// UiPath Sales Cycle Guide - Main Application Logic
// This file contains the core functionality and event handling

// Import data from separate file
const APP_STATE = SALES_CYCLE_DATA;

// ---------- LOCALSTORAGE PERSISTENCE ----------
// MODIFIED: Now handles a single state object for checklists and notes
function loadFullState() {
  const savedState = localStorage.getItem('uipathSalesGuideState');
  const defaultState = { checklists: {}, notes: {} };
  return savedState ? JSON.parse(savedState) : defaultState;
}

function saveFullState(state) {
  localStorage.setItem('uipathSalesGuideState', JSON.stringify(state));
}

// ---------- DOM UTILITIES ----------
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

// ---------- RENDERING FUNCTIONS ----------
function renderPersonas(){
  ['banking','insurance'].forEach(ind =>{
    const host = ind==='banking' ? $('#personas-banking') : $('#personas-insurance');
    host.innerHTML = '';
    APP_STATE.personas[ind].forEach((p,i)=>{
      host.innerHTML += `
        <div class="persona-card editable-card" id="persona-${ind}-${i}">
          <h3 class="flex justify-between items-center cursor-pointer persona-toggle" onclick="togglePersonaDetails('persona-${ind}-${i}')">
            <span>${p.title}</span>
            <div class="flex items-center gap-2">
              <svg class="edit-icon w-5 h-5 text-gray-400 hover:text-orange-600 transition-colors" data-target="persona-${ind}-${i}" onclick="event.stopPropagation()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg>
              <svg class="persona-toggle-icon w-5 h-5 text-gray-400 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </h3>
          <div class="persona-details hidden transition-all duration-300 ease-in-out">
            <div class="editable-content pt-3 border-t border-gray-100 mt-3">
              <ul class="space-y-3">
                <li><strong>Their world:</strong> ${p.world}</li>
                <li><strong>What they care about:</strong> ${p.cares}</li>
                <li><strong>How UiPath helps:</strong> ${p.help}</li>
              </ul>
            </div>
          </div>
        </div>`
    });
  });
}

// Toggle persona details visibility
function togglePersonaDetails(personaId) {
  const personaCard = document.getElementById(personaId);
  if (!personaCard) return;
  
  const details = personaCard.querySelector('.persona-details');
  const toggleIcon = personaCard.querySelector('.persona-toggle-icon');
  
  if (details.classList.contains('hidden')) {
    // Show details
    details.classList.remove('hidden');
    toggleIcon.style.transform = 'rotate(180deg)';
  } else {
    // Hide details
    details.classList.add('hidden');
    toggleIcon.style.transform = 'rotate(0deg)';
  }
}

function stageCard(stage){
  return `
    <h2 class="section-toggle text-3xl font-bold border-b-2 border-gray-200 pb-2 mb-2 flex justify-between items-center cursor-pointer">
      <span>${stage.title}</span>
      <svg class="toggle-icon w-6 h-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </h2>
    <div class="collapsible-content hidden pt-4">
      <div class="w-full progress-bar-bg rounded-full h-2.5 mb-6"><div class="progress-bar h-2.5 rounded-full" style="width:0%"></div></div>
      <div class="grid lg:grid-cols-2 gap-6">
        <div id="${stage.id}-outcomes" class="editable-card bg-gray-50 p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-3 uipath-robotic-orange flex justify-between items-center"><span>Verifiable Outcomes / Exit Criteria</span><svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-outcomes" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg></h3>
          <div class="editable-content">${listHtml(stage.outcomes,true, stage.id)}</div>
        </div>
        <div id="${stage.id}-initial-personas" class="editable-card bg-gray-50 p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-3 uipath-robotic-orange flex justify-between items-center"><span>Initial Personas to Engage</span><svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-initial-personas" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg></h3>
          <div class="editable-content">${listHtml(stage.initialPersonas)}</div>
        </div>
      </div>
      <div id="${stage.id}-questions" class="editable-card bg-gray-50 p-6 rounded-lg shadow mt-6">
        <h3 class="text-2xl font-semibold mb-4 uipath-robotic-orange flex justify-between items-center"><span>Key Discovery Questions</span><svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-questions" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg></h3>
        <div class="editable-content">${questionsHtml(stage.questions)}</div>
        <div class="flex justify-center mt-4">
          <button class="export-notes-btn px-4 py-2 text-white rounded-md font-semibold flex items-center" style="background-color: #FA4616; hover:background-color: #E03E0F;" onmouseover="this.style.backgroundColor='#E03E0F'" onmouseout="this.style.backgroundColor='#FA4616'">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7m-6 4h6m-6-4h6m-3-4h.01M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
            </svg>
            Copy Notes
          </button>
        </div>
      </div>
      <div id="${stage.id}-objections" class="editable-card bg-gray-50 p-6 rounded-lg shadow mt-6">
        <h3 class="text-2xl font-semibold mb-4 uipath-robotic-orange flex justify-between items-center"><span>Common Objections & Responses</span><svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-objections" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg></h3>
        <div class="editable-content">${objectionsHtml(stage.objections)}</div>
      </div>
      <div id="${stage.id}-resources" class="editable-card bg-gray-50 p-6 rounded-lg shadow mt-6">
        <h3 class="text-2xl font-semibold mb-4 uipath-robotic-orange flex justify-between items-center">
          <span data-industry="banking">Key Content & Resources (Banking)</span>
          <span data-industry="insurance" class="hidden">Key Content & Resources (Insurance)</span>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-resources" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg>
        </h3>
        <div class="editable-content">
          ${resourcesHtml(stage.resources)}
        </div>
      </div>
    </div>`;
}

const listHtml = (arr, checklist=false, stageId = '')=>{
  return `<ul class="space-y-3">${arr.map((x, i)=>{
    if(checklist){
      const checkboxId = `${stageId}-${i}`;
      return `<li><label class="flex items-center text-gray-700 cursor-pointer"><input type="checkbox" class="form-checkbox h-5 w-5 rounded border-gray-300 focus:ring-orange-500" data-id="${checkboxId}"><span class="ml-3">${x}</span></label></li>`
    }
    return `<li>${x}</li>`
  }).join('')}</ul>`
}

// MODIFIED: questionsHtml now adds AI response button for each question
const questionsHtml = (map)=>{
  let questionIndex = 0;
  return Object.entries(map).map(([k,qs])=>{
    const categoryHtml = qs.map(q=>{
      // Create a unique ID for each note textarea
      const noteId = `discovery-q-${k.replace(/\s+/g, '-')}-${questionIndex++}`;
      return `
      <details class="mb-3 bg-white p-3 rounded-md border">
        <summary class="font-semibold text-gray-700">${q}</summary>
        <div class="mt-3 space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Your Notes & Customer Response:</label>
            <textarea data-note-id="${noteId}" class="note-textarea w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" rows="3" placeholder="Capture customer responses and your notes here..."></textarea>
          </div>
          <div class="flex justify-end">
            <button class="ai-question-response-btn px-3 py-1.5 text-white rounded-md font-medium text-sm flex items-center" style="background-color: #FA4616;" onmouseover="this.style.backgroundColor='#E03E0F'" onmouseout="this.style.backgroundColor='#FA4616'" data-question="${encodeURIComponent(q)}" data-note-id="${noteId}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              AI Response
            </button>
          </div>
          <div class="ai-question-response-content hidden bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
            <p class="text-blue-700 font-medium text-sm mb-2">🤖 AI-Generated Response:</p>
            <div class="ai-response-text text-gray-700 text-sm"></div>
          </div>
        </div>
      </details>`
    }).join('');
    return `<div class="mb-4"><h4 class="text-lg font-bold text-gray-800 mb-2">${k}</h4>${categoryHtml}</div>`
  }).join('') + `
  <!-- Additional Question Section -->
  <div class="mb-4 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
    <h4 class="text-lg font-bold text-gray-800 mb-3">💬 Additional Questions</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Your Custom Question:</label>
        <input type="text" class="additional-question-input w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" placeholder="Enter your own discovery question here...">
      </div>
      <div class="additional-question-notes hidden">
        <label class="block text-sm font-medium text-gray-600 mb-1">Customer Response & Notes:</label>
        <textarea class="additional-question-textarea w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" rows="3" placeholder="Capture customer response and your notes..."></textarea>
      </div>
      <div class="flex justify-between">
        <button class="add-question-btn px-3 py-1.5 bg-gray-600 text-white rounded-md font-medium text-sm hover:bg-gray-700">
          ➕ Add Question
        </button>
        <button class="ai-additional-question-btn hidden px-3 py-1.5 text-white rounded-md font-medium text-sm" style="background-color: #FA4616;" onmouseover="this.style.backgroundColor='#E03E0F'" onmouseout="this.style.backgroundColor='#FA4616'">
          <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          AI Response
        </button>
      </div>
      <div class="ai-additional-question-response hidden bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
        <p class="text-blue-700 font-medium text-sm mb-2">🤖 AI-Generated Response:</p>
        <div class="ai-additional-response-text text-gray-700 text-sm"></div>
      </div>
    </div>
  </div>`
}

const objectionsHtml = (items)=>{
  return items.map((it, index)=>`
    <details class="mb-3 bg-white p-3 rounded-md border">
      <summary class="font-semibold text-gray-700">${it.q}</summary>
      <div class="mt-3 space-y-3">
        <div class="bg-gray-50 p-3 rounded-md">
          <p class="text-sm font-medium text-gray-600 mb-1">Standard Response:</p>
          <p class="text-gray-700 text-sm">${it.a}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Customer's Specific Response & Context:</label>
          <textarea class="objection-notes-textarea w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" rows="3" placeholder="What did the customer specifically say? Any additional context or concerns they raised?" data-objection-index="${index}"></textarea>
        </div>
        <div class="flex justify-end">
          <button class="ai-objection-response-btn px-3 py-1.5 text-white rounded-md font-medium text-sm flex items-center" style="background-color: #FA4616;" onmouseover="this.style.backgroundColor='#E03E0F'" onmouseout="this.style.backgroundColor='#FA4616'" data-objection="${encodeURIComponent(it.q)}" data-objection-index="${index}">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            AI Response
          </button>
        </div>
        <div class="ai-objection-response-content hidden bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">
          <p class="text-purple-700 font-medium text-sm mb-2">🤖 AI-Generated Tailored Response:</p>
          <div class="ai-objection-response-text text-gray-700 text-sm"></div>
        </div>
      </div>
    </details>`).join('') + `
  <!-- Additional Objection Section -->
  <div class="mb-4 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
    <h4 class="text-lg font-bold text-gray-800 mb-3">🛡️ Additional Objections</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Customer's Objection:</label>
        <input type="text" class="additional-objection-input w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" placeholder="What objection did the customer raise?">
      </div>
      <div class="additional-objection-notes hidden">
        <label class="block text-sm font-medium text-gray-600 mb-1">Full Context & Details:</label>
        <textarea class="additional-objection-textarea w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" rows="3" placeholder="Provide full context of the objection, customer's tone, specific concerns..."></textarea>
      </div>
      <div class="flex justify-between">
        <button class="add-objection-btn px-3 py-1.5 bg-gray-600 text-white rounded-md font-medium text-sm hover:bg-gray-700">
          ➕ Add Objection
        </button>
        <button class="ai-additional-objection-btn hidden px-3 py-1.5 text-white rounded-md font-medium text-sm" style="background-color: #FA4616;" onmouseover="this.style.backgroundColor='#E03E0F'" onmouseout="this.style.backgroundColor='#FA4616'">
          <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          AI Response
        </button>
      </div>
      <div class="ai-additional-objection-response hidden bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">
        <p class="text-purple-700 font-medium text-sm mb-2">🤖 AI-Generated Response:</p>
        <div class="ai-additional-objection-response-text text-gray-700 text-sm"></div>
      </div>
    </div>
  </div>`
}

const resourcesHtml = (res)=>{
  const b = (res.banking||[]).map(r=>`<li><a href="${r.link}" class="text-blue-600 font-semibold hover:underline">${r.name}</a><p class="text-sm text-gray-600 mt-1"><strong>Overview:</strong> ${r.overview} <br><strong>Why it Matters:</strong> ${r.why}</p></li>`).join('')
  const i = (res.insurance||[]).map(r=>`<li><a href="${r.link}" class="text-blue-600 font-semibold hover:underline">${r.name}</a><p class="text-sm text-gray-600 mt-1"><strong>Overview:</strong> ${r.overview} <br><strong>Why it Matters:</strong> ${r.why}</p></li>`).join('')
  return `<div data-industry="banking"><ul class="space-y-4">${b}</ul></div><div data-industry="insurance" class="hidden"><ul class="space-y-4">${i}</ul></div>`
}

function renderStages(){
  APP_STATE.stages.forEach(s=>{
    const host = document.getElementById(s.id);
    host.innerHTML = stageCard(s);
  })
}

// ---------- INITIALIZATION FUNCTIONS ----------
function initCollapsibleSections() {
  $$('.section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      if (content && content.classList.contains('collapsible-content')) {
        toggle.classList.toggle('open');
        content.classList.toggle('hidden');
      }
    });
  });
}

// MODIFIED: initChecklists now uses the new state management
function initChecklists(){
  const fullState = loadFullState();
  $$('.content-section').forEach(sec=>{
    const checks = sec.querySelectorAll('input[type="checkbox"]');
    const bar = sec.querySelector('.progress-bar');
    if(!bar) return;
    const update=()=>{
      const total = checks.length || 1;
      const done = sec.querySelectorAll('input[type="checkbox"]:checked').length;
      bar.style.width = `${(done/total)*100}%`;
    }
    checks.forEach(ch=>{
      const checkboxId = ch.dataset.id;
      if (fullState.checklists[checkboxId]) {
        ch.checked = true;
        ch.closest('label')?.classList.add('checked-item');
      }
      if(ch.dataset.bound) return; ch.dataset.bound='1';
      ch.addEventListener('change',e=>{
        e.target.closest('label')?.classList.toggle('checked-item', e.target.checked);
        const currentState = loadFullState();
        currentState.checklists[e.target.dataset.id] = e.target.checked;
        saveFullState(currentState);
        update();
      });
    })
    update();
  })
}

// NEW: Initialize and handle notes persistence
function initNotes() {
    const fullState = loadFullState();
    $$('.note-textarea').forEach(textarea => {
        const noteId = textarea.dataset.noteId;
        if (noteId && fullState.notes[noteId]) {
            textarea.value = fullState.notes[noteId];
        }

        textarea.addEventListener('input', () => {
            const currentState = loadFullState();
            currentState.notes[textarea.dataset.noteId] = textarea.value;
            saveFullState(currentState);
        });
    });
}

function initNavigation() {
  $$('#mobile-menu a, nav a').forEach(a=>a.addEventListener('click',e=>{
    const href = a.getAttribute('href');
    if(href && href.startsWith('#')){
      e.preventDefault(); 
      const el = document.querySelector(href); 
      if(el) {
        const content = el.querySelector('.collapsible-content');
        if(content && content.classList.contains('hidden')) {
          el.querySelector('.section-toggle')?.click();
        }
        setTimeout(() => {
          el.scrollIntoView({behavior:'smooth'});
        }, 100);
      } 
      $('#mobile-menu')?.classList.add('hidden'); 
    }
  }))
}

function initScrollSpy() {
  const sections = $$('.content-section');
  window.addEventListener('scroll',()=>{
    let current='';
    sections.forEach(s=>{ if(window.scrollY >= s.offsetTop-100) current=s.id; })
    $$('.nav-link').forEach(l=> l.classList.toggle('active', l.getAttribute('href').slice(1)===current))
  })
}

function initIndustryToggle() {
  function updateIndustryContent(selected){
    APP_STATE.industry = selected;
    $$('.industry-selector button').forEach(b=> b.classList.toggle('active', b.id.replace('-mobile','')===selected));
    $$('[data-industry]').forEach(div=> div.classList.toggle('hidden', div.dataset.industry!==selected));
  }
  
  ['banking','insurance'].forEach(id=>{
    ['','-mobile'].forEach(suf=>{
      const btn = document.getElementById(id+suf); 
      if(btn){ 
        btn.addEventListener('click',()=> updateIndustryContent(id)) 
      }
    })
  })
  updateIndustryContent('banking');
}

function initMobileMenu() {
  $('#mobile-menu-button')?.addEventListener('click',()=> $('#mobile-menu')?.classList.toggle('hidden'))
}

// NEW: Export Notes functionality
function initExportNotes() {
  const handleExport = () => {
      let fullNotesText = "### Discovery Question Notes\n\n";
      let discoveryNotesFound = false;

      $$('.note-textarea').forEach(textarea => {
          if (textarea.value.trim()) {
              discoveryNotesFound = true;
              const question = textarea.closest('details').querySelector('summary').innerHTML;
              fullNotesText += `**Q: ${question.trim()}**\n`;
              fullNotesText += `${textarea.value.trim()}\n\n`;
          }
      });

      if (!discoveryNotesFound) {
          fullNotesText += "No discovery notes captured.\n";
      }
      
      // Use modern clipboard API if available, fallback to textarea method
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullNotesText).then(() => {
          showCopyMessage();
        }).catch(() => {
          fallbackCopyToClipboard(fullNotesText);
        });
      } else {
        fallbackCopyToClipboard(fullNotesText);
      }
  };
  
  // Add event listeners to all copy notes buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.export-notes-btn') || e.target.closest('.export-notes-btn')) {
      handleExport();
    }
  });
}

function fallbackCopyToClipboard(text) {
  const tempTextarea = document.createElement('textarea');
  tempTextarea.value = text;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextarea);
  showCopyMessage();
}

function showCopyMessage() {
  const message = $('#copy-message');
  if (message) {
    message.classList.remove('opacity-0', 'translate-y-2');
    setTimeout(() => {
        message.classList.add('opacity-0', 'translate-y-2');
    }, 2000);
  }
}

// ---------- ADMIN EDITING (Stub for now) ----------
let currentEditTarget = null;
function htmlToText(contentElement){
  // Admin editing functionality placeholder
  return '';
}

function textToHtml(text, structureType){
  // Admin editing functionality placeholder
  return '';
}

// ---------- AI INTEGRATION (Stub for now) ----------
async function callClaude(prompt){
  // AI integration placeholder
  return 'AI functionality not implemented yet.';
}

// ---------- AI FUNCTIONALITY ----------
function initAIIntegration() {
  // Initialize AI integration with hardcoded configuration
  if (typeof initializeAI === 'function') {
    aiIntegration = initializeAI();
  }

  initAIButtons();
}


function initAIButtons() {
  // AI question responses
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.ai-question-response-btn') || e.target.closest('.ai-question-response-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const button = e.target.closest('.ai-question-response-btn') || e.target;
      await generateQuestionResponse(button);
    }
  });

  // AI objection responses
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.ai-objection-response-btn') || e.target.closest('.ai-objection-response-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const button = e.target.closest('.ai-objection-response-btn') || e.target;
      await generateObjectionResponse(button);
    }
  });

  // Additional question functionality
  document.addEventListener('click', (e) => {
    if (e.target.matches('.add-question-btn')) {
      e.preventDefault();
      const container = e.target.closest('.mb-4');
      const notesSection = container.querySelector('.additional-question-notes');
      const aiButton = container.querySelector('.ai-additional-question-btn');
      
      notesSection.classList.remove('hidden');
      aiButton.classList.remove('hidden');
      e.target.textContent = '✅ Question Added';
      e.target.disabled = true;
    }
  });

  // Additional objection functionality
  document.addEventListener('click', (e) => {
    if (e.target.matches('.add-objection-btn')) {
      e.preventDefault();
      const container = e.target.closest('.mb-4');
      const notesSection = container.querySelector('.additional-objection-notes');
      const aiButton = container.querySelector('.ai-additional-objection-btn');
      
      notesSection.classList.remove('hidden');
      aiButton.classList.remove('hidden');
      e.target.textContent = '✅ Objection Added';
      e.target.disabled = true;
    }
  });

  // AI additional question response
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.ai-additional-question-btn') || e.target.closest('.ai-additional-question-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const button = e.target.closest('.ai-additional-question-btn') || e.target;
      await generateAdditionalQuestionResponse(button);
    }
  });

  // AI additional objection response
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.ai-additional-objection-btn') || e.target.closest('.ai-additional-objection-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const button = e.target.closest('.ai-additional-objection-btn') || e.target;
      await generateAdditionalObjectionResponse(button);
    }
  });
}

async function generateFollowUpQuestions(stageId) {
  if (!aiIntegration) {
    showMessage('AI integration not available', 'error');
    return;
  }

  const stage = SALES_CYCLE_DATA.stages.find(s => s.id === stageId);
  if (!stage) return;

  const button = $(`[data-generate-followups="${stageId}"]`);
  const resultContainer = $(`#${stageId}-generated`);

  if (button) {
    button.disabled = true;
    button.innerHTML = '⏳ Generating questions...';
  }

  try {
    // Get customer notes for context
    const notes = collectCustomerNotes(stageId);
    
    const questions = await aiIntegration.generateFollowUpQuestions(
      stageId, 
      stage.questions, 
      notes
    );

    if (resultContainer && questions.length > 0) {
      resultContainer.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-lg font-semibold text-blue-800 mb-3">🤖 AI-Generated Follow-up Questions</h4>
          ${questions.map(q => `
            <div class="mb-3 p-3 bg-white rounded border-l-4 border-blue-400">
              <p class="font-medium text-gray-800">${q.question}</p>
              <p class="text-sm text-gray-600 mt-1"><strong>Category:</strong> ${q.category}</p>
              <p class="text-xs text-blue-600 mt-1">${q.purpose}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600">❌ Failed to generate questions: ${error.message}</p>
          <p class="text-sm text-red-500 mt-1">Please check your AI configuration.</p>
        </div>
      `;
    }
  }

  if (button) {
    button.disabled = false;
    button.innerHTML = '✨ AI: Generate Follow-up Questions';
  }
}

// Generate AI response for individual questions
async function generateQuestionResponse(button) {
  if (!aiIntegration) {
    showMessage('AI integration not available', 'error');
    return;
  }

  const question = decodeURIComponent(button.dataset.question);
  const noteId = button.dataset.noteId;
  const notesTextarea = document.querySelector(`[data-note-id="${noteId}"]`);
  const responseContainer = button.closest('details').querySelector('.ai-question-response-content');
  const responseContent = responseContainer?.querySelector('.ai-response-text');

  if (!responseContainer || !responseContent || !notesTextarea) return;

  button.disabled = true;
  button.innerHTML = '⏳ Generating...';

  try {
    const customerNotes = notesTextarea.value.trim();
    const stageId = button.closest('.content-section')?.id;
    const stageName = SALES_CYCLE_DATA.stages.find(s => s.id === stageId)?.title || 'Discovery';
    
    const prompt = `You are an expert enterprise software sales consultant specializing in UiPath automation solutions. You are currently in the ${stageName} stage of the sales cycle.

CONTEXT:
- This is an enterprise software sales call for UiPath (business process automation/RPA)
- Industry: ${SALES_CYCLE_DATA.industry}
- Sales Stage: ${stageName}
- Discovery Question Asked: "${question}"
- Customer Response/Notes: "${customerNotes || 'No specific response captured yet'}"

Based on this context, provide a strategic response that:
1. Acknowledges what the customer shared
2. Provides helpful insights about UiPath's capabilities in this area
3. Suggests 2-3 strategic follow-up questions to deepen the conversation
4. Positions UiPath as the optimal solution for their ${SALES_CYCLE_DATA.industry} automation needs

Keep the response conversational, consultative, and focused on their specific business outcomes. Maximum 3-4 sentences.`;

    const response = await aiIntegration.generateResponse(prompt, {
      type: 'question_response',
      stage: stageId,
      industry: SALES_CYCLE_DATA.industry,
      question: question,
      customerNotes: customerNotes
    });

    responseContent.innerHTML = response;
    responseContainer.classList.remove('hidden');

  } catch (error) {
    console.error('Error generating question response:', error);
    responseContent.innerHTML = `
      <div class="text-red-600">
        ❌ Failed to generate response: ${error.message}<br>
        <span class="text-sm">Please check your AI configuration.</span>
      </div>
    `;
    responseContainer.classList.remove('hidden');
  }

  button.disabled = false;
  button.innerHTML = `
    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>
    AI Response
  `;
}

// Generate AI response for objections
async function generateObjectionResponse(button) {
  if (!aiIntegration) {
    showMessage('AI integration not available', 'error');
    return;
  }

  const objection = decodeURIComponent(button.dataset.objection);
  const objectionIndex = button.dataset.objectionIndex;
  const notesTextarea = document.querySelector(`[data-objection-index="${objectionIndex}"]`);
  const responseContainer = button.closest('details').querySelector('.ai-objection-response-content');
  const responseContent = responseContainer?.querySelector('.ai-objection-response-text');

  if (!responseContainer || !responseContent) return;

  button.disabled = true;
  button.innerHTML = '⏳ Generating...';

  try {
    const customerResponse = notesTextarea?.value.trim() || '';
    const stageId = button.closest('.content-section')?.id;
    const stageName = SALES_CYCLE_DATA.stages.find(s => s.id === stageId)?.title || 'Discovery';
    
    const prompt = `You are an expert enterprise software sales consultant specializing in UiPath automation solutions. You are handling a customer objection during the ${stageName} stage.

CONTEXT:
- This is an enterprise software sales call for UiPath (business process automation/RPA)
- Industry: ${SALES_CYCLE_DATA.industry}
- Sales Stage: ${stageName}
- Customer Objection: "${objection}"
- Customer's Specific Response/Context: "${customerResponse || 'Standard objection, no additional context provided'}"

Provide a compelling, tailored response that:
1. Acknowledges and empathizes with their concern
2. Addresses the specific objection with UiPath's unique value proposition
3. Provides relevant ${SALES_CYCLE_DATA.industry} industry examples or case studies
4. Suggests a logical next step to move the conversation forward
5. Maintains a consultative, non-pushy tone

Keep the response professional, confident, and solution-focused. Maximum 4-5 sentences.`;

    const response = await aiIntegration.generateResponse(prompt, {
      type: 'objection_response',
      stage: stageId,
      industry: SALES_CYCLE_DATA.industry,
      objection: objection,
      customerContext: customerResponse
    });

    responseContent.innerHTML = response;
    responseContainer.classList.remove('hidden');

  } catch (error) {
    console.error('Error generating objection response:', error);
    responseContent.innerHTML = `
      <div class="text-red-600">
        ❌ Failed to generate response: ${error.message}<br>
        <span class="text-sm">Please check your AI configuration.</span>
      </div>
    `;
    responseContainer.classList.remove('hidden');
  }

  button.disabled = false;
  button.innerHTML = `
    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>
    AI Response
  `;
}

// Generate AI response for additional questions
async function generateAdditionalQuestionResponse(button) {
  if (!aiIntegration) {
    showMessage('AI integration not available', 'error');
    return;
  }

  const container = button.closest('.mb-4');
  const questionInput = container.querySelector('.additional-question-input');
  const notesTextarea = container.querySelector('.additional-question-textarea');
  const responseContainer = container.querySelector('.ai-additional-question-response');
  const responseContent = responseContainer?.querySelector('.ai-additional-response-text');

  if (!questionInput || !notesTextarea || !responseContainer || !responseContent) return;

  const customQuestion = questionInput.value.trim();
  const customerNotes = notesTextarea.value.trim();

  if (!customQuestion) {
    showMessage('Please enter a question first', 'error');
    return;
  }

  button.disabled = true;
  button.innerHTML = '⏳ Generating...';

  try {
    const stageId = button.closest('.content-section')?.id;
    const stageName = SALES_CYCLE_DATA.stages.find(s => s.id === stageId)?.title || 'Discovery';
    
    const prompt = `You are an expert enterprise software sales consultant specializing in UiPath automation solutions. You are in the ${stageName} stage of the sales cycle.

CONTEXT:
- This is an enterprise software sales call for UiPath (business process automation/RPA)
- Industry: ${SALES_CYCLE_DATA.industry}
- Sales Stage: ${stageName}
- Your Custom Question: "${customQuestion}"
- Customer Response/Notes: "${customerNotes || 'No response captured yet'}"

Based on this custom question and the customer's response, provide strategic guidance that:
1. Interprets what the customer's response reveals about their business needs
2. Suggests how to position UiPath's capabilities to address their specific situation
3. Recommends 2-3 strategic follow-up questions to advance the sales process
4. Identifies potential opportunities or risks based on their response

Keep the response actionable, insightful, and focused on advancing the ${SALES_CYCLE_DATA.industry} automation sale. Maximum 4 sentences.`;

    const response = await aiIntegration.generateResponse(prompt, {
      type: 'additional_question_response',
      stage: stageId,
      industry: SALES_CYCLE_DATA.industry,
      question: customQuestion,
      customerNotes: customerNotes
    });

    responseContent.innerHTML = response;
    responseContainer.classList.remove('hidden');

  } catch (error) {
    console.error('Error generating additional question response:', error);
    responseContent.innerHTML = `
      <div class="text-red-600">
        ❌ Failed to generate response: ${error.message}<br>
        <span class="text-sm">Please check your AI configuration.</span>
      </div>
    `;
    responseContainer.classList.remove('hidden');
  }

  button.disabled = false;
  button.innerHTML = `
    <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>
    AI Response
  `;
}

// Generate AI response for additional objections
async function generateAdditionalObjectionResponse(button) {
  if (!aiIntegration) {
    showMessage('AI integration not available', 'error');
    return;
  }

  const container = button.closest('.mb-4');
  const objectionInput = container.querySelector('.additional-objection-input');
  const notesTextarea = container.querySelector('.additional-objection-textarea');
  const responseContainer = container.querySelector('.ai-additional-objection-response');
  const responseContent = responseContainer?.querySelector('.ai-additional-objection-response-text');

  if (!objectionInput || !notesTextarea || !responseContainer || !responseContent) return;

  const customObjection = objectionInput.value.trim();
  const customerContext = notesTextarea.value.trim();

  if (!customObjection) {
    showMessage('Please enter an objection first', 'error');
    return;
  }

  button.disabled = true;
  button.innerHTML = '⏳ Generating...';

  try {
    const stageId = button.closest('.content-section')?.id;
    const stageName = SALES_CYCLE_DATA.stages.find(s => s.id === stageId)?.title || 'Discovery';
    
    const prompt = `You are an expert enterprise software sales consultant specializing in UiPath automation solutions. You are handling a customer objection during the ${stageName} stage.

CONTEXT:
- This is an enterprise software sales call for UiPath (business process automation/RPA)
- Industry: ${SALES_CYCLE_DATA.industry}
- Sales Stage: ${stageName}
- Customer's Objection: "${customObjection}"
- Full Context/Details: "${customerContext || 'Limited context provided'}"

Craft a compelling response that:
1. Acknowledges and validates their concern
2. Reframes the objection as an opportunity to demonstrate UiPath's value
3. Provides specific ${SALES_CYCLE_DATA.industry} examples or proof points
4. Suggests concrete next steps to address their concern
5. Maintains momentum in the sales process

Be consultative, confident, and solution-oriented. Maximum 5 sentences.`;

    const response = await aiIntegration.generateResponse(prompt, {
      type: 'additional_objection_response',
      stage: stageId,
      industry: SALES_CYCLE_DATA.industry,
      objection: customObjection,
      customerContext: customerContext
    });

    responseContent.innerHTML = response;
    responseContainer.classList.remove('hidden');

  } catch (error) {
    console.error('Error generating additional objection response:', error);
    responseContent.innerHTML = `
      <div class="text-red-600">
        ❌ Failed to generate response: ${error.message}<br>
        <span class="text-sm">Please check your AI configuration.</span>
      </div>
    `;
    responseContainer.classList.remove('hidden');
  }

  button.disabled = false;
  button.innerHTML = `
    <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>
    AI Response
  `;
}

function collectCustomerNotes(stageId) {
  const notes = {};
  const stageSection = stageId ? $(`#${stageId}`) : document;
  
  if (stageSection) {
    stageSection.querySelectorAll('.note-textarea').forEach(textarea => {
      if (textarea.value.trim()) {
        const questionText = textarea.closest('details')?.querySelector('summary')?.textContent?.trim();
        if (questionText) {
          notes[questionText] = textarea.value.trim();
        }
      }
    });
  }
  
  return Object.keys(notes).length > 0 ? JSON.stringify(notes, null, 2) : '';
}

function showMessage(message, type = 'info') {
  const messageDiv = $('#copy-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `fixed bottom-5 right-5 py-2 px-4 rounded-lg shadow-lg opacity-0 transform translate-y-2 ${
      type === 'error' ? 'bg-red-600 text-white' : 
      type === 'success' ? 'bg-green-600 text-white' : 
      'bg-gray-800 text-white'
    }`;
    messageDiv.classList.remove('opacity-0', 'translate-y-2');
    setTimeout(() => {
      messageDiv.classList.add('opacity-0', 'translate-y-2');
    }, 3000);
  }
}


// ---------- MAIN INITIALIZATION ----------
document.addEventListener('DOMContentLoaded',()=>{
  // Render initial content
  renderPersonas();
  renderStages();
  
  // Initialize all functionality
  initCollapsibleSections();
  initChecklists();
  initNotes();
  initNavigation();
  initScrollSpy();
  initIndustryToggle();
  initMobileMenu();
  initExportNotes();
  initAIIntegration(); // Initialize AI functionality
  initBulkAdmin(); // Initialize bulk admin interface
});

// ---------- BULK ADMIN INTERFACE ----------
function initBulkAdmin() {
  const bulkAdminBtn = $('#bulk-admin-btn');
  const bulkAdminModal = $('#bulk-admin-modal');
  const bulkAdminCancel = $('#bulk-admin-cancel');
  const bulkAdminSave = $('#bulk-admin-save');
  const bulkAdminExport = $('#bulk-admin-export');
  const bulkAdminImport = $('#bulk-admin-import');
  const bulkImportJsonFile = $('#bulk-import-json');
  const bulkImportCsvFile = $('#bulk-import-csv');
  const exportDropdown = $('#export-dropdown');
  const importDropdown = $('#import-dropdown');
  const exportCsvBtn = $('#export-csv');
  const exportJsonBtn = $('#export-json');

  // Show bulk admin modal
  const showBulkAdmin = () => {
    if (bulkAdminModal) {
      loadAllContentToBulkEditor();
      bulkAdminModal.classList.remove('hidden');
    }
  };

  // Event listeners
  if (bulkAdminBtn) bulkAdminBtn.addEventListener('click', showBulkAdmin);
  
  if (bulkAdminCancel) {
    bulkAdminCancel.addEventListener('click', () => {
      if (bulkAdminModal) bulkAdminModal.classList.add('hidden');
    });
  }

  if (bulkAdminSave) {
    bulkAdminSave.addEventListener('click', saveBulkChanges);
  }

  // Export dropdown toggle
  if (bulkAdminExport) {
    bulkAdminExport.addEventListener('click', () => {
      if (exportDropdown) {
        exportDropdown.classList.toggle('hidden');
        if (importDropdown) importDropdown.classList.add('hidden');
      }
    });
  }

  // Import dropdown toggle
  if (bulkAdminImport) {
    bulkAdminImport.addEventListener('click', () => {
      if (importDropdown) {
        importDropdown.classList.toggle('hidden');
        if (exportDropdown) exportDropdown.classList.add('hidden');
      }
    });
  }

  // Export options
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      exportAllContentAsCSV();
      if (exportDropdown) exportDropdown.classList.add('hidden');
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      exportAllContent();
      if (exportDropdown) exportDropdown.classList.add('hidden');
    });
  }

  // Import file handlers
  if (bulkImportJsonFile) {
    bulkImportJsonFile.addEventListener('change', importAllContent);
  }

  if (bulkImportCsvFile) {
    bulkImportCsvFile.addEventListener('change', importCSVContent);
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#bulk-admin-export') && !e.target.closest('#export-dropdown')) {
      if (exportDropdown) exportDropdown.classList.add('hidden');
    }
    if (!e.target.closest('#bulk-admin-import') && !e.target.closest('#import-dropdown')) {
      if (importDropdown) importDropdown.classList.add('hidden');
    }
  });

  // Initialize tabs
  initBulkAdminTabs();
}

// Initialize bulk admin tabs
function initBulkAdminTabs() {
  const tabs = $$('.bulk-tab');
  const tabContents = $$('.bulk-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.add('hidden'));

      // Add active to clicked tab and show corresponding content
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab') + '-tab';
      const content = document.getElementById(tabId);
      if (content) {
        content.classList.remove('hidden');
      }
    });
  });
}

// Load all current content into the bulk editor
function loadAllContentToBulkEditor() {
  // Load personas
  loadPersonasToBulkEditor();
  
  // Load stage data
  SALES_CYCLE_DATA.stages.forEach(stage => {
    const stagePrefix = stage.id.replace('-', '');
    
    // Load outcomes
    const outcomesContainer = $(`#${stagePrefix}-outcomes-container`);
    if (outcomesContainer && stage.outcomes) {
      outcomesContainer.innerHTML = '';
      stage.outcomes.forEach(outcome => {
        addContentItem(outcomesContainer, 'outcome', outcome, stagePrefix);
      });
    }
    
    // Load initial personas
    const personasContainer = $(`#${stagePrefix}-personas-container`);
    if (personasContainer && stage.initialPersonas) {
      personasContainer.innerHTML = '';
      stage.initialPersonas.forEach(persona => {
        addContentItem(personasContainer, 'persona', persona, stagePrefix);
      });
    }
    
    // Load questions by category
    const questionsContainer = $(`#${stagePrefix}-questions-container`);
    if (questionsContainer && stage.questions) {
      questionsContainer.innerHTML = '';
      Object.entries(stage.questions).forEach(([category, questions]) => {
        addQuestionCategoryToContainer(questionsContainer, category, questions, stagePrefix);
      });
    }
  });
}

// Load personas into bulk editor
function loadPersonasToBulkEditor() {
  // Clear existing persona editors
  const bankingEditor = $('#banking-personas-editor');
  const insuranceEditor = $('#insurance-personas-editor');
  
  if (bankingEditor) {
    bankingEditor.innerHTML = '';
    SALES_CYCLE_DATA.personas.banking.forEach((persona, index) => {
      addPersonaEditor('banking', persona, index);
    });
  }
  
  if (insuranceEditor) {
    insuranceEditor.innerHTML = '';
    SALES_CYCLE_DATA.personas.insurance.forEach((persona, index) => {
      addPersonaEditor('insurance', persona, index);
    });
  }
}

// Add persona editor
function addPersonaEditor(industry, persona = null, index = null) {
  const container = $(`#${industry}-personas-editor`);
  if (!container) return;
  
  const personaIndex = index !== null ? index : container.children.length;
  const personaData = persona || { title: '', world: '', cares: '', help: '' };
  
  const editorHtml = `
    <div class="persona-editor bg-white p-3 rounded-md border" data-industry="${industry}" data-index="${personaIndex}">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">Persona ${personaIndex + 1}</span>
        <button type="button" onclick="removePersonaEditor(this)" class="text-red-600 hover:text-red-800 text-sm">🗑️ Remove</button>
      </div>
      <div class="space-y-2">
        <input type="text" placeholder="Persona Title" value="${personaData.title}" class="persona-title w-full p-2 border rounded text-sm">
        <textarea placeholder="Their world..." class="persona-world w-full p-2 border rounded text-sm h-16">${personaData.world}</textarea>
        <textarea placeholder="What they care about..." class="persona-cares w-full p-2 border rounded text-sm h-16">${personaData.cares}</textarea>
        <textarea placeholder="How UiPath helps..." class="persona-help w-full p-2 border rounded text-sm h-16">${personaData.help}</textarea>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', editorHtml);
}

// Add persona function (called by onclick)
function addPersona(industry) {
  addPersonaEditor(industry);
}

// Remove persona editor
function removePersonaEditor(button) {
  const personaEditor = button.closest('.persona-editor');
  if (personaEditor) {
    personaEditor.remove();
  }
}

// Save all bulk changes
function saveBulkChanges() {
  try {
    // Save personas
    savePersonasFromBulkEditor();
    
    // Save stage data
    SALES_CYCLE_DATA.stages.forEach(stage => {
      const stagePrefix = stage.id.replace('-', '');
      
      // Save outcomes
      const outcomesContainer = $(`#${stagePrefix}-outcomes-container`);
      if (outcomesContainer) {
        const outcomes = [];
        const outcomeInputs = outcomesContainer.querySelectorAll('.content-input');
        outcomeInputs.forEach(input => {
          const value = input.value.trim();
          if (value) outcomes.push(value);
        });
        stage.outcomes = outcomes;
      }
      
      // Save initial personas
      const personasContainer = $(`#${stagePrefix}-personas-container`);
      if (personasContainer) {
        const personas = [];
        const personaInputs = personasContainer.querySelectorAll('.content-input');
        personaInputs.forEach(input => {
          const value = input.value.trim();
          if (value) personas.push(value);
        });
        stage.initialPersonas = personas;
      }
      
      // Save questions by category
      const questionsContainer = $(`#${stagePrefix}-questions-container`);
      if (questionsContainer) {
        const questions = {};
        const categories = questionsContainer.querySelectorAll('.question-category');
        
        categories.forEach(categoryDiv => {
          const categoryInput = categoryDiv.querySelector('.category-name-input');
          const categoryName = categoryInput.value.trim();
          
          if (categoryName) {
            const questionInputs = categoryDiv.querySelectorAll('.questions-list .content-input');
            const categoryQuestions = [];
            
            questionInputs.forEach(input => {
              const value = input.value.trim();
              if (value) categoryQuestions.push(value);
            });
            
            if (categoryQuestions.length > 0) {
              questions[categoryName] = categoryQuestions;
            }
          }
        });
        
        stage.questions = questions;
      }
    });
    
    // Re-render the entire application with new data
    renderPersonas();
    renderStages();
    
    // Re-initialize functionality that depends on the content
    initChecklists();
    initNotes();
    
    // Close modal
    const bulkAdminModal = $('#bulk-admin-modal');
    if (bulkAdminModal) bulkAdminModal.classList.add('hidden');
    
    showMessage('All changes saved successfully! 🎉', 'success');
    
  } catch (error) {
    console.error('Error saving bulk changes:', error);
    showMessage('Error saving changes: ' + error.message, 'error');
  }
}

// Save personas from bulk editor
function savePersonasFromBulkEditor() {
  ['banking', 'insurance'].forEach(industry => {
    const personaEditors = $$(`#${industry}-personas-editor .persona-editor`);
    const personas = [];
    
    personaEditors.forEach(editor => {
      const title = editor.querySelector('.persona-title').value.trim();
      const world = editor.querySelector('.persona-world').value.trim();
      const cares = editor.querySelector('.persona-cares').value.trim();
      const help = editor.querySelector('.persona-help').value.trim();
      
      if (title || world || cares || help) {
        personas.push({ title, world, cares, help });
      }
    });
    
    SALES_CYCLE_DATA.personas[industry] = personas;
  });
}

// Export all content
function exportAllContent() {
  const exportData = {
    personas: SALES_CYCLE_DATA.personas,
    stages: SALES_CYCLE_DATA.stages.map(stage => ({
      id: stage.id,
      title: stage.title,
      outcomes: stage.outcomes,
      initialPersonas: stage.initialPersonas,
      questions: stage.questions,
      objections: stage.objections,
      resources: stage.resources
    })),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `uipath-sales-guide-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showMessage('Content exported successfully! 📁', 'success');
}

// Import all content
function importAllContent(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importData = JSON.parse(e.target.result);
      
      // Validate import data
      if (!importData.personas || !importData.stages) {
        throw new Error('Invalid import file format');
      }
      
      // Update data
      if (importData.personas) {
        SALES_CYCLE_DATA.personas = importData.personas;
      }
      
      if (importData.stages) {
        importData.stages.forEach(importStage => {
          const existingStage = SALES_CYCLE_DATA.stages.find(s => s.id === importStage.id);
          if (existingStage) {
            Object.assign(existingStage, importStage);
          }
        });
      }
      
      // Reload the bulk editor with new data
      loadAllContentToBulkEditor();
      
      showMessage('Content imported successfully! 📥', 'success');
      
    } catch (error) {
      console.error('Import error:', error);
      showMessage('Error importing file: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

// Helper functions for new bulk editor interface

// Add content item (outcome, persona, etc.)
function addContentItem(container, type, value = '', stagePrefix) {
  const item = document.createElement('div');
  item.className = 'content-item';
  
  const input = type === 'outcome' ? 
    `<textarea rows="2" placeholder="Enter ${type}..." class="content-input">${value}</textarea>` :
    `<input type="text" placeholder="Enter ${type}..." value="${value}" class="content-input">`;
  
  item.innerHTML = `
    ${input}
    <button type="button" class="remove-item-btn" onclick="removeContentItem(this)">✕</button>
  `;
  
  container.appendChild(item);
  return item;
}

// Remove content item
function removeContentItem(button) {
  const item = button.closest('.content-item');
  if (item) {
    item.remove();
  }
}

// Add outcome
function addOutcome(stagePrefix) {
  const container = $(`#${stagePrefix}-outcomes-container`);
  if (container) {
    addContentItem(container, 'outcome', '', stagePrefix);
  }
}

// Add initial persona
function addInitialPersona(stagePrefix) {
  const container = $(`#${stagePrefix}-personas-container`);
  if (container) {
    addContentItem(container, 'persona', '', stagePrefix);
  }
}

// Add question category
function addQuestionCategory(stagePrefix) {
  const container = $(`#${stagePrefix}-questions-container`);
  if (container) {
    addQuestionCategoryToContainer(container, '', [], stagePrefix);
  }
}

// Add question category to container
function addQuestionCategoryToContainer(container, categoryName = '', questions = [], stagePrefix) {
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'question-category';
  
  categoryDiv.innerHTML = `
    <div class="question-category-header">
      <input type="text" placeholder="Category Name (e.g., Pain Points)" value="${categoryName}" class="category-name-input">
      <button type="button" class="add-question-btn" onclick="addQuestion(this)">+ Question</button>
      <button type="button" class="remove-item-btn" onclick="removeQuestionCategory(this)">✕</button>
    </div>
    <div class="questions-list"></div>
  `;
  
  container.appendChild(categoryDiv);
  
  // Add existing questions
  const questionsList = categoryDiv.querySelector('.questions-list');
  questions.forEach(question => {
    addQuestionToCategory(questionsList, question);
  });
  
  // Add empty question if no questions exist
  if (questions.length === 0) {
    addQuestionToCategory(questionsList, '');
  }
  
  return categoryDiv;
}

// Add question to category
function addQuestion(button) {
  const categoryDiv = button.closest('.question-category');
  const questionsList = categoryDiv.querySelector('.questions-list');
  addQuestionToCategory(questionsList, '');
}

// Add question to category list
function addQuestionToCategory(questionsList, questionText = '') {
  const questionDiv = document.createElement('div');
  questionDiv.className = 'content-item';
  
  questionDiv.innerHTML = `
    <textarea rows="2" placeholder="Enter question..." class="content-input">${questionText}</textarea>
    <button type="button" class="remove-item-btn" onclick="removeContentItem(this)">✕</button>
  `;
  
  questionsList.appendChild(questionDiv);
}

// Remove question category
function removeQuestionCategory(button) {
  const category = button.closest('.question-category');
  if (category) {
    category.remove();
  }
}

// Export all content as CSV
function exportAllContentAsCSV() {
  const csvData = [];
  
  // Add header
  csvData.push(['Type', 'Industry/Stage', 'Category', 'Field', 'Content']);
  
  // Export personas
  Object.entries(SALES_CYCLE_DATA.personas).forEach(([industry, personas]) => {
    personas.forEach((persona, index) => {
      csvData.push(['Persona', industry, `Persona ${index + 1}`, 'Title', persona.title || '']);
      csvData.push(['Persona', industry, `Persona ${index + 1}`, 'World', persona.world || '']);
      csvData.push(['Persona', industry, `Persona ${index + 1}`, 'Cares About', persona.cares || '']);
      csvData.push(['Persona', industry, `Persona ${index + 1}`, 'How We Help', persona.help || '']);
    });
  });
  
  // Export stage data
  SALES_CYCLE_DATA.stages.forEach(stage => {
    // Outcomes
    if (stage.outcomes && stage.outcomes.length > 0) {
      stage.outcomes.forEach(outcome => {
        csvData.push(['Stage', stage.title, 'Outcomes', 'Outcome', outcome]);
      });
    }
    
    // Initial Personas
    if (stage.initialPersonas && stage.initialPersonas.length > 0) {
      stage.initialPersonas.forEach(persona => {
        csvData.push(['Stage', stage.title, 'Initial Personas', 'Persona', persona]);
      });
    }
    
    // Questions
    if (stage.questions) {
      Object.entries(stage.questions).forEach(([category, questions]) => {
        questions.forEach(question => {
          csvData.push(['Stage', stage.title, 'Questions', category, question]);
        });
      });
    }
  });
  
  // Convert to CSV string
  const csvString = csvData.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = String(cell || '').replace(/"/g, '""');
      return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
  
  // Download CSV
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `sales-cycle-content-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showMessage('Content exported as CSV! 📊', 'success');
}

// Import CSV content
function importCSVContent(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csvText = e.target.result;
      const lines = csvText.split('\n');
      const header = lines[0];
      
      // Validate header
      if (!header.includes('Type') || !header.includes('Industry/Stage') || !header.includes('Content')) {
        throw new Error('Invalid CSV format. Please use the exported CSV template.');
      }
      
      // Parse CSV data
      const newPersonas = { banking: [], insurance: [] };
      const stageUpdates = {};
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parser (handles quoted fields)
        const fields = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            if (inQuotes && line[j + 1] === '"') {
              current += '"';
              j++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        fields.push(current); // Add last field
        
        if (fields.length >= 5) {
          const [type, industryOrStage, category, field, content] = fields;
          
          if (type === 'Persona') {
            const industry = industryOrStage.toLowerCase();
            if (newPersonas[industry]) {
              let persona = newPersonas[industry].find(p => p.category === category);
              if (!persona) {
                persona = { category, title: '', world: '', cares: '', help: '' };
                newPersonas[industry].push(persona);
              }
              
              switch (field) {
                case 'Title': persona.title = content; break;
                case 'World': persona.world = content; break;
                case 'Cares About': persona.cares = content; break;
                case 'How We Help': persona.help = content; break;
              }
            }
          } else if (type === 'Stage') {
            if (!stageUpdates[industryOrStage]) {
              stageUpdates[industryOrStage] = { outcomes: [], initialPersonas: [], questions: {} };
            }
            
            const stageData = stageUpdates[industryOrStage];
            
            if (category === 'Outcomes') {
              stageData.outcomes.push(content);
            } else if (category === 'Initial Personas') {
              stageData.initialPersonas.push(content);
            } else if (category === 'Questions') {
              if (!stageData.questions[field]) {
                stageData.questions[field] = [];
              }
              stageData.questions[field].push(content);
            }
          }
        }
      }
      
      // Update personas
      Object.entries(newPersonas).forEach(([industry, personas]) => {
        if (personas.length > 0) {
          SALES_CYCLE_DATA.personas[industry] = personas.map(p => ({
            title: p.title || '',
            world: p.world || '',
            cares: p.cares || '',
            help: p.help || ''
          }));
        }
      });
      
      // Update stages
      Object.entries(stageUpdates).forEach(([stageTitle, updates]) => {
        const stage = SALES_CYCLE_DATA.stages.find(s => s.title === stageTitle);
        if (stage) {
          if (updates.outcomes.length > 0) stage.outcomes = updates.outcomes;
          if (updates.initialPersonas.length > 0) stage.initialPersonas = updates.initialPersonas;
          if (Object.keys(updates.questions).length > 0) stage.questions = updates.questions;
        }
      });
      
      // Reload the bulk editor with new data
      loadAllContentToBulkEditor();
      
      showMessage('CSV content imported successfully! 📊', 'success');
      
    } catch (error) {
      console.error('CSV import error:', error);
      showMessage('Error importing CSV: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}