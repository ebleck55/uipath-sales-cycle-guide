/**
 * Timeline Navigation UiPath Sales Cycle Guide
 * Modern timeline-based navigation with stage progression
 */

// ==================== SECURITY MODULE ====================
class HTMLSanitizer {
  constructor() {
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li']
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    return this.escapeHtml(html);
  }

  // New method for rendering safe HTML content
  renderSafeHTML(content) {
    if (typeof content !== 'string') return '';
    
    // Allow specific safe HTML tags and escape the rest
    return content
      .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>')
      .replace /<strong>(.*?)<\/strong>/gi, '<strong>$1</strong>')
      .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>')
      .replace(/<em>(.*?)<\/em>/gi, '<em>$1</em>')
      .replace(/&lt;br&gt;/gi, '<br>')
      .replace(/<br>/gi, '<br>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
}

const sanitizer = new HTMLSanitizer();

// ==================== STATE MANAGEMENT ====================
class AppState {
  constructor() {
    this.state = {
      currentIndustry: 'banking',
      currentStage: 0,
      adminMode: false,
      checkboxes: new Map(),
      notes: new Map()
    };
    this.listeners = new Map();
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notifyListeners(key, value, oldValue);
  }

  notifyListeners(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  }

  toggleCheckbox(checkboxId, checked) {
    const checkboxes = new Map(this.state.checkboxes);
    if (checked) {
      checkboxes.set(checkboxId, true);
    } else {
      checkboxes.delete(checkboxId);
    }
    this.set('checkboxes', checkboxes);
  }

  updateNote(noteId, content) {
    const notes = new Map(this.state.notes);
    if (content && content.trim()) {
      notes.set(noteId, content);
    } else {
      notes.delete(noteId);
    }
    this.set('notes', notes);
  }

  clearFormState() {
    this.set('checkboxes', new Map());
    this.set('notes', new Map());
  }
}

const appState = new AppState();

// ==================== DOM UTILITIES ====================
function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

// ==================== MAIN APPLICATION ====================
class TimelineUiPathApp {
  constructor() {
    this.initialized = false;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing Timeline UiPath Sales Guide...');
      
      // Initialize UI
      this.initializeUI();
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      // Load and render data
      this.loadData();
      
      this.initialized = true;
      console.log('Application initialized successfully');
      
      // Hide loading indicator
      const loading = $('#app-loading');
      if (loading) {
        loading.style.display = 'none';
      }
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh and try again.');
    }
  }

  initializeUI() {
    // Subscribe to state changes
    appState.subscribe('currentStage', (stageIndex) => {
      this.renderStageContent(stageIndex);
      this.updateTimelineUI(stageIndex);
    });

    appState.subscribe('currentIndustry', (industry) => {
      this.updateIndustryUI(industry);
      this.loadData();
    });

    appState.subscribe('adminMode', (enabled) => {
      document.body.classList.toggle('admin-mode', enabled);
      this.updateAdminUI(enabled);
    });
  }

  initializeEventListeners() {
    // Global click handler
    document.addEventListener('click', (e) => {
      // Handle timeline dot clicks
      if (e.target.closest('.timeline-dot')) {
        e.preventDefault();
        const dot = e.target.closest('.timeline-dot');
        const stageIndex = parseInt(dot.dataset.stage);
        if (!isNaN(stageIndex)) {
          appState.set('currentStage', stageIndex);
        }
      }
      
      // Handle export notes
      if (e.target.closest('.export-notes-btn')) {
        e.preventDefault();
        this.handleExportNotes();
      }
      
      // Handle clear all
      if (e.target.closest('.clear-all-btn')) {
        e.preventDefault();
        this.handleClearAll();
      }
      
      // Handle admin mode toggle
      if (e.target.closest('#admin-mode-btn') || e.target.closest('#mobile-admin-btn')) {
        e.preventDefault();
        this.toggleAdminMode();
      }
      
      // Handle industry switcher
      if (e.target.closest('.industry-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.industry-btn');
        const industry = btn.dataset.industry;
        if (industry) {
          appState.set('currentIndustry', industry);
        }
      }
      
      // Handle mobile menu
      if (e.target.closest('#mobile-menu-btn')) {
        e.preventDefault();
        const menu = $('#mobile-menu');
        if (menu) {
          menu.classList.toggle('hidden');
        }
      }

      // Handle collapsible sections
      if (e.target.closest('.collapsible-header')) {
        e.preventDefault();
        const header = e.target.closest('.collapsible-header');
        const section = header.parentElement;
        const content = section.querySelector('.collapsible-content');
        const chevron = header.querySelector('.chevron-icon');
        
        if (content && chevron) {
          const isHidden = content.classList.contains('hidden');
          content.classList.toggle('hidden');
          chevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
          
          // Update the hint text
          const hintText = header.querySelector('span');
          if (hintText) {
            // Removed hint text functionality
          }
        }
      }
      
      // Handle AI response buttons
      if (e.target.closest('.ai-question-response-btn')) {
        e.preventDefault();
        this.handleAIResponse(e.target.closest('.ai-question-response-btn'));
      }
      
      // Handle AI objection response buttons
      if (e.target.closest('.ai-objection-response-btn')) {
        e.preventDefault();
        this.handleAIObjectionResponse(e.target.closest('.ai-objection-response-btn'));
      }

      // Handle navigation arrows
      if (e.target.closest('.nav-prev')) {
        e.preventDefault();
        this.navigateToPreviousStage();
      }
      
      if (e.target.closest('.nav-next')) {
        e.preventDefault();
        this.navigateToNextStage();
      }
    });
    
    // Handle checkbox changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const checkboxId = e.target.dataset.id;
        if (checkboxId) {
          appState.toggleCheckbox(checkboxId, e.target.checked);
          e.target.closest('label')?.classList.toggle('checked-item', e.target.checked);
        }
      }
    });
    
    // Handle textarea input
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('note-textarea')) {
        const noteId = e.target.dataset.noteId;
        if (noteId) {
          appState.updateNote(noteId, e.target.value);
        }
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateToPreviousStage();
      } else if (e.key === 'ArrowRight') {
        this.navigateToNextStage();
      }
    });
  }

  loadData() {
    if (typeof SALES_CYCLE_DATA === 'undefined') {
      console.error('Sales cycle data not loaded, waiting...');
      setTimeout(() => {
        if (typeof SALES_CYCLE_DATA === 'undefined') {
          console.error('Sales cycle data still not loaded');
          this.showError('Failed to load sales data. Please refresh the page.');
          return;
        }
        this.loadData();
      }, 500);
      return;
    }
    
    console.log('Loading data with', SALES_CYCLE_DATA.stages?.length, 'stages');
    
    // Render personas
    this.renderPersonas();
    this.renderUseCases();
    
    // Render timeline
    this.renderTimeline();
    
    // Render initial stage content
    this.renderStageContent(appState.get('currentStage') || 0);
    
    // Set default expanded states
    this.setDefaultExpandedStates();
  }

  renderTimeline() {
    const container = $('#timeline-container');
    if (!container || !SALES_CYCLE_DATA.stages) return;
    
    const stages = SALES_CYCLE_DATA.stages;
    const currentStage = appState.get('currentStage') || 0;
    
    const timelineHTML = `
      <div class="relative">
        <!-- Progress Line -->
        <div class="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
        <div class="absolute top-8 left-0 h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500" 
             style="width: ${((currentStage + 1) / stages.length) * 100}%"></div>
        
        <!-- Timeline Dots -->
        <div class="relative flex justify-between items-start">
          ${stages.map((stage, index) => {
            const isActive = index === currentStage;
            
            return `
              <div class="timeline-dot flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105"
                   data-stage="${index}">
                <div class="relative">
                  <div class="w-16 h-16 rounded-full ${isActive ? 'bg-orange-500' : 'bg-gray-300'} flex items-center justify-center text-white font-bold text-lg mb-3 
                              transition-all duration-300 group-hover:shadow-lg ${isActive ? 'ring-4 ring-orange-200 scale-110' : ''} hover:bg-orange-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  ${isActive ? '<div class="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25"></div>' : ''}
                </div>
                <div class="text-center">
                  <div class="font-semibold text-sm ${isActive ? 'text-orange-600' : 'text-gray-600'} mb-1 max-w-20 leading-tight">${sanitizer.escapeHtml(stage.title)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = timelineHTML;
  }

  renderPersonas() {
    const container = $('#personas-container');
    if (!container || !SALES_CYCLE_DATA.personas) return;
    
    const currentIndustry = appState.get('currentIndustry');
    const personas = SALES_CYCLE_DATA.personas[currentIndustry] || [];
    
    const personasHTML = personas.map(persona => `
      <div class="persona-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div class="collapsible-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-section="persona-card">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-blue-700 flex items-center">
              <svg class="chevron-icon w-4 h-4 mr-2 text-blue-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              ${sanitizer.renderSafeHTML(persona.title)}
            </h3>
          </div>
        </div>
        <div class="collapsible-content hidden px-4 pb-4">
          <div class="space-y-2 pt-2 border-t border-gray-100">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Their World:</h4>
              <p class="text-xs text-gray-600 leading-relaxed">${sanitizer.renderSafeHTML(persona.world || '')}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">What They Care About:</h4>
              <p class="text-xs text-gray-600 leading-relaxed">${sanitizer.renderSafeHTML(persona.cares || '')}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">How UiPath Helps:</h4>
              <p class="text-xs text-gray-600 leading-relaxed">${sanitizer.renderSafeHTML(persona.help || '')}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = personasHTML || '<p class="text-gray-500 col-span-full text-center">No personas available for this industry.</p>';
  }

  renderUseCases() {
    const container = document.getElementById('use-cases-container');
    if (!container) return;
    
    const currentIndustry = appState.get('currentIndustry');
    
    const useCasesData = {
      banking: [
        { category: 'Consumer Banking', color: 'blue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', cases: [
          { name: 'Consumer Banking Operations', page: 10 },
          { name: 'Credit Risk Assessment', page: 15 },
          { name: 'Commercial Lending', page: 20 },
          { name: 'Trade Finance Automation', page: 25 }
        ]},
        { category: 'Capital Markets', color: 'indigo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', cases: [
          { name: 'Capital Markets Processing', page: 30 },
          { name: 'Wealth Management', page: 35 },
          { name: 'Payments Processing', page: 40 },
          { name: 'Treasury Operations', page: 45 }
        ]}
      ],
      insurance: [
        { category: 'Core Insurance', color: 'green', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', cases: [
          { name: 'Claims Processing', page: 50 },
          { name: 'Policy Administration', page: 52 },
          { name: 'Underwriting Automation', page: 54 },
          { name: 'Customer Onboarding', page: 56 }
        ]},
        { category: 'Operations', color: 'teal', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cases: [
          { name: 'Regulatory Reporting', page: 58 },
          { name: 'Fraud Detection', page: 60 },
          { name: 'Risk Assessment', page: 62 },
          { name: 'Compliance Monitoring', page: 64 }
        ]}
      ]
    };

    // Common horizontal functions for both industries
    const horizontalFunctions = [
      { category: 'IT Operations', color: 'purple', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cases: [
        { name: 'ServiceNow Integration', page: 66 },
        { name: 'System Monitoring', page: 68 },
        { name: 'Data Migration', page: 70 },
        { name: 'Infrastructure Automation', page: 72 }
      ]},
      { category: 'Finance & Operations', color: 'orange', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', cases: [
        { name: 'Invoice Processing', page: 74 },
        { name: 'Financial Reconciliation', page: 76 },
        { name: 'Expense Management', page: 78 },
        { name: 'Procurement Automation', page: 80 }
      ]}
    ];

    const industryUseCases = useCasesData[currentIndustry] || [];
    const allUseCases = [...industryUseCases, ...horizontalFunctions];

    const getColorClasses = (color) => {
      const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-900', link: 'text-blue-700', linkHover: 'hover:text-blue-900' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', link: 'text-indigo-700', linkHover: 'hover:text-indigo-900' },
        green: { bg: 'bg-green-50', text: 'text-green-900', link: 'text-green-700', linkHover: 'hover:text-green-900' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-900', link: 'text-teal-700', linkHover: 'hover:text-teal-900' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-900', link: 'text-purple-700', linkHover: 'hover:text-purple-900' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-900', link: 'text-orange-700', linkHover: 'hover:text-orange-900' }
      };
      return colorMap[color] || colorMap.blue;
    };

    const useCasesHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        ${allUseCases.map(category => {
          const colors = getColorClasses(category.color);
          return `
          <div class="${colors.bg} rounded-lg p-6">
            <h3 class="text-lg font-semibold ${colors.text} mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${category.icon}"/>
              </svg>
              ${sanitizer.renderSafeHTML(category.category)}
            </h3>
            <ul class="space-y-2">
              ${category.cases.map(useCase => `
                <li><button class="use-case-link text-sm ${colors.link} ${colors.linkHover} text-left transition-colors" data-page="${useCase.page}" data-name="${sanitizer.escapeHtml(useCase.name)}">• ${sanitizer.renderSafeHTML(useCase.name)}</button></li>
              `).join('')}
            </ul>
          </div>
        `;
        }).join('')}
      </div>
    `;

    container.innerHTML = useCasesHTML;
  }

  setDefaultExpandedStates() {
    // Default expand personas and use cases sections
    setTimeout(() => {
      const personasSection = document.querySelector('#personas-section .collapsible-content');
      const personasChevron = document.querySelector('#personas-section .chevron-icon');
      
      if (personasSection && personasChevron) {
        personasSection.classList.remove('hidden');
        personasChevron.style.transform = 'rotate(90deg)';
      }
      
      const useCasesSection = document.querySelector('#use-cases-section .collapsible-content');
      const useCasesChevron = document.querySelector('#use-cases-section .chevron-icon');
      
      if (useCasesSection && useCasesChevron) {
        useCasesSection.classList.remove('hidden');
        useCasesChevron.style.transform = 'rotate(90deg)';
      }
    }, 100);
  }

  renderStageContent(stageIndex) {
    const container = $('#stage-content');
    if (!container || !SALES_CYCLE_DATA.stages) return;
    
    const stage = SALES_CYCLE_DATA.stages[stageIndex];
    if (!stage) return;
    
    const currentIndustry = appState.get('currentIndustry');
    
    const contentHTML = `
      <!-- Stage Header -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">
            ${sanitizer.escapeHtml(stage.title)}
          </h2>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <!-- Outcomes -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-orange-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Verifiable Outcomes
          </h3>
          <div class="space-y-3">
            ${(stage.outcomes || []).map((outcome, i) => `
              <label class="flex items-start cursor-pointer group">
                <input type="checkbox" class="mt-1 mr-3 h-5 w-5 text-orange-600 rounded focus:ring-orange-500" 
                       data-id="stage-${stageIndex}-outcome-${i}">
                <span class="text-gray-700 group-hover:text-gray-900">${sanitizer.renderSafeHTML(outcome)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Initial Personas -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-blue-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Personas
          </h3>
          <ul class="space-y-2">
            ${(stage.initialPersonas || []).map(persona => `
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                <span class="text-gray-700">${sanitizer.renderSafeHTML(persona)}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Resources -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-green-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Key Resources
          </h3>
          <ul class="space-y-2">
            ${((stage.resources?.[currentIndustry] || []).slice(0, 5)).map(resource => `
              <li>
                <a href="${sanitizer.escapeHtml(resource.link)}" 
                   class="text-blue-600 hover:underline text-sm" 
                   target="_blank" rel="noopener noreferrer">
                  → ${sanitizer.renderSafeHTML(resource.name)}
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <!-- Discovery Questions -->
      <div class="bg-white rounded-lg shadow-lg mb-6 discovery-questions-section">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="discovery-questions">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-purple-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-purple-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Key Discovery Questions
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid md:grid-cols-2 gap-4">
            ${Object.entries(stage.questions || {}).map(([category, questions]) => `
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-3">${sanitizer.renderSafeHTML(category)}</h4>
                <div class="space-y-3">
                  ${questions.map((q, i) => {
                    const noteId = `stage-${stageIndex}-q-${category.replace(/\s+/g, '-')}-${i}`;
                    return `
                      <details class="bg-white rounded border border-gray-200 question-details">
                        <summary class="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700 text-sm">
                          ${sanitizer.renderSafeHTML(q)}
                        </summary>
                        <div class="p-3 pt-0 space-y-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Your Notes & Customer Response:</label>
                            <textarea class="note-textarea w-full p-2 border border-gray-300 rounded text-sm resize-none" 
                                     rows="3" 
                                     placeholder="Capture customer responses and your notes here..."
                                     data-note-id="${noteId}"></textarea>
                          </div>
                          <div class="flex justify-end">
                            <button class="ai-question-response-btn px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition-colors flex items-center"
                                    data-question="${encodeURIComponent(q)}" data-note-id="${noteId}">
                              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                              </svg>
                              AI Response
                            </button>
                          </div>
                        </div>
                      </details>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Common Objections -->
      <div class="bg-white rounded-lg shadow-lg mb-6 objections-section">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="objections">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-red-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-red-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Common Objections
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid md:grid-cols-2 gap-4">
            ${(stage.objections || []).map((objection, i) => {
              const objectionId = `stage-${stageIndex}-obj-${i}`;
              return `
                <div class="bg-gray-50 p-4 rounded-lg">
                  <details class="bg-white rounded border border-gray-200 objection-details">
                    <summary class="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700 text-sm">
                      ${sanitizer.renderSafeHTML(objection.q)}
                    </summary>
                    <div class="p-3 pt-0 space-y-3">
                      <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                        <h5 class="text-sm font-semibold text-green-700 mb-2 flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Suggested Response:
                        </h5>
                        <p class="text-sm text-gray-700">${sanitizer.renderSafeHTML(objection.a)}</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Your Custom Response & Notes:</label>
                        <textarea class="note-textarea w-full p-2 border border-gray-300 rounded text-sm resize-none" 
                                 rows="3" 
                                 placeholder="Add your own response strategy and notes for this objection..."
                                 data-note-id="${objectionId}"></textarea>
                      </div>
                      <div class="flex justify-end">
                        <button class="ai-objection-response-btn px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition-colors flex items-center"
                                data-objection="${encodeURIComponent(objection.q)}" 
                                data-context="${encodeURIComponent(objection.a)}"
                                data-note-id="${objectionId}">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                          </svg>
                          AI Response
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center">
        <button class="nav-prev px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors
                       ${stageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
          ← Previous Stage
        </button>
        
        <div class="flex gap-3">
          <button class="export-notes-btn px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy Notes
          </button>
          <button class="clear-all-btn px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
            Clear All
          </button>
        </div>
        
        <button class="nav-next px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors
                       ${stageIndex === SALES_CYCLE_DATA.stages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">
          Next Stage →
        </button>
      </div>
    `;
    
    container.innerHTML = contentHTML;
    
    // Restore checkbox states
    this.restoreFormState(stageIndex);
  }

  restoreFormState(stageIndex) {
    // Restore checkboxes
    appState.state.checkboxes.forEach((checked, checkboxId) => {
      if (checkboxId.startsWith(`stage-${stageIndex}-`)) {
        const checkbox = $(`[data-id="${checkboxId}"]`);
        if (checkbox) {
          checkbox.checked = checked;
          checkbox.closest('label')?.classList.toggle('checked-item', checked);
        }
      }
    });
    
    // Restore notes
    appState.state.notes.forEach((content, noteId) => {
      if (noteId.startsWith(`stage-${stageIndex}-`)) {
        const textarea = $(`[data-note-id="${noteId}"]`);
        if (textarea) {
          textarea.value = content;
        }
      }
    });
  }

  updateTimelineUI(stageIndex) {
    // Re-render timeline to show updated active state
    this.renderTimeline();
  }

  navigateToPreviousStage() {
    const currentStage = appState.get('currentStage') || 0;
    if (currentStage > 0) {
      appState.set('currentStage', currentStage - 1);
    }
  }

  navigateToNextStage() {
    const currentStage = appState.get('currentStage') || 0;
    if (SALES_CYCLE_DATA.stages && currentStage < SALES_CYCLE_DATA.stages.length - 1) {
      appState.set('currentStage', currentStage + 1);
    }
  }

  toggleAdminMode() {
    const currentMode = appState.get('adminMode');
    appState.set('adminMode', !currentMode);
  }

  updateAdminUI(enabled) {
    const adminBtn = $('#admin-mode-btn');
    const mobileAdminBtn = $('#mobile-admin-btn');
    const adminStatus = $('#admin-status');
    
    if (adminBtn) {
      adminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
      adminBtn.classList.toggle('bg-orange-600', enabled);
      adminBtn.classList.toggle('text-white', enabled);
    }
    
    if (mobileAdminBtn) {
      mobileAdminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
    }
    
    if (adminStatus) {
      adminStatus.classList.toggle('hidden', !enabled);
    }
  }

  updateIndustryUI(industry) {
    $$('.industry-btn').forEach(btn => {
      const isActive = btn.dataset.industry === industry;
      btn.classList.toggle('bg-orange-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('bg-white', !isActive);
      btn.classList.toggle('text-gray-700', !isActive);
    });
    
    this.renderPersonas();
    this.renderUseCases();
  }

  async handleExportNotes() {
    try {
      const notes = this.collectAllNotes();
      
      if (!notes.trim()) {
        this.showNotification('No notes to export', 'warning');
        return;
      }
      
      const success = await copyToClipboard(notes);
      
      if (success) {
        this.showNotification('Notes copied to clipboard!', 'success');
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to copy notes. Please try selecting and copying manually.');
    }
  }

  collectAllNotes() {
    const notes = [];
    const notesMap = appState.get('notes');
    
    SALES_CYCLE_DATA.stages.forEach((stage, index) => {
      const stageNotes = [];
      
      notesMap.forEach((value, key) => {
        if (key.startsWith(`stage-${index}-`) && value.trim()) {
          stageNotes.push(`- ${value.trim()}`);
        }
      });
      
      if (stageNotes.length > 0) {
        notes.push(`\n=== Stage ${index + 1}: ${stage.title} ===\n${stageNotes.join('\n')}`);
      }
    });
    
    return notes.join('\n\n').trim();
  }

  handleClearAll() {
    if (confirm('Are you sure you want to clear all checkboxes and notes? This cannot be undone.')) {
      appState.clearFormState();
      
      $$('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('label')?.classList.remove('checked-item');
      });
      
      $$('.note-textarea').forEach(textarea => {
        textarea.value = '';
      });
      
      this.showNotification('All data cleared', 'success');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 animate-slideIn ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>' :
            type === 'warning' ? '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>' :
            type === 'error' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>' :
            '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  async handleAIResponse(button) {
    const question = decodeURIComponent(button.dataset.question);
    const noteId = button.dataset.noteId;
    const textarea = $(`[data-note-id="${noteId}"]`);
    
    if (!question || !textarea) {
      this.showError('Unable to process AI response request');
      return;
    }

    // Check if AI integration is available
    if (!this.isAIAvailable()) {
      this.showAISetupModal();
      return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;

    try {
      const context = this.buildAIContext(question);
      const response = await this.generateAIResponse(question, context);
      
      // Append response to existing notes or create new
      const existingNotes = textarea.value.trim();
      const newContent = existingNotes 
        ? `${existingNotes}\n\n--- AI Response ---\n${response}`
        : `--- AI Response ---\n${response}`;
      
      textarea.value = newContent;
      
      // Update state
      appState.updateNote(noteId, newContent);
      
      this.showNotification('AI response generated successfully!', 'success');
    } catch (error) {
      console.error('AI response generation failed:', error);
      this.showError('Failed to generate AI response. Please check your API key and try again.');
    } finally {
      // Reset button
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  isAIAvailable() {
    // Check for stored API key (simplified version)
    const apiKey = sessionStorage.getItem('claude_api_key');
    return apiKey && apiKey.length > 0;
  }

  buildAIContext(question) {
    const currentIndustry = appState.get('currentIndustry');
    const currentStage = appState.get('currentStage') || 0;
    const stageName = SALES_CYCLE_DATA.stages[currentStage]?.title || 'Unknown Stage';
    
    return {
      industry: currentIndustry,
      stage: stageName,
      question: question
    };
  }

  async generateAIResponse(question, context) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const prompt = `You are a UiPath sales expert helping with ${context.industry} industry prospects in the ${context.stage} stage.

Question: "${question}"

Please provide a helpful response that:
1. Suggests what to listen for in the customer's answer
2. Provides follow-up questions to ask
3. Identifies potential objections or concerns
4. Suggests how UiPath's solutions address this area

Keep your response concise and actionable (2-3 paragraphs maximum).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }

  showAISetupModal() {
    // Create a simple modal for API key setup
    const modalHTML = `
      <div id="ai-setup-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">AI Response Setup</h3>
          <p class="text-sm text-gray-600 mb-4">
            To use AI-powered responses, please enter your Claude API key. Your key is stored securely in your browser session.
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Claude API Key</label>
              <input type="password" id="ai-api-key" placeholder="sk-ant-api03-..." 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <p class="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://console.anthropic.com" target="_blank" class="text-blue-600 hover:underline">console.anthropic.com</a>
              </p>
            </div>
            <div class="flex justify-end space-x-3">
              <button id="ai-setup-cancel" class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button id="ai-setup-save" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = $('#ai-setup-modal');
    const cancelBtn = $('#ai-setup-cancel');
    const saveBtn = $('#ai-setup-save');
    const apiKeyInput = $('#ai-api-key');
    
    const closeModal = () => {
      modal?.remove();
    };
    
    cancelBtn?.addEventListener('click', closeModal);
    
    saveBtn?.addEventListener('click', () => {
      const apiKey = apiKeyInput?.value.trim();
      if (apiKey) {
        sessionStorage.setItem('claude_api_key', apiKey);
        this.showNotification('API key saved! You can now use AI responses.', 'success');
        closeModal();
      } else {
        this.showError('Please enter a valid API key');
      }
    });
    
    // Close on outside click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  async handleAIObjectionResponse(button) {
    const objection = decodeURIComponent(button.dataset.objection);
    const context = decodeURIComponent(button.dataset.context);
    const noteId = button.dataset.noteId;
    const textarea = document.querySelector(`[data-note-id="${noteId}"]`);
    
    if (!objection || !textarea) {
      this.showError('Unable to process AI objection response request');
      return;
    }

    // Check if AI integration is available
    if (!this.isAIAvailable()) {
      this.showAISetupModal();
      return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;

    try {
      const response = await this.generateAIObjectionResponse(objection, context);
      
      // Append response to existing notes or create new
      const existingNotes = textarea.value.trim();
      const newContent = existingNotes 
        ? `${existingNotes}\n\n--- AI Enhanced Response ---\n${response}`
        : `--- AI Enhanced Response ---\n${response}`;
      
      textarea.value = newContent;
      
      // Update state
      appState.updateNote(noteId, newContent);
      
      this.showNotification('AI objection response generated successfully!', 'success');
    } catch (error) {
      console.error('AI objection response generation failed:', error);
      this.showError('Failed to generate AI response. Please check your API key and try again.');
    } finally {
      // Reset button
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  async generateAIObjectionResponse(objection, suggestedResponse) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const currentStage = this.stages[appState.getState().currentStage];
    const stageContext = this.buildAIContext('objection handling');

    const prompt = `You are a UiPath sales expert helping handle objections in the ${stageContext.stage} stage for ${stageContext.industry} industry prospects.

Objection: "${objection}"
Suggested Response: "${suggestedResponse}"

Please provide an enhanced response strategy that:
1. Acknowledges the customer's concern with empathy
2. Builds on or improves the suggested response
3. Provides specific UiPath value propositions that address this objection
4. Includes follow-up questions to continue the conversation
5. Suggests concrete next steps or proof points

Keep your response practical and conversation-ready (2-3 paragraphs maximum).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }
}

// Initialize application
const timelineApp = new TimelineUiPathApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.TimelineApp = timelineApp;
  window.appState = appState;
}

// ==================== USE CASE PDF FUNCTIONALITY ====================
class UseCasePDFHandler {
  constructor() {
    this.pdfPath = '/Users/eric.bouchard/Downloads/FINS - MAESTRO - Use Case Deck- Aug 2025.pdf';
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.use-case-link')) {
        e.preventDefault();
        this.handleUseCaseClick(e.target);
      }
    });
  }

  async handleUseCaseClick(button) {
    const pageNumber = button.dataset.page;
    const useCaseName = button.dataset.name || button.textContent.trim().replace('• ', '');
    
    if (!pageNumber) {
      this.showNotification('Page number not found for this use case', 'error');
      return;
    }

    try {
      // Show loading state
      button.style.opacity = '0.6';
      button.disabled = true;
      
      // Navigate to the PDF viewer page
      this.openPDFViewer(pageNumber, useCaseName);
      
    } catch (error) {
      console.error('Error opening PDF viewer:', error);
      this.showNotification(`Unable to open PDF viewer`, 'error');
    } finally {
      // Reset button state  
      button.style.opacity = '1';
      button.disabled = false;
    }
  }

  openPDFViewer(pageNumber, useCaseName) {
    // Navigate to the dedicated PDF viewer page
    const viewerUrl = `pdf-viewer.html?page=${encodeURIComponent(pageNumber)}&name=${encodeURIComponent(useCaseName)}`;
    window.open(viewerUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    this.showNotification(`Opening ${useCaseName} (Page ${pageNumber})`, 'success');
  }


  showNotification(message, type = 'info') {
    // Reuse the existing notification system
    if (window.appInstance && window.appInstance.notificationManager) {
      window.appInstance.notificationManager.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize PDF handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.useCasePDFHandler = new UseCasePDFHandler();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
  @keyframes ping {
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .use-case-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .use-case-link:hover {
    transform: translateX(2px);
  }
`;
document.head.appendChild(style);