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
          <h3 class="flex justify-between items-center">
            <span>${p.title}</span>
            <svg class="edit-icon w-5 h-5 text-gray-400 hover:text-orange-600 transition-colors" data-target="persona-${ind}-${i}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg>
          </h3>
          <div class="editable-content">
            <ul class="space-y-3">
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
        <div class="flex gap-3 mt-4">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" data-generate-followups="${stage.id}">✨ AI: Generate Follow-up Questions</button>
          <button class="export-notes-btn px-4 py-2 text-white rounded-md font-semibold flex items-center" style="background-color: #FA4616; hover:background-color: #E03E0F;" onmouseover="this.style.backgroundColor='#E03E0F'" onmouseout="this.style.backgroundColor='#FA4616'">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7m-6 4h6m-6-4h6m-3-4h.01M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
            </svg>
            Copy Notes
          </button>
        </div>
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
      <summary class="font-semibold text-gray-700 flex justify-between"><span>${it.q}</span><button class="ai-response-btn ml-4 px-2 py-1 text-xs bg-purple-200 text-purple-800 rounded-md hover:bg-purple-300" data-obj="${encodeURIComponent(it.q)}">✨ AI Response</button></summary>
      <div class="mt-2">
        <p class="text-gray-600"><strong>Standard Response:</strong> ${it.a}</p>
        <div class="ai-custom-response mt-3 hidden">
          <p class="text-purple-600 font-semibold">AI-Generated Response:</p>
          <div class="ai-response-content bg-purple-50 p-3 rounded-md mt-2 text-gray-700"></div>
        </div>
      </div>
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
  // Initialize AI integration
  if (typeof initializeAI === 'function') {
    aiIntegration = initializeAI();
  }

  // AI Settings button handlers
  const aiSettingsBtn = $('#ai-settings-btn');
  const aiSettingsBtnMobile = $('#ai-settings-btn-mobile');
  
  const showAISettings = () => {
    const modal = $('#ai-modal');
    if (modal) {
      loadAISettings();
      modal.classList.remove('hidden');
    }
  };

  if (aiSettingsBtn) aiSettingsBtn.addEventListener('click', showAISettings);
  if (aiSettingsBtnMobile) aiSettingsBtnMobile.addEventListener('click', showAISettings);

  // AI Modal handlers
  const aiModal = $('#ai-modal');
  const aiModalCancel = $('#ai-modal-cancel');
  const aiModalSave = $('#ai-modal-save');

  if (aiModalCancel) {
    aiModalCancel.addEventListener('click', () => {
      if (aiModal) aiModal.classList.add('hidden');
    });
  }

  if (aiModalSave) {
    aiModalSave.addEventListener('click', saveAISettings);
  }

  // Temperature slider
  const temperatureSlider = $('#ai-temperature');
  const temperatureValue = $('#temperature-value');
  if (temperatureSlider && temperatureValue) {
    temperatureSlider.addEventListener('input', (e) => {
      temperatureValue.textContent = e.target.value;
    });
  }

  // Test connection button
  const testBtn = $('#test-ai-connection');
  if (testBtn) {
    testBtn.addEventListener('click', testAIConnection);
  }

  // Provider selection
  $$('input[name="ai-provider"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (aiIntegration && radio.checked) {
        aiIntegration.switchProvider(radio.value);
      }
    });
  });

  initAIButtons();
}

function loadAISettings() {
  if (!aiIntegration) return;

  const config = aiIntegration.config;

  // Load provider selection
  const providerRadio = $(`#provider-${config.selectedProvider}`);
  if (providerRadio) {
    providerRadio.checked = true;
    providerRadio.closest('.ai-provider-option').querySelector('label').classList.add('border-purple-500', 'bg-purple-50');
  }

  // Load API keys (masked)
  Object.entries(config.apiKeys).forEach(([provider, key]) => {
    const input = $(`#${provider}-api-key`);
    if (input && key) {
      input.value = '*'.repeat(key.length);
      input.dataset.hasKey = 'true';
    }
  });

  // Load advanced settings
  const tempSlider = $('#ai-temperature');
  const tempValue = $('#temperature-value');
  const maxTokens = $('#ai-max-tokens');

  if (tempSlider) {
    tempSlider.value = config.temperature;
    if (tempValue) tempValue.textContent = config.temperature;
  }

  if (maxTokens) {
    maxTokens.value = config.maxTokens;
  }
}

function saveAISettings() {
  if (!aiIntegration) return;

  // Get selected provider
  const selectedProvider = $$('input[name="ai-provider"]:checked')[0]?.value;
  if (selectedProvider) {
    aiIntegration.switchProvider(selectedProvider);
  }

  // Save API keys (only if they've been modified)
  ['claude'].forEach(provider => {
    const input = $(`#${provider}-api-key`);
    if (input && input.value && !input.value.startsWith('*')) {
      aiIntegration.setApiKey(provider, input.value);
    }
  });

  // Save advanced settings
  const tempSlider = $('#ai-temperature');
  const maxTokens = $('#ai-max-tokens');

  if (tempSlider) {
    aiIntegration.config.temperature = parseFloat(tempSlider.value);
  }

  if (maxTokens) {
    aiIntegration.config.maxTokens = parseInt(maxTokens.value);
  }

  aiIntegration.saveConfig();

  // Close modal
  const modal = $('#ai-modal');
  if (modal) modal.classList.add('hidden');

  showMessage('AI settings saved successfully!', 'success');
}

async function testAIConnection() {
  if (!aiIntegration) {
    showMessage('AI integration not available', 'error');
    return;
  }

  const testBtn = $('#test-ai-connection');
  const resultDiv = $('#ai-test-result');

  if (testBtn) {
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
  }

  try {
    const result = await aiIntegration.testConnection();
    
    if (resultDiv) {
      resultDiv.classList.remove('hidden');
      if (result.success) {
        resultDiv.className = 'mt-2 text-sm text-green-600';
        resultDiv.textContent = `✅ Connection successful with ${result.provider}`;
      } else {
        resultDiv.className = 'mt-2 text-sm text-red-600';
        resultDiv.textContent = `❌ Connection failed: ${result.error}`;
      }
    }
  } catch (error) {
    if (resultDiv) {
      resultDiv.classList.remove('hidden');
      resultDiv.className = 'mt-2 text-sm text-red-600';
      resultDiv.textContent = `❌ Test failed: ${error.message}`;
    }
  }

  if (testBtn) {
    testBtn.disabled = false;
    testBtn.textContent = 'Test Connection';
  }
}

function initAIButtons() {
  // Follow-up questions generation
  document.addEventListener('click', async (e) => {
    if (e.target.matches('[data-generate-followups]')) {
      e.preventDefault();
      await generateFollowUpQuestions(e.target.dataset.generateFollowups);
    }
  });

  // AI objection responses
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.ai-response-btn')) {
      e.preventDefault();
      e.stopPropagation();
      await generateObjectionResponse(e.target);
    }
  });
}

async function generateFollowUpQuestions(stageId) {
  if (!aiIntegration) {
    showMessage('Please configure AI settings first', 'error');
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

async function generateObjectionResponse(button) {
  if (!aiIntegration) {
    showMessage('Please configure AI settings first', 'error');
    return;
  }

  const objection = decodeURIComponent(button.dataset.obj);
  const responseContainer = button.closest('details').querySelector('.ai-custom-response');
  const responseContent = button.closest('details').querySelector('.ai-response-content');

  if (!responseContainer || !responseContent) return;

  button.disabled = true;
  button.textContent = '⏳ Generating...';

  try {
    // Get context from the current stage and customer notes
    const stageId = button.closest('.content-section')?.id;
    const context = {
      stage: stageId,
      customerNotes: collectCustomerNotes(stageId),
      industry: SALES_CYCLE_DATA.industry
    };

    const response = await aiIntegration.generateObjectionResponse(objection, context);

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
  button.textContent = '✨ AI Response';
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
});