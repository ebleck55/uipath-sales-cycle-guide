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

// ==================== DOM UTILITIES ====================

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.warn('Copy to clipboard failed:', error);
    return false;
  }
}

// ==================== ANALYTICS SERVICE ====================

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.events = [];
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    this.loadStoredEvents();
    this.exposeGlobalInterface();
    this.initialized = true;
    
    console.log('Analytics service initialized');
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  loadStoredEvents() {
    try {
      const stored = localStorage.getItem('site_analytics_events');
      this.events = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
      this.events = [];
    }
  }

  storeEvents() {
    try {
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }
      localStorage.setItem('site_analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to store analytics events:', error);
    }
  }

  trackEvent(eventType, eventData = {}) {
    const event = {
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      type: eventType,
      data: { ...eventData }
    };
    
    this.events.push(event);
    this.storeEvents();
  }

  trackPrompt(context, prompt, response, responseQuality, additionalData = {}) {
    this.trackEvent('prompt_submission', {
      context: context,
      prompt: prompt,
      response: response,
      responseQuality: responseQuality,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  getEvents(timePeriod = 'all') {
    if (timePeriod === 'all') return this.events;
    
    const now = new Date();
    let cutoff;
    
    switch (timePeriod) {
      case '24h': cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000)); break;
      case '7d': cutoff = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); break;
      case '30d': cutoff = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); break;
      default: return this.events;
    }
    
    return this.events.filter(event => new Date(event.timestamp) >= cutoff);
  }

  exposeGlobalInterface() {
    if (typeof window !== 'undefined') {
      window.siteAnalytics = {
        trackEvent: this.trackEvent.bind(this),
        trackPrompt: this.trackPrompt.bind(this),
        getEvents: this.getEvents.bind(this)
      };
    }
  }
}

const analyticsService = new AnalyticsService();

// ==================== AI SERVICE ====================

class AIService {
  constructor() {
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
    this.defaultModel = 'claude-3-haiku-20240307';
    this.defaultSettings = {
      temperature: 0.7,
      maxTokens: 1000
    };
  }

  async generateResponse(prompt, options = {}) {
    const apiKey = apiSecurity.getStoredApiKey();
    if (!apiKey) {
      throw new Error('API key not configured. Please set up your Claude API key first.');
    }

    if (apiSecurity.isRateLimited('ai-generation', 10)) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    }

    const settings = { ...this.defaultSettings, ...options };
    const startTime = Date.now();
    
    const requestBody = {
      model: settings.model || this.defaultModel,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;
      const responseTime = Date.now() - startTime;
      
      // Track prompt with analytics
      this.trackPromptUsage(prompt, responseText, options, responseTime);
      
      return responseText;
      
    } catch (error) {
      console.error('AI generation error:', error);
      this.trackPromptUsage(prompt, null, options, Date.now() - startTime, error.message);
      throw error;
    }
  }

  trackPromptUsage(prompt, response, options = {}, responseTime = 0, error = null) {
    if (window.siteAnalytics && window.siteAnalytics.trackPrompt) {
      const context = options.context || this.inferContextFromPrompt(prompt);
      const keywords = this.extractKeywords(prompt);
      const responseQuality = response ? this.assessResponseQuality(response, prompt) : 'failed';
      
      window.siteAnalytics.trackPrompt(context, prompt, response, responseQuality, {
        keywords: keywords,
        responseTime: responseTime,
        responseLength: response ? response.length : 0,
        model: options.model || this.defaultModel,
        error: error
      });
    }
  }

  inferContextFromPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('compet') || lowerPrompt.includes('versus') || lowerPrompt.includes('vs ') || lowerPrompt.includes('alternative')) {
      return 'competitive';
    }
    if (lowerPrompt.includes('objection') || lowerPrompt.includes('concern') || lowerPrompt.includes('pushback')) {
      return 'objection';
    }
    if (lowerPrompt.includes('uipath') || lowerPrompt.includes('our company') || lowerPrompt.includes('our product')) {
      return 'company';
    }
    if (lowerPrompt.includes('discover') || lowerPrompt.includes('question') || lowerPrompt.includes('ask')) {
      return 'discovery';
    }
    
    return 'general';
  }

  extractKeywords(prompt) {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 10);
  }

  assessResponseQuality(response, prompt) {
    if (!response || response.length < 50) return 'weak';
    
    const responseLength = response.length;
    const hasSpecifics = /\b(uipath|automation|rpa|enterprise|solution|process)\b/i.test(response);
    const hasStructure = response.includes('\n') || response.match(/\d+\./) || response.includes('•');
    
    if (responseLength > 300 && hasSpecifics && hasStructure) return 'strong';
    if (responseLength > 150 && (hasSpecifics || hasStructure)) return 'moderate';
    return 'weak';
  }
}

const aiService = new AIService();

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
      
      // Initialize analytics
      analyticsService.initialize();
      
      // Initialize UI
      this.initializeUI();
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      // Initialize admin functionality
      this.initializeAdmin();
      
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
        this.handleAdminToggle();
      }
      
      // Handle admin panel toggle
      if (e.target.closest('#show-admin-panel')) {
        e.preventDefault();
        this.showAdminPanel();
      }
      
      if (e.target.closest('#close-admin-panel')) {
        e.preventDefault();
        this.hideAdminPanel();
      }
      
      // Handle admin tab switching
      if (e.target.closest('.admin-tab-btn')) {
        e.preventDefault();
        const tab = e.target.closest('.admin-tab-btn').dataset.tab;
        this.switchAdminTab(tab);
      }
      
      // Handle admin controls
      if (e.target.closest('#save-api-key')) {
        e.preventDefault();
        this.saveApiKey();
      }
      
      if (e.target.closest('#test-api-connection')) {
        e.preventDefault();
        this.testApiConnection();
      }
      
      if (e.target.closest('#clear-api-key')) {
        e.preventDefault();
        this.clearApiKey();
      }
      
      if (e.target.closest('#toggle-api-visibility')) {
        e.preventDefault();
        this.toggleApiKeyVisibility();
      }
      
      if (e.target.closest('#export-analytics')) {
        e.preventDefault();
        this.exportAnalytics();
      }
      
      if (e.target.closest('#clear-analytics')) {
        e.preventDefault();
        this.clearAnalytics();
      }
      
      // Handle industry switching
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
      console.error('Sales cycle data not loaded, waiting...');
      // Wait a bit for data.js to load
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
    
    // Render stages
    this.renderStages();
    
    // Initialize progress bars
    this.initializeProgressBars();
  }

  renderPersonas() {
    const container = $('#personas-container');
    if (!container || !SALES_CYCLE_DATA.personas) return;
    
    const currentIndustry = appState.get('currentIndustry');
    const personas = SALES_CYCLE_DATA.personas[currentIndustry] || [];
    
    const personasHTML = personas.map(persona => `
      <div class="persona-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 class="text-lg font-semibold mb-2">${sanitizer.escapeHtml(persona.title)}</h3>
        <p class="text-sm text-gray-600 mb-2"><strong>Their World:</strong> ${sanitizer.escapeHtml(persona.world || '')}</p>
        <p class="text-sm text-gray-600"><strong>What They Care About:</strong> ${sanitizer.escapeHtml(persona.cares || '')}</p>
      </div>
    `).join('');
    
    container.innerHTML = personasHTML || '<p class="text-gray-500">No personas available for this industry.</p>';
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

  // ==================== ADMIN METHODS ====================

  initializeAdmin() {
    // Add analytics time filter listener
    const analyticsTimeFilter = $('#analytics-time-filter');
    if (analyticsTimeFilter) {
      analyticsTimeFilter.addEventListener('change', () => {
        this.updateAnalyticsDisplay();
      });
    }
    
    // Initialize admin mode state tracking
    appState.subscribe('adminMode', (enabled) => {
      this.updateAdminModeUI(enabled);
    });
  }

  updateAdminModeUI(enabled) {
    const adminStatus = $('#admin-status');
    const adminBtn = $('#admin-mode-btn');
    const mobileAdminBtn = $('#mobile-admin-btn');
    
    if (adminStatus) {
      adminStatus.classList.toggle('hidden', !enabled);
    }
    
    if (adminBtn) {
      adminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
      adminBtn.classList.toggle('bg-red-100', enabled);
      adminBtn.classList.toggle('text-red-800', enabled);
      adminBtn.classList.toggle('border-red-300', enabled);
    }
    
    if (mobileAdminBtn) {
      mobileAdminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
      mobileAdminBtn.classList.toggle('bg-red-100', enabled);
      mobileAdminBtn.classList.toggle('text-red-800', enabled);
    }
  }

  handleAdminToggle() {
    const isAdmin = appState.get('adminMode');
    appState.set('adminMode', !isAdmin);
  }

  showAdminPanel() {
    const panel = $('#admin-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.updateAnalyticsDisplay();
    }
  }

  hideAdminPanel() {
    const panel = $('#admin-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
  }

  switchAdminTab(tab) {
    // Update tab buttons
    $$('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('border-blue-500', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeBtn = $(`.admin-tab-btn[data-tab="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('border-transparent', 'text-gray-500');
      activeBtn.classList.add('border-blue-500', 'text-blue-600');
    }

    // Update tab content
    $$('.admin-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    const activeTab = $(`#${tab}-tab`);
    if (activeTab) {
      activeTab.classList.remove('hidden');
      
      // Update content based on tab
      if (tab === 'analytics') {
        this.updateAnalyticsDisplay();
      } else if (tab === 'ai-settings') {
        this.loadApiKeyDisplay();
      }
    }
  }

  updateAnalyticsDisplay() {
    const events = analyticsService.getEvents('7d');
    const promptEvents = events.filter(e => e.type === 'prompt_submission');
    
    // Update metrics
    const totalPrompts = $('#total-prompts');
    const strongResponses = $('#strong-responses');
    const weakResponses = $('#weak-responses');

    if (totalPrompts) totalPrompts.textContent = promptEvents.length;
    
    const strong = promptEvents.filter(e => e.data.responseQuality === 'strong').length;
    const weak = promptEvents.filter(e => e.data.responseQuality === 'weak').length;
    
    if (strongResponses) strongResponses.textContent = strong;
    if (weakResponses) weakResponses.textContent = weak;

    // Update recent prompts
    const recentList = $('#recent-prompts-list');
    if (recentList && promptEvents.length > 0) {
      const recent = promptEvents
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      recentList.innerHTML = recent.map(event => `
        <div class="border-l-4 border-blue-400 pl-3 py-2 bg-white rounded">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs font-medium text-gray-500">${event.data.context || 'general'}</span>
            <span class="text-xs text-gray-400">${new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
          <p class="text-sm text-gray-800 line-clamp-2">${sanitizer.escapeHtml(event.data.prompt.substring(0, 100))}</p>
          <div class="mt-1">
            <span class="text-xs px-2 py-0.5 rounded ${
              event.data.responseQuality === 'strong' ? 'bg-green-100 text-green-800' :
              event.data.responseQuality === 'weak' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }">${event.data.responseQuality || 'Unknown'}</span>
          </div>
        </div>
      `).join('');
    }
  }

  saveApiKey() {
    const input = $('#admin-api-key');
    const status = $('#api-status');
    
    if (!input || !input.value.trim()) {
      this.showApiStatus('Please enter an API key', 'error');
      return;
    }

    try {
      apiSecurity.storeApiKey(input.value.trim());
      this.showApiStatus('API key saved successfully', 'success');
      input.value = '';
    } catch (error) {
      this.showApiStatus('Failed to save API key', 'error');
    }
  }

  async testApiConnection() {
    const status = $('#api-status');
    
    try {
      this.showApiStatus('Testing connection...', 'info');
      
      const response = await aiService.generateResponse(
        'Respond with "Connection successful" if you receive this message.',
        { maxTokens: 50, temperature: 0.1 }
      );
      
      if (response.includes('Connection successful')) {
        this.showApiStatus('Connection successful! API key is working.', 'success');
      } else {
        this.showApiStatus('Connection test failed. Please check your API key.', 'error');
      }
    } catch (error) {
      this.showApiStatus(`Connection failed: ${error.message}`, 'error');
    }
  }

  clearApiKey() {
    if (confirm('Are you sure you want to clear the API key?')) {
      apiSecurity.clearStoredApiKey();
      this.showApiStatus('API key cleared', 'success');
    }
  }

  toggleApiKeyVisibility() {
    const input = $('#admin-api-key');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  loadApiKeyDisplay() {
    const input = $('#admin-api-key');
    const hasKey = !!apiSecurity.getStoredApiKey();
    
    if (input && hasKey) {
      input.placeholder = 'API key is configured';
    }
  }

  showApiStatus(message, type) {
    const status = $('#api-status');
    if (status) {
      status.className = `p-4 rounded-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' :
        type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`;
      status.textContent = message;
      status.classList.remove('hidden');
      
      setTimeout(() => {
        if (type !== 'error') {
          status.classList.add('hidden');
        }
      }, 3000);
    }
  }

  exportAnalytics() {
    const events = analyticsService.getEvents('all');
    const data = analyticsService.exportData('json', 'all');
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uipath-sales-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Analytics data exported', 'success');
  }

  clearAnalytics() {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      analyticsService.clearData();
      this.updateAnalyticsDisplay();
      this.showNotification('Analytics data cleared', 'success');
    }
  }
}

// Initialize application
const hardenedApp = new HardenedUiPathApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.HardenedApp = hardenedApp;
  window.appState = appState;
  window.apiSecurity = apiSecurity;
  window.aiService = aiService;
  window.analyticsService = analyticsService;
}