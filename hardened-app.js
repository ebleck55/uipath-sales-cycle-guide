/**
 * Hardened UiPath Sales Cycle Guide
 * Single-file implementation for GitHub Pages compatibility
 * This version combines the modular architecture into a working single file
 * while maintaining security improvements
 */

// ==================== SECURITY MODULE ====================

class HTMLSanitizer {
  constructor() {
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li'],
      formatting: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    };
    
    this.allowedAttributes = {
      'a': ['href', 'target', 'rel'],
      'span': ['class'],
      'div': ['class'],
      '*': ['class', 'id', 'data-*']
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    
    if (level === 'strict') {
      return this.escapeHtml(html);
    }
    
    // For now, use escapeHtml for safety
    // In production, implement full sanitization
    return this.escapeHtml(html);
  }
}

const sanitizer = new HTMLSanitizer();

// ==================== API SECURITY ====================

class APISecurityManager {
  constructor() {
    this.rateLimiter = new Map();
  }

  storeApiKey(apiKey) {
    // Use session storage for security
    const encoded = btoa(apiKey);
    sessionStorage.setItem('secure_api_key', encoded);
  }

  getStoredApiKey() {
    const encoded = sessionStorage.getItem('secure_api_key');
    if (encoded) {
      try {
        return atob(encoded);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  clearStoredApiKey() {
    sessionStorage.removeItem('secure_api_key');
  }

  isRateLimited(endpoint, maxCalls = 10) {
    const now = Date.now();
    const windowStart = now - (60 * 1000);
    
    if (!this.rateLimiter.has(endpoint)) {
      this.rateLimiter.set(endpoint, []);
    }
    
    const calls = this.rateLimiter.get(endpoint);
    const recentCalls = calls.filter(timestamp => timestamp > windowStart);
    this.rateLimiter.set(endpoint, recentCalls);
    
    if (recentCalls.length >= maxCalls) {
      return true;
    }
    
    recentCalls.push(now);
    return false;
  }
}

const apiSecurity = new APISecurityManager();

// ==================== STATE MANAGEMENT ====================

class AppState {
  constructor() {
    this.state = {
      currentIndustry: 'banking',
      adminMode: false,
      checkboxes: new Map(),
      notes: new Map(),
      collapsedSections: new Set()
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

function safeSetHTML(element, html) {
  if (!element) return;
  // For now, use textContent for safety
  element.textContent = html;
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

class HardenedUiPathApp {
  constructor() {
    this.initialized = false;
    
    // Wait for DOM and data to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing Hardened UiPath Sales Guide...');
      
      // Initialize security
      this.initializeSecurity();
      
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
      
      const securityWarning = $('#security-warning');
      if (securityWarning) {
        securityWarning.style.display = 'none';
      }
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh and try again.');
    }
  }

  initializeSecurity() {
    // Apply security headers via meta tags
    const securityHeaders = [
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' }
    ];

    securityHeaders.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.httpEquiv;
      meta.content = header.content;
      document.head.appendChild(meta);
    });
  }

  initializeUI() {
    // Initialize admin mode UI
    appState.subscribe('adminMode', (enabled) => {
      document.body.classList.toggle('admin-mode', enabled);
      this.updateAdminUI(enabled);
    });

    // Initialize industry switcher
    appState.subscribe('currentIndustry', (industry) => {
      this.updateIndustryUI(industry);
    });
  }

  initializeEventListeners() {
    // Global click handler
    document.addEventListener('click', (e) => {
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
      
      // Handle stage toggle
      if (e.target.closest('.section-toggle')) {
        e.preventDefault();
        const toggle = e.target.closest('.section-toggle');
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('.toggle-icon');
        if (content && icon) {
          content.classList.toggle('hidden');
          icon.classList.toggle('rotate-180');
        }
      }
      
      // Handle collapsible sections
      if (e.target.closest('.collapsible-header')) {
        const header = e.target.closest('.collapsible-header');
        if (!e.target.closest('.edit-icon')) {
          const section = header.parentElement;
          const content = section.querySelector('.collapsible-content');
          const chevron = section.querySelector('.chevron-icon');
          if (content && chevron) {
            content.classList.toggle('hidden');
            chevron.style.transform = content.classList.contains('hidden') ? '' : 'rotate(90deg)';
          }
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
    });
    
    // Handle checkbox changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const checkboxId = e.target.dataset.id;
        if (checkboxId) {
          appState.toggleCheckbox(checkboxId, e.target.checked);
          e.target.closest('label')?.classList.toggle('checked-item', e.target.checked);
          this.updateProgressBar(e.target.closest('.stage-container'));
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
  }

  loadData() {
    // Check if SALES_CYCLE_DATA exists
    if (typeof SALES_CYCLE_DATA === 'undefined') {
      console.error('Sales cycle data not loaded');
      this.showError('Failed to load sales data. Please ensure data.js is loaded.');
      return;
    }
    
    // Render personas
    this.renderPersonas();
    
    // Render stages
    this.renderStages();
    
    // Initialize progress bars
    this.initializeProgressBars();
  }

  renderPersonas() {
    const container = $('#personas-container');
    if (!container || !SALES_CYCLE_DATA.personas) return;
    
    const personasHTML = SALES_CYCLE_DATA.personas.map(persona => `
      <div class="persona-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 class="text-lg font-semibold mb-2">${sanitizer.escapeHtml(persona.title)}</h3>
        <p class="text-sm text-gray-600">${sanitizer.escapeHtml(persona.level)}</p>
      </div>
    `).join('');
    
    container.innerHTML = personasHTML;
  }

  renderStages() {
    SALES_CYCLE_DATA.stages.forEach((stage, index) => {
      const container = $(`#stage-${index + 1}`);
      if (!container) return;
      
      const stageHTML = this.createStageHTML(stage);
      container.innerHTML = stageHTML;
    });
  }

  createStageHTML(stage) {
    return `
      <h2 class="section-toggle text-2xl font-bold border-b-2 border-gray-200 pb-1 mb-1 flex justify-between items-center cursor-pointer">
        <span>${sanitizer.escapeHtml(stage.title)}</span>
        <svg class="toggle-icon w-6 h-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
      <div class="collapsible-content hidden pt-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div class="progress-bar bg-orange-600 h-2.5 rounded-full transition-all duration-300" style="width:0%"></div>
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
          ${this.createOutcomesSection(stage)}
          ${this.createPersonasSection(stage)}
          ${stage.uipathTeam ? this.createUiPathTeamSection(stage) : ''}
          ${this.createResourcesSection(stage)}
        </div>
        ${this.createQuestionsSection(stage)}
        ${this.createObjectionsSection(stage)}
      </div>
    `;
  }

  createOutcomesSection(stage) {
    const outcomes = stage.outcomes || [];
    return `
      <div class="bg-orange-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-orange-600">Verifiable Outcomes</h3>
        <ul class="space-y-3">
          ${outcomes.map((outcome, i) => `
            <li>
              <label class="flex items-start text-gray-700 cursor-pointer">
                <input type="checkbox" class="mt-1 mr-3" data-id="${stage.id}-outcome-${i}">
                <span>${sanitizer.escapeHtml(outcome)}</span>
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  createPersonasSection(stage) {
    const personas = stage.initialPersonas || [];
    return `
      <div class="bg-green-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-green-700">Initial Personas to Engage</h3>
        <ul class="space-y-2">
          ${personas.map(persona => `<li>${sanitizer.escapeHtml(persona)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  createUiPathTeamSection(stage) {
    return `
      <div class="bg-blue-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-blue-700">UiPath Team</h3>
        <ul class="space-y-2">
          ${stage.uipathTeam.map(member => `<li>${sanitizer.escapeHtml(member)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  createResourcesSection(stage) {
    const resources = stage.resources || {};
    const currentIndustry = appState.get('currentIndustry');
    const industryResources = resources[currentIndustry] || [];
    
    return `
      <div class="bg-gray-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-gray-700">Key Resources</h3>
        <ul class="space-y-2">
          ${industryResources.map(resource => `
            <li>
              <a href="${sanitizer.escapeHtml(resource.link)}" class="text-blue-600 hover:underline" target="_blank">
                ${sanitizer.escapeHtml(resource.name)}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  createQuestionsSection(stage) {
    const questions = stage.questions || {};
    return `
      <div class="bg-gray-50 rounded-lg shadow mt-3 collapsible-section">
        <div class="collapsible-header p-4 cursor-pointer flex justify-between items-center hover:bg-gray-100">
          <div class="flex items-center space-x-3">
            <svg class="chevron-icon w-4 h-4 text-gray-600 transition-transform">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800">Key Discovery Questions</h3>
          </div>
        </div>
        <div class="collapsible-content hidden p-6 pt-0">
          ${Object.entries(questions).map(([category, items]) => `
            <div class="mb-4">
              <h4 class="font-medium text-gray-700 mb-2">${sanitizer.escapeHtml(category)}</h4>
              <div class="space-y-3">
                ${items.map((q, i) => `
                  <div class="bg-white p-3 rounded border border-gray-200">
                    <p class="text-gray-700">${sanitizer.escapeHtml(q)}</p>
                    <textarea class="note-textarea w-full mt-2 p-2 border border-gray-300 rounded resize-none" 
                             rows="2" placeholder="Notes..." 
                             data-note-id="${stage.id}-q-${category}-${i}"></textarea>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div class="flex justify-center gap-3 mt-4">
            <button class="export-notes-btn px-4 py-2 bg-orange-600 text-white rounded font-semibold hover:bg-orange-700">
              Copy Notes
            </button>
            <button class="clear-all-btn px-4 py-2 bg-gray-500 text-white rounded font-semibold hover:bg-gray-600">
              Clear All
            </button>
          </div>
        </div>
      </div>
    `;
  }

  createObjectionsSection(stage) {
    const objections = stage.objections || [];
    return `
      <div class="bg-gray-50 rounded-lg shadow mt-3 collapsible-section">
        <div class="collapsible-header p-4 cursor-pointer flex justify-between items-center hover:bg-gray-100">
          <div class="flex items-center space-x-3">
            <svg class="chevron-icon w-4 h-4 text-gray-600 transition-transform">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800">Common Objections</h3>
          </div>
        </div>
        <div class="collapsible-content hidden p-6 pt-0">
          <div class="space-y-3">
            ${objections.map((obj, i) => `
              <div class="bg-white p-4 rounded border border-gray-200">
                <h4 class="font-medium text-red-600 mb-2">${sanitizer.escapeHtml(obj.objection)}</h4>
                <p class="text-gray-700">${sanitizer.escapeHtml(obj.response)}</p>
                <textarea class="note-textarea w-full mt-2 p-2 border border-gray-300 rounded resize-none" 
                         rows="2" placeholder="Additional notes..." 
                         data-note-id="${stage.id}-obj-${i}"></textarea>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  updateProgressBar(container) {
    if (!container) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const checked = container.querySelectorAll('input[type="checkbox"]:checked');
    const progressBar = container.querySelector('.progress-bar');
    
    if (progressBar && checkboxes.length > 0) {
      const percentage = (checked.length / checkboxes.length) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  initializeProgressBars() {
    $$('.stage-container').forEach(container => {
      this.updateProgressBar(container);
    });
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
    // Update buttons
    $$('.industry-btn').forEach(btn => {
      const isActive = btn.dataset.industry === industry;
      btn.classList.toggle('bg-orange-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('bg-white', !isActive);
      btn.classList.toggle('text-gray-700', !isActive);
    });
    
    // Re-render stages to show correct resources
    this.renderStages();
    this.initializeProgressBars();
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
    
    SALES_CYCLE_DATA.stages.forEach(stage => {
      const stageNotes = [];
      
      // Collect notes for this stage
      notesMap.forEach((value, key) => {
        if (key.startsWith(stage.id) && value.trim()) {
          stageNotes.push(`- ${value.trim()}`);
        }
      });
      
      if (stageNotes.length > 0) {
        notes.push(`\n=== ${stage.title} ===\n${stageNotes.join('\n')}`);
      }
    });
    
    return notes.join('\n\n').trim();
  }

  handleClearAll() {
    if (confirm('Are you sure you want to clear all checkboxes and notes? This cannot be undone.')) {
      // Clear state
      appState.clearFormState();
      
      // Clear UI
      $$('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('label')?.classList.remove('checked-item');
      });
      
      $$('.note-textarea').forEach(textarea => {
        textarea.value = '';
      });
      
      // Reset progress bars
      $$('.progress-bar').forEach(bar => {
        bar.style.width = '0%';
      });
      
      this.showNotification('All data cleared', 'success');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      type === 'error' ? 'bg-red-100 text-red-800' :
      'bg-blue-100 text-blue-800'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }
}

// Initialize application
const hardenedApp = new HardenedUiPathApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.HardenedApp = hardenedApp;
  window.appState = appState;
  window.apiSecurity = apiSecurity;
}