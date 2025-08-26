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
        <div class="bg-gray-50 p-5 rounded-lg shadow relative editable-card" id="persona-${ind}-${i}">
          <h3 class="text-lg font-semibold uipath-robotic-orange flex justify-between items-center">
            <span>${p.title}</span>
            <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="persona-${ind}-${i}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg>
          </h3>
          <div class="editable-content">
            <ul class="space-y-2">
              <li><strong>Their world:</strong> ${p.world}</li>
              <li><strong>What they care about:</strong> ${p.cares}</li>
              <li><strong>How UiPath helps:</strong> ${p.help}</li>
            </ul>
          </div>
        </div>`
    });
  });
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
        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" data-generate-followups="${stage.id}">✨ Generate Follow-up Questions</button>
        <div class="mt-4" id="${stage.id}-generated"></div>
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

// MODIFIED: questionsHtml now adds a unique data-note-id to each textarea
const questionsHtml = (map)=>{
  let questionIndex = 0;
  return Object.entries(map).map(([k,qs])=>{
    const categoryHtml = qs.map(q=>{
      // Create a unique ID for each note textarea
      const noteId = `discovery-q-${k.replace(/\s+/g, '-')}-${questionIndex++}`;
      return `
      <details class="mb-3 bg-white p-3 rounded-md border">
        <summary class="font-semibold text-gray-700">${q}</summary>
        <textarea data-note-id="${noteId}" class="note-textarea w-full mt-2 p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" rows="3" placeholder="Capture notes here..."></textarea>
      </details>`
    }).join('');
    return `<div class="mb-4"><h4 class="text-lg font-bold text-gray-800 mb-2">${k}</h4>${categoryHtml}</div>`
  }).join('')
}

const objectionsHtml = (items)=>{
  return items.map(it=>`
    <details class="mb-3 bg-white p-3 rounded-md border">
      <summary class="font-semibold text-gray-700 flex justify-between"><span>${it.q}</span><button class="ai-response-btn ml-4 px-2 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300" data-obj="${encodeURIComponent(it.q)}">✨ Get AI Response</button></summary>
      <p class="mt-2 text-gray-600"><strong>Response:</strong> ${it.a}</p>
    </details>`).join('')
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
  const exportBtn = $('#export-notes-btn');
  const exportBtnMobile = $('#export-notes-btn-mobile');
  
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
  
  if (exportBtn) exportBtn.addEventListener('click', handleExport);
  if (exportBtnMobile) exportBtnMobile.addEventListener('click', handleExport);
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
async function callGemini(prompt){
  // AI integration placeholder
  return 'AI functionality not implemented yet.';
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
});