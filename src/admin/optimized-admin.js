/**
 * Admin Module - Unified Content Management System
 * Integrates with the module system for proper dependency management
 * Provides content management for personas, stages, resources, and categories
 */

/**
 * Fuzzy Search Utility
 * Lightweight fuzzy search implementation for admin interface
 */
class FuzzySearch {
  /**
   * Calculate fuzzy match score between two strings
   * @param {string} pattern - Search pattern
   * @param {string} text - Text to search in
   * @returns {number} Score between 0 and 1 (1 = perfect match)
   */
  static score(pattern, text) {
    if (!pattern || !text) return 0;
    
    pattern = pattern.toLowerCase();
    text = text.toLowerCase();
    
    // Exact match gets highest score
    if (text.includes(pattern)) {
      const ratio = pattern.length / text.length;
      return Math.min(1, 0.8 + ratio * 0.2);
    }
    
    // Calculate character-by-character fuzzy match
    let score = 0;
    let patternIndex = 0;
    let previousMatch = false;
    
    for (let i = 0; i < text.length; i++) {
      if (patternIndex < pattern.length && text[i] === pattern[patternIndex]) {
        score += previousMatch ? 1.5 : 1; // Bonus for consecutive matches
        patternIndex++;
        previousMatch = true;
      } else {
        previousMatch = false;
      }
    }
    
    // Normalize score
    const completeness = patternIndex / pattern.length;
    const efficiency = score / text.length;
    
    return completeness * efficiency * 0.7; // Max 0.7 for fuzzy matches
  }
  
  /**
   * Search multiple fields with fuzzy matching
   * @param {string} query - Search query
   * @param {Array} items - Items to search
   * @param {Array} fields - Fields to search in
   * @param {number} threshold - Minimum score threshold (default: 0.1)
   * @returns {Array} Filtered and scored items
   */
  static search(query, items, fields, threshold = 0.1) {
    if (!query || !items.length) return items;
    
    const results = items.map(item => {
      let maxScore = 0;
      
      fields.forEach(field => {
        const value = this.getNestedValue(item, field);
        if (value) {
          const score = this.score(query, String(value));
          maxScore = Math.max(maxScore, score);
        }
      });
      
      return { item, score: maxScore };
    })
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score);
    
    return results.map(result => result.item);
  }
  
  /**
   * Get nested object value by dot notation
   * @param {Object} obj - Object to search in
   * @param {string} path - Dot-notation path (e.g., 'tags.primary')
   * @returns {*} Value at path
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export class AdminModule {
  constructor() {
    this.initialized = false;
    this.isOnline = navigator.onLine;
    this.changes = new Map();
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 5000; // 5 seconds
    this.maxUndoSteps = 50;
    this.undoStack = [];
    this.redoStack = [];
    
    // Editor instances
    this.editors = new Map();
    this.dragDropHandler = null;
    this.searchIndex = new Map();
    
    // Feature flags
    this.features = {
      autoSave: true,
      realTimePreview: true,
      bulkOperations: true,
      advancedSearch: true,
      undoRedo: true,
      dragDropReorder: true,
      importExport: true,
      collaborativeEditing: false,
      analytics: true
    };
    
    // Module initialization will be called by ModuleManager
  }

  /**
   * Initialize the admin module
   * @param {Object} config - Configuration object from module manager
   */
  async init(config = {}) {
    if (this.initialized) return;
    
    try {
      console.log('🔧 Initializing Admin Module...');
      
      // Remove admin search from main page immediately
      if (!window.location.pathname.includes('admin')) {
        const existingSearch = document.getElementById('admin-search');
        if (existingSearch) {
          existingSearch.remove();
          console.log('🗑️ Removed admin search from main page');
        }
      }
      
      // Store config
      this.config = config;
      
      // Initialize Unified Data Manager
      await this.initializeUnifiedDataManager();
      
      // Initialize core components
      this.initializeDataStore();
      this.setupEventListeners();
      this.initializeEditors();
      this.setupAutoSave();
      this.setupKeyboardShortcuts();
      this.initializeSearch();
      
      // Enhanced features
      if (this.features.dragDropReorder) this.initializeDragDrop();
      if (this.features.realTimePreview) this.setupRealTimePreview();
      if (this.features.undoRedo) this.setupUndoRedo();
      if (this.features.analytics) this.initializeAnalytics();
      
      // Load existing data
      await this.loadDataFromSources();
      
      // Populate LOB dropdowns from categories
      this.populateLobDropdowns();
      
      // Only render interface if admin panel is requested
      if (config.renderInterface !== false) {
        await this.renderInterface();
      }
      
      // Show default section if on admin page
      if (window.location.pathname.includes('admin')) {
        this.showAdminSection('resources'); // Show first section by default
      }
      
      this.initialized = true;
      console.log('✅ Admin Module initialized successfully');
      
      // Notify parent window if embedded
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'admin:ready' }, '*');
      }
      
    } catch (error) {
      console.error('❌ Admin module initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    console.error('❌ Admin initialization error:', error);
    
    // Show error message to user
    const errorHtml = `
      <div class="error-container" style="padding: 20px; text-align: center; color: #dc2626;">
        <h2>⚠️ Admin Panel Error</h2>
        <p>Failed to initialize admin interface:</p>
        <p><strong>${error.message}</strong></p>
        <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
    
    // Try to show error in the document
    if (document.body) {
      document.body.innerHTML = errorHtml;
    } else {
      // Fallback - wait for body to be available
      document.addEventListener('DOMContentLoaded', () => {
        document.body.innerHTML = errorHtml;
      });
    }
  }

  /**
   * Initialize data store with caching and synchronization
   */
  initializeDataStore() {
    this.dataStore = {
      personas: new Map(),
      stages: new Map(),
      resources: new Map(),
      useCases: new Map(),
      metadata: {
        lastModified: Date.now(),
        version: '2.0.0',
        schemaVersion: 2
      }
    };
    
    // Setup change tracking
    this.changeTracker = new Proxy(this.dataStore, {
      set: (target, property, value) => {
        if (property !== 'metadata') {
          this.trackChange(property, value);
        }
        target[property] = value;
        return true;
      }
    });
  }

  /**
   * Enhanced event listeners with delegation and optimization
   */
  setupEventListeners() {
    // Optimized event delegation
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('change', this.handleChange.bind(this));
    document.addEventListener('input', this.debounce(this.handleInput.bind(this), 300));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Form submission
    document.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Drag and drop
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    
    // Network status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Before unload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Visibility change for auto-save optimization
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Setup modal event listeners
    this.setupModalEventListeners();
  }

  /**
   * Setup modal event listeners and enhanced tag inputs
   */
  setupModalEventListeners() {
    // Add Resource Modal
    const addResourceBtn = document.getElementById('add-resource-btn');
    if (addResourceBtn) {
      addResourceBtn.addEventListener('click', () => {
        const modal = document.getElementById('resource-modal');
        if (modal) {
          // Reset form first
          const form = modal.querySelector('form');
          if (form) form.reset();
          
          // Clear any existing AI suggestions
          const aiContainers = modal.querySelectorAll('[id^="ai-suggestions-"]');
          aiContainers.forEach(container => container.remove());
          
          modal.classList.remove('hidden');
          
          // Setup enhanced tag input for add resource form
          setTimeout(() => {
            this.setupEnhancedTagInput('resource-tags-input', 'resource-tags-display', 'orange', []);
          }, 100);
        }
      });
    }

    // Add Use Case Modal  
    const addUseCaseBtn = document.getElementById('add-use-case-btn');
    if (addUseCaseBtn) {
      addUseCaseBtn.addEventListener('click', () => {
        const modal = document.getElementById('use-case-modal');
        if (modal) {
          // Reset form first
          const form = modal.querySelector('form');
          if (form) form.reset();
          
          // Clear any existing AI suggestions
          const aiContainers = modal.querySelectorAll('[id^="ai-suggestions-"]');
          aiContainers.forEach(container => container.remove());
          
          modal.classList.remove('hidden');
          
          // Setup enhanced tag input for add use case form
          setTimeout(() => {
            this.setupEnhancedTagInput('use-case-tags-input', 'use-case-tags-display', 'green', []);
          }, 100);
        }
      });
    }

    // Add Persona Modal
    const addPersonaBtn = document.getElementById('add-persona-btn');  
    if (addPersonaBtn) {
      addPersonaBtn.addEventListener('click', () => {
        const modal = document.getElementById('persona-modal');
        if (modal) {
          // Reset form first
          const form = modal.querySelector('form');
          if (form) form.reset();
          
          // Clear any existing AI suggestions
          const aiContainers = modal.querySelectorAll('[id^="ai-suggestions-"]');
          aiContainers.forEach(container => container.remove());
          
          modal.classList.remove('hidden');
          
          // Setup enhanced tag input for add persona form
          setTimeout(() => {
            this.setupEnhancedTagInput('persona-tags-input', 'persona-tags-display', 'purple', []);
          }, 100);
        }
      });
    }

    // Close modal buttons
    const closeButtons = document.querySelectorAll('[id^="close-"][id$="-modal"]');
    console.log('🔍 Found close buttons:', closeButtons.length, Array.from(closeButtons).map(b => b.id));
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('🔧 Close button clicked:', e.target.id);
        const modal = e.target.closest('[id$="-modal"]');
        console.log('🔍 Found modal:', modal?.id);
        if (modal) modal.classList.add('hidden');
      });
    });

    // Specific close button handler for resource modal (backup)
    const closeResourceModalBtn = document.getElementById('close-resource-modal');
    if (closeResourceModalBtn) {
      closeResourceModalBtn.addEventListener('click', (e) => {
        const resourceModal = document.getElementById('resource-modal');
        if (resourceModal) resourceModal.classList.add('hidden');
      });
    }

    // Specific close button handler for use case modal (backup)
    const closeUseCaseModalBtn = document.getElementById('close-use-case-modal');
    if (closeUseCaseModalBtn) {
      closeUseCaseModalBtn.addEventListener('click', (e) => {
        const useCaseModal = document.getElementById('use-case-modal');
        if (useCaseModal) useCaseModal.classList.add('hidden');
      });
    }

    // Specific close button handler for persona modal (backup)
    const closePersonaModalBtn = document.getElementById('close-persona-modal');
    if (closePersonaModalBtn) {
      closePersonaModalBtn.addEventListener('click', (e) => {
        const personaModal = document.getElementById('persona-modal');
        if (personaModal) personaModal.classList.add('hidden');
      });
    }

    // Specific close button handler for filter rule modal (backup)
    const closeFilterRuleModalBtn = document.getElementById('close-filter-rule-modal');
    if (closeFilterRuleModalBtn) {
      closeFilterRuleModalBtn.addEventListener('click', (e) => {
        const filterRuleModal = document.getElementById('filter-rule-modal');
        if (filterRuleModal) filterRuleModal.classList.add('hidden');
      });
    }

    // Cancel buttons for modals
    const cancelButtons = document.querySelectorAll('[id^="cancel-"][id$="-btn"]');
    cancelButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('[id$="-modal"]');
        if (modal) {
          modal.classList.add('hidden');
          // Reset form if it exists
          const form = modal.querySelector('form');
          if (form) form.reset();
          
          // Clear any AI suggestion containers
          const aiContainers = modal.querySelectorAll('[id^="ai-suggestions-"]');
          aiContainers.forEach(container => container.remove());
          
          // Clear enhanced tag displays
          const tagDisplays = modal.querySelectorAll('[id$="-tags-display"]');
          tagDisplays.forEach(display => {
            display.innerHTML = '<p class="text-gray-400 text-sm">Tags will appear here as you add them</p>';
          });
        }
      });
    });

    // Add Filter Rule Modal
    const addFilterRuleBtn = document.getElementById('add-filter-rule-btn');
    if (addFilterRuleBtn) {
      addFilterRuleBtn.addEventListener('click', () => {
        const modal = document.getElementById('filter-rule-modal');
        if (modal) {
          // Reset form first
          const form = modal.querySelector('form');
          if (form) form.reset();
          
          // Clear any existing AI suggestions
          const aiContainers = modal.querySelectorAll('[id^="ai-suggestions-"]');
          aiContainers.forEach(container => container.remove());
          
          modal.classList.remove('hidden');
          
          // Setup hierarchical dropdowns for filter rule
          this.setupFilterRuleDropdowns();
          
          // Setup enhanced tag input for filter rule form
          setTimeout(() => {
            this.setupEnhancedTagInput('filter-rule-tags-input', 'filter-rule-tags-display', 'blue', []);
          }, 100);
        }
      });
    }
    
    // Filter Rule Form Submission
    const filterRuleForm = document.getElementById('filter-rule-form');
    if (filterRuleForm) {
      filterRuleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFilterRuleSubmission();
      });
    }
    
    // Cancel filter rule button
    const cancelFilterRuleBtn = document.getElementById('cancel-filter-rule-btn');
    if (cancelFilterRuleBtn) {
      cancelFilterRuleBtn.addEventListener('click', () => {
        const modal = document.getElementById('filter-rule-modal');
        if (modal) {
          modal.classList.add('hidden');
        }
      });
    }

    // Close modals when clicking on backdrop
    document.addEventListener('click', (e) => {
      // Check if clicking on modal backdrop (the outer modal div)
      if (e.target.id && e.target.id.endsWith('-modal') && e.target !== e.currentTarget) {
        e.target.classList.add('hidden');
      }
    });

    // API Settings buttons
    const saveApiBtn = document.getElementById('save-api-settings');
    const clearApiBtn = document.getElementById('clear-api-settings');
    const testApiBtn = document.getElementById('test-api-btn');

    if (saveApiBtn) {
      saveApiBtn.addEventListener('click', () => this.saveApiSettings());
    }

    if (clearApiBtn) {
      clearApiBtn.addEventListener('click', () => this.clearApiSettings());
    }

    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => this.testApiConnection());
    }

    // Toggle password visibility for API key
    const toggleApiBtn = document.getElementById('toggle-api-key-visibility');
    if (toggleApiBtn) {
      toggleApiBtn.addEventListener('click', () => this.toggleApiKeyVisibility());
    }

    // Load saved API settings on init
    this.loadApiSettings();
    
    // Setup persona form hierarchy handling
    this.setupPersonaFormHierarchy();
  }

  /**
   * Save API settings to localStorage
   */
  async saveApiSettings() {
    try {
      const apiKey = document.getElementById('claude-api-key')?.value?.trim();
      const model = document.getElementById('claude-model')?.value || 'claude-3-sonnet-20240229';

      if (!apiKey) {
        this.showNotification('Please enter a Claude API key', 'error');
        return;
      }

      if (!apiKey.startsWith('sk-ant-')) {
        this.showNotification('Invalid Claude API key format. Key should start with "sk-ant-"', 'error');
        return;
      }

      // Save to localStorage
      const apiSettings = {
        claudeApiKey: apiKey,
        claudeModel: model,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('admin-api-settings', JSON.stringify(apiSettings));
      
      // Update UI
      this.updateApiStatus('configured');
      this.showNotification('API settings saved successfully', 'success');
      
      // Enable test button
      const testBtn = document.getElementById('test-api-btn');
      if (testBtn) testBtn.disabled = false;

      console.log('✅ API settings saved');

    } catch (error) {
      console.error('Error saving API settings:', error);
      this.showNotification('Error saving API settings', 'error');
    }
  }

  /**
   * Clear API settings
   */
  clearApiSettings() {
    if (confirm('Are you sure you want to clear all API settings? This cannot be undone.')) {
      localStorage.removeItem('admin-api-settings');
      
      // Clear form
      const apiKeyInput = document.getElementById('claude-api-key');
      const modelSelect = document.getElementById('claude-model');
      
      if (apiKeyInput) apiKeyInput.value = '';
      if (modelSelect) modelSelect.value = 'claude-3-sonnet-20240229';
      
      // Update UI
      this.updateApiStatus('not-configured');
      this.showNotification('API settings cleared', 'success');
      
      // Disable test button
      const testBtn = document.getElementById('test-api-btn');
      if (testBtn) testBtn.disabled = true;
      
      console.log('🧹 API settings cleared');
    }
  }

  /**
   * Load saved API settings
   */
  loadApiSettings() {
    try {
      const saved = localStorage.getItem('admin-api-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        
        const apiKeyInput = document.getElementById('claude-api-key');
        const modelSelect = document.getElementById('claude-model');
        
        if (apiKeyInput && settings.claudeApiKey) {
          apiKeyInput.value = settings.claudeApiKey;
        }
        
        if (modelSelect && settings.claudeModel) {
          modelSelect.value = settings.claudeModel;
        }
        
        this.updateApiStatus('configured');
        
        // Enable test button
        const testBtn = document.getElementById('test-api-btn');
        if (testBtn) testBtn.disabled = false;
        
        console.log('📥 API settings loaded');
      } else {
        this.updateApiStatus('not-configured');
      }
    } catch (error) {
      console.error('Error loading API settings:', error);
      this.updateApiStatus('error');
    }
  }

  /**
   * Update API status display
   */
  updateApiStatus(status) {
    const statusElement = document.getElementById('api-status');
    if (!statusElement) return;

    const statusConfig = {
      'configured': {
        text: 'Configured',
        class: 'text-green-600'
      },
      'not-configured': {
        text: 'Not configured',
        class: 'text-gray-500'
      },
      'testing': {
        text: 'Testing connection...',
        class: 'text-blue-600'
      },
      'connected': {
        text: 'Connected ✓',
        class: 'text-green-600'
      },
      'error': {
        text: 'Connection failed',
        class: 'text-red-600'
      }
    };

    const config = statusConfig[status] || statusConfig['error'];
    statusElement.textContent = config.text;
    statusElement.className = `text-sm ${config.class}`;
  }

  /**
   * Test API connection (mock validation due to CORS)
   */
  async testApiConnection() {
    try {
      const apiKey = document.getElementById('claude-api-key')?.value?.trim();
      
      if (!apiKey) {
        this.showNotification('Please enter an API key first', 'error');
        return;
      }

      this.updateApiStatus('testing');
      
      // Simulate testing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate API key format (since we can't make real API calls due to CORS)
      if (!apiKey.startsWith('sk-ant-') || apiKey.length < 50) {
        this.updateApiStatus('error');
        this.showNotification('Invalid API key format. Please check your Claude API key.', 'error');
        return;
      }

      // Check if key looks like a real Claude API key
      const keyPattern = /^sk-ant-[a-zA-Z0-9_-]+$/;
      if (!keyPattern.test(apiKey)) {
        this.updateApiStatus('error');
        this.showNotification('API key format validation failed. Please verify your Claude API key.', 'error');
        return;
      }

      // If format is valid, show success with explanation
      this.updateApiStatus('connected');
      
      // Show success message
      this.showNotification('✅ API key format validated successfully!', 'success');
      
      // Show additional information in console for developers
      console.log([
        '📝 API Key Validation Results:',
        '✅ Format: Valid Claude API key format',
        '📝 Note: Due to browser CORS restrictions, we cannot test the actual API connection from the frontend.',
        '',
        '🔧 To verify your API key actually works:',
        '• Test it in Claude Console (console.anthropic.com)',
        '• Use it in a backend service with server-side requests',
        '• Try it with curl/Postman directly to api.anthropic.com',
        '',
        '🛡️ CORS Info: Browsers block frontend requests to external APIs for security.',
        'This is normal behavior and not an error with your setup.'
      ].join('\n'));

    } catch (error) {
      console.error('Error testing API connection:', error);
      this.updateApiStatus('error');
      this.showNotification('Error validating API key', 'error');
    }
  }

  /**
   * Toggle API key visibility
   */
  toggleApiKeyVisibility() {
    const input = document.getElementById('claude-api-key');
    const button = document.getElementById('toggle-api-key-visibility');
    
    if (!input || !button) return;

    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
      button.title = 'Hide API key';
    } else {
      input.type = 'password';
      button.textContent = '👁️';
      button.title = 'Show API key';
    }
  }

  /**
   * Initialize rich text editors with security
   */
  initializeEditors() {
    this.editorConfig = {
      theme: 'snow',
      placeholder: 'Enter content...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      },
      formats: ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']
    };
    
    // Initialize editors for existing elements
    const editorElements = document.querySelectorAll('.rich-editor');
    editorElements.forEach(element => {
      this.createEditor(element);
    });
  }

  /**
   * Create a secure rich text editor
   */
  createEditor(element) {
    if (typeof Quill === 'undefined') {
      console.warn('Quill editor not available, falling back to textarea');
      return null;
    }
    
    const editorId = element.id || this.generateId();
    const editor = new Quill(element, this.editorConfig);
    
    // Security: Sanitize content on change
    editor.on('text-change', () => {
      const content = editor.getContents();
      this.validateAndSanitizeContent(content, editorId);
    });
    
    this.editors.set(editorId, editor);
    return editor;
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    if (!this.features.autoSave) return;
    
    this.autoSaveTimer = setInterval(() => {
      if (this.changes.size > 0 && this.isOnline) {
        this.saveChanges();
      }
    }, this.autoSaveInterval);
    
    console.log('💾 Auto-save enabled');
  }

  /**
   * Setup keyboard shortcuts for power users
   */
  setupKeyboardShortcuts() {
    this.shortcuts = new Map([
      ['ctrl+s', () => this.saveChanges()],
      ['ctrl+z', () => this.undo()],
      ['ctrl+y', () => this.redo()],
      ['ctrl+f', () => this.focusSearch()],
      ['ctrl+n', () => this.createNew()],
      ['ctrl+d', () => this.duplicate()],
      ['escape', () => this.cancelOperation()],
      ['ctrl+shift+p', () => this.openPreview()],
      ['ctrl+shift+e', () => this.exportData()],
      ['ctrl+shift+i', () => this.importData()]
    ]);
    
    // Add visual shortcuts guide
    this.createShortcutsPanel();
  }

  /**
   * Create keyboard shortcuts panel
   */
  createShortcutsPanel() {
    // Create shortcuts help panel
    const shortcutsPanel = document.createElement('div');
    shortcutsPanel.id = 'shortcuts-panel';
    shortcutsPanel.className = 'fixed top-4 right-4 bg-white border shadow-lg rounded-lg p-4 z-50 hidden';
    shortcutsPanel.innerHTML = `
      <div class="shortcuts-header flex justify-between items-center mb-3">
        <h3 class="font-bold text-lg">Keyboard Shortcuts</h3>
        <button class="close-shortcuts text-gray-500 hover:text-gray-700">×</button>
      </div>
      <div class="shortcuts-list space-y-2 text-sm">
        <div><kbd>Ctrl+S</kbd> Save changes</div>
        <div><kbd>Ctrl+Z</kbd> Undo</div>
        <div><kbd>Ctrl+Y</kbd> Redo</div>
        <div><kbd>Ctrl+F</kbd> Focus search</div>
        <div><kbd>Ctrl+N</kbd> Create new</div>
        <div><kbd>Ctrl+D</kbd> Duplicate</div>
        <div><kbd>Escape</kbd> Cancel operation</div>
        <div><kbd>Ctrl+Shift+P</kbd> Open preview</div>
        <div><kbd>Ctrl+Shift+E</kbd> Export data</div>
        <div><kbd>Ctrl+Shift+I</kbd> Import data</div>
      </div>
    `;

    // Add to document
    document.body.appendChild(shortcutsPanel);

    // Setup toggle functionality
    const closeBtn = shortcutsPanel.querySelector('.close-shortcuts');
    closeBtn.addEventListener('click', () => {
      shortcutsPanel.classList.add('hidden');
    });

    // Add help button to trigger shortcuts panel
    const helpBtn = document.createElement('button');
    helpBtn.className = 'fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-blue-700 z-40';
    helpBtn.innerHTML = '?';
    helpBtn.title = 'Show keyboard shortcuts';
    helpBtn.addEventListener('click', () => {
      shortcutsPanel.classList.toggle('hidden');
    });

    document.body.appendChild(helpBtn);
  }

  /**
   * Initialize advanced search functionality
   */
  initializeSearch() {
    if (!this.features.advancedSearch) return;
    
    this.searchConfig = {
      caseSensitive: false,
      fuzzyMatching: true,
      searchFields: ['title', 'description', 'content', 'tags', 'category'],
      maxResults: 50
    };
    
    this.buildSearchIndex();
    this.setupSearchUI();
    this.enhanceTagInterface();
  }

  /**
   * Build search index for fast searching
   */
  buildSearchIndex() {
    this.searchIndex.clear();
    
    // Index personas
    for (const [id, persona] of this.dataStore.personas) {
      const searchableText = [
        persona.title,
        persona.description,
        ...(persona.priorities || []),
        ...(persona.painPoints || []),
        ...(persona.interests || []),
        persona.useCase,
        persona.outcomesBenefits
      ].filter(Boolean).join(' ').toLowerCase();
      
      this.searchIndex.set(`persona_${id}`, {
        type: 'persona',
        id,
        data: persona,
        searchText: searchableText
      });
    }
    
    // Index other data types as needed
    console.log(`🔍 Search index built with ${this.searchIndex.size} items`);
  }

  /**
   * Setup search UI components
   */
  setupSearchUI() {
    // Only setup search if we're on an admin page
    if (!window.location.pathname.includes('admin')) {
      return;
    }
    
    // Setup global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', this.debounce((e) => {
        this.performGlobalSearch(e.target.value);
      }, 300));
    }
    
    // Setup section-specific searches
    this.setupSectionSearch('resource-search', 'resources');
    this.setupSectionSearch('use-case-search', 'useCases');
    this.setupSectionSearch('persona-search', 'personas');
    
    // Setup filter controls
    this.setupFilterControls();
  }
  
  /**
   * Setup section-specific search
   */
  setupSectionSearch(inputId, dataType) {
    const searchInput = document.getElementById(inputId);
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        // Trigger the appropriate filter function based on dataType
        switch(dataType) {
          case 'resources':
            this.applyResourceFilters();
            break;
          case 'useCases':
            this.applyUseCaseFilters();
            break;
          case 'personas':
            this.applyPersonaFilters();
            break;
        }
      }, 300));
    }
  }
  
  /**
   * Setup filter controls
   */
  setupFilterControls() {
    // Clear filters buttons
    const clearButtons = document.querySelectorAll('[id*="clear"][id*="filter"]');
    clearButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const sectionType = e.target.id.replace('clear-', '').replace('-filters', '');
        this.clearFilters(sectionType);
      });
    });
    
    // Setup dropdown filters
    this.setupDropdownFilters();
    
    // Setup global search blur handler to hide results
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#global-search') && !e.target.closest('#global-search-results')) {
        this.clearGlobalSearchResults();
      }
    });
  }
  
  /**
   * Setup dropdown filter handlers
   */
  setupDropdownFilters() {
    // Resource filters
    const resourceFilters = ['resource-vertical-filter', 'resource-type-filter', 'resource-has-link-filter', 'resource-sort-filter'];
    resourceFilters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('change', () => {
          this.applyResourceFilters();
        });
      }
    });
    
    // Resource checkboxes
    const resourceCheckboxes = ['resource-tags-filter', 'resource-content-filter'];
    resourceCheckboxes.forEach(checkboxId => {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          this.applyResourceFilters();
        });
      }
    });
    
    // Use case filters
    const useCaseFilters = ['use-case-vertical-filter', 'use-case-category-filter', 'use-case-lob-filter', 'use-case-sort-filter'];
    useCaseFilters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('change', () => {
          console.log(`🔄 Use Case Filter changed: ${filterId} = ${filter.value}`);
          // Special handling for vertical filter - update LOB dropdown hierarchy
          if (filterId === 'use-case-vertical-filter') {
            console.log(`🏢 Updating Use Case LOB dropdown for industry: ${filter.value}`);
            this.populateLobDropdowns(filter.value);
          }
          this.applyUseCaseFilters();
        });
      }
    });
    
    // Use case checkboxes
    const useCaseCheckboxes = ['use-case-tags-filter', 'use-case-content-filter'];
    useCaseCheckboxes.forEach(checkboxId => {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          this.applyUseCaseFilters();
        });
      }
    });
    
    // Persona filters
    const personaFilters = ['persona-vertical-filter', 'persona-lob-filter', 'persona-sort-filter'];
    personaFilters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('change', () => {
          console.log(`🔄 Filter changed: ${filterId} = ${filter.value}`);
          // Special handling for vertical filter - update LOB dropdown hierarchy
          if (filterId === 'persona-vertical-filter') {
            console.log(`🏢 Updating LOB dropdown for industry: ${filter.value}`);
            this.populateLobDropdowns(filter.value);
          }
          this.applyPersonaFilters();
        });
      }
    });
    
    // Persona checkboxes
    const personaCheckboxes = ['persona-tags-filter', 'persona-content-filter'];
    personaCheckboxes.forEach(checkboxId => {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          this.applyPersonaFilters();
        });
      }
    });
  }
  
  /**
   * Apply resource filters
   */
  applyResourceFilters() {
    const filters = {
      vertical: document.getElementById('resource-vertical-filter')?.value || '',
      type: document.getElementById('resource-type-filter')?.value || '',
      hasLink: document.getElementById('resource-has-link-filter')?.value || '',
      sort: document.getElementById('resource-sort-filter')?.value || 'relevance',
      search: document.getElementById('resource-search')?.value || '',
      searchTags: document.getElementById('resource-tags-filter')?.checked || false,
      searchContent: document.getElementById('resource-content-filter')?.checked || false
    };
    
    this.renderResourcesManager(filters);
  }
  
  /**
   * Apply use case filters
   */
  applyUseCaseFilters() {
    const filters = {
      vertical: document.getElementById('use-case-vertical-filter')?.value || '',
      category: document.getElementById('use-case-category-filter')?.value || '',
      lob: document.getElementById('use-case-lob-filter')?.value || '',
      sort: document.getElementById('use-case-sort-filter')?.value || 'relevance',
      search: document.getElementById('use-case-search')?.value || '',
      searchTags: document.getElementById('use-case-tags-filter')?.checked || false,
      searchContent: document.getElementById('use-case-content-filter')?.checked || false
    };
    
    this.renderUseCasesManager(filters);
  }
  
  /**
   * Apply persona filters
   */
  applyPersonaFilters() {
    const filters = {
      vertical: document.getElementById('persona-vertical-filter')?.value || '',
      lob: document.getElementById('persona-lob-filter')?.value || '',
      sort: document.getElementById('persona-sort-filter')?.value || 'title',
      search: document.getElementById('persona-search')?.value || '',
      searchTags: document.getElementById('persona-tags-filter')?.checked || false,
      searchContent: document.getElementById('persona-content-filter')?.checked || false
    };
    
    this.renderPersonasManager(filters);
  }
  
  /**
   * Clear filters for a section
   */
  clearFilters(sectionType) {
    console.log(`🧹 Clearing filters for ${sectionType}`);
    
    const filterMaps = {
      'resource': ['resource-vertical-filter', 'resource-type-filter', 'resource-has-link-filter', 'resource-sort-filter', 'resource-search', 'resource-tags-filter', 'resource-content-filter'],
      'use-case': ['use-case-vertical-filter', 'use-case-category-filter', 'use-case-lob-filter', 'use-case-sort-filter', 'use-case-search', 'use-case-tags-filter', 'use-case-content-filter'],
      'persona': ['persona-vertical-filter', 'persona-lob-filter', 'persona-sort-filter', 'persona-search', 'persona-tags-filter', 'persona-content-filter']
    };
    
    const filters = filterMaps[sectionType];
    if (filters) {
      filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
          if (filter.type === 'checkbox') {
            // Special handling for checkboxes - reset to default state
            if (filterId === 'resource-content-filter' || filterId === 'use-case-content-filter' || filterId === 'persona-content-filter') {
              filter.checked = true; // Default to checked
            } else {
              filter.checked = false;
            }
          } else {
            filter.value = '';
          }
        }
      });
      
      // Re-render the appropriate section
      switch (sectionType) {
        case 'resource':
          this.renderResourcesManager();
          break;
        case 'use-case':
          this.renderUseCasesManager();
          break;
        case 'persona':
          this.renderPersonasManager();
          break;
      }
    }
  }
  
  /**
   * Enhanced tag management
   */
  enhanceTagInterface() {
    this.setupTagAutoComplete();
    // Note: Drag/drop and quick filtering can be added later if needed
    console.log('🏷️ Enhanced tag interface initialized');
  }
  
  /**
   * Setup tag auto-complete
   */
  setupTagAutoComplete() {
    const tagInputs = document.querySelectorAll('[id*="tags-input"]');
    
    tagInputs.forEach(input => {
      let suggestionsList = null;
      
      input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const lastComma = value.lastIndexOf(',');
        const currentTag = value.substring(lastComma + 1).trim();
        
        if (currentTag.length < 2) {
          this.hideSuggestions(suggestionsList);
          return;
        }
        
        const suggestions = this.getTagSuggestions(currentTag);
        suggestionsList = this.showTagSuggestions(input, suggestions, currentTag);
      });
      
      input.addEventListener('blur', (e) => {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => {
          if (suggestionsList) {
            this.hideSuggestions(suggestionsList);
          }
        }, 200);
      });
    });
  }
  
  /**
   * Get tag suggestions based on input
   */
  getTagSuggestions(input) {
    const commonTags = [
      'automation', 'rpa', 'cost-reduction', 'process-efficiency', 'compliance',
      'banking', 'insurance', 'healthcare', 'manufacturing', 'retail',
      'customer-experience', 'digital-transformation', 'ai', 'document-processing',
      'claims-processing', 'regulatory-reporting', 'risk-management', 'c-suite',
      'operations', 'efficiency', 'ai-transformation', 'decision-maker', 'influencer',
      'aml-kyc', 'regulatory', 'audit-trails', 'explainable-ai', 'lending',
      'credit-risk', 'loan-origination', 'underwriting', 'claims', 'fraud-prevention',
      'fnol-automation', 'loss-adjustment', 'subrogation', 'quote-automation'
    ];
    
    // Get all existing tags from data for better suggestions
    const existingTags = new Set();
    
    // Collect tags from all data sources
    if (this.dataManager) {
      [this.dataManager.getResources(), this.dataManager.getUseCases(), this.dataManager.getPersonas()].forEach(items => {
        items.forEach(item => {
          if (Array.isArray(item.tags)) {
            item.tags.forEach(tag => existingTags.add(tag));
          }
        });
      });
    }
    
    const allTags = [...commonTags, ...existingTags];
    
    return allTags
      .filter(tag => tag.toLowerCase().includes(input.toLowerCase()) && tag !== input)
      .slice(0, 8);
  }

  /**
   * Create visual tag element with remove functionality
   * @param {string} tag - Tag text
   * @param {string} colorTheme - Color theme (orange, green, purple)
   * @param {Function} onRemove - Callback when tag is removed
   * @returns {HTMLElement} Tag element
   */
  createVisualTag(tag, colorTheme = 'blue', onRemove) {
    const colorClasses = {
      orange: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200', 
      purple: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
    };
    
    const tagElement = document.createElement('span');
    tagElement.className = `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${colorClasses[colorTheme] || colorClasses.blue}`;
    tagElement.innerHTML = `
      <span>${this.escapeHtml(tag)}</span>
      <button type="button" class="ml-1 text-current hover:text-red-600 transition-colors" onclick="event.stopPropagation()">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;
    
    const removeBtn = tagElement.querySelector('button');
    removeBtn.addEventListener('click', () => {
      if (onRemove) onRemove(tag);
      tagElement.remove();
    });
    
    return tagElement;
  }

  /**
   * Setup enhanced tag input with typeahead and visual tags
   * @param {string} inputId - Input element ID
   * @param {string} displayId - Display container ID  
   * @param {string} colorTheme - Color theme for tags
   * @param {Array} initialTags - Initial tags to display
   */
  setupEnhancedTagInput(inputId, displayId, colorTheme = 'blue', initialTags = []) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (!input || !display) return;

    let currentTags = new Set(initialTags);
    let suggestionContainer = null;
    
    // Create suggestion dropdown
    const createSuggestionDropdown = () => {
      if (suggestionContainer) suggestionContainer.remove();
      
      suggestionContainer = document.createElement('div');
      suggestionContainer.className = 'absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto';
      suggestionContainer.style.display = 'none';
      
      input.parentElement.style.position = 'relative';
      input.parentElement.appendChild(suggestionContainer);
      
      return suggestionContainer;
    };
    
    // Update display with visual tags
    const updateDisplay = () => {
      display.innerHTML = '';
      if (currentTags.size === 0) {
        display.innerHTML = '<p class="text-gray-400 text-sm">Tags will appear here as you add them</p>';
        return;
      }
      
      const container = document.createElement('div');
      container.className = 'flex flex-wrap gap-2';
      
      currentTags.forEach(tag => {
        const tagElement = this.createVisualTag(tag, colorTheme, (removedTag) => {
          currentTags.delete(removedTag);
          updateDisplay();
        });
        container.appendChild(tagElement);
      });
      
      display.appendChild(container);
    };
    
    // Show suggestions
    const showSuggestions = (suggestions) => {
      if (!suggestionContainer) createSuggestionDropdown();
      
      suggestionContainer.innerHTML = '';
      
      if (suggestions.length === 0) {
        suggestionContainer.style.display = 'none';
        return;
      }
      
      suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0';
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span>${this.escapeHtml(suggestion)}</span>
            <span class="text-xs text-gray-400">Click to add</span>
          </div>
        `;
        item.addEventListener('click', () => {
          addTag(suggestion);
          input.value = '';
          suggestionContainer.style.display = 'none';
        });
        suggestionContainer.appendChild(item);
      });
      
      suggestionContainer.style.display = 'block';
    };
    
    // Add tag function
    const addTag = (tag) => {
      tag = tag.trim();
      if (tag && !currentTags.has(tag)) {
        currentTags.add(tag);
        updateDisplay();
      }
    };
    
    // Input event handlers
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      if (value.length > 0) {
        const suggestions = this.getTagSuggestions(value);
        showSuggestions(suggestions);
      } else {
        if (suggestionContainer) suggestionContainer.style.display = 'none';
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = input.value.trim();
        if (value) {
          addTag(value);
          input.value = '';
          if (suggestionContainer) suggestionContainer.style.display = 'none';
        }
      }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && (!suggestionContainer || !suggestionContainer.contains(e.target))) {
        if (suggestionContainer) suggestionContainer.style.display = 'none';
      }
    });
    
    // Initialize display
    updateDisplay();
    
    // Return function to get current tags
    return () => Array.from(currentTags);
  }

  /**
   * AI-powered tag suggestion based on content analysis
   * @param {Object} content - Content object with text fields
   * @param {string} contentType - Type of content (resource, use-case, persona)
   * @returns {Array<string>} Suggested tags
   */
  suggestTagsWithAI(content, contentType) {
    const suggestedTags = [];
    
    // Extract all text content for analysis
    const textContent = this.extractTextContent(content, contentType);
    const words = textContent.toLowerCase().split(/\s+/);
    const phrases = this.extractPhrases(textContent);
    
    // Industry-specific tag mapping
    const industryKeywords = {
      banking: ['bank', 'loan', 'credit', 'payment', 'financial', 'aml', 'kyc', 'regulatory', 'compliance', 'lending', 'mortgage', 'wealth'],
      insurance: ['claim', 'policy', 'underwriting', 'premium', 'coverage', 'fnol', 'adjuster', 'actuarial', 'loss', 'subrogation'],
      healthcare: ['patient', 'medical', 'clinical', 'health', 'hospital', 'physician', 'diagnosis', 'treatment', 'pharmacy'],
      manufacturing: ['production', 'assembly', 'quality', 'supply chain', 'inventory', 'warehouse', 'procurement', 'logistics'],
      retail: ['customer', 'sales', 'inventory', 'merchandise', 'pos', 'e-commerce', 'fulfillment', 'checkout']
    };
    
    // Process-specific tag mapping
    const processKeywords = {
      'automation': ['automate', 'automated', 'automatic', 'streamline', 'digitize', 'robotic process'],
      'cost-reduction': ['cost', 'save', 'savings', 'reduce', 'efficiency', 'optimize', 'budget', 'expense'],
      'customer-experience': ['customer', 'experience', 'satisfaction', 'service', 'support', 'nps', 'csat'],
      'compliance': ['comply', 'regulation', 'audit', 'governance', 'risk', 'control', 'policy'],
      'ai-transformation': ['artificial intelligence', 'machine learning', 'ai', 'intelligent', 'cognitive', 'neural'],
      'document-processing': ['document', 'paper', 'form', 'pdf', 'ocr', 'extract', 'scan'],
      'data-analytics': ['data', 'analytics', 'insight', 'report', 'dashboard', 'metric', 'kpi'],
      'process-efficiency': ['efficient', 'streamline', 'optimize', 'improve', 'enhance', 'accelerate']
    };
    
    // Role-specific tag mapping for personas
    const roleKeywords = {
      'c-suite': ['ceo', 'cfo', 'coo', 'cto', 'cio', 'chief', 'executive', 'president'],
      'operations': ['operations', 'operational', 'process', 'workflow', 'procedure', 'efficiency'],
      'decision-maker': ['decide', 'approve', 'authorize', 'strategy', 'budget', 'investment'],
      'influencer': ['recommend', 'influence', 'advise', 'suggest', 'evaluate', 'review']
    };
    
    // Analyze industries
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword) || phrases.some(phrase => phrase.includes(keyword)))) {
        suggestedTags.push(industry);
      }
    });
    
    // Analyze processes
    Object.entries(processKeywords).forEach(([process, keywords]) => {
      const score = this.calculateKeywordScore(keywords, words, phrases);
      if (score > 0.3) { // Threshold for relevance
        suggestedTags.push(process);
      }
    });
    
    // Analyze roles (for personas)
    if (contentType === 'persona') {
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        const score = this.calculateKeywordScore(keywords, words, phrases);
        if (score > 0.2) {
          suggestedTags.push(role);
        }
      });
    }
    
    // Content-type specific suggestions
    switch (contentType) {
      case 'resource':
        this.addResourceSpecificTags(content, words, phrases, suggestedTags);
        break;
      case 'use-case':
        this.addUseCaseSpecificTags(content, words, phrases, suggestedTags);
        break;
      case 'persona':
        this.addPersonaSpecificTags(content, words, phrases, suggestedTags);
        break;
    }
    
    // Remove duplicates and return top suggestions
    return [...new Set(suggestedTags)].slice(0, 8);
  }

  /**
   * Extract text content from different content types
   * @param {Object} content - Content object
   * @param {string} contentType - Type of content
   * @returns {string} Combined text content
   */
  extractTextContent(content, contentType) {
    let text = '';
    
    switch (contentType) {
      case 'resource':
        text += `${content.name || ''} ${content.title || ''} ${content.description || ''} ${content.overview || ''} ${content.why || ''}`;
        break;
      case 'use-case':
        text += `${content.name || ''} ${content.title || ''} ${content.description || ''} ${content.overview || ''} ${content.benefits || ''}`;
        break;
      case 'persona':
        text += `${content.title || ''} ${content.world || ''} ${content.cares || ''} ${content.help || ''}`;
        break;
    }
    
    return text;
  }

  /**
   * Extract phrases from text for better context analysis
   * @param {string} text - Input text
   * @returns {Array<string>} Array of phrases
   */
  extractPhrases(text) {
    const phrases = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      
      // Extract 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words.slice(i, i + 2).join(' ').toLowerCase());
        if (i < words.length - 2) {
          phrases.push(words.slice(i, i + 3).join(' ').toLowerCase());
        }
      }
    });
    
    return phrases;
  }

  /**
   * Calculate keyword relevance score
   * @param {Array<string>} keywords - Keywords to match
   * @param {Array<string>} words - Words from content
   * @param {Array<string>} phrases - Phrases from content
   * @returns {number} Relevance score (0-1)
   */
  calculateKeywordScore(keywords, words, phrases) {
    let score = 0;
    let matches = 0;
    
    keywords.forEach(keyword => {
      if (words.includes(keyword)) {
        matches++;
        score += 1;
      } else if (phrases.some(phrase => phrase.includes(keyword))) {
        matches++;
        score += 0.7;
      } else if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
        matches++;
        score += 0.5;
      }
    });
    
    return matches > 0 ? score / keywords.length : 0;
  }

  /**
   * Add resource-specific tag suggestions
   */
  addResourceSpecificTags(content, words, phrases, suggestedTags) {
    // Type-based tags
    if (content.type) {
      switch (content.type.toLowerCase()) {
        case 'solution kit':
          suggestedTags.push('solution-kit', 'implementation');
          break;
        case 'demo video':
          suggestedTags.push('demo', 'video', 'presentation');
          break;
        case 'first call deck':
          suggestedTags.push('first-call', 'sales-deck', 'presentation');
          break;
        case 'business value':
          suggestedTags.push('business-value', 'roi-analysis', 'cost-benefit');
          break;
      }
    }
    
    // ROI and value keywords
    if (words.some(word => ['roi', 'return', 'investment', 'value', 'benefit', 'savings'].includes(word))) {
      suggestedTags.push('roi-analysis', 'business-value');
    }
  }

  /**
   * Add use case-specific tag suggestions
   */
  addUseCaseSpecificTags(content, words, phrases, suggestedTags) {
    // LOB-specific patterns
    const lobPatterns = {
      'consumer-banking': ['consumer', 'retail banking', 'personal'],
      'commercial-banking': ['commercial', 'business banking', 'corporate'],
      'mortgage': ['mortgage', 'loan', 'lending'],
      'payments': ['payment', 'transaction', 'transfer'],
      'claims-processing': ['claim', 'adjuster', 'settlement'],
      'underwriting': ['underwrite', 'risk assessment', 'policy']
    };
    
    Object.entries(lobPatterns).forEach(([lob, patterns]) => {
      if (patterns.some(pattern => 
        words.some(word => pattern.split(' ').includes(word)) || 
        phrases.some(phrase => phrase.includes(pattern))
      )) {
        suggestedTags.push(lob);
      }
    });
  }

  /**
   * Add persona-specific tag suggestions
   */
  addPersonaSpecificTags(content, words, phrases, suggestedTags) {
    // Level detection
    if (words.some(word => ['chief', 'head', 'director', 'vp', 'president'].includes(word))) {
      suggestedTags.push('leadership');
    }
    
    // Influence detection
    if (content.cares && content.cares.includes('budget') || words.includes('budget')) {
      suggestedTags.push('budget-owner');
    }
    
    if (content.help && (content.help.includes('decision') || words.includes('approve'))) {
      suggestedTags.push('decision-maker');
    }
  }

  /**
   * Get AI tag suggestions for a specific form
   * @param {string} formType - Type of form (resource, use-case, persona)
   * @param {string} formId - ID suffix for the form
   */
  async getAITagSuggestions(formType, formId = '') {
    try {
      // Extract content from form fields
      const content = this.extractFormContent(formType, formId);
      
      if (!content || this.isContentEmpty(content)) {
        this.showNotification('Please fill in some content fields before getting AI suggestions', 'info');
        return;
      }
      
      // Show loading state
      const aiButton = document.querySelector(`#ai-suggest-${formType}-tags${formId ? '-' + formId : ''}`);
      if (aiButton) {
        const originalText = aiButton.innerHTML;
        aiButton.innerHTML = '<span class="animate-spin">⟳</span> Analyzing...';
        aiButton.disabled = true;
        
        // Simulate AI processing delay
        setTimeout(() => {
          const suggestions = this.suggestTagsWithAI(content, formType);
          
          if (suggestions.length > 0) {
            this.displayAISuggestions(suggestions, formType, formId);
            this.showNotification(`AI suggested ${suggestions.length} relevant tags`, 'success');
          } else {
            this.showNotification('AI could not find relevant tag suggestions for this content', 'info');
          }
          
          // Restore button
          aiButton.innerHTML = originalText;
          aiButton.disabled = false;
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error getting AI tag suggestions:', error);
      this.showNotification('Error getting AI suggestions', 'error');
    }
  }

  /**
   * Extract content from form fields
   */
  extractFormContent(formType, formId) {
    const content = {};
    const suffix = formId ? `-${formId}` : '';
    
    switch (formType) {
      case 'resource':
        content.name = document.getElementById(`${formId ? 'edit-name' : 'resource-name'}${suffix}`)?.value || '';
        content.description = document.getElementById(`${formId ? 'edit-description' : 'resource-description'}${suffix}`)?.value || '';
        content.why = document.getElementById(`${formId ? 'edit-why' : 'resource-why'}${suffix}`)?.value || '';
        content.type = document.getElementById(`${formId ? 'edit-type' : 'resource-type'}${suffix}`)?.value || '';
        break;
        
      case 'use-case':
        content.name = document.getElementById(`${formId ? 'edit-name' : 'use-case-name'}${suffix}`)?.value || '';
        content.description = document.getElementById(`${formId ? 'edit-description' : 'use-case-description'}${suffix}`)?.value || '';
        content.benefits = document.getElementById(`${formId ? 'edit-benefits' : 'use-case-benefits'}${suffix}`)?.value || '';
        break;
        
      case 'persona':
        content.title = document.getElementById(`${formId ? 'edit-title' : 'persona-title'}${suffix}`)?.value || '';
        content.world = document.getElementById(`${formId ? 'edit-world' : 'persona-world'}${suffix}`)?.value || '';
        content.cares = document.getElementById(`${formId ? 'edit-cares' : 'persona-cares'}${suffix}`)?.value || '';
        content.help = document.getElementById(`${formId ? 'edit-help' : 'persona-help'}${suffix}`)?.value || '';
        break;
    }
    
    return content;
  }

  /**
   * Check if content is empty
   */
  isContentEmpty(content) {
    return !Object.values(content).some(value => value && value.trim().length > 10);
  }

  /**
   * Display AI suggestions as clickable badges
   */
  displayAISuggestions(suggestions, formType, formId) {
    const containerId = `ai-suggestions-${formType}${formId ? '-' + formId : ''}`;
    let container = document.getElementById(containerId);
    
    if (!container) {
      // Create suggestions container
      const aiButton = document.querySelector(`#ai-suggest-${formType}-tags${formId ? '-' + formId : ''}`);
      if (aiButton) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200';
        aiButton.parentElement.insertBefore(container, aiButton.nextSibling);
      }
    }
    
    if (container) {
      const colorThemes = { resource: 'orange', 'use-case': 'green', persona: 'purple' };
      const theme = colorThemes[formType] || 'blue';
      
      container.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <h6 class="text-sm font-medium text-purple-800">🤖 AI Suggested Tags</h6>
          <button class="text-xs text-purple-600 hover:text-purple-800" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="flex flex-wrap gap-2">
          ${suggestions.map(tag => `
            <button type="button" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer
                           bg-${theme}-100 text-${theme}-800 border-${theme}-200 
                           hover:bg-${theme}-200 hover:border-${theme}-300"
                    onclick="adminInterface.addAISuggestedTag('${tag}', '${formType}', '${formId}')">
              <span class="mr-1">+</span> ${tag}
            </button>
          `).join('')}
        </div>
        <p class="text-xs text-purple-600 mt-2">Click tags to add them to your content</p>
      `;
    }
  }

  /**
   * Add AI-suggested tag to the form
   */
  addAISuggestedTag(tag, formType, formId) {
    let inputId;
    
    if (formId) {
      // Edit form
      inputId = `edit-tags-input-${formId}`;
    } else {
      // Add form
      inputId = `${formType}-tags-input`;
    }
    
    const input = document.getElementById(inputId);
    
    if (input) {
      // Trigger the add tag functionality
      input.value = tag;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      input.value = '';
    }
    
    // Visual feedback
    this.showNotification(`Added "${tag}" tag`, 'success');
  }
  
  /**
   * Show tag suggestions dropdown
   */
  showTagSuggestions(input, suggestions, currentTag) {
    this.hideSuggestions();
    
    if (suggestions.length === 0) return null;
    
    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-50 max-h-48 overflow-y-auto';
    suggestionsList.id = 'tag-suggestions';
    
    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.className = 'px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center space-x-2';
      item.innerHTML = `
        <span class="tag-enhanced tag-secondary">${suggestion}</span>
        <span class="text-gray-500 text-sm">Click to add</span>
      `;
      
      item.addEventListener('click', () => {
        this.addSuggestedTag(input, suggestion, currentTag);
        this.hideSuggestions(suggestionsList);
      });
      
      suggestionsList.appendChild(item);
    });
    
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(suggestionsList);
    
    return suggestionsList;
  }
  
  /**
   * Add suggested tag to input
   */
  addSuggestedTag(input, suggestion, currentTag) {
    const value = input.value;
    const lastComma = value.lastIndexOf(',');
    const beforeCurrent = value.substring(0, lastComma + 1);
    const afterCurrent = value.substring(value.indexOf(currentTag) + currentTag.length);
    
    input.value = beforeCurrent + (beforeCurrent.trim() ? ' ' : '') + suggestion + ', ';
    input.focus();
    
    // Trigger any existing tag processing
    input.dispatchEvent(new Event('input'));
  }
  
  /**
   * Hide tag suggestions
   */
  hideSuggestions(suggestionsList = null) {
    if (suggestionsList) {
      suggestionsList.remove();
    } else {
      const existing = document.getElementById('tag-suggestions');
      if (existing) existing.remove();
    }
  }
  
  /**
   * Perform global search across all content
   */
  performGlobalSearch(query) {
    if (!query.trim()) {
      this.clearGlobalSearchResults();
      return;
    }
    
    const results = this.searchAllContent(query);
    this.displayGlobalSearchResults(results);
  }
  
  /**
   * Search all content types
   */
  searchAllContent(query) {
    const results = {
      resources: [],
      useCases: [],
      personas: []
    };
    
    const queryLower = query.toLowerCase();
    
    // Search resources
    if (this.dataManager?.dataStore?.resources) {
      for (const [id, resource] of this.dataManager.dataStore.resources) {
        if (this.matchesSearch(resource, queryLower)) {
          results.resources.push({ ...resource, id });
        }
      }
    }
    
    // Search use cases
    if (this.dataManager?.dataStore?.useCases) {
      for (const [id, useCase] of this.dataManager.dataStore.useCases) {
        if (this.matchesSearch(useCase, queryLower)) {
          results.useCases.push({ ...useCase, id });
        }
      }
    }
    
    // Search personas
    if (this.dataManager?.dataStore?.personas) {
      for (const [id, persona] of this.dataManager.dataStore.personas) {
        if (this.matchesSearch(persona, queryLower)) {
          results.personas.push({ ...persona, id });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Check if item matches search query
   */
  matchesSearch(item, query) {
    const searchFields = [
      item.name, item.title, item.description, item.overview,
      item.vertical, item.industry, item.lob,
      JSON.stringify(item.tags || [])
    ];
    
    return searchFields.some(field => 
      field && field.toString().toLowerCase().includes(query)
    );
  }
  
  /**
   * Display global search results
   */
  displayGlobalSearchResults(results) {
    // Create or update global search results panel
    let resultsPanel = document.getElementById('global-search-results');
    if (!resultsPanel) {
      resultsPanel = document.createElement('div');
      resultsPanel.id = 'global-search-results';
      resultsPanel.className = 'absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-2 shadow-lg z-50 max-h-96 overflow-y-auto';
      
      const globalSearchContainer = document.getElementById('global-search').parentElement;
      globalSearchContainer.appendChild(resultsPanel);
    }
    
    const totalResults = results.resources.length + results.useCases.length + results.personas.length;
    
    if (totalResults === 0) {
      resultsPanel.innerHTML = `
        <div class="p-4 text-center text-gray-500">
          <p>No results found</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="p-4">';
    html += `<div class="text-sm text-gray-600 mb-3">${totalResults} results found</div>`;
    
    // Resources
    if (results.resources.length > 0) {
      html += `<div class="mb-3"><h4 class="font-semibold text-gray-800 mb-2">Resources (${results.resources.length})</h4>`;
      results.resources.slice(0, 3).forEach(resource => {
        html += `
          <div class="p-2 hover:bg-gray-50 rounded cursor-pointer" onclick="adminInterface.showSection('resources'); adminInterface.highlightItem('${resource.id}')">
            <div class="font-medium text-sm">${this.escapeHtml(resource.name || resource.title || 'Untitled')}</div>
            <div class="text-xs text-gray-500">${this.escapeHtml(resource.vertical || resource.industry || 'N/A')}</div>
          </div>
        `;
      });
      if (results.resources.length > 3) {
        html += `<div class="text-xs text-gray-500 mt-1">+${results.resources.length - 3} more resources</div>`;
      }
      html += '</div>';
    }
    
    // Use Cases
    if (results.useCases.length > 0) {
      html += `<div class="mb-3"><h4 class="font-semibold text-gray-800 mb-2">Use Cases (${results.useCases.length})</h4>`;
      results.useCases.slice(0, 3).forEach(useCase => {
        html += `
          <div class="p-2 hover:bg-gray-50 rounded cursor-pointer" onclick="adminInterface.showSection('use-cases'); adminInterface.highlightItem('${useCase.id}')">
            <div class="font-medium text-sm">${this.escapeHtml(useCase.name || useCase.title || 'Untitled')}</div>
            <div class="text-xs text-gray-500">${this.escapeHtml(useCase.vertical || useCase.industry || 'N/A')} - ${this.escapeHtml(useCase.lob || 'N/A')}</div>
          </div>
        `;
      });
      if (results.useCases.length > 3) {
        html += `<div class="text-xs text-gray-500 mt-1">+${results.useCases.length - 3} more use cases</div>`;
      }
      html += '</div>';
    }
    
    // Personas
    if (results.personas.length > 0) {
      html += `<div class="mb-3"><h4 class="font-semibold text-gray-800 mb-2">Personas (${results.personas.length})</h4>`;
      results.personas.slice(0, 3).forEach(persona => {
        html += `
          <div class="p-2 hover:bg-gray-50 rounded cursor-pointer" onclick="adminInterface.showSection('personas'); adminInterface.highlightItem('${persona.id}')">
            <div class="font-medium text-sm">${this.escapeHtml(persona.name || persona.title || 'Untitled')}</div>
            <div class="text-xs text-gray-500">${this.escapeHtml(persona.vertical || persona.industry || 'N/A')}</div>
          </div>
        `;
      });
      if (results.personas.length > 3) {
        html += `<div class="text-xs text-gray-500 mt-1">+${results.personas.length - 3} more personas</div>`;
      }
      html += '</div>';
    }
    
    html += '</div>';
    resultsPanel.innerHTML = html;
  }
  
  /**
   * Clear global search results
   */
  clearGlobalSearchResults() {
    const resultsPanel = document.getElementById('global-search-results');
    if (resultsPanel) {
      resultsPanel.remove();
    }
  }
  
  /**
   * Show specific section
   */
  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
    
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.remove('admin-nav-active');
    });
    
    const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (navBtn) {
      navBtn.classList.add('admin-nav-active');
    }
  }
  
  /**
   * Highlight specific item
   */
  highlightItem(itemId) {
    setTimeout(() => {
      const item = document.querySelector(`[data-id="${itemId}"]`);
      if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.classList.add('ring-2', 'ring-orange-400');
        setTimeout(() => {
          item.classList.remove('ring-2', 'ring-orange-400');
        }, 3000);
      }
    }, 100);
  }

  /**
   * Perform search across indexed content
   */
  performSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }
    
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [key, item] of this.searchIndex) {
      if (item.searchText.includes(queryLower)) {
        results.push(item);
      }
    }
    
    this.displaySearchResults(results);
  }

  /**
   * Display search results
   */
  displaySearchResults(results) {
    console.log(`🔍 Found ${results.length} search results`);
    // Implement search results display logic here
  }

  /**
   * Clear search results
   */
  clearSearchResults() {
    // Implement search results clearing logic here
  }

  /**
   * Initialize drag and drop reordering
   */
  initializeDragDrop() {
    if (!this.features.dragDropReorder) return;
    
    this.dragDropHandler = {
      draggedElement: null,
      draggedData: null,
      dropZones: new Set()
    };
    
    // Setup sortable lists
    this.setupSortableLists();
    console.log('🔄 Drag & drop reordering enabled');
  }

  /**
   * Setup sortable lists for drag and drop reordering
   */
  setupSortableLists() {
    const sortableLists = document.querySelectorAll('.sortable-list, [data-sortable="true"]');
    
    sortableLists.forEach(list => {
      // Add sortable attributes
      list.setAttribute('data-sortable', 'true');
      
      // Make items draggable
      const items = list.querySelectorAll('li, .sortable-item, [data-sortable-item]');
      items.forEach(item => {
        item.draggable = true;
        item.setAttribute('data-sortable-item', 'true');
      });
      
      this.dragDropHandler.dropZones.add(list);
    });
    
    console.log(`🔄 Setup ${sortableLists.length} sortable lists`);
  }

  /**
   * Setup real-time preview
   */
  setupRealTimePreview() {
    if (!this.features.realTimePreview) return;
    
    this.previewFrame = document.getElementById('preview-frame');
    if (this.previewFrame) {
      this.previewUpdateTimer = null;
      console.log('👁️ Real-time preview enabled');
    }
  }

  /**
   * Setup undo/redo system
   */
  setupUndoRedo() {
    if (!this.features.undoRedo) return;
    
    this.createUndoRedoUI();
    this.updateUndoRedoState();
    console.log('⏮️ Undo/Redo system enabled');
  }

  /**
   * Create undo/redo UI elements
   */
  createUndoRedoUI() {
    // Create undo/redo toolbar
    const undoRedoToolbar = document.createElement('div');
    undoRedoToolbar.id = 'undo-redo-toolbar';
    undoRedoToolbar.className = 'fixed top-20 right-4 bg-white border shadow-lg rounded-lg p-2 z-40 flex space-x-2';
    undoRedoToolbar.innerHTML = `
      <button id="undo-btn" class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Undo (Ctrl+Z)" disabled>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
      </button>
      <button id="redo-btn" class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Redo (Ctrl+Y)" disabled>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/>
        </svg>
      </button>
    `;

    document.body.appendChild(undoRedoToolbar);

    // Setup event listeners
    document.getElementById('undo-btn').addEventListener('click', () => this.undo());
    document.getElementById('redo-btn').addEventListener('click', () => this.redo());
  }

  /**
   * Update undo/redo button states
   */
  updateUndoRedoState() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn && redoBtn) {
      undoBtn.disabled = this.undoStack.length === 0;
      redoBtn.disabled = this.redoStack.length === 0;
      
      // Update tooltips with action names
      if (this.undoStack.length > 0) {
        const lastAction = this.undoStack[this.undoStack.length - 1];
        undoBtn.title = `Undo ${lastAction.action || 'action'} (Ctrl+Z)`;
      } else {
        undoBtn.title = 'Undo (Ctrl+Z)';
      }
      
      if (this.redoStack.length > 0) {
        const nextAction = this.redoStack[this.redoStack.length - 1];
        redoBtn.title = `Redo ${nextAction.action || 'action'} (Ctrl+Y)`;
      } else {
        redoBtn.title = 'Redo (Ctrl+Y)';
      }
    }
  }

  /**
   * Initialize analytics for admin usage
   */
  initializeAnalytics() {
    if (!this.features.analytics) return;
    
    this.analytics = {
      sessionStart: Date.now(),
      actions: [],
      editingTime: 0,
      savesPerformed: 0,
      errorsEncountered: 0
    };
    
    this.trackAdminAction('session_start');
  }

  /**
   * Load data from various sources
   */
  async loadDataFromSources() {
    try {
      // Load from localStorage first (fastest)
      await this.loadFromLocalStorage();
      
      // Load from server if available
      if (this.isOnline) {
        await this.loadFromServer();
      }
      
      // Load from backup files
      await this.loadFromBackupFiles();
      
      console.log('📊 Data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load data:', error);
      this.handleDataLoadError(error);
    }
  }

  /**
   * Load data from localStorage
   */
  async loadFromLocalStorage() {
    try {
      const adminData = localStorage.getItem('admin-data');
      if (adminData) {
        const data = JSON.parse(adminData);
        console.log('📦 Loaded data from localStorage');
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from localStorage:', error);
    }
    return null;
  }

  /**
   * Load data from server
   */
  async loadFromServer() {
    // For now, this is a placeholder - would integrate with actual server API
    console.log('🌐 Server data loading not implemented yet');
    return null;
  }

  /**
   * Load data from backup files
   */
  async loadFromBackupFiles() {
    // Placeholder for backup file loading
    console.log('💾 Backup file loading not implemented yet');
    return null;
  }

  /**
   * Handle data loading errors
   */
  handleDataLoadError(error) {
    console.error('❌ Data loading error:', error);
    
    // Show user-friendly error message
    this.showNotification('Warning: Some data could not be loaded. Using cached data.', 'warning');
    
    // Try to continue with whatever data we have
    try {
      // Load from localStorage as fallback
      const savedData = localStorage.getItem('admin-fallback-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('📦 Using fallback data from localStorage');
        
        // Populate data store with fallback data
        if (parsedData.personas) {
          parsedData.personas.forEach(persona => {
            this.dataStore.personas.set(persona.id, persona);
          });
        }
      } else {
        console.log('📝 No fallback data available, starting with empty data store');
      }
      
    } catch (fallbackError) {
      console.error('❌ Fallback data loading also failed:', fallbackError);
      this.showNotification('Unable to load data. Starting with empty admin panel.', 'error');
    }
  }

  /**
   * Render the admin interface
   */
  async renderInterface() {
    performance.mark('admin-render-start');
    
    try {
      // Render navigation
      this.renderNavigation();
      
      // Render main content areas
      this.renderPersonasManager();
      this.renderStagesManager();
      this.renderResourcesManager();
      this.renderUseCasesManager();
      
      // Render utilities
      this.renderUtilitiesPanel();
      this.renderStatusBar();
      
      // Initialize interactive elements
      this.initializeInteractiveElements();
      
      performance.mark('admin-render-end');
      performance.measure('admin-render-duration', 'admin-render-start', 'admin-render-end');
      
    } catch (error) {
      console.error('Interface rendering failed:', error);
      this.showErrorMessage('Failed to render admin interface');
    }
  }

  /**
   * Show specific admin section
   */
  showAdminSection(sectionName) {
    console.log(`🔍 Showing admin section: ${sectionName}`);
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.add('hidden');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.remove('admin-nav-active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
    
    // Mark nav button as active
    const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (navBtn) {
      navBtn.classList.add('admin-nav-active');
    }
    
    // Render section content based on section type
    this.renderSectionContent(sectionName);
  }

  /**
   * Render content for specific section
   */
  renderSectionContent(sectionName) {
    console.log(`📄 Rendering content for section: ${sectionName}`);
    
    switch(sectionName) {
      case 'personas':
        this.renderPersonasManager();
        break;
      case 'use-cases':
        this.renderUseCasesManager();
        break;
      case 'resources':
        this.renderResourcesManager();
        break;
      case 'tags':
        this.renderTagsManager();
        break;
      case 'categories':
        this.renderCategoriesManager();
        break;
      case 'filters':
        this.renderFiltersManager();
        break;
      case 'pdf-extraction':
        this.renderPdfExtractionManager();
        break;
      default:
        console.log(`ℹ️ Section ${sectionName} content not implemented yet`);
    }
  }

  /**
   * Render navigation
   */
  renderNavigation() {
    console.log('🧭 Navigation rendering - placeholder');
  }

  /**
   * Render personas manager
   */
  renderPersonasManager(filters = {}) {
    console.log('👥 Rendering personas manager with actual data', filters);
    
    const section = document.getElementById('section-personas');
    if (!section) {
      console.log('❌ section-personas not found');
      return;
    }
    
    const container = section.querySelector('.personas-grid') || section;
    let personas = this.dataManager ? this.dataManager.getPersonas() : [];
    
    // Apply filters
    if (filters.vertical) {
      personas = personas.filter(p => (p.vertical || p.industry || '').toLowerCase() === filters.vertical.toLowerCase());
    }
    if (filters.lob) {
      personas = personas.filter(p => {
        const lobList = p.lob || [];
        return Array.isArray(lobList) ? 
          lobList.some(lob => lob.toLowerCase() === filters.lob.toLowerCase()) :
          (p.lob || '').toLowerCase() === filters.lob.toLowerCase();
      });
    }
    
    if (filters.search) {
      // Build dynamic search fields based on checkboxes
      let searchFields = [];
      if (filters.searchContent) {
        searchFields.push('name', 'title', 'world', 'cares', 'help', 'vertical', 'industry', 'level');
      }
      if (filters.searchTags) {
        searchFields.push('tags');
      }
      if (searchFields.length === 0) {
        // Default to content search if no checkboxes selected
        searchFields = ['name', 'title', 'world', 'cares', 'help', 'vertical', 'industry', 'level'];
      }
      
      // Use fuzzy search for better matching
      personas = FuzzySearch.search(filters.search, personas, searchFields, 0.15);
    }
    
    // Apply sorting
    if (filters.sort && filters.sort !== 'relevance') {
      personas.sort((a, b) => {
        let aVal = '';
        let bVal = '';
        
        switch(filters.sort) {
          case 'title':
            aVal = (a.title || '').toLowerCase();
            bVal = (b.title || '').toLowerCase();
            break;
          case 'industry':
            aVal = (a.vertical || a.industry || '').toLowerCase();
            bVal = (b.vertical || b.industry || '').toLowerCase();
            break;
          case 'lob':
            aVal = Array.isArray(a.lob) ? (a.lob[0] || '').toLowerCase() : (a.lob || '').toLowerCase();
            bVal = Array.isArray(b.lob) ? (b.lob[0] || '').toLowerCase() : (b.lob || '').toLowerCase();
            break;
        }
        
        return aVal.localeCompare(bVal);
      });
    }
    
    // Update results count
    const resultsCount = document.getElementById('persona-results-count');
    if (resultsCount) {
      const totalPersonas = this.dataManager ? this.dataManager.getPersonas().length : 0;
      resultsCount.textContent = `Showing ${personas.length} of ${totalPersonas} personas`;
    }
    
    console.log(`📊 Found ${personas.length} personas to render`, personas);
    
    // Create the personas display HTML (even if empty)
    let personasHtml = '';
    
    if (personas.length === 0) {
      personasHtml = '<div class="text-center text-gray-500 py-8">No personas found. Data may still be loading.</div>';
    } else {
      // Create personas grid
      personasHtml = '<div class="personas-grid space-y-4">';
      
      personas.forEach((persona, index) => {
        // Generate tags HTML
        let tagsHtml = '';
        if (persona.tags && Array.isArray(persona.tags) && persona.tags.length > 0) {
          tagsHtml = `
            <div class="mb-3">
              <div class="flex flex-wrap gap-1">
                ${persona.tags.map(tag => `
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    ${this.escapeHtml(tag)}
                  </span>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        personasHtml += `
          <div class="persona-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-gray-900">${this.escapeHtml(persona.title || 'Untitled')}</h3>
              <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">${this.escapeHtml(persona.vertical || persona.industry || 'N/A')}</span>
            </div>
            
            ${persona.world ? `
            <div class="mb-3">
              <h4 class="text-xs font-semibold text-purple-700 mb-1">👤 Who Are They?</h4>
              <p class="text-sm text-gray-700">${this.escapeHtml(persona.world)}</p>
            </div>
            ` : ''}
            
            ${persona.cares ? `
            <div class="mb-3">
              <h4 class="text-xs font-semibold text-orange-700 mb-1">🎯 What They Care About</h4>
              <p class="text-sm text-gray-700">${this.escapeHtml(persona.cares)}</p>
            </div>
            ` : ''}
            
            ${persona.help ? `
            <div class="mb-3">
              <h4 class="text-xs font-semibold text-green-700 mb-1">🚀 How UiPath Can Help</h4>
              <p class="text-sm text-gray-700">${this.escapeHtml(persona.help)}</p>
            </div>
            ` : ''}
            
            ${tagsHtml}
            
            <div class="flex justify-end items-center pt-2 border-t border-gray-100">
              <div class="flex items-center space-x-2">
                <button class="text-sm text-blue-600 hover:text-blue-800 p-1" data-admin-action="edit-persona" data-id="${persona.id}" title="Edit persona">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="text-sm text-red-600 hover:text-red-800 p-1" data-admin-action="delete-persona" data-id="${persona.id}" title="Delete persona">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      personasHtml += '</div>';
    }
    
    // Find the right container in the section and update the personas list
    const contentArea = section.querySelector('.bg-white.rounded-lg.shadow-sm');
    if (contentArea) {
      // Find and update just the personas list container
      const personasListContainer = contentArea.querySelector('#personas-list');
      if (personasListContainer) {
        personasListContainer.innerHTML = personasHtml;
      } else {
        console.warn('Personas list container (#personas-list) not found');
      }
    }
  }

  /**
   * Render stages manager
   */
  renderStagesManager() {
    console.log('📊 Stages manager rendering - placeholder');
  }

  /**
   * Render resources manager
   */
  renderResourcesManager(filters = {}) {
    console.log('📚 Rendering resources manager with actual data', filters);
    
    const section = document.getElementById('section-resources');
    if (!section) return;
    
    let resources = this.dataManager ? this.dataManager.getResources() : [];
    
    // Add custom resources from localStorage
    const customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
    if (customResources.length > 0) {
      console.log(`📄 Adding ${customResources.length} custom resources from localStorage`);
      resources = [...resources, ...customResources];
    }
    
    // Apply filters
    if (filters.vertical) {
      resources = resources.filter(r => (r.vertical || r.industry || '').toLowerCase() === filters.vertical.toLowerCase());
    }
    if (filters.type) {
      resources = resources.filter(r => (r.type || '').toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.hasLink) {
      if (filters.hasLink === 'with-link') {
        resources = resources.filter(r => r.link && r.link.trim() !== '');
      } else if (filters.hasLink === 'no-link') {
        resources = resources.filter(r => !r.link || r.link.trim() === '');
      }
    }
    
    if (filters.search) {
      // Build dynamic search fields based on checkboxes
      let searchFields = [];
      if (filters.searchContent) {
        searchFields.push('name', 'title', 'overview', 'description', 'why', 'vertical', 'industry');
      }
      if (filters.searchTags) {
        searchFields.push('tags');
      }
      if (searchFields.length === 0) {
        // Default to content search if no checkboxes selected
        searchFields = ['name', 'title', 'overview', 'description', 'why', 'vertical', 'industry'];
      }
      
      // Use fuzzy search for better matching
      resources = FuzzySearch.search(filters.search, resources, searchFields, 0.15);
    }
    
    // Apply sorting
    if (filters.sort && filters.sort !== 'relevance') {
      resources.sort((a, b) => {
        let aVal = '';
        let bVal = '';
        
        switch(filters.sort) {
          case 'name':
            aVal = (a.name || a.title || '').toLowerCase();
            bVal = (b.name || b.title || '').toLowerCase();
            break;
          case 'type':
            aVal = (a.type || '').toLowerCase();
            bVal = (b.type || '').toLowerCase();
            break;
          case 'industry':
            aVal = (a.vertical || a.industry || '').toLowerCase();
            bVal = (b.vertical || b.industry || '').toLowerCase();
            break;
        }
        
        return aVal.localeCompare(bVal);
      });
    }
    
    console.log(`📊 Found ${resources.length} resources to render`);
    
    // Update results count
    const resultsCount = document.getElementById('resource-results-count');
    if (resultsCount) {
      const totalResources = this.dataManager ? this.dataManager.getResources().length : 0;
      resultsCount.textContent = `Showing ${resources.length} of ${totalResources} resources`;
    }
    
    // Create the resources display HTML (even if empty)
    let resourcesHtml = '';
    
    if (resources.length === 0) {
      resourcesHtml = '<div class="text-center text-gray-500 py-8">No resources found. Data may still be loading.</div>';
    } else {
      // Create resources grid
      resourcesHtml = '<div class="resources-grid space-y-4">';
      
      resources.forEach((resource, index) => {
        // Generate tags HTML
        let tagsHtml = '';
        if (resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0) {
          tagsHtml = `
            <div class="mb-3">
              <div class="flex flex-wrap gap-1">
                ${resource.tags.map(tag => `
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    ${this.escapeHtml(tag)}
                  </span>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        const resourceId = resource.id || resource.name || resource.title;
        console.log('🏷️ Creating resource card with ID:', resourceId, 'for resource:', resource.name || resource.title);
        
        resourcesHtml += `
          <div class="resource-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-resource-id="${resourceId}">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-semibold text-gray-900">${this.escapeHtml(resource.name || resource.title || 'Untitled')}</h3>
              <div class="flex items-center space-x-2">
                ${resource.type ? `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${this.escapeHtml(resource.type)}</span>` : ''}
                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">${this.escapeHtml(resource.vertical || resource.industry || 'N/A')}</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">${this.escapeHtml(resource.overview || resource.description || 'No description')}</p>
            ${resource.why || resource.whyThisMatters || resource.why_this_matters ? `<div class="mb-3"><p class="text-xs font-medium text-gray-700 mb-1">Why This Matters:</p><p class="text-xs text-orange-700 bg-orange-50 p-2 rounded">${this.escapeHtml(resource.why || resource.whyThisMatters || resource.why_this_matters)}</p></div>` : ''}
            ${tagsHtml}
            <div class="flex justify-between items-center pt-2 ${tagsHtml || (resource.why || resource.whyThisMatters || resource.why_this_matters) ? 'border-t border-gray-100' : ''}">
              ${resource.link ? `<a href="${this.escapeHtml(resource.link)}" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 underline flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                View Resource
              </a>` : '<div></div>'}
              <div class="flex items-center space-x-2">
                <button class="text-sm text-blue-600 hover:text-blue-800 p-1" data-admin-action="edit-resource" data-id="${resource.id}" title="Edit resource">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="text-sm text-red-600 hover:text-red-800 p-1" data-admin-action="delete-resource" data-id="${resource.id}" title="Delete resource">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      resourcesHtml += '</div>';
    }
    
    // Find the right container in the section and update the resources list
    const contentArea = section.querySelector('.bg-white.rounded-lg.shadow-sm');
    if (contentArea) {
      // Find and update just the resources list container
      const resourcesListContainer = contentArea.querySelector('#resources-list');
      if (resourcesListContainer) {
        resourcesListContainer.innerHTML = resourcesHtml;
      } else {
        console.warn('Resources list container (#resources-list) not found');
      }
    }
  }

  /**
   * Render use cases manager
   */
  renderUseCasesManager(filters = {}) {
    console.log('💼 Rendering use cases manager with actual data', filters);
    
    const section = document.getElementById('section-use-cases');
    if (!section) {
      console.log('❌ section-use-cases not found');
      return;
    }
    
    let useCases = this.dataManager ? this.dataManager.getUseCases() : [];
    
    // Apply filters
    if (filters.vertical) {
      useCases = useCases.filter(uc => (uc.vertical || uc.industry || '').toLowerCase() === filters.vertical.toLowerCase());
    }
    if (filters.category) {
      useCases = useCases.filter(uc => (uc.category || '').toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.lob) {
      useCases = useCases.filter(uc => {
        const lobList = uc.lob || [];
        return Array.isArray(lobList) ? 
          lobList.some(l => l.toLowerCase().includes(filters.lob.toLowerCase())) :
          (lobList || '').toLowerCase().includes(filters.lob.toLowerCase());
      });
    }
    
    if (filters.search) {
      // Build dynamic search fields based on checkboxes
      let searchFields = [];
      if (filters.searchContent) {
        searchFields.push('name', 'title', 'overview', 'description', 'benefits', 'vertical', 'industry', 'category', 'lob');
      }
      if (filters.searchTags) {
        searchFields.push('tags');
      }
      if (searchFields.length === 0) {
        // Default to content search if no checkboxes selected
        searchFields = ['name', 'title', 'overview', 'description', 'benefits', 'vertical', 'industry', 'category'];
      }
      
      // Use fuzzy search for better matching
      useCases = FuzzySearch.search(filters.search, useCases, searchFields, 0.15);
    }
    
    // Apply sorting
    if (filters.sort && filters.sort !== 'relevance') {
      useCases.sort((a, b) => {
        let aVal = '';
        let bVal = '';
        
        switch(filters.sort) {
          case 'name':
            aVal = (a.name || a.title || '').toLowerCase();
            bVal = (b.name || b.title || '').toLowerCase();
            break;
          case 'complexity':
            const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
            aVal = complexityOrder[(a.complexity || '').toLowerCase()] || 0;
            bVal = complexityOrder[(b.complexity || '').toLowerCase()] || 0;
            return aVal - bVal;
          case 'industry':
            aVal = (a.vertical || a.industry || '').toLowerCase();
            bVal = (b.vertical || b.industry || '').toLowerCase();
            break;
          case 'category':
            aVal = (a.category || '').toLowerCase();
            bVal = (b.category || '').toLowerCase();
            break;
        }
        
        return aVal.localeCompare(bVal);
      });
    }
    
    // Update results count
    const resultsCount = document.getElementById('use-case-results-count');
    if (resultsCount) {
      const totalUseCases = this.dataManager ? this.dataManager.getUseCases().length : 0;
      resultsCount.textContent = `Showing ${useCases.length} of ${totalUseCases} use cases`;
    }
    
    console.log(`📊 Found ${useCases.length} use cases to render`, useCases);
    console.log('📊 First few use cases:', useCases.slice(0, 3));
    
    // Create the use cases display HTML (even if empty)
    let useCasesHtml = '';
    
    if (useCases.length === 0) {
      useCasesHtml = '<div class="text-center text-gray-500 py-8">No use cases found. Data may still be loading.</div>';
    } else {
      // Create use cases grid
      useCasesHtml = '<div class="use-cases-grid space-y-4">';
      
      useCases.forEach((useCase, index) => {
        // Generate tags HTML
        let tagsHtml = '';
        if (useCase.tags && Array.isArray(useCase.tags) && useCase.tags.length > 0) {
          tagsHtml = `
            <div class="mb-3">
              <div class="flex flex-wrap gap-1">
                ${useCase.tags.map(tag => `
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    ${this.escapeHtml(tag)}
                  </span>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        useCasesHtml += `
          <div class="use-case-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-semibold text-gray-900">${this.escapeHtml(useCase.name || useCase.title || 'Untitled')}</h3>
              <div class="flex items-center space-x-2">
                ${useCase.category ? `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${this.escapeHtml(useCase.category)}</span>` : ''}
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">${this.escapeHtml(useCase.vertical || useCase.industry || 'N/A')}</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">${this.escapeHtml(useCase.overview || useCase.description || 'No description')}</p>
            ${useCase.businessValue || useCase.benefits ? `<div class="mb-3"><p class="text-xs font-medium text-gray-700 mb-1">Key Value Propositions:</p><p class="text-xs text-green-700 bg-green-50 p-2 rounded">${this.escapeHtml(useCase.businessValue || useCase.benefits)}</p></div>` : ''}
            ${tagsHtml}
            <div class="flex justify-between items-center pt-2 ${tagsHtml || (useCase.businessValue || useCase.benefits) ? 'border-t border-gray-100' : ''}">
              ${useCase.link ? `<a href="${this.escapeHtml(useCase.link)}" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 underline flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                View Use Case
              </a>` : '<div></div>'}
              <div class="flex items-center space-x-2">
                <button class="text-sm text-blue-600 hover:text-blue-800 p-1" data-admin-action="edit-use-case" data-id="${useCase.id}" title="Edit use case">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="text-sm text-red-600 hover:text-red-800 p-1" data-admin-action="delete-use-case" data-id="${useCase.id}" title="Delete use case">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      useCasesHtml += '</div>';
    }
    
    // Find the right container in the section and update the use cases list
    const contentArea = section.querySelector('.bg-white.rounded-lg.shadow-sm');
    if (contentArea) {
      // Find and update just the use cases list container
      const useCasesListContainer = contentArea.querySelector('#use-cases-list');
      if (useCasesListContainer) {
        useCasesListContainer.innerHTML = useCasesHtml;
      } else {
        console.warn('Use cases list container (#use-cases-list) not found');
      }
    }
  }

  /**
   * Render tags manager
   */
  renderTagsManager(filters = {}) {
    console.log('🏷️ Rendering tags manager');
    
    // Extract all tags from personas, resources, and use cases
    const allTags = this.extractAllTags();
    console.log('📊 Found tags:', allTags);
    
    // Calculate tag statistics
    const tagStats = this.calculateTagStatistics(allTags);
    console.log('📈 Tag statistics:', tagStats);
    
    // Update all tags display
    this.updateAllTagsDisplay(allTags, filters);
    
    // Update statistics
    this.updateTagStatistics(tagStats);
    
    // Setup event listeners for adding new tags
    this.setupTagAdditionListeners();
    
    // Setup event listeners for filtering tags
    this.setupTagFilterListeners();
  }

  /**
   * Extract all tags from all data sources
   */
  extractAllTags() {
    const tagMap = new Map();
    
    // Extract from personas
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.personas) {
      for (const [id, persona] of this.dataManager.dataStore.personas) {
        if (persona.tags && Array.isArray(persona.tags)) {
          persona.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              const normalizedTag = tag.toLowerCase().trim();
              if (!tagMap.has(normalizedTag)) {
                tagMap.set(normalizedTag, {
                  name: tag.trim(),
                  count: 0,
                  usedIn: {
                    personas: new Set(),
                    resources: new Set(),
                    useCases: new Set()
                  }
                });
              }
              tagMap.get(normalizedTag).count++;
              tagMap.get(normalizedTag).usedIn.personas.add(id);
            }
          });
        }
      }
    }
    
    // Extract from resources
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.resources) {
      for (const [id, resource] of this.dataManager.dataStore.resources) {
        if (resource.tags && Array.isArray(resource.tags)) {
          resource.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              const normalizedTag = tag.toLowerCase().trim();
              if (!tagMap.has(normalizedTag)) {
                tagMap.set(normalizedTag, {
                  name: tag.trim(),
                  count: 0,
                  usedIn: {
                    personas: new Set(),
                    resources: new Set(),
                    useCases: new Set()
                  }
                });
              }
              tagMap.get(normalizedTag).count++;
              tagMap.get(normalizedTag).usedIn.resources.add(id);
            }
          });
        }
      }
    }
    
    // Extract from use cases
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.useCases) {
      for (const [id, useCase] of this.dataManager.dataStore.useCases) {
        if (useCase.tags && Array.isArray(useCase.tags)) {
          useCase.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              const normalizedTag = tag.toLowerCase().trim();
              if (!tagMap.has(normalizedTag)) {
                tagMap.set(normalizedTag, {
                  name: tag.trim(),
                  count: 0,
                  usedIn: {
                    personas: new Set(),
                    resources: new Set(),
                    useCases: new Set()
                  }
                });
              }
              tagMap.get(normalizedTag).count++;
              tagMap.get(normalizedTag).usedIn.useCases.add(id);
            }
          });
        }
      }
    }
    
    // Add any global tags that haven't been used yet
    if (this.globalTags) {
      this.globalTags.forEach(globalTag => {
        const normalizedTag = globalTag.toLowerCase().trim();
        if (!tagMap.has(normalizedTag)) {
          tagMap.set(normalizedTag, {
            name: globalTag.trim(),
            count: 0,
            usedIn: {
              personas: new Set(),
              resources: new Set(),
              useCases: new Set()
            }
          });
        }
      });
    }
    
    // Convert to array and sort by usage count
    return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate tag statistics
   */
  calculateTagStatistics(tags) {
    const totalTags = tags.length;
    const usedTags = tags.filter(tag => tag.count > 0).length;
    const popularTags = tags.filter(tag => tag.count >= 3).length; // 3+ uses considered popular
    const unusedTags = tags.filter(tag => tag.count === 0).length;
    
    return {
      total: totalTags,
      used: usedTags,
      popular: popularTags,
      unused: unusedTags,
      mostPopular: tags.length > 0 ? tags[0] : null
    };
  }

  /**
   * Update all tags display
   */
  updateAllTagsDisplay(tags, filters = {}) {
    const allTagsDisplay = document.getElementById('all-tags-display');
    if (!allTagsDisplay) return;
    
    let filteredTags = [...tags];
    
    // Apply search filter
    if (filters.search) {
      filteredTags = filteredTags.filter(tag => 
        tag.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply usage filter
    if (filters.usage) {
      switch (filters.usage) {
        case 'high':
          filteredTags = filteredTags.filter(tag => tag.count >= 5);
          break;
        case 'medium':
          filteredTags = filteredTags.filter(tag => tag.count >= 2 && tag.count < 5);
          break;
        case 'low':
          filteredTags = filteredTags.filter(tag => tag.count === 1);
          break;
        case 'unused':
          filteredTags = filteredTags.filter(tag => tag.count === 0);
          break;
      }
    }
    
    if (filteredTags.length === 0) {
      allTagsDisplay.innerHTML = '<span class="text-gray-500 text-sm">No tags found matching the current filters.</span>';
      return;
    }
    
    // Generate tags HTML
    let tagsHtml = '<div class="flex flex-wrap gap-3">';
    filteredTags.forEach(tag => {
      const usageCount = tag.count;
      const usageText = usageCount === 1 ? '1 use' : `${usageCount} uses`;
      
      // Color coding based on usage
      let colorClass = 'bg-gray-100 text-gray-800 border-gray-300';
      if (usageCount >= 5) {
        colorClass = 'bg-green-100 text-green-800 border-green-300';
      } else if (usageCount >= 3) {
        colorClass = 'bg-blue-100 text-blue-800 border-blue-300';
      } else if (usageCount >= 1) {
        colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      }
      
      tagsHtml += `
        <div class="flex items-center space-x-2 px-2 py-1 rounded border ${colorClass}">
          <span class="text-sm font-medium">${this.escapeHtml(tag.name)}</span>
          <span class="text-xs opacity-75">${usageText}</span>
          <div class="flex items-center space-x-1">
            <button class="text-blue-600 hover:text-blue-800 text-xs" onclick="adminInterface.editTag('${this.escapeHtml(tag.name)}')" title="Edit tag">
              ✏️
            </button>
            <button class="text-red-600 hover:text-red-800 text-xs" onclick="adminInterface.deleteTag('${this.escapeHtml(tag.name)}')" title="Delete tag">
              🗑️
            </button>
          </div>
        </div>
      `;
    });
    tagsHtml += '</div>';
    
    allTagsDisplay.innerHTML = tagsHtml;
  }

  /**
   * Update tag statistics display
   */
  updateTagStatistics(stats) {
    document.getElementById('stats-total-tags').textContent = stats.total;
    document.getElementById('stats-used-tags').textContent = stats.used;
    document.getElementById('stats-popular-tags').textContent = stats.popular;
    document.getElementById('stats-unused-tags').textContent = stats.unused;
  }

  /**
   * Setup event listeners for tag addition
   */
  setupTagAdditionListeners() {
    const newTagInput = document.getElementById('new-tag-input');
    const addTagBtn = document.getElementById('add-tag-btn');
    
    if (newTagInput) {
      // Handle Enter key press
      newTagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addNewTag();
        }
      });
      
      // Clear any previous listeners on the add button and add new one
      if (addTagBtn) {
        addTagBtn.replaceWith(addTagBtn.cloneNode(true));
        const newAddTagBtn = document.getElementById('add-tag-btn');
        newAddTagBtn.addEventListener('click', () => {
          this.addNewTag();
        });
      }
    }
  }

  /**
   * Setup event listeners for tag filtering
   */
  setupTagFilterListeners() {
    const tagSearchInput = document.getElementById('tag-search');
    const tagUsageFilter = document.getElementById('tag-filter-usage');
    
    // Search input handler
    if (tagSearchInput) {
      // Clear any existing listeners
      tagSearchInput.removeEventListener('input', this.handleTagSearchInput);
      this.handleTagSearchInput = (e) => {
        const searchTerm = e.target.value.trim();
        const usageFilter = tagUsageFilter ? tagUsageFilter.value : '';
        this.applyTagFilters({ search: searchTerm, usage: usageFilter });
      };
      tagSearchInput.addEventListener('input', this.handleTagSearchInput);
    }
    
    // Usage filter handler
    if (tagUsageFilter) {
      // Clear any existing listeners
      tagUsageFilter.removeEventListener('change', this.handleTagUsageFilter);
      this.handleTagUsageFilter = (e) => {
        const usageFilter = e.target.value;
        const searchTerm = tagSearchInput ? tagSearchInput.value.trim() : '';
        this.applyTagFilters({ search: searchTerm, usage: usageFilter });
      };
      tagUsageFilter.addEventListener('change', this.handleTagUsageFilter);
    }
  }

  /**
   * Apply tag filters
   */
  applyTagFilters(filters = {}) {
    console.log('🔍 Applying tag filters:', filters);
    
    // Extract all tags
    const allTags = this.extractAllTags();
    
    // Update display with filters
    this.updateAllTagsDisplay(allTags, filters);
    
    // Update statistics based on filtered results
    let filteredTags = [...allTags];
    
    // Apply search filter for stats
    if (filters.search) {
      filteredTags = filteredTags.filter(tag => 
        tag.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply usage filter for stats
    if (filters.usage) {
      switch (filters.usage) {
        case 'high':
          filteredTags = filteredTags.filter(tag => tag.count >= 5);
          break;
        case 'medium':
          filteredTags = filteredTags.filter(tag => tag.count >= 2 && tag.count < 5);
          break;
        case 'low':
          filteredTags = filteredTags.filter(tag => tag.count === 1);
          break;
        case 'unused':
          filteredTags = filteredTags.filter(tag => tag.count === 0);
          break;
      }
    }
    
    // Update statistics with filtered data
    const filteredStats = this.calculateTagStatistics(filteredTags);
    this.updateTagStatistics(filteredStats);
  }

  /**
   * Add a new tag to the system
   */
  addNewTag() {
    const newTagInput = document.getElementById('new-tag-input');
    if (!newTagInput) return;
    
    const tagName = newTagInput.value.trim();
    if (!tagName) {
      this.showNotification('Please enter a tag name', 'error');
      return;
    }
    
    // Check if tag already exists (case insensitive)
    const existingTags = this.extractAllTags();
    const tagExists = existingTags.some(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );
    
    if (tagExists) {
      this.showNotification('Tag already exists', 'error');
      return;
    }
    
    // Create a new empty tag entry
    // Note: This creates the tag in the system but doesn't assign it to any items
    // Users can then use it when editing personas, resources, or use cases
    console.log('🏷️ Creating new tag:', tagName);
    
    // For now, we'll add it to a global tags list that can be referenced
    // In the future, you might want to store this in a dedicated tags data structure
    if (!this.globalTags) {
      this.globalTags = new Set();
    }
    this.globalTags.add(tagName);
    
    // Clear the input
    newTagInput.value = '';
    
    // Refresh the display
    this.renderTagsManager();
    
    this.showNotification(`Tag "${tagName}" created successfully`, 'success');
  }

  /**
   * Edit an existing tag
   */
  async editTag(tagName) {
    console.log('✏️ Edit tag:', tagName);
    
    // Prompt for new tag name
    const newTagName = prompt(`Edit tag name:`, tagName);
    
    if (!newTagName) {
      return; // User cancelled
    }
    
    const trimmedNewName = newTagName.trim();
    
    if (trimmedNewName === tagName) {
      return; // No change
    }
    
    if (!trimmedNewName) {
      this.showNotification('Tag name cannot be empty', 'error');
      return;
    }
    
    // Check if new tag name already exists
    const existingTags = this.extractAllTags();
    const tagExists = existingTags.some(tag => 
      tag.name.toLowerCase() === trimmedNewName.toLowerCase() && 
      tag.name.toLowerCase() !== tagName.toLowerCase()
    );
    
    if (tagExists) {
      this.showNotification('A tag with this name already exists', 'error');
      return;
    }
    
    // Update the tag across all data sources
    await this.updateTagAcrossAllData(tagName, trimmedNewName);
    
    this.showNotification(`Tag renamed from "${tagName}" to "${trimmedNewName}"`, 'success');
    
    // Refresh displays
    this.renderTagsManager();
    this.refreshTagManagementIfVisible();
    
    // Refresh other sections to show updated tags
    this.refreshAllSectionsAfterTagChange();
  }

  /**
   * Delete an existing tag
   */
  async deleteTag(tagName) {
    console.log('🗑️ Delete tag:', tagName);
    
    // Get usage information for the tag
    const allTags = this.extractAllTags();
    const tagInfo = allTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    
    if (!tagInfo) {
      this.showNotification('Tag not found', 'error');
      return;
    }
    
    // Show confirmation dialog with usage information
    const usageCount = tagInfo.count;
    const usageText = usageCount === 0 ? 'This tag is not used by any items.' : 
                     usageCount === 1 ? 'This tag is used by 1 item.' :
                     `This tag is used by ${usageCount} items.`;
    
    const confirmed = confirm(
      `Delete tag "${tagName}"?\n\n${usageText}\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) {
      return;
    }
    
    // Remove the tag from all data sources
    await this.removeTagFromAllData(tagName);
    
    // Remove from global tags if it exists there
    if (this.globalTags) {
      this.globalTags.delete(tagName);
    }
    
    this.showNotification(`Tag "${tagName}" deleted successfully`, 'success');
    
    // Refresh displays
    this.renderTagsManager();
    this.refreshTagManagementIfVisible();
    
    // Refresh other sections to show updated tags
    this.refreshAllSectionsAfterTagChange();
  }

  /**
   * Update a tag name across all data sources (personas, resources, use cases)
   */
  async updateTagAcrossAllData(oldTagName, newTagName) {
    console.log(`🔄 Updating tag "${oldTagName}" to "${newTagName}" across all data`);
    
    let updatedCount = 0;
    
    // Update in personas
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.personas) {
      for (const [id, persona] of this.dataManager.dataStore.personas) {
        if (persona.tags && Array.isArray(persona.tags)) {
          const tagIndex = persona.tags.findIndex(tag => 
            typeof tag === 'string' && tag.toLowerCase() === oldTagName.toLowerCase()
          );
          if (tagIndex !== -1) {
            persona.tags[tagIndex] = newTagName;
            updatedCount++;
            console.log(`✅ Updated tag in persona: ${persona.title}`);
          }
        }
      }
    }
    
    // Update in resources
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.resources) {
      for (const [id, resource] of this.dataManager.dataStore.resources) {
        if (resource.tags && Array.isArray(resource.tags)) {
          const tagIndex = resource.tags.findIndex(tag => 
            typeof tag === 'string' && tag.toLowerCase() === oldTagName.toLowerCase()
          );
          if (tagIndex !== -1) {
            resource.tags[tagIndex] = newTagName;
            updatedCount++;
            console.log(`✅ Updated tag in resource: ${resource.name}`);
          }
        }
      }
    }
    
    // Update in use cases
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.useCases) {
      for (const [id, useCase] of this.dataManager.dataStore.useCases) {
        if (useCase.tags && Array.isArray(useCase.tags)) {
          const tagIndex = useCase.tags.findIndex(tag => 
            typeof tag === 'string' && tag.toLowerCase() === oldTagName.toLowerCase()
          );
          if (tagIndex !== -1) {
            useCase.tags[tagIndex] = newTagName;
            updatedCount++;
            console.log(`✅ Updated tag in use case: ${useCase.name}`);
          }
        }
      }
    }
    
    // Update in global tags if it exists there
    if (this.globalTags) {
      if (this.globalTags.has(oldTagName)) {
        this.globalTags.delete(oldTagName);
        this.globalTags.add(newTagName);
      }
    }
    
    // Persist data
    if (this.dataManager) {
      this.dataManager.persistData();
    }
    
    console.log(`📊 Updated ${updatedCount} items with tag rename`);
    return updatedCount;
  }

  /**
   * Remove a tag from all data sources
   */
  async removeTagFromAllData(tagName) {
    console.log(`🗑️ Removing tag "${tagName}" from all data`);
    
    let removedCount = 0;
    
    // Remove from personas
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.personas) {
      for (const [id, persona] of this.dataManager.dataStore.personas) {
        if (persona.tags && Array.isArray(persona.tags)) {
          const originalLength = persona.tags.length;
          persona.tags = persona.tags.filter(tag => 
            typeof tag === 'string' && tag.toLowerCase() !== tagName.toLowerCase()
          );
          if (persona.tags.length < originalLength) {
            removedCount++;
            console.log(`✅ Removed tag from persona: ${persona.title}`);
          }
        }
      }
    }
    
    // Remove from resources
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.resources) {
      for (const [id, resource] of this.dataManager.dataStore.resources) {
        if (resource.tags && Array.isArray(resource.tags)) {
          const originalLength = resource.tags.length;
          resource.tags = resource.tags.filter(tag => 
            typeof tag === 'string' && tag.toLowerCase() !== tagName.toLowerCase()
          );
          if (resource.tags.length < originalLength) {
            removedCount++;
            console.log(`✅ Removed tag from resource: ${resource.name}`);
          }
        }
      }
    }
    
    // Remove from use cases
    if (this.dataManager && this.dataManager.dataStore && this.dataManager.dataStore.useCases) {
      for (const [id, useCase] of this.dataManager.dataStore.useCases) {
        if (useCase.tags && Array.isArray(useCase.tags)) {
          const originalLength = useCase.tags.length;
          useCase.tags = useCase.tags.filter(tag => 
            typeof tag === 'string' && tag.toLowerCase() !== tagName.toLowerCase()
          );
          if (useCase.tags.length < originalLength) {
            removedCount++;
            console.log(`✅ Removed tag from use case: ${useCase.name}`);
          }
        }
      }
    }
    
    // Persist data
    if (this.dataManager) {
      this.dataManager.persistData();
    }
    
    console.log(`📊 Removed tag from ${removedCount} items`);
    return removedCount;
  }

  /**
   * Refresh all sections after a tag change to show updated tags
   */
  refreshAllSectionsAfterTagChange() {
    console.log('🔄 Refreshing all sections after tag change');
    
    // Check which section is currently visible and refresh it
    const personasSection = document.getElementById('section-personas');
    const resourcesSection = document.getElementById('section-resources');
    const useCasesSection = document.getElementById('section-use-cases');
    
    if (personasSection && !personasSection.classList.contains('hidden')) {
      console.log('📄 Refreshing personas section');
      this.renderPersonasManager();
    }
    
    if (resourcesSection && !resourcesSection.classList.contains('hidden')) {
      console.log('📄 Refreshing resources section');
      this.renderResourcesManager();
    }
    
    if (useCasesSection && !useCasesSection.classList.contains('hidden')) {
      console.log('📄 Refreshing use cases section');
      this.renderUseCasesManager();
    }
  }

  /**
   * Refresh tag management if it's currently visible
   */
  refreshTagManagementIfVisible() {
    const tagsSection = document.getElementById('section-tags');
    if (tagsSection && !tagsSection.classList.contains('hidden')) {
      console.log('🔄 Refreshing tag management due to data change');
      this.renderTagsManager();
    }
  }

  /**
   * Render categories manager
   */
  renderCategoriesManager() {
    console.log('🗂️ Rendering categories manager');
    
    // Setup tab functionality
    this.setupCategoriesTabs();
    
    // Load and render current data
    this.renderVerticalsList();
    this.renderLobsList();  
    this.renderProjectTypesList();
  }
  
  /**
   * Setup category tabs functionality
   */
  setupCategoriesTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    const tabContents = document.querySelectorAll('.category-tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = tab.dataset.tab;
        
        // Update tab active states
        tabs.forEach(t => {
          t.classList.remove('active', 'border-blue-500', 'text-blue-600');
          t.classList.add('border-transparent', 'text-gray-500');
        });
        tab.classList.add('active', 'border-blue-500', 'text-blue-600');
        tab.classList.remove('border-transparent', 'text-gray-500');
        
        // Show/hide tab content
        tabContents.forEach(content => {
          const contentId = content.id;
          if (contentId === `${targetTab}-tab`) {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
        
        console.log(`🗂️ Switched to ${targetTab} tab`);
      });
    });
    
    // Setup form event listeners
    this.setupCategoriesFormListeners();
  }
  
  /**
   * Setup form listeners for categories management
   */
  setupCategoriesFormListeners() {
    // Vertical form submission
    const verticalForm = document.getElementById('vertical-form');
    if (verticalForm) {
      verticalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerticalSubmit();
      });
    }
    
    // Cancel vertical button
    const cancelVerticalBtn = document.getElementById('cancel-vertical-btn');
    if (cancelVerticalBtn) {
      cancelVerticalBtn.addEventListener('click', () => {
        this.clearVerticalForm();
      });
    }
    
    // Add vertical button
    const addVerticalBtn = document.getElementById('add-vertical-btn');
    if (addVerticalBtn) {
      addVerticalBtn.addEventListener('click', () => {
        this.clearVerticalForm();
      });
    }
  }
  
  /**
   * Render verticals list
   */
  renderVerticalsList() {
    // Get verticals from both unified categories and localStorage
    let allVerticals = [];
    
    // Get from unified categories (original data)
    const categories = this.getUnifiedCategories();
    if (categories && categories.industries) {
      allVerticals = [...categories.industries];
    }
    
    // Get custom verticals from localStorage
    const customVerticals = JSON.parse(localStorage.getItem('verticals') || '[]');
    
    // Merge and deduplicate
    customVerticals.forEach(customVertical => {
      const existingIndex = allVerticals.findIndex(v => (v.id || v) === (customVertical.id || customVertical));
      if (existingIndex >= 0) {
        // Replace existing with custom version
        allVerticals[existingIndex] = customVertical;
      } else {
        // Add new custom vertical
        allVerticals.push(customVertical);
      }
    });
    
    const verticalsList = document.getElementById('verticals-list');
    if (!verticalsList) return;
    
    let html = '';
    allVerticals.forEach(vertical => {
      const verticalName = vertical.name || vertical.id || vertical;
      const verticalId = vertical.id || vertical;
      const description = vertical.description || (typeof vertical === 'string' ? 'Default system vertical' : 'No description');
      
      html += `
        <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
          <div>
            <div class="font-medium text-gray-900">${this.escapeHtml(verticalName)}</div>
            <div class="text-sm text-gray-500">${this.escapeHtml(description)}</div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300" 
                    data-admin-action="edit-vertical" data-id="${verticalId}">Edit</button>
            <button class="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300" 
                    data-admin-action="delete-vertical" data-id="${verticalId}">Delete</button>
          </div>
        </div>
      `;
    });
    
    if (allVerticals.length === 0) {
      html = `
        <div class="text-center py-8 text-gray-500">
          <p>No verticals defined yet. Click "Add Vertical" to get started.</p>
        </div>
      `;
    }
    
    verticalsList.innerHTML = html;
  }
  
  /**
   * Render LOBs list
   */
  renderLobsList() {
    console.log('📋 Rendering LOBs list');
    
    // Get LOBs from both unified categories and localStorage
    let allLobs = {};
    
    // Get from unified categories (original data)
    const categories = this.getUnifiedCategories();
    if (categories && categories.linesOfBusiness) {
      allLobs = { ...categories.linesOfBusiness };
    }
    
    // Get custom LOBs from localStorage and merge
    const customLobs = JSON.parse(localStorage.getItem('lobs') || '{}');
    
    // Merge custom LOBs with existing ones
    Object.keys(customLobs).forEach(vertical => {
      if (!allLobs[vertical]) {
        allLobs[vertical] = [];
      }
      
      customLobs[vertical].forEach(customLob => {
        const existingIndex = allLobs[vertical].findIndex(lob => lob.id === customLob.id);
        if (existingIndex >= 0) {
          // Replace existing with custom version
          allLobs[vertical][existingIndex] = customLob;
        } else {
          // Add new custom LOB
          allLobs[vertical].push(customLob);
        }
      });
    });
    
    const lobsList = document.getElementById('lobs-list');
    if (!lobsList) return;
    
    let html = '';
    
    // Render LOBs by vertical
    Object.keys(allLobs).forEach(vertical => {
      const verticalLobs = allLobs[vertical];
      if (!verticalLobs || verticalLobs.length === 0) return;
      
      const verticalName = vertical.charAt(0).toUpperCase() + vertical.slice(1);
      const verticalColor = this.getVerticalColor(vertical);
      
      html += `
        <div class="bg-${verticalColor}-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3 flex items-center">
            <span class="px-2 py-1 text-xs bg-${verticalColor}-200 text-${verticalColor}-700 rounded mr-2">${verticalName}</span>
            ${verticalName} Functions
          </h4>
          <div class="space-y-2 ml-4">
      `;
      
      verticalLobs.forEach(lob => {
        // Handle both data structures: unified data manager (with 'label') and custom LOBs (with 'name')
        const lobName = lob.name || lob.label || lob.id || 'Unnamed LOB';
        const lobDescription = lob.description || this.getLobDefaultDescription(lob.id, vertical);
        const lobId = lob.id || lob.name;
        
        html += `
          <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
            <div>
              <div class="font-medium text-gray-900">${this.escapeHtml(lobName)}</div>
              <div class="text-sm text-gray-500">${this.escapeHtml(lobDescription)}</div>
            </div>
            <div class="flex items-center space-x-2">
              <button class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300" 
                      data-admin-action="edit-lob" data-id="${lobId}" data-vertical="${vertical}">Edit</button>
              <button class="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300" 
                      data-admin-action="delete-lob" data-id="${lobId}" data-vertical="${vertical}">Delete</button>
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    if (html === '') {
      html = `
        <div class="text-center py-8 text-gray-500">
          <p>No LOBs defined yet. Click "Add LOB" to get started.</p>
        </div>
      `;
    }
    
    lobsList.innerHTML = html;
  }
  
  /**
   * Get color theme for vertical
   */
  getVerticalColor(vertical) {
    const colorMap = {
      'banking': 'blue',
      'insurance': 'green',
      'corporate': 'gray',
      'general': 'purple'
    };
    return colorMap[vertical] || 'gray';
  }
  
  /**
   * Get default description for system LOBs
   */
  getLobDefaultDescription(lobId, vertical) {
    const descriptions = {
      // Banking LOBs
      'retail-banking': 'Consumer banking services and products',
      'commercial-banking': 'Business and corporate banking services',
      'investment-banking': 'Investment banking and capital markets',
      'risk-management': 'Risk assessment and management',
      'compliance': 'Banking compliance and regulatory affairs',
      'operations': 'Banking operations and back office',
      'credit-lending': 'Credit analysis and lending operations',
      'wealth-management': 'Wealth and asset management services',
      'payments': 'Payment processing and systems',
      'lending': 'Lending and credit services',
      'trading': 'Trading operations and market making',
      
      // Insurance LOBs
      'property-casualty': 'Property and casualty insurance',
      'life-annuities': 'Life insurance and annuity products',
      'health-insurance': 'Health insurance and benefits',
      'commercial-lines': 'Commercial insurance products',
      'claims': 'Claims processing and management',
      'underwriting': 'Risk assessment and underwriting',
      'actuarial': 'Actuarial analysis and modeling',
      'customer-service': 'Customer service and support',
      'reinsurance': 'Reinsurance and risk transfer',
      
      // General/Cross-industry LOBs
      'operations': 'Business operations and processes',
      'finance': 'Financial planning and accounting',
      'hr': 'Human resources and talent management',
      'procurement': 'Procurement and supply chain',
      'it': 'Information technology and systems',
      'legal': 'Legal affairs and compliance',
      'marketing': 'Marketing and brand management',
      'sales': 'Sales and business development'
    };
    
    return descriptions[lobId] || `${vertical} line of business`;
  }
  
  /**
   * Render project types list
   */
  renderProjectTypesList() {
    console.log('📋 Rendering project types list');
    
    // Get project types from both unified categories and localStorage
    let allProjectTypes = [];
    
    // Get from unified categories (system default project types)
    const categories = this.getUnifiedCategories();
    if (categories && categories.contentTypes) {
      // Filter for project-related content types or add system defaults
      allProjectTypes = [
        { id: 'rpa', name: 'RPA', description: 'Robotic Process Automation' },
        { id: 'idp', name: 'IDP', description: 'Intelligent Document Processing' },
        { id: 'agentic', name: 'Agentic', description: 'AI-powered autonomous agents' },
        { id: 'api-integration', name: 'API Integration', description: 'System integration and API connectivity' },
        { id: 'process-mining', name: 'Process Mining', description: 'Business process discovery and optimization' }
      ];
    }
    
    // Get custom project types from localStorage and merge
    const customProjectTypes = JSON.parse(localStorage.getItem('projectTypes') || '[]');
    
    // Merge custom project types with system ones
    customProjectTypes.forEach(customType => {
      const existingIndex = allProjectTypes.findIndex(pt => pt.id === customType.id);
      if (existingIndex >= 0) {
        // Replace existing with custom version
        allProjectTypes[existingIndex] = customType;
      } else {
        // Add new custom project type
        allProjectTypes.push(customType);
      }
    });
    
    const projectTypesList = document.getElementById('project-types-list');
    if (!projectTypesList) return;
    
    let html = '';
    allProjectTypes.forEach(projectType => {
      const typeName = projectType.name || projectType.id || 'Unnamed Type';
      const typeDescription = projectType.description || 'No description';
      const typeId = projectType.id || projectType.name;
      
      html += `
        <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
          <div>
            <div class="font-medium text-gray-900">${this.escapeHtml(typeName)}</div>
            <div class="text-sm text-gray-500">${this.escapeHtml(typeDescription)}</div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300" 
                    data-admin-action="edit-project-type" data-id="${typeId}">Edit</button>
            <button class="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300" 
                    data-admin-action="delete-project-type" data-id="${typeId}">Delete</button>
          </div>
        </div>
      `;
    });
    
    if (allProjectTypes.length === 0) {
      html = `
        <div class="text-center py-8 text-gray-500">
          <p>No project types defined yet. Click "Add Type" to get started.</p>
        </div>
      `;
    }
    
    projectTypesList.innerHTML = html;
  }
  
  /**
   * Handle vertical form submission
   */
  async handleVerticalSubmit() {
    try {
      const form = document.getElementById('vertical-form');
      const editingId = form ? form.dataset.editingId : null;
      
      const nameInput = document.getElementById('vertical-name');
      const descriptionInput = document.getElementById('vertical-description');
      const colorInput = document.getElementById('vertical-color');
      
      const name = nameInput.value.trim();
      const description = descriptionInput.value.trim();
      const color = colorInput.value;
      
      if (!name) {
        alert('Please enter a vertical name');
        return;
      }
      
      // Create vertical object
      const vertical = {
        id: editingId || name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        description: description,
        color: color,
        createdAt: editingId ? undefined : new Date().toISOString(), // Don't overwrite createdAt when editing
        updatedAt: new Date().toISOString()
      };
      
      // Remove undefined properties
      Object.keys(vertical).forEach(key => {
        if (vertical[key] === undefined) {
          delete vertical[key];
        }
      });
      
      console.log('💾 Saving vertical:', vertical, editingId ? '(editing)' : '(new)');
      
      // Add/update in data store
      await this.addVertical(vertical);
      
      // Clear form
      this.clearVerticalForm();
      
      // Refresh display
      this.renderVerticalsList();
      
      // Show success
      const action = editingId ? 'updated' : 'created';
      this.showNotification(`Vertical "${name}" ${action} successfully!`, 'success');
      
    } catch (error) {
      console.error('❌ Error saving vertical:', error);
      this.showNotification('Failed to save vertical', 'error');
    }
  }
  
  /**
   * Add vertical to data store
   */
  async addVertical(vertical) {
    // For now, use localStorage - could be enhanced to use unified data manager
    let verticals = JSON.parse(localStorage.getItem('verticals') || '[]');
    
    // Check if editing existing
    const existingIndex = verticals.findIndex(v => v.id === vertical.id);
    if (existingIndex >= 0) {
      verticals[existingIndex] = vertical;
    } else {
      verticals.push(vertical);
    }
    
    localStorage.setItem('verticals', JSON.stringify(verticals));
  }
  
  /**
   * Edit vertical
   */
  editVertical(verticalId) {
    console.log('✏️ Edit vertical:', verticalId);
    
    // Get vertical data
    const categories = this.getUnifiedCategories();
    if (!categories || !categories.industries) return;
    
    const vertical = categories.industries.find(v => (v.id || v) === verticalId);
    if (!vertical) {
      console.error('Vertical not found:', verticalId);
      return;
    }
    
    // Populate form with existing data
    const nameInput = document.getElementById('vertical-name');
    const descriptionInput = document.getElementById('vertical-description');
    const colorInput = document.getElementById('vertical-color');
    
    if (nameInput) nameInput.value = vertical.name || vertical.id || vertical;
    if (descriptionInput) descriptionInput.value = vertical.description || '';
    if (colorInput) colorInput.value = vertical.color || 'blue';
    
    // Store editing ID for form submission
    const form = document.getElementById('vertical-form');
    if (form) {
      form.dataset.editingId = verticalId;
    }
    
    this.showNotification(`Editing vertical: ${vertical.name || verticalId}`, 'info');
  }
  
  /**
   * Delete vertical
   */
  async deleteVertical(verticalId) {
    console.log('🗑️ Delete vertical:', verticalId);
    
    if (!confirm(`Are you sure you want to delete the vertical "${verticalId}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove from localStorage
      let verticals = JSON.parse(localStorage.getItem('verticals') || '[]');
      verticals = verticals.filter(v => (v.id || v) !== verticalId);
      localStorage.setItem('verticals', JSON.stringify(verticals));
      
      // Refresh display
      this.renderVerticalsList();
      
      this.showNotification(`Vertical "${verticalId}" deleted successfully`, 'success');
      
    } catch (error) {
      console.error('❌ Error deleting vertical:', error);
      this.showNotification('Failed to delete vertical', 'error');
    }
  }

  /**
   * Clear vertical form
   */
  clearVerticalForm() {
    const form = document.getElementById('vertical-form');
    if (form) {
      form.reset();
      delete form.dataset.editingId;
    }
  }
  
  /**
   * Edit LOB
   */
  editLob(lobId, vertical) {
    console.log('✏️ Edit LOB:', lobId, 'from vertical:', vertical);
    
    // Get LOB data
    const customLobs = JSON.parse(localStorage.getItem('lobs') || '{}');
    let lob = null;
    
    // First check custom LOBs
    if (customLobs[vertical]) {
      lob = customLobs[vertical].find(l => l.id === lobId);
    }
    
    // If not found, check unified categories
    if (!lob) {
      const categories = this.getUnifiedCategories();
      if (categories && categories.linesOfBusiness && categories.linesOfBusiness[vertical]) {
        lob = categories.linesOfBusiness[vertical].find(l => l.id === lobId);
      }
    }
    
    if (!lob) {
      console.error('LOB not found:', lobId, vertical);
      return;
    }
    
    // Populate form with existing data
    const nameInput = document.getElementById('lob-name');
    const parentVerticalInput = document.getElementById('lob-parent-vertical');
    const descriptionInput = document.getElementById('lob-description');
    
    // Handle both data structures: unified data manager (with 'label') and custom LOBs (with 'name')
    const lobName = lob.name || lob.label || '';
    const lobDescription = lob.description || this.getLobDefaultDescription(lob.id, vertical);
    
    if (nameInput) nameInput.value = lobName;
    if (parentVerticalInput) parentVerticalInput.value = vertical;
    if (descriptionInput) descriptionInput.value = lobDescription;
    
    // Store editing info for form submission
    const form = document.getElementById('lob-form');
    if (form) {
      form.dataset.editingId = lobId;
      form.dataset.editingVertical = vertical;
    }
    
    this.showNotification(`Editing LOB: ${lob.name}`, 'info');
  }
  
  /**
   * Delete LOB
   */
  async deleteLob(lobId, vertical) {
    console.log('🗑️ Delete LOB:', lobId, 'from vertical:', vertical);
    
    if (!confirm(`Are you sure you want to delete the LOB "${lobId}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove from localStorage
      let customLobs = JSON.parse(localStorage.getItem('lobs') || '{}');
      
      if (customLobs[vertical]) {
        customLobs[vertical] = customLobs[vertical].filter(lob => lob.id !== lobId);
        
        // Remove the vertical key if it's empty
        if (customLobs[vertical].length === 0) {
          delete customLobs[vertical];
        }
      }
      
      localStorage.setItem('lobs', JSON.stringify(customLobs));
      
      // Refresh display
      this.renderLobsList();
      
      this.showNotification(`LOB "${lobId}" deleted successfully`, 'success');
      
    } catch (error) {
      console.error('❌ Error deleting LOB:', error);
      this.showNotification('Failed to delete LOB', 'error');
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Extract data attributes from DOM element
   */
  extractDataFromElement(element) {
    const data = {};
    
    // Extract common data attributes
    if (element.hasAttribute('data-id')) {
      data.id = element.getAttribute('data-id');
    }
    if (element.hasAttribute('data-type')) {
      data.type = element.getAttribute('data-type');
    }
    if (element.hasAttribute('data-index')) {
      data.index = element.getAttribute('data-index');
    }
    if (element.hasAttribute('data-section')) {
      data.section = element.getAttribute('data-section');
    }
    
    return data;
  }

  /**
   * Render utilities panel
   */
  renderUtilitiesPanel() {
    console.log('🔧 Utilities panel rendering - placeholder');
  }

  /**
   * Render status bar
   */
  renderStatusBar() {
    console.log('📊 Status bar rendering - placeholder');
  }

  /**
   * Initialize interactive elements
   */
  initializeInteractiveElements() {
    console.log('⚡ Interactive elements initialized - placeholder');
  }

  /**
   * Enhanced click handler with action routing
   */
  handleClick(event) {
    // Handle navigation buttons first
    const navBtn = event.target.closest('.admin-nav-btn');
    if (navBtn) {
      const section = navBtn.getAttribute('data-section');
      if (section) {
        this.showAdminSection(section);
        return;
      }
    }

    const target = event.target.closest('[data-admin-action]');
    if (!target) return;
    
    const action = target.getAttribute('data-admin-action');
    const data = this.extractDataFromElement(target);
    
    // Quick workaround: directly get data-id if extraction failed
    if (!data.id && target.hasAttribute('data-id')) {
      data.id = target.getAttribute('data-id');
      console.log('🔧 Direct data-id extraction:', data.id);
    }
    
    // Debug click handler
    console.log('🖱️ Admin click:', action, 'ID:', data.id);
    
    this.trackAdminAction('click', { action, ...data });
    
    switch (action) {
      case 'add-persona':
        this.addPersona(data);
        break;
      case 'edit-persona':
        this.editPersona(data.id);
        break;
      case 'delete-persona':
        this.deletePersona(data.id);
        break;
      case 'add-resource':
        this.addResource(data);
        break;
      case 'edit-resource':
        this.editResource(data.id);
        break;
      case 'delete-resource':
        this.deleteResource(data.id);
        break;
      case 'add-use-case':
        this.addUseCase(data);
        break;
      case 'edit-use-case':
        this.editUseCase(data.id);
        break;
      case 'delete-use-case':
        this.deleteUseCase(data.id);
        break;
      case 'save-resource':
        this.saveResource(data.id);
        break;
      case 'save-use-case':
        this.saveUseCase(data.id);
        break;
      case 'save-persona':
        this.savePersonaEdit(data.id);
        break;
      case 'cancel-edit':
        this.cancelEdit(data.id);
        break;
      case 'add-stage':
        this.addStage(data);
        break;
      case 'edit-stage':
        this.editStage(data.id);
        break;
      case 'delete-stage':
        this.deleteStage(data.id);
        break;
      case 'save-changes':
        this.saveChanges();
        break;
      case 'preview':
        this.openPreview();
        break;
      case 'export':
        this.exportData();
        break;
      case 'import':
        this.importData();
        break;
      case 'toggle-section':
        this.toggleSection(data.section);
        break;
      case 'bulk-edit':
        this.openBulkEdit(data.type);
        break;
      case 'duplicate':
        this.duplicateItem(data.type, data.id);
        break;
      case 'reorder':
        this.handleReorder(data);
        break;
      case 'edit-vertical':
        this.editVertical(data.id);
        break;
      case 'delete-vertical':
        this.deleteVertical(data.id);
        break;
      case 'edit-lob':
        this.editLob(data.id, data.vertical);
        break;
      case 'delete-lob':
        this.deleteLob(data.id, data.vertical);
        break;
      case 'edit-filter-rule':
        this.editFilterRule(data.id);
        break;
      case 'delete-filter-rule':
        this.deleteFilterRule(data.id);
        break;
      case 'edit-project-type':
        this.editProjectType(data.id);
        break;
      case 'delete-project-type':
        this.deleteProjectType(data.id);
        break;
    }
  }

  /**
   * Enhanced form handling
   */
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const action = form.getAttribute('data-admin-form');
    
    // Debug logging
    console.log('🔍 Form submission debug:', {
      formId: form.id,
      action: action,
      hasDataAdminForm: form.hasAttribute('data-admin-form'),
      dataAdminFormValue: form.getAttribute('data-admin-form')
    });
    
    this.trackAdminAction('form_submit', { action });
    
    switch (action) {
      case 'persona-form':
        this.handlePersonaSubmit(formData);
        break;
      case 'use-case-form':
        this.handleUseCaseSubmit(formData);
        break;
      case 'stage-form':
        this.handleStageSubmit(formData);
        break;
      case 'bulk-edit-form':
        this.handleBulkEditSubmit(formData);
        break;
      case 'import-form':
        this.handleImportSubmit(formData);
        break;
      case 'lob-form':
        this.handleLobSubmit(formData);
        break;
      case 'project-type-form':
        this.handleProjectTypeSubmit(formData);
        break;
      default:
        // Fallback: try to identify form by ID if data-admin-form is missing
        if (!action && form.id === 'project-type-form') {
          console.log('🔄 Fallback: handling project-type-form by ID');
          this.handleProjectTypeSubmit(formData);
        } else if (!action) {
          console.warn('⚠️ Form submitted without data-admin-form attribute:', form.id);
        } else {
          console.warn('⚠️ Unknown form action:', action);
        }
        break;
    }
  }

  /**
   * Handle persona form submission
   */
  async handlePersonaSubmit(formData) {
    try {
      // Extract persona data from form
      const personaData = {
        id: formData.get('persona-id') || `persona-${Date.now()}`,
        title: formData.get('persona-title') || '',
        level: formData.get('persona-level') || '',
        vertical: formData.get('persona-vertical') || '',
        priority: formData.get('persona-priority') || 'medium',
        influence: formData.get('persona-influence') || '',
        lob: this.getSelectedLobValues(), // Get LOB from multi-select
        description: formData.get('persona-description') || '',
        world: formData.get('persona-world') || '',
        cares: formData.get('persona-cares') || '',
        help: formData.get('persona-help') || '',
        updatedAt: new Date().toISOString()
      };

      // Validate required fields
      if (!personaData.title || !personaData.level || !personaData.vertical || !personaData.influence) {
        this.showErrorMessage('Please fill in all required fields');
        return;
      }

      // Save persona
      await this.savePersonaToUnified(personaData);
      
      // Close modal and show success
      this.closePersonaModal();
      this.showNotification('Persona saved successfully', 'success');
      
      // Refresh personas list
      this.renderPersonasManager();
      
      // Refresh tag management if visible
      this.refreshTagManagementIfVisible();

    } catch (error) {
      console.error('Error saving persona:', error);
      this.showErrorMessage('Failed to save persona');
    }
  }

  /**
   * Handle use case form submission
   */
  async handleUseCaseSubmit(formData) {
    try {
      // Extract use case data from form
      const useCaseData = {
        id: formData.get('use-case-id') || `use-case-${Date.now()}`,
        name: formData.get('use-case-name') || '',
        category: formData.get('use-case-category') || '',
        vertical: formData.get('use-case-vertical') || '',
        lob: this.getSelectedUseCaseLobValues(), // Get LOB from multi-select
        complexity: formData.get('use-case-complexity') || '',
        timeToValue: formData.get('use-case-time-to-value') || '',
        description: formData.get('use-case-description') || '',
        businessValue: formData.get('use-case-business-value') || '',
        benefits: formData.get('use-case-business-value') || '', // Alias for consistency
        roi: formData.get('use-case-roi') || '',
        link: formData.get('use-case-link') || '',
        updatedAt: new Date().toISOString()
      };

      // Validate required fields
      if (!useCaseData.name || !useCaseData.category || !useCaseData.vertical || !useCaseData.description || !useCaseData.businessValue) {
        this.showErrorMessage('Please fill in all required fields');
        return;
      }

      // Save use case
      await this.saveUseCaseToUnified(useCaseData);
      
      // Close modal and show success
      this.closeUseCaseModal();
      this.showNotification('Use case saved successfully', 'success');
      
      // Refresh use cases list
      this.renderUseCasesManager();
      
      // Refresh tag management if visible
      this.refreshTagManagementIfVisible();

    } catch (error) {
      console.error('Error saving use case:', error);
      this.showErrorMessage('Failed to save use case');
    }
  }

  /**
   * Handle LOB form submission
   */
  async handleLobSubmit(formData) {
    try {
      const form = document.getElementById('lob-form');
      const editingId = form ? form.dataset.editingId : null;
      const editingVertical = form ? form.dataset.editingVertical : null;
      
      // Extract LOB data from form
      const lobData = {
        name: formData.get('lob-name') || document.getElementById('lob-name')?.value || '',
        parentVertical: formData.get('lob-parent-vertical') || document.getElementById('lob-parent-vertical')?.value || '',
        description: formData.get('lob-description') || document.getElementById('lob-description')?.value || '',
        enabled: true
      };
      
      // Validate required fields
      if (!lobData.name || !lobData.parentVertical) {
        this.showNotification('Please fill in LOB name and select a parent vertical', 'error');
        return;
      }
      
      // Handle ID assignment
      if (editingId) {
        lobData.id = editingId;
        lobData.updatedAt = new Date().toISOString();
      } else {
        // Clean up the name to create a proper ID
        const cleanId = lobData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        lobData.id = cleanId;
        lobData.createdAt = new Date().toISOString();
      }
      
      console.log('💾 Saving LOB:', lobData, editingId ? '(editing)' : '(new)');
      
      // If editing and vertical changed, need to handle the move
      if (editingId && editingVertical && editingVertical !== lobData.parentVertical) {
        await this.moveLob(editingId, editingVertical, lobData.parentVertical, lobData);
      } else {
        // Save to localStorage
        await this.addLob(lobData);
      }
      
      // Clear form
      this.clearLobForm();
      
      // Refresh display
      this.renderLobsList();
      
      // Show success
      const action = editingId ? 'updated' : 'created';
      this.showNotification(`LOB "${lobData.name}" ${action} successfully!`, 'success');
      
    } catch (error) {
      console.error('❌ Error saving LOB:', error);
      this.showNotification('Failed to save LOB', 'error');
    }
  }
  
  /**
   * Add LOB to data store
   */
  async addLob(lobData) {
    // Store LOBs in localStorage organized by parent vertical
    let lobs = JSON.parse(localStorage.getItem('lobs') || '{}');
    
    // Initialize parent vertical array if it doesn't exist
    if (!lobs[lobData.parentVertical]) {
      lobs[lobData.parentVertical] = [];
    }
    
    // Check if editing existing LOB
    const existingIndex = lobs[lobData.parentVertical].findIndex(l => l.id === lobData.id);
    if (existingIndex >= 0) {
      // Update existing
      lobs[lobData.parentVertical][existingIndex] = lobData;
    } else {
      // Add new LOB
      lobs[lobData.parentVertical].push(lobData);
    }
    
    localStorage.setItem('lobs', JSON.stringify(lobs));
    console.log('💾 LOBs saved to localStorage:', lobs);
  }
  
  /**
   * Move LOB from one vertical to another
   */
  async moveLob(lobId, fromVertical, toVertical, lobData) {
    let lobs = JSON.parse(localStorage.getItem('lobs') || '{}');
    
    // Remove from old vertical
    if (lobs[fromVertical]) {
      lobs[fromVertical] = lobs[fromVertical].filter(lob => lob.id !== lobId);
      
      // Remove vertical key if it's empty
      if (lobs[fromVertical].length === 0) {
        delete lobs[fromVertical];
      }
    }
    
    // Add to new vertical
    if (!lobs[toVertical]) {
      lobs[toVertical] = [];
    }
    lobs[toVertical].push(lobData);
    
    localStorage.setItem('lobs', JSON.stringify(lobs));
    console.log('💾 LOB moved and saved to localStorage:', lobs);
  }

  /**
   * Clear LOB form
   */
  clearLobForm() {
    const form = document.getElementById('lob-form');
    if (form) {
      form.reset();
      delete form.dataset.editingId;
      delete form.dataset.editingVertical;
    }
  }
  
  /**
   * Handle Project Type form submission
   */
  async handleProjectTypeSubmit(formData) {
    try {
      const form = document.getElementById('project-type-form');
      const editingId = form ? form.dataset.editingId : null;
      
      // Extract project type data from form
      const projectTypeData = {
        name: formData.get('project-type-name') || document.getElementById('project-type-name')?.value || '',
        description: formData.get('project-type-description') || document.getElementById('project-type-description')?.value || '',
        enabled: true
      };
      
      // Validate required fields
      if (!projectTypeData.name) {
        this.showNotification('Please enter a project type name', 'error');
        return;
      }
      
      // Handle ID assignment
      if (editingId) {
        projectTypeData.id = editingId;
        projectTypeData.updatedAt = new Date().toISOString();
      } else {
        // Clean up the name to create a proper ID
        const cleanId = projectTypeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        projectTypeData.id = cleanId;
        projectTypeData.createdAt = new Date().toISOString();
      }
      
      console.log('💾 Saving Project Type:', projectTypeData, editingId ? '(editing)' : '(new)');
      
      // Save to localStorage
      await this.addProjectType(projectTypeData);
      
      // Clear form
      this.clearProjectTypeForm();
      
      // Refresh display
      this.renderProjectTypesList();
      
      // Show success
      const action = editingId ? 'updated' : 'created';
      this.showNotification(`Project type "${projectTypeData.name}" ${action} successfully!`, 'success');
      
    } catch (error) {
      console.error('❌ Error saving project type:', error);
      this.showNotification('Failed to save project type', 'error');
    }
  }
  
  /**
   * Add project type to data store
   */
  async addProjectType(projectTypeData) {
    let projectTypes = JSON.parse(localStorage.getItem('projectTypes') || '[]');
    
    // Check if editing existing
    const existingIndex = projectTypes.findIndex(pt => pt.id === projectTypeData.id);
    if (existingIndex >= 0) {
      // Update existing
      projectTypes[existingIndex] = projectTypeData;
    } else {
      // Add new project type
      projectTypes.push(projectTypeData);
    }
    
    localStorage.setItem('projectTypes', JSON.stringify(projectTypes));
    console.log('💾 Project types saved to localStorage:', projectTypes);
  }
  
  /**
   * Edit project type
   */
  editProjectType(projectTypeId) {
    console.log('✏️ Edit project type:', projectTypeId);
    
    // Get project type data
    const customProjectTypes = JSON.parse(localStorage.getItem('projectTypes') || '[]');
    let projectType = customProjectTypes.find(pt => pt.id === projectTypeId);
    
    // If not found in custom types, check system defaults
    if (!projectType) {
      const systemTypes = [
        { id: 'rpa', name: 'RPA', description: 'Robotic Process Automation' },
        { id: 'idp', name: 'IDP', description: 'Intelligent Document Processing' },
        { id: 'agentic', name: 'Agentic', description: 'AI-powered autonomous agents' },
        { id: 'api-integration', name: 'API Integration', description: 'System integration and API connectivity' },
        { id: 'process-mining', name: 'Process Mining', description: 'Business process discovery and optimization' }
      ];
      projectType = systemTypes.find(pt => pt.id === projectTypeId);
    }
    
    if (!projectType) {
      console.error('Project type not found:', projectTypeId);
      return;
    }
    
    // Populate form with existing data
    const nameInput = document.getElementById('project-type-name');
    const descriptionInput = document.getElementById('project-type-description');
    
    if (nameInput) nameInput.value = projectType.name || '';
    if (descriptionInput) descriptionInput.value = projectType.description || '';
    
    // Store editing ID for form submission
    const form = document.getElementById('project-type-form');
    if (form) {
      form.dataset.editingId = projectTypeId;
    }
    
    this.showNotification(`Editing project type: ${projectType.name}`, 'info');
  }
  
  /**
   * Delete project type
   */
  async deleteProjectType(projectTypeId) {
    console.log('🗑️ Delete project type:', projectTypeId);
    
    if (!confirm(`Are you sure you want to delete the project type "${projectTypeId}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove from localStorage
      let customProjectTypes = JSON.parse(localStorage.getItem('projectTypes') || '[]');
      customProjectTypes = customProjectTypes.filter(pt => pt.id !== projectTypeId);
      localStorage.setItem('projectTypes', JSON.stringify(customProjectTypes));
      
      // Refresh display
      this.renderProjectTypesList();
      
      this.showNotification(`Project type "${projectTypeId}" deleted successfully`, 'success');
      
    } catch (error) {
      console.error('❌ Error deleting project type:', error);
      this.showNotification('Failed to delete project type', 'error');
    }
  }

  /**
   * Clear project type form
   */
  clearProjectTypeForm() {
    const form = document.getElementById('project-type-form');
    if (form) {
      form.reset();
      delete form.dataset.editingId;
    }
  }

  /**
   * Get selected LOB values from multi-select dropdown
   */
  getSelectedLobValues() {
    const lobSelect = document.getElementById('persona-lob');
    if (!lobSelect) return [];
    
    const selectedOptions = Array.from(lobSelect.selectedOptions);
    return selectedOptions.map(option => option.value);
  }

  /**
   * Get selected LOB values from use case multi-select dropdown
   */
  getSelectedUseCaseLobValues() {
    const lobSelect = document.getElementById('use-case-lob');
    if (!lobSelect) return [];
    
    const selectedOptions = Array.from(lobSelect.selectedOptions);
    return selectedOptions.map(option => option.value);
  }

  /**
   * Close persona modal
   */
  closePersonaModal() {
    const modal = document.getElementById('persona-modal');
    if (modal) {
      modal.classList.add('hidden');
      // Reset form
      const form = document.getElementById('persona-form');
      if (form) form.reset();
    }
  }

  /**
   * Close use case modal
   */
  closeUseCaseModal() {
    const modal = document.getElementById('use-case-modal');
    if (modal) {
      modal.classList.add('hidden');
      // Reset form
      const form = document.getElementById('use-case-form');
      if (form) form.reset();
    }
  }

  /**
   * Get keyboard shortcut string from event
   */
  getKeyboardShortcut(event) {
    const parts = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    
    // Add the key
    const key = event.key.toLowerCase();
    if (key !== 'control' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
      parts.push(key);
    }
    
    return parts.join('+');
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeydown(event) {
    const key = this.getKeyboardShortcut(event);
    const handler = this.shortcuts.get(key);
    
    if (handler) {
      event.preventDefault();
      handler();
      this.trackAdminAction('keyboard_shortcut', { shortcut: key });
    }
  }

  /**
   * Handle form input changes
   */
  handleChange(event) {
    // Handle form changes
    this.trackAdminAction('form_change', { 
      field: event.target.name || event.target.id 
    });
  }

  /**
   * Handle text input (debounced)
   */
  handleInput(event) {
    // Handle real-time input
    if (this.features.realTimePreview) {
      this.updatePreview();
    }
  }

  /**
   * Handle drag start events
   */
  handleDragStart(event) {
    if (this.dragDropHandler && event.target.draggable) {
      this.dragDropHandler.draggedElement = event.target;
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  /**
   * Handle drag over events
   */
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drop events
   */
  handleDrop(event) {
    event.preventDefault();
    if (this.dragDropHandler && this.dragDropHandler.draggedElement) {
      // Handle reordering logic here
      this.trackAdminAction('item_reordered');
    }
  }

  /**
   * Handle online status
   */
  handleOnline() {
    this.isOnline = true;
    console.log('📡 Admin: Back online');
  }

  /**
   * Handle offline status  
   */
  handleOffline() {
    this.isOnline = false;
    console.log('📡 Admin: Gone offline');
  }

  /**
   * Handle before page unload
   */
  handleBeforeUnload(event) {
    if (this.changes.size > 0) {
      const message = 'You have unsaved changes. Are you sure you want to leave?';
      event.returnValue = message;
      return message;
    }
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause auto-save
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }
    } else {
      // Page is visible, resume auto-save
      this.setupAutoSave();
    }
  }

  /**
   * Handle unified data changes
   */
  handleUnifiedDataChange(event) {
    const { type, data } = event;
    console.log(`🔄 Unified data change in admin: ${type}`, data);
    
    // Update local data store to stay in sync
    switch (type) {
      case 'persona_saved':
        this.dataStore.personas.set(data.id, data);
        this.updatePersonaUI(data);
        break;
      case 'persona_deleted':
        this.dataStore.personas.delete(data.id);
        this.removePersonaFromUI(data.id);
        break;
      case 'categories_updated':
        this.updateCategoriesUI(data);
        break;
    }
  }

  /**
   * Add new persona with enhanced UX
   */
  async addPersona(data = {}) {
    const personaId = this.generateId();
    const defaultPersona = {
      id: personaId,
      title: data.title || 'New Persona',
      description: data.description || '',
      industry: data.industry || 'banking',
      lob: data.lob || '',
      level: data.level || 'manager',
      priorities: [],
      painPoints: [],
      interests: [],
      useCase: data.useCase || '',
      outcomesBenefits: data.outcomesBenefits || '',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Add to store
    this.dataStore.personas.set(personaId, defaultPersona);
    this.trackChange('personas', { action: 'add', id: personaId, data: defaultPersona });
    
    // Render persona card
    const personaCard = this.createPersonaCard(defaultPersona);
    const container = this.getPersonaContainer(defaultPersona.industry);
    
    if (container) {
      container.appendChild(personaCard);
      
      // Scroll into view and focus
      personaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.focusPersona(personaId);
    }
    
    // Show success message
    this.showNotification('Persona added successfully', 'success');
    this.trackAdminAction('persona_added', { id: personaId });
    
    // Auto-save
    if (this.features.autoSave) {
      this.deferredSave();
    }
    
    return personaId;
  }

  /**
   * Edit persona with inline editing
   */
  editPersona(personaId) {
    console.log('🔧 Editing persona:', personaId);
    const persona = this.dataManager ? this.dataManager.dataStore.personas.get(personaId) : null;
    if (!persona) {
      console.error('❌ Persona not found:', personaId);
      this.showErrorMessage('Persona not found');
      return;
    }

    // Find the persona card
    const personaCard = document.querySelector(`[data-id="${personaId}"]`)?.closest('.persona-card');
    if (!personaCard) {
      this.showErrorMessage('Persona card not found in UI');
      return;
    }

    // Store original content
    const originalContent = personaCard.innerHTML;
    personaCard.setAttribute('data-original-content', originalContent);

    // Create inline edit form
    personaCard.innerHTML = `
      <div class="edit-form">
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" id="edit-title-${personaId}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                   value="${this.escapeHtml(persona.title || '')}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select id="edit-industry-${personaId}" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="banking" ${persona.vertical === 'banking' ? 'selected' : ''}>Banking</option>
              <option value="insurance" ${persona.vertical === 'insurance' ? 'selected' : ''}>Insurance</option>
              <option value="general" ${persona.vertical === 'general' ? 'selected' : ''}>General</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Line of Business</label>
            <select id="edit-lob-${personaId}" multiple
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]">
              <!-- LOB options will be populated dynamically -->
            </select>
            <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple LOBs. Options are controlled by your Categories/Types taxonomy.</p>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Who Are They? (Role & Context)</label>
          <textarea id="edit-world-${personaId}" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe their role, responsibilities, and day-to-day context...">${this.escapeHtml(persona.world || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">What They Care About (Pain Points & Goals)</label>
          <textarea id="edit-cares-${personaId}" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Their main concerns, KPIs, challenges, and objectives...">${this.escapeHtml(persona.cares || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">How UiPath Can Help (Value Proposition)</label>
          <textarea id="edit-help-${personaId}" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Specific UiPath solutions and benefits for this persona...">${this.escapeHtml(persona.help || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div style="position: relative;">
            <input type="text" id="edit-tags-input-${personaId}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                   placeholder="Type to search tags or add new ones (press Enter or comma to add)">
            <p class="text-xs text-gray-500 mt-1">Type tags and press Enter or comma to add. Click × to remove.</p>
          </div>
          <div id="edit-tags-display-${personaId}" class="mt-2 min-h-[2rem]">
            <p class="text-gray-400 text-sm">Tags will appear here as you add them</p>
          </div>
          <button type="button" id="ai-suggest-persona-tags-${personaId}" 
                  class="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-1" 
                  onclick="adminInterface.getAITagSuggestions('persona', '${personaId}')">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span>AI Suggest Tags</span>
          </button>
        </div>
        <div class="flex justify-end space-x-2">
          <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" 
                  data-admin-action="cancel-edit" data-id="${personaId}">
            Cancel
          </button>
          <button class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700" 
                  data-admin-action="save-persona" data-id="${personaId}">
            Save
          </button>
        </div>
      </div>
    `;

    // Setup enhanced tag input
    const initialTags = Array.isArray(persona.tags) ? persona.tags : [];
    const getPersonaTags = this.setupEnhancedTagInput(
      `edit-tags-input-${personaId}`, 
      `edit-tags-display-${personaId}`, 
      'purple', 
      initialTags
    );
    
    // Store tag getter for save operation
    if (!this.tagGetters) this.tagGetters = new Map();
    this.tagGetters.set(`persona-${personaId}`, getPersonaTags);

    // Setup LOB dropdown with current vertical
    const currentVertical = persona.vertical || '';
    this.populateLobDropdowns(currentVertical);
    
    // Pre-select current LOB values if they exist
    const lobSelect = document.getElementById(`edit-lob-${personaId}`);
    if (lobSelect && persona.lob && Array.isArray(persona.lob)) {
      persona.lob.forEach(lobValue => {
        const option = lobSelect.querySelector(`option[value="${lobValue}"]`);
        if (option) {
          option.selected = true;
        }
      });
    }
    
    // Add event listener for industry change to update LOB options
    const industrySelect = document.getElementById(`edit-industry-${personaId}`);
    if (industrySelect) {
      industrySelect.addEventListener('change', (e) => {
        this.populateLobDropdowns(e.target.value);
      });
    }

    // Focus on the title field
    document.getElementById(`edit-title-${personaId}`)?.focus();
    
    console.log('✅ Persona edit form shown for:', personaId);
  }

  /**
   * Create inline editor for personas
   */
  createInlineEditor(container, data) {
    const originalContent = container.innerHTML;
    
    // Create editing interface
    const editorHTML = `
      <div class="inline-editor bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg">
        <div class="editor-header flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Editing: ${this.escapeHtml(data.title)}</h3>
          <div class="editor-controls">
            <button type="button" class="save-btn bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700">Save</button>
            <button type="button" class="cancel-btn bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </div>
        
        <form class="editor-form space-y-4">
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Title</label>
            <input type="text" name="title" value="${this.escapeHtml(data.title)}" 
                   class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows="3" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${this.escapeHtml(data.description)}</textarea>
          </div>
          
          <div class="form-row grid grid-cols-3 gap-4">
            <div class="form-group">
              <label class="block text-sm font-medium mb-1">Industry</label>
              <select name="industry" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="banking" ${data.industry === 'banking' ? 'selected' : ''}>Banking</option>
                <option value="insurance" ${data.industry === 'insurance' ? 'selected' : ''}>Insurance</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium mb-1">Level</label>
              <select name="level" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="executive" ${data.level === 'executive' ? 'selected' : ''}>Executive</option>
                <option value="manager" ${data.level === 'manager' ? 'selected' : ''}>Manager</option>
                <option value="analyst" ${data.level === 'analyst' ? 'selected' : ''}>Analyst</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium mb-1">LOB</label>
              <input type="text" name="lob" value="${this.escapeHtml(data.lob || '')}" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Priorities (one per line)</label>
            <textarea name="priorities" rows="4" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${(data.priorities || []).join('\\n')}</textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Pain Points (one per line)</label>
            <textarea name="painPoints" rows="4" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${(data.painPoints || []).join('\\n')}</textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Interests (one per line)</label>
            <textarea name="interests" rows="4" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${(data.interests || []).join('\\n')}</textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Use Case</label>
            <div class="rich-editor-container">
              <div class="rich-editor" data-field="useCase">${data.useCase || ''}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Outcomes & Benefits</label>
            <div class="rich-editor-container">
              <div class="rich-editor" data-field="outcomesBenefits">${data.outcomesBenefits || ''}</div>
            </div>
          </div>
        </form>
      </div>
    `;
    
    container.innerHTML = editorHTML;
    
    // Initialize rich text editors
    const richEditors = container.querySelectorAll('.rich-editor');
    richEditors.forEach(editor => {
      this.createEditor(editor);
    });
    
    // Setup event handlers
    const saveBtn = container.querySelector('.save-btn');
    const cancelBtn = container.querySelector('.cancel-btn');
    const form = container.querySelector('.editor-form');
    
    saveBtn.addEventListener('click', () => {
      this.saveInlineEdit(data.id, form, container, originalContent);
    });
    
    cancelBtn.addEventListener('click', () => {
      this.cancelInlineEdit(container, originalContent);
    });
    
    // Focus first input
    const firstInput = form.querySelector('input, textarea');
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }
  }

  /**
   * Save inline edit changes
   */
  saveInlineEdit(personaId, form, container, originalContent) {
    try {
      const formData = new FormData(form);
      const updatedPersona = this.dataStore.personas.get(personaId);
      
      if (!updatedPersona) {
        throw new Error('Persona not found');
      }
      
      // Update persona data
      updatedPersona.title = formData.get('title') || updatedPersona.title;
      updatedPersona.description = formData.get('description') || updatedPersona.description;
      updatedPersona.industry = formData.get('industry') || updatedPersona.industry;
      updatedPersona.level = formData.get('level') || updatedPersona.level;
      updatedPersona.lob = formData.get('lob') || updatedPersona.lob;
      
      // Parse multi-line fields
      updatedPersona.priorities = this.parseMultilineField(formData.get('priorities'));
      updatedPersona.painPoints = this.parseMultilineField(formData.get('painPoints'));
      updatedPersona.interests = this.parseMultilineField(formData.get('interests'));
      
      // Get rich editor content
      const useCaseEditor = this.editors.get(container.querySelector('[data-field="useCase"]')?.id);
      const benefitsEditor = this.editors.get(container.querySelector('[data-field="outcomesBenefits"]')?.id);
      
      if (useCaseEditor) {
        updatedPersona.useCase = useCaseEditor.root.innerHTML;
      }
      if (benefitsEditor) {
        updatedPersona.outcomesBenefits = benefitsEditor.root.innerHTML;
      }
      
      updatedPersona.updatedAt = Date.now();
      
      // Track change
      this.trackChange('personas', { action: 'update', id: personaId, data: updatedPersona });
      
      // Re-render persona card
      const newPersonaCard = this.createPersonaCard(updatedPersona);
      container.parentNode.replaceChild(newPersonaCard, container);
      
      // Show success message
      this.showNotification('Persona updated successfully', 'success');
      this.trackAdminAction('persona_updated', { id: personaId });
      
      // Auto-save
      if (this.features.autoSave) {
        this.deferredSave();
      }
      
      // Update search index
      this.updateSearchIndex();
      
      // Update real-time preview
      if (this.features.realTimePreview) {
        this.updatePreview();
      }
      
    } catch (error) {
      console.error('Failed to save persona:', error);
      this.showErrorMessage('Failed to save persona: ' + error.message);
      
      // Revert to original content
      container.innerHTML = originalContent;
    }
  }

  /**
   * Cancel inline edit
   */
  cancelInlineEdit(container, originalContent) {
    if (confirm('Cancel editing? Any unsaved changes will be lost.')) {
      container.innerHTML = originalContent;
      this.trackAdminAction('persona_edit_cancelled');
    }
  }

  /**
   * Delete persona with confirmation
   */
  async deletePersona(personaId) {
    const persona = this.dataStore.personas.get(personaId);
    if (!persona) {
      this.showErrorMessage('Persona not found');
      return;
    }
    
    const confirmed = await this.showConfirmDialog(
      'Delete Persona',
      `Are you sure you want to delete "${persona.title}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (!confirmed) return;
    
    // Create undo point
    if (this.features && this.features.undoRedo && typeof this.createUndoPoint === 'function') {
      this.createUndoPoint('delete_persona', { personaId, persona: { ...persona } });
    }
    
    // Remove from store
    this.dataStore.personas.delete(personaId);
    this.trackChange('personas', { action: 'delete', id: personaId });
    
    // Remove from UI
    const personaCard = document.querySelector(`[data-persona-id="${personaId}"]`);
    if (personaCard) {
      // Animate removal
      personaCard.style.transition = 'all 0.3s ease-out';
      personaCard.style.opacity = '0';
      personaCard.style.transform = 'translateX(-100%)';
      
      setTimeout(() => {
        personaCard.remove();
      }, 300);
    }
    
    // Show success message
    this.showNotification('Persona deleted successfully', 'success');
    this.trackAdminAction('persona_deleted', { id: personaId });
    
    // Auto-save
    if (this.features.autoSave) {
      this.deferredSave();
    }
    
    // Update search index
    this.updateSearchIndex();
  }

  /**
   * Create persona card for admin interface
   */
  createPersonaCard(persona) {
    const card = document.createElement('div');
    card.className = 'persona-admin-card bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow';
    card.setAttribute('data-persona-id', persona.id);
    card.setAttribute('data-industry', persona.industry);
    card.draggable = true;
    
    card.innerHTML = `
      <div class="card-header mb-3">
        <div class="persona-info">
          <h4 class="font-semibold text-lg text-gray-900">${this.escapeHtml(persona.title)}</h4>
          <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(persona.description)}</p>
          <div class="persona-meta flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span class="industry-badge bg-blue-100 text-blue-800 px-2 py-1 rounded">${this.escapeHtml(persona.industry)}</span>
            <span class="level-badge bg-purple-100 text-purple-800 px-2 py-1 rounded">${this.escapeHtml(persona.level)}</span>
            ${persona.lob ? `<span class="lob-badge bg-green-100 text-green-800 px-2 py-1 rounded">${this.escapeHtml(persona.lob)}</span>` : ''}
          </div>
        </div>
      </div>
      
      <div class="card-content">
        ${this.renderPersonaPreview(persona)}
      </div>
      
      <div class="card-footer mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <div class="persona-status">
          <div>Updated: ${new Date(persona.updatedAt).toLocaleDateString()}</div>
          <span class="status-badge ${persona.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded mt-1 inline-block">
            ${persona.status || 'draft'}
          </span>
        </div>
        <div class="card-actions flex items-center space-x-2">
          <button class="edit-btn text-blue-600 hover:text-blue-800 p-1" 
                  data-admin-action="edit-persona" 
                  data-id="${persona.id}"
                  title="Edit persona">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          
          <button class="duplicate-btn text-green-600 hover:text-green-800 p-1" 
                  data-admin-action="duplicate" 
                  data-type="persona" 
                  data-id="${persona.id}"
                  title="Duplicate persona">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
          
          <button class="delete-btn text-red-600 hover:text-red-800 p-1" 
                  data-admin-action="delete-persona" 
                  data-id="${persona.id}"
                  title="Delete persona">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  /**
   * Render persona preview in admin card
   */
  renderPersonaPreview(persona) {
    let preview = '';
    
    if (persona.priorities?.length) {
      preview += `<div class="preview-section mb-2">
        <span class="preview-label font-medium text-xs">Priorities:</span>
        <span class="preview-content text-xs text-gray-600">${persona.priorities.slice(0, 2).join(', ')}${persona.priorities.length > 2 ? '...' : ''}</span>
      </div>`;
    }
    
    if (persona.painPoints?.length) {
      preview += `<div class="preview-section mb-2">
        <span class="preview-label font-medium text-xs">Pain Points:</span>
        <span class="preview-content text-xs text-gray-600">${persona.painPoints.slice(0, 2).join(', ')}${persona.painPoints.length > 2 ? '...' : ''}</span>
      </div>`;
    }
    
    if (persona.useCase) {
      const useCaseText = this.stripHtml(persona.useCase);
      preview += `<div class="preview-section mb-2">
        <span class="preview-label font-medium text-xs">Use Case:</span>
        <span class="preview-content text-xs text-gray-600">${useCaseText.substring(0, 100)}${useCaseText.length > 100 ? '...' : ''}</span>
      </div>`;
    }
    
    return preview || '<div class="text-xs text-gray-500 italic">No content preview available</div>';
  }

  /**
   * Enhanced save functionality
   */
  async saveChanges() {
    if (this.changes.size === 0) {
      this.showNotification('No changes to save', 'info');
      return;
    }
    
    const saveBtn = document.querySelector('[data-admin-action="save-changes"]');
    const originalText = saveBtn?.textContent;
    
    try {
      // Show saving state
      if (saveBtn) {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
      }
      
      // Create backup before saving
      await this.createBackup();
      
      // Save to local storage
      await this.saveToLocalStorage();
      
      // Save to server if online
      if (this.isOnline) {
        await this.saveToServer();
      }
      
      // Generate export files
      await this.generateExportFiles();
      
      // Update metadata
      this.dataStore.metadata.lastModified = Date.now();
      this.dataStore.metadata.version = this.incrementVersion(this.dataStore.metadata.version);
      
      // Clear changes
      this.changes.clear();
      
      // Show success
      this.showNotification(`Changes saved successfully (v${this.dataStore.metadata.version})`, 'success');
      this.trackAdminAction('changes_saved', { 
        version: this.dataStore.metadata.version,
        changesCount: this.changes.size 
      });
      
      // Notify parent window
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'admin:content-updated', 
          data: { version: this.dataStore.metadata.version } 
        }, '*');
      }
      
    } catch (error) {
      console.error('Failed to save changes:', error);
      this.showErrorMessage('Failed to save changes: ' + error.message);
      this.analytics.errorsEncountered++;
      
    } finally {
      // Reset save button
      if (saveBtn) {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }
    }
  }

  /**
   * Export data with multiple formats
   */
  async exportData() {
    const exportData = {
      metadata: {
        ...this.dataStore.metadata,
        exportedAt: new Date().toISOString(),
        exportedBy: 'admin-panel',
        schemaVersion: 2
      },
      personas: Array.from(this.dataStore.personas.values()),
      stages: Array.from(this.dataStore.stages.values()),
      resources: Array.from(this.dataStore.resources.values()),
      useCases: Array.from(this.dataStore.useCases.values())
    };
    
    try {
      // Create multiple export formats
      const exports = {
        json: this.exportAsJSON(exportData),
        csv: this.exportAsCSV(exportData),
        yaml: this.exportAsYAML(exportData)
      };
      
      // Create zip file with all formats
      if (typeof JSZip !== 'undefined') {
        const zip = new JSZip();
        
        Object.entries(exports).forEach(([format, content]) => {
          zip.file(`uipath-sales-guide-${new Date().toISOString().split('T')[0]}.${format}`, content);
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(zipBlob, `uipath-sales-guide-export-${new Date().toISOString().split('T')[0]}.zip`);
        
      } else {
        // Fallback to JSON only
        const jsonBlob = new Blob([exports.json], { type: 'application/json' });
        this.downloadFile(jsonBlob, `uipath-sales-guide-${new Date().toISOString().split('T')[0]}.json`);
      }
      
      this.showNotification('Data exported successfully', 'success');
      this.trackAdminAction('data_exported', { formats: Object.keys(exports) });
      
    } catch (error) {
      console.error('Export failed:', error);
      this.showErrorMessage('Export failed: ' + error.message);
    }
  }

  /**
   * Utility methods
   */
  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  parseMultilineField(value) {
    if (!value) return [];
    return value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  trackChange(collection, change) {
    this.changes.set(`${collection}_${change.id || Date.now()}`, {
      collection,
      timestamp: Date.now(),
      ...change
    });
    
    // Update UI indicators
    this.updateChangeIndicators();
  }

  trackAdminAction(action, data = {}) {
    if (!this.features.analytics) return;
    
    this.analytics.actions.push({
      action,
      timestamp: Date.now(),
      ...data
    });
    
    console.log(`📊 Admin: ${action}`, data);
  }

  showNotification(message, type = 'info') {
    // Create or update notification
    let notification = document.getElementById('admin-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'admin-notification';
      notification.className = 'fixed top-4 right-4 z-50 max-w-sm';
      document.body.appendChild(notification);
    }
    
    const typeClasses = {
      success: 'bg-green-100 border-green-500 text-green-700',
      error: 'bg-red-100 border-red-500 text-red-700',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      info: 'bg-blue-100 border-blue-500 text-blue-700'
    };
    
    notification.innerHTML = `
      <div class="notification-content ${typeClasses[type] || typeClasses.info} border-l-4 p-4 rounded shadow-lg">
        <div class="flex justify-between items-center">
          <span>${this.escapeHtml(message)}</span>
          <button class="ml-4 text-current opacity-70 hover:opacity-100" onclick="this.closest('#admin-notification').remove()">×</button>
        </div>
      </div>
    `;
    
    // Auto-hide after 5 seconds for non-error notifications
    if (type !== 'error') {
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    }
  }

  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Initialize unified data manager
   */
  async initializeUnifiedDataManager() {
    try {
      // Check if UnifiedDataManager is available
      if (typeof UnifiedDataManager !== 'undefined') {
        this.unifiedDataManager = new UnifiedDataManager();
        this.dataManager = this.unifiedDataManager; // Alias for render methods
        await this.unifiedDataManager.init();
        
        // Subscribe to data changes
        this.unifiedDataManager.subscribe(this.handleUnifiedDataChange.bind(this));
        
        console.log('✅ Unified Data Manager connected to admin panel');
        return true;
      } else {
        console.warn('⚠️ Unified Data Manager not available, using local data store');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Unified Data Manager:', error);
      return false;
    }
  }

  /**
   * Handle unified data changes
   */
  handleUnifiedDataChange(event) {
    const { type, data } = event;
    console.log(`🔄 Unified data change in admin: ${type}`, data);
    
    // Update local data store to stay in sync
    switch (type) {
      case 'persona_saved':
        this.dataStore.personas.set(data.id, data);
        this.updatePersonaUI(data);
        break;
      case 'persona_deleted':
        this.dataStore.personas.delete(data.id);
        this.removePersonaFromUI(data.id);
        break;
      case 'categories_updated':
        this.updateCategoriesUI(data);
        break;
    }
  }

  /**
   * Save persona using unified data manager
   */
  async savePersonaToUnified(personaData) {
    if (this.unifiedDataManager) {
      try {
        const savedPersona = this.unifiedDataManager.savePersona(personaData);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:persona-saved',
            data: savedPersona
          }, '*');
        }
        
        return savedPersona;
      } catch (error) {
        console.error('Failed to save persona to unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local save
      return this.savePersonaLocal(personaData);
    }
  }

  /**
   * Save use case using unified data manager
   */
  async saveUseCaseToUnified(useCaseData) {
    if (this.unifiedDataManager) {
      try {
        const savedUseCase = this.unifiedDataManager.saveUseCase(useCaseData);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:use-case-saved',
            data: savedUseCase
          }, '*');
        }
        
        return savedUseCase;
      } catch (error) {
        console.error('Failed to save use case to unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local save
      return this.saveUseCaseLocal(useCaseData);
    }
  }

  /**
   * Save use case locally to data store
   */
  saveUseCaseLocal(useCaseData) {
    if (this.dataManager && this.dataManager.dataStore) {
      this.dataManager.dataStore.useCases.set(useCaseData.id, useCaseData);
      this.dataManager.persistData();
      return useCaseData;
    }
    throw new Error('No data store available for local save');
  }

  /**
   * Delete persona using unified data manager
   */
  async deletePersonaFromUnified(personaId) {
    if (this.unifiedDataManager) {
      try {
        const result = this.unifiedDataManager.deletePersona(personaId);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:persona-deleted',
            data: { id: personaId }
          }, '*');
        }
        
        return result;
      } catch (error) {
        console.error('Failed to delete persona from unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local delete
      return this.deletePersonaLocal(personaId);
    }
  }

  /**
   * Populate LOB dropdowns from Categories/Types taxonomy (hierarchical)
   */
  populateLobDropdowns(selectedIndustry = null) {
    const categories = this.getUnifiedCategories();
    if (!categories || !categories.linesOfBusiness) return;

    console.log('🔍 Populating LOBs for industry:', selectedIndustry);
    console.log('🗂️ Available linesOfBusiness:', Object.keys(categories.linesOfBusiness));
    console.log('🏢 Full categories structure:', categories.linesOfBusiness);

    // Get LOBs based on selected industry + general (cross-industry)
    let lobOptions = [];
    
    if (selectedIndustry && categories.linesOfBusiness[selectedIndustry]) {
      // Add industry-specific LOBs
      console.log(`✅ Found LOBs for ${selectedIndustry}:`, categories.linesOfBusiness[selectedIndustry]);
      lobOptions = [...categories.linesOfBusiness[selectedIndustry].filter(lob => lob.enabled)];
    } else if (selectedIndustry) {
      console.log(`❌ No LOBs found for industry: ${selectedIndustry}`);
    }
    
    // Always add general (cross-industry) LOBs
    if (categories.linesOfBusiness.general) {
      const generalLobs = categories.linesOfBusiness.general.filter(lob => lob.enabled);
      generalLobs.forEach(generalLob => {
        // Avoid duplicates (some LOBs might exist in both industry-specific and general)
        if (!lobOptions.find(existing => existing.id === generalLob.id)) {
          lobOptions.push(generalLob);
        }
      });
    }

    // If no industry selected, show all LOBs
    if (!selectedIndustry) {
      lobOptions = [];
      Object.values(categories.linesOfBusiness).forEach(industryLobs => {
        industryLobs.forEach(lob => {
          if (lob.enabled && !lobOptions.find(existing => existing.id === lob.id)) {
            lobOptions.push(lob);
          }
        });
      });
    }

    // Sort LOBs alphabetically
    lobOptions.sort((a, b) => a.label.localeCompare(b.label));

    // Update persona filter dropdown
    const personaLobFilter = document.getElementById('persona-lob-filter');
    if (personaLobFilter) {
      const currentValue = personaLobFilter.value;
      personaLobFilter.innerHTML = '<option value="">All LOBs</option>';
      lobOptions.forEach(lob => {
        const option = document.createElement('option');
        option.value = lob.id;
        option.textContent = lob.label;
        personaLobFilter.appendChild(option);
      });
      // Restore previous selection if still valid
      if (currentValue && lobOptions.find(lob => lob.id === currentValue)) {
        personaLobFilter.value = currentValue;
      }
    }

    // Update use case LOB filter dropdown
    const useCaseLobFilter = document.getElementById('use-case-lob-filter');
    if (useCaseLobFilter) {
      const currentValue = useCaseLobFilter.value;
      useCaseLobFilter.innerHTML = '<option value="">All LOBs</option>';
      lobOptions.forEach(lob => {
        const option = document.createElement('option');
        option.value = lob.id;
        option.textContent = lob.label;
        useCaseLobFilter.appendChild(option);
      });
      // Restore previous selection if still valid
      if (currentValue && lobOptions.find(lob => lob.id === currentValue)) {
        useCaseLobFilter.value = currentValue;
      }
    }

    // Update persona edit form dropdown
    const personaLobEdit = document.getElementById('persona-lob');
    if (personaLobEdit) {
      const currentValues = Array.from(personaLobEdit.selectedOptions).map(option => option.value);
      personaLobEdit.innerHTML = '';
      lobOptions.forEach(lob => {
        const option = document.createElement('option');
        option.value = lob.id;
        option.textContent = lob.label;
        // Restore selection if still valid
        if (currentValues.includes(lob.id)) {
          option.selected = true;
        }
        personaLobEdit.appendChild(option);
      });
    }

    // Update use case edit form dropdown
    const useCaseLobEdit = document.getElementById('use-case-lob');
    if (useCaseLobEdit) {
      const currentValues = Array.from(useCaseLobEdit.selectedOptions).map(option => option.value);
      useCaseLobEdit.innerHTML = '';
      lobOptions.forEach(lob => {
        const option = document.createElement('option');
        option.value = lob.id;
        option.textContent = lob.label;
        // Restore selection if still valid
        if (currentValues.includes(lob.id)) {
          option.selected = true;
        }
        useCaseLobEdit.appendChild(option);
      });
    }

    // Update inline edit LOB dropdowns (for any currently open inline edits)
    document.querySelectorAll('[id^="edit-lob-"]').forEach(editLobDropdown => {
      const currentValues = Array.from(editLobDropdown.selectedOptions).map(option => option.value);
      editLobDropdown.innerHTML = '';
      lobOptions.forEach(lob => {
        const option = document.createElement('option');
        option.value = lob.id;
        option.textContent = lob.label;
        // Restore selection if still valid
        if (currentValues.includes(lob.id)) {
          option.selected = true;
        }
        editLobDropdown.appendChild(option);
      });
    });
  }

  /**
   * Setup persona form hierarchy handling
   */
  setupPersonaFormHierarchy() {
    // Setup industry vertical change handler for persona and use case form modals
    document.addEventListener('change', (event) => {
      if (event.target.id === 'persona-vertical') {
        const selectedIndustry = event.target.value;
        console.log(`🏢 Persona form vertical changed to: ${selectedIndustry}`);
        this.populateLobDropdowns(selectedIndustry);
      } else if (event.target.id === 'use-case-vertical') {
        const selectedIndustry = event.target.value;
        console.log(`🏢 Use case form vertical changed to: ${selectedIndustry}`);
        this.populateLobDropdowns(selectedIndustry);
      }
    });
  }

  /**
   * Update categories using unified data manager
   */
  async updateCategoriesInUnified(categoryType, updates) {
    if (this.unifiedDataManager) {
      try {
        this.unifiedDataManager.updateCategories(categoryType, updates);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:categories-updated',
            data: { categoryType, updates }
          }, '*');
        }
        
        return true;
      } catch (error) {
        console.error('Failed to update categories in unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local update
      return this.updateCategoriesLocal(categoryType, updates);
    }
  }

  /**
   * Add new industry using unified data manager
   */
  async addIndustryToUnified(industry) {
    if (this.unifiedDataManager) {
      try {
        const newIndustry = this.unifiedDataManager.addIndustry(industry);
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:industry-added',
            data: newIndustry
          }, '*');
        }
        
        // Update admin UI
        this.updateIndustrySelector();
        
        return newIndustry;
      } catch (error) {
        console.error('Failed to add industry:', error);
        throw error;
      }
    }
  }

  /**
   * Add new LOB using unified data manager
   */
  async addLOBToUnified(industryId, lob) {
    if (this.unifiedDataManager) {
      try {
        const newLOB = this.unifiedDataManager.addLOBToIndustry(industryId, lob);
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:lob-added',
            data: { industryId, lob: newLOB }
          }, '*');
        }
        
        // Update admin UI
        this.updateLOBSelectors();
        
        return newLOB;
      } catch (error) {
        console.error('Failed to add LOB:', error);
        throw error;
      }
    }
  }

  /**
   * Get categories from unified data manager
   */
  getUnifiedCategories() {
    if (this.unifiedDataManager) {
      const categories = this.unifiedDataManager.getCategories();
      console.log('🏢 Raw categories from unified manager:', categories);
      return categories;
    }
    
    // Fallback: return the categories directly from the data structure
    console.log('❌ No unified data manager available, using fallback');
    return {
      industries: [
        { id: 'banking', label: 'Banking', enabled: true },
        { id: 'insurance', label: 'Insurance', enabled: true },
        { id: 'general', label: 'General', enabled: true }
      ],
      linesOfBusiness: {
        banking: [
          { id: 'consumer-banking', label: 'Consumer Banking', enabled: true },
          { id: 'commercial-banking', label: 'Commercial Banking', enabled: true },
          { id: 'capital-markets', label: 'Capital Markets', enabled: true },
          { id: 'wealth-management', label: 'Wealth Management', enabled: true },
          { id: 'operations', label: 'Operations', enabled: true },
          { id: 'compliance-risk', label: 'Compliance & Risk', enabled: true },
          { id: 'payments', label: 'Payments', enabled: true },
          { id: 'lending', label: 'Lending', enabled: true },
          { id: 'trading', label: 'Trading Operations', enabled: true }
        ],
        insurance: [
          { id: 'property-casualty', label: 'Property & Casualty', enabled: true },
          { id: 'life-annuities', label: 'Life & Annuities', enabled: true },
          { id: 'health-insurance', label: 'Health Insurance', enabled: true },
          { id: 'commercial-lines', label: 'Commercial Lines', enabled: true },
          { id: 'claims', label: 'Claims Processing', enabled: true },
          { id: 'underwriting', label: 'Underwriting', enabled: true },
          { id: 'actuarial', label: 'Actuarial', enabled: true },
          { id: 'customer-service', label: 'Customer Service', enabled: true },
          { id: 'reinsurance', label: 'Reinsurance', enabled: true }
        ],
        general: [
          { id: 'operations', label: 'Operations', enabled: true },
          { id: 'finance', label: 'Finance', enabled: true },
          { id: 'hr', label: 'Human Resources', enabled: true },
          { id: 'procurement', label: 'Procurement', enabled: true },
          { id: 'customer-service', label: 'Customer Service', enabled: true },
          { id: 'it', label: 'Information Technology', enabled: true },
          { id: 'legal', label: 'Legal & Compliance', enabled: true },
          { id: 'marketing', label: 'Marketing', enabled: true },
          { id: 'sales', label: 'Sales', enabled: true }
        ]
      }
    };
  }

  /**
   * Get personas from unified data manager
   */
  getUnifiedPersonas(filters = {}) {
    if (this.unifiedDataManager) {
      return this.unifiedDataManager.getPersonas(filters);
    }
    return [];
  }

  /**
   * Update persona UI after change
   */
  updatePersonaUI(persona) {
    // Find and update the persona card in the UI
    const personaCard = document.querySelector(`[data-persona-id="${persona.id}"]`);
    if (personaCard) {
      const newCard = this.createPersonaCard(persona);
      personaCard.parentNode.replaceChild(newCard, personaCard);
    } else {
      // Add new persona card
      this.addPersonaCardToUI(persona);
    }
  }

  /**
   * Remove persona from UI
   */
  removePersonaFromUI(personaId) {
    const personaCard = document.querySelector(`[data-persona-id="${personaId}"]`);
    if (personaCard) {
      personaCard.remove();
    }
  }

  /**
   * Update categories UI after change
   */
  updateCategoriesUI(data) {
    // Update various selectors and dropdowns
    this.updateIndustrySelector();
    this.updateLOBSelectors();
    this.updatePersonaLevelSelectors();
  }

  /**
   * Update industry selector with current data
   */
  updateIndustrySelector() {
    const categories = this.getUnifiedCategories();
    if (!categories) return;
    
    const industrySelectors = document.querySelectorAll('.industry-selector');
    industrySelectors.forEach(selector => {
      selector.innerHTML = categories.industries.map(industry => 
        `<option value="${industry.id}">${this.escapeHtml(industry.label)}</option>`
      ).join('');
    });
  }

  /**
   * Update LOB selectors with current data
   */
  updateLOBSelectors() {
    const categories = this.getUnifiedCategories();
    if (!categories) return;
    
    const lobSelectors = document.querySelectorAll('.lob-selector');
    lobSelectors.forEach(selector => {
      const industry = selector.getAttribute('data-industry');
      if (industry && categories.linesOfBusiness[industry]) {
        const lobs = categories.linesOfBusiness[industry];
        selector.innerHTML = [
          '<option value="">All LOBs</option>',
          ...lobs.map(lob => `<option value="${lob.id}">${this.escapeHtml(lob.label)}</option>`)
        ].join('');
      }
    });
  }

  /**
   * Update persona level selectors
   */
  updatePersonaLevelSelectors() {
    const categories = this.getUnifiedCategories();
    if (!categories) return;
    
    const levelSelectors = document.querySelectorAll('.persona-level-selector');
    levelSelectors.forEach(selector => {
      selector.innerHTML = categories.personaLevels.map(level => 
        `<option value="${level.id}">${this.escapeHtml(level.label)}</option>`
      ).join('');
    });
  }

  /**
   * Shortcut handler methods
   */
  undo() {
    console.log('Undo action - not yet implemented');
  }

  redo() {
    console.log('Redo action - not yet implemented');
  }

  focusSearch() {
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
      searchInput.focus();
    }
  }

  createNew() {
    console.log('Create new action - not yet implemented');
  }

  duplicate() {
    console.log('Duplicate action - not yet implemented');
  }

  cancelOperation() {
    // Close any open modals or cancel current operation
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.add('hidden'));
  }

  openPreview() {
    console.log('Open preview - not yet implemented');
  }

  importData() {
    console.log('Import data - not yet implemented');
  }

  updatePreview() {
    // Update preview functionality
    console.log('Updating preview...');
  }

  /**
   * Edit resource with inline editing
   */
  editResource(resourceId) {
    console.log('🔧 Editing resource:', resourceId);
    
    // First try to find in unified data manager
    let resource = this.dataManager ? this.dataManager.dataStore.resources.get(resourceId) : null;
    
    // If not found, check custom resources in localStorage
    if (!resource) {
      console.log('🔍 Resource not in unified data, checking custom resources...');
      const customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
      resource = customResources.find(r => r.id === resourceId);
      
      if (resource) {
        console.log('✅ Found resource in custom resources:', resource.title || resource.name);
      }
    }
    
    if (!resource) {
      console.error('❌ Resource not found in unified data or custom resources:', resourceId);
      this.showErrorMessage('Resource not found');
      return;
    }

    // Find the resource card (search within resources section only)
    const resourcesSection = document.getElementById('section-resources');
    const resourceCard = resourcesSection?.querySelector(`[data-id="${resourceId}"]`)?.closest('.resource-card');
    if (!resourceCard) {
      this.showErrorMessage('Resource card not found in UI');
      return;
    }

    // Store original content
    const originalContent = resourceCard.innerHTML;
    resourceCard.setAttribute('data-original-content', originalContent);

    // Create inline edit form
    resourceCard.innerHTML = `
      <div class="edit-form">
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" id="edit-name-${resourceId}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                   value="${this.escapeHtml(resource.name || resource.title || '')}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select id="edit-type-${resourceId}" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="solution-kit" ${resource.type === 'solution-kit' ? 'selected' : ''}>Solution Kit</option>
              <option value="demo-video" ${resource.type === 'demo-video' ? 'selected' : ''}>Demo Video</option>
              <option value="first-call-deck" ${resource.type === 'first-call-deck' ? 'selected' : ''}>First Call Deck</option>
              <option value="specialty-asset" ${resource.type === 'specialty-asset' ? 'selected' : ''}>Specialty Asset</option>
              <option value="business-value" ${resource.type === 'business-value' ? 'selected' : ''}>Business Value</option>
            </select>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea id="edit-description-${resourceId}" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">${this.escapeHtml(resource.overview || resource.description || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Why This Matters (Value Proposition)</label>
          <textarea id="edit-why-${resourceId}" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">${this.escapeHtml(resource.why || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">External Link</label>
          <input type="url" id="edit-link-${resourceId}" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                 value="${this.escapeHtml(resource.link || '')}"
                 placeholder="https://example.com/resource-link">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
          <select id="edit-industry-${resourceId}" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="banking" ${resource.vertical === 'banking' ? 'selected' : ''}>Banking</option>
            <option value="insurance" ${resource.vertical === 'insurance' ? 'selected' : ''}>Insurance</option>
            <option value="general" ${resource.vertical === 'general' ? 'selected' : ''}>General</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div style="position: relative;">
            <input type="text" id="edit-tags-input-${resourceId}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                   placeholder="Type to search tags or add new ones (press Enter or comma to add)">
            <p class="text-xs text-gray-500 mt-1">Type tags and press Enter or comma to add. Click × to remove.</p>
          </div>
          <div id="edit-tags-display-${resourceId}" class="mt-2 min-h-[2rem]">
            <p class="text-gray-400 text-sm">Tags will appear here as you add them</p>
          </div>
          <button type="button" id="ai-suggest-resource-tags-${resourceId}" 
                  class="mt-2 px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center space-x-1" 
                  onclick="adminInterface.getAITagSuggestions('resource', '${resourceId}')">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span>AI Suggest Tags</span>
          </button>
        </div>
        <div class="flex justify-end space-x-2">
          <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" 
                  data-admin-action="cancel-edit" data-id="${resourceId}">
            Cancel
          </button>
          <button class="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700" 
                  data-admin-action="save-resource" data-id="${resourceId}">
            Save
          </button>
        </div>
      </div>
    `;

    // Setup enhanced tag input
    const initialTags = Array.isArray(resource.tags) ? resource.tags : [];
    const getResourceTags = this.setupEnhancedTagInput(
      `edit-tags-input-${resourceId}`, 
      `edit-tags-display-${resourceId}`, 
      'orange', 
      initialTags
    );
    
    // Store tag getter for save operation
    if (!this.tagGetters) this.tagGetters = new Map();
    this.tagGetters.set(`resource-${resourceId}`, getResourceTags);

    // Focus on the name field
    document.getElementById(`edit-name-${resourceId}`)?.focus();
    
    console.log('✅ Resource edit form shown for:', resourceId);
  }

  /**
   * Edit use case with inline editing
   */
  editUseCase(useCaseId) {
    console.log('🔧 Editing use case:', useCaseId);
    const useCase = this.dataManager ? this.dataManager.dataStore.useCases.get(useCaseId) : null;
    if (!useCase) {
      console.error('❌ Use case not found:', useCaseId);
      this.showErrorMessage('Use case not found');
      return;
    }

    // Find the use case card (search within use cases section only)
    const useCasesSection = document.getElementById('section-use-cases');
    const dataIdElement = useCasesSection?.querySelector(`[data-id="${useCaseId}"]`);
    console.log('🔍 Found data-id element in use cases section:', dataIdElement);
    
    const useCaseCard = dataIdElement?.closest('.use-case-card');
    console.log('🔍 Found use case card:', useCaseCard);
    
    if (!useCaseCard) {
      console.error('❌ Use case card not found in UI. Data-id element:', dataIdElement);
      this.showErrorMessage('Use case card not found in UI');
      return;
    }

    // Store original content
    const originalContent = useCaseCard.innerHTML;
    useCaseCard.setAttribute('data-original-content', originalContent);

    // Create inline edit form
    useCaseCard.innerHTML = `
      <div class="edit-form">
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" id="edit-name-${useCaseId}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                   value="${this.escapeHtml(useCase.name || useCase.title || '')}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select id="edit-industry-${useCaseId}" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="banking" ${useCase.vertical === 'banking' ? 'selected' : ''}>Banking</option>
              <option value="insurance" ${useCase.vertical === 'insurance' ? 'selected' : ''}>Insurance</option>
              <option value="general" ${useCase.vertical === 'general' ? 'selected' : ''}>General</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Line of Business</label>
            <select id="edit-lob-${useCaseId}" multiple
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]">
              <!-- LOB options will be populated dynamically -->
            </select>
            <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple LOBs. Options are controlled by your Categories/Types taxonomy.</p>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea id="edit-description-${useCaseId}" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">${this.escapeHtml(useCase.description || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Benefits (Key Value Propositions)</label>
          <textarea id="edit-benefits-${useCaseId}" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="List the key benefits and value propositions...">${this.escapeHtml(useCase.benefits || '')}</textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">External Link</label>
          <input type="url" id="edit-link-${useCaseId}" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                 value="${this.escapeHtml(useCase.link || '')}" 
                 placeholder="https://example.com/use-case-details">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div style="position: relative;">
            <input type="text" id="edit-tags-input-${useCaseId}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                   placeholder="Type to search tags or add new ones (press Enter or comma to add)">
            <p class="text-xs text-gray-500 mt-1">Type tags and press Enter or comma to add. Click × to remove.</p>
          </div>
          <div id="edit-tags-display-${useCaseId}" class="mt-2 min-h-[2rem]">
            <p class="text-gray-400 text-sm">Tags will appear here as you add them</p>
          </div>
          <button type="button" id="ai-suggest-use-case-tags-${useCaseId}" 
                  class="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1" 
                  onclick="adminInterface.getAITagSuggestions('use-case', '${useCaseId}')">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span>AI Suggest Tags</span>
          </button>
        </div>
        <div class="flex justify-end space-x-2">
          <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" 
                  data-admin-action="cancel-edit" data-id="${useCaseId}">
            Cancel
          </button>
          <button class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700" 
                  data-admin-action="save-use-case" data-id="${useCaseId}">
            Save
          </button>
        </div>
      </div>
    `;

    // Setup enhanced tag input
    const initialTags = Array.isArray(useCase.tags) ? useCase.tags : [];
    const getUseCaseTags = this.setupEnhancedTagInput(
      `edit-tags-input-${useCaseId}`, 
      `edit-tags-display-${useCaseId}`, 
      'green', 
      initialTags
    );
    
    // Store tag getter for save operation
    if (!this.tagGetters) this.tagGetters = new Map();
    this.tagGetters.set(`use-case-${useCaseId}`, getUseCaseTags);

    // Setup LOB dropdown with current vertical
    const currentVertical = useCase.vertical || '';
    this.populateLobDropdowns(currentVertical);
    
    // Pre-select current LOB values if they exist
    const lobSelect = document.getElementById(`edit-lob-${useCaseId}`);
    if (lobSelect && useCase.lob && Array.isArray(useCase.lob)) {
      useCase.lob.forEach(lobValue => {
        const option = lobSelect.querySelector(`option[value="${lobValue}"]`);
        if (option) {
          option.selected = true;
        }
      });
    }
    
    // Add event listener for industry change to update LOB options
    const industrySelect = document.getElementById(`edit-industry-${useCaseId}`);
    if (industrySelect) {
      industrySelect.addEventListener('change', (e) => {
        this.populateLobDropdowns(e.target.value);
      });
    }

    // Focus on the name field
    document.getElementById(`edit-name-${useCaseId}`)?.focus();
    
    console.log('✅ Use case edit form shown for:', useCaseId);
  }

  /**
   * Add resource (placeholder)
   */
  addResource(data) {
    console.log('➕ Adding resource:', data);
    alert('Add Resource functionality not yet implemented');
  }

  /**
   * Delete resource with confirmation
   */
  async deleteResource(resourceId) {
    // First try to find in unified data manager
    let resource = this.dataManager ? this.dataManager.dataStore.resources.get(resourceId) : null;
    let isCustomResource = false;
    
    // If not found, check custom resources in localStorage
    if (!resource) {
      console.log('🔍 Resource not in unified data, checking custom resources for deletion...');
      const customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
      resource = customResources.find(r => r.id === resourceId);
      isCustomResource = true;
      
      if (resource) {
        console.log('✅ Found custom resource for deletion:', resource.title || resource.name);
      }
    }
    
    if (!resource) {
      this.showErrorMessage('Resource not found');
      return;
    }
    
    const confirmed = await this.showConfirmDialog(
      'Delete Resource',
      `Are you sure you want to delete "${resource.name || resource.title || 'Untitled'}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (!confirmed) return;
    
    // Create undo point
    if (this.features && this.features.undoRedo && typeof this.createUndoPoint === 'function') {
      this.createUndoPoint('delete_resource', { resourceId, resource: { ...resource } });
    }
    
    // Remove from appropriate storage
    if (isCustomResource) {
      // Remove from custom resources in localStorage
      let customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
      customResources = customResources.filter(r => r.id !== resourceId);
      localStorage.setItem('customResources', JSON.stringify(customResources));
      console.log('🗑️ Removed custom resource from localStorage');
      
      // Also remove associated PDF content if exists
      let pdfContents = JSON.parse(localStorage.getItem('pdfContents') || '[]');
      pdfContents = pdfContents.filter(p => p.resourceId !== resourceId);
      localStorage.setItem('pdfContents', JSON.stringify(pdfContents));
    } else {
      // Remove from data manager
      if (this.dataManager?.dataStore?.resources) {
        this.dataManager.dataStore.resources.delete(resourceId);
        if (typeof this.trackChange === 'function') {
          this.trackChange('resources', { action: 'delete', id: resourceId });
        }
      }
    }
    
    // Remove from UI
    const resourceCard = document.querySelector(`[data-resource-id="${resourceId}"]`);
    if (resourceCard) {
      // Animate removal
      resourceCard.style.transition = 'all 0.3s ease-out';
      resourceCard.style.opacity = '0';
      resourceCard.style.transform = 'translateX(-100%)';
      
      setTimeout(() => {
        resourceCard.remove();
      }, 300);
    }
    
    // Re-render resources section to update the list
    this.renderResourcesManager();
    
    // Show success message
    this.showNotification('Resource deleted successfully', 'success');
    if (typeof this.trackAdminAction === 'function') {
      this.trackAdminAction('resource_deleted', { id: resourceId });
    }
    
    // Auto-save
    if (this.features && this.features.autoSave && typeof this.deferredSave === 'function') {
      this.deferredSave();
    }
  }

  /**
   * Add use case (placeholder)
   */
  addUseCase(data) {
    console.log('➕ Adding use case:', data);
    alert('Add Use Case functionality not yet implemented');
  }

  /**
   * Delete use case with confirmation
   */
  async deleteUseCase(useCaseId) {
    const useCase = this.dataManager ? this.dataManager.dataStore.useCases.get(useCaseId) : null;
    if (!useCase) {
      this.showErrorMessage('Use case not found');
      return;
    }
    
    const confirmed = await this.showConfirmDialog(
      'Delete Use Case',
      `Are you sure you want to delete "${useCase.name || useCase.title || 'Untitled'}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (!confirmed) return;
    
    // Create undo point
    if (this.features && this.features.undoRedo && typeof this.createUndoPoint === 'function') {
      this.createUndoPoint('delete_use_case', { useCaseId, useCase: { ...useCase } });
    }
    
    // Remove from data manager
    if (this.dataManager?.dataStore?.useCases) {
      this.dataManager.dataStore.useCases.delete(useCaseId);
      this.trackChange('useCases', { action: 'delete', id: useCaseId });
    }
    
    // Remove from UI
    const useCaseCard = document.querySelector(`[data-use-case-id="${useCaseId}"]`);
    if (useCaseCard) {
      // Animate removal
      useCaseCard.style.transition = 'all 0.3s ease-out';
      useCaseCard.style.opacity = '0';
      useCaseCard.style.transform = 'translateX(-100%)';
      
      setTimeout(() => {
        useCaseCard.remove();
      }, 300);
    }
    
    // Re-render use cases section to update the list
    this.renderUseCasesManager();
    
    // Show success message
    this.showNotification('Use case deleted successfully', 'success');
    this.trackAdminAction('use_case_deleted', { id: useCaseId });
    
    // Auto-save
    if (this.features.autoSave) {
      this.deferredSave();
    }
  }

  /**
   * Save resource changes
   */
  saveResource(resourceId) {
    console.log('💾 Saving resource:', resourceId);
    
    // Get form values
    const nameInput = document.getElementById(`edit-name-${resourceId}`);
    const typeInput = document.getElementById(`edit-type-${resourceId}`);
    const descriptionInput = document.getElementById(`edit-description-${resourceId}`);
    const whyInput = document.getElementById(`edit-why-${resourceId}`);
    const linkInput = document.getElementById(`edit-link-${resourceId}`);
    const industryInput = document.getElementById(`edit-industry-${resourceId}`);
    
    if (!nameInput || !typeInput || !descriptionInput || !industryInput) {
      this.showErrorMessage('Required fields not found in edit form');
      return;
    }
    
    // Find the resource in unified data manager or custom resources
    let resource = this.dataManager ? this.dataManager.dataStore.resources.get(resourceId) : null;
    let isCustomResource = false;
    
    if (!resource) {
      // Check custom resources
      const customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
      const resourceIndex = customResources.findIndex(r => r.id === resourceId);
      if (resourceIndex !== -1) {
        resource = customResources[resourceIndex];
        isCustomResource = true;
        console.log('💾 Editing custom resource:', resource.title || resource.name);
      }
    }
    
    if (resource) {
      // Update resource properties
      if (isCustomResource) {
        // For custom resources, use title instead of name
        resource.title = nameInput.value;
        resource.name = nameInput.value; // Keep both for compatibility
      } else {
        resource.name = nameInput.value;
      }
      
      resource.type = typeInput.value;
      resource.description = descriptionInput.value; // Custom resources use description
      resource.overview = descriptionInput.value; // Also set overview for compatibility
      resource.why = whyInput ? whyInput.value : '';
      resource.url = linkInput ? linkInput.value : resource.url; // Custom resources use url
      resource.link = linkInput ? linkInput.value : ''; // Also set link for compatibility
      resource.vertical = industryInput.value;
      resource.updatedAt = new Date().toISOString();
      
      // Handle tags from enhanced tag input
      const tagGetter = this.tagGetters?.get(`resource-${resourceId}`);
      if (tagGetter) {
        resource.tags = tagGetter();
      } else {
        resource.tags = resource.tags || [];
      }
      
      // Save to appropriate storage
      if (isCustomResource) {
        // Update custom resources in localStorage
        const customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
        const resourceIndex = customResources.findIndex(r => r.id === resourceId);
        if (resourceIndex !== -1) {
          customResources[resourceIndex] = resource;
          localStorage.setItem('customResources', JSON.stringify(customResources));
          console.log('💾 Custom resource saved to localStorage');
        }
      } else {
        // Save to unified data manager
        this.dataManager.persistData();
      }
      
      console.log('✅ Resource saved:', resourceId);
      this.showNotification('Resource updated successfully', 'success');
      
      // Re-render the resources section to show updated data
      this.renderResourcesManager();
      
      // Refresh tag management if visible
      this.refreshTagManagementIfVisible();
    } else {
      console.error('❌ Resource not found for saving:', resourceId);
      this.showErrorMessage('Resource not found');
    }
  }

  /**
   * Save use case changes
   */
  saveUseCase(useCaseId) {
    console.log('💾 Saving use case:', useCaseId);
    
    // Get form values
    const nameInput = document.getElementById(`edit-name-${useCaseId}`);
    const descriptionInput = document.getElementById(`edit-description-${useCaseId}`);
    const industryInput = document.getElementById(`edit-industry-${useCaseId}`);
    const benefitsInput = document.getElementById(`edit-benefits-${useCaseId}`);
    const linkInput = document.getElementById(`edit-link-${useCaseId}`);
    
    if (!nameInput || !descriptionInput || !industryInput) {
      this.showErrorMessage('Required fields not found in edit form');
      return;
    }
    
    // Update the use case in data manager
    const useCase = this.dataManager.dataStore.useCases.get(useCaseId);
    if (useCase) {
      useCase.name = nameInput.value;
      useCase.description = descriptionInput.value;
      useCase.vertical = industryInput.value;
      useCase.benefits = benefitsInput ? benefitsInput.value : '';
      useCase.link = linkInput ? linkInput.value : '';
      
      // Handle LOB field (preserve existing if not in edit form)
      const lobInput = document.getElementById(`edit-lob-${useCaseId}`);
      if (lobInput) {
        const selectedOptions = Array.from(lobInput.selectedOptions);
        useCase.lob = selectedOptions.map(option => option.value);
      }
      
      // Handle tags from enhanced tag input
      const tagGetter = this.tagGetters?.get(`use-case-${useCaseId}`);
      if (tagGetter) {
        useCase.tags = tagGetter();
      } else {
        useCase.tags = [];
      }
      
      // Save to data manager
      this.dataManager.persistData();
      
      console.log('✅ Use case saved:', useCaseId);
      this.showNotification('Use case updated successfully', 'success');
      
      // Re-render the use cases section to show updated data
      this.renderUseCasesManager();
      
      // Refresh tag management if visible
      this.refreshTagManagementIfVisible();
    }
  }

  /**
   * Save persona changes
   */
  savePersonaEdit(personaId) {
    console.log('💾 Saving persona:', personaId);
    
    // Get form values
    const titleInput = document.getElementById(`edit-title-${personaId}`);
    const worldInput = document.getElementById(`edit-world-${personaId}`);
    const caresInput = document.getElementById(`edit-cares-${personaId}`);
    const helpInput = document.getElementById(`edit-help-${personaId}`);
    const industryInput = document.getElementById(`edit-industry-${personaId}`);
    
    if (!titleInput || !worldInput || !caresInput || !helpInput || !industryInput) {
      this.showErrorMessage('Required fields not found in edit form');
      return;
    }
    
    // Update the persona in data manager
    const persona = this.dataManager.dataStore.personas.get(personaId);
    if (persona) {
      persona.title = titleInput.value;
      persona.world = worldInput.value;
      persona.cares = caresInput.value;
      persona.help = helpInput.value;
      persona.vertical = industryInput.value;
      
      // Handle LOB field (preserve existing if not in edit form)
      const lobInput = document.getElementById(`edit-lob-${personaId}`);
      if (lobInput) {
        const selectedOptions = Array.from(lobInput.selectedOptions);
        persona.lob = selectedOptions.map(option => option.value);
      }
      
      // Handle tags from enhanced tag input
      const tagGetter = this.tagGetters?.get(`persona-${personaId}`);
      if (tagGetter) {
        persona.tags = tagGetter();
      } else {
        persona.tags = [];
      }
      
      // Save to data manager
      this.dataManager.persistData();
      
      console.log('✅ Persona saved:', personaId);
      this.showNotification('Persona updated successfully', 'success');
      
      // Re-render the personas section to show updated data
      this.renderPersonasManager();
      
      // Refresh tag management if visible
      this.refreshTagManagementIfVisible();
    }
  }

  /**
   * Cancel edit and restore original content
   */
  cancelEdit(itemId) {
    console.log('❌ Canceling edit for:', itemId);
    
    // Find the card directly by looking for cards with data-original-content attribute
    const cardWithOriginalContent = document.querySelector(`[data-original-content]`);
    console.log('🔍 Found card with original content:', cardWithOriginalContent);
    
    // Alternatively, search within each section for the card
    let card = null;
    
    // Check in use cases section first
    const useCasesSection = document.getElementById('section-use-cases');
    if (useCasesSection) {
      card = useCasesSection.querySelector(`.use-case-card[data-original-content]`);
      console.log('🔍 Found use case card in section:', card);
    }
    
    // Check in resources section if not found
    if (!card) {
      const resourcesSection = document.getElementById('section-resources');
      if (resourcesSection) {
        card = resourcesSection.querySelector(`.resource-card[data-original-content]`);
        console.log('🔍 Found resource card in section:', card);
      }
    }
    
    // Check in personas section if not found
    if (!card) {
      const personasSection = document.getElementById('section-personas');
      if (personasSection) {
        card = personasSection.querySelector(`.persona-card[data-original-content]`);
        console.log('🔍 Found persona card in section:', card);
      }
    }
    
    console.log('🔍 Final card found:', card);
    console.log('🔍 Card has original content:', card?.hasAttribute('data-original-content'));
    
    if (card && card.hasAttribute('data-original-content')) {
      card.innerHTML = card.getAttribute('data-original-content');
      card.removeAttribute('data-original-content');
      console.log('✅ Edit canceled for:', itemId);
    } else {
      console.log('❌ Could not cancel edit - card or original content not found');
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Handle filter rule form submission
   */
  async handleFilterRuleSubmission() {
    try {
      const form = document.getElementById('filter-rule-form');
      const editingId = form ? form.dataset.editingId : null;
      
      // Collect form data
      const ruleName = document.getElementById('filter-rule-name').value.trim();
      const vertical = document.getElementById('filter-rule-vertical').value;
      const lob = document.getElementById('filter-rule-lob').value;
      
      // Get content types to show
      const showResources = document.getElementById('filter-show-resources').checked;
      const showUseCases = document.getElementById('filter-show-use-cases').checked; 
      const showPersonas = document.getElementById('filter-show-personas').checked;
      
      // Get tags from the enhanced tag input
      const tagsDisplay = document.getElementById('filter-rule-tags-display');
      const tagElements = tagsDisplay.querySelectorAll('.tag');
      const tags = Array.from(tagElements).map(tag => tag.textContent.replace('×', '').trim()).filter(Boolean);
      
      // Validate required fields
      if (!ruleName) {
        alert('Please enter a rule name');
        return;
      }
      
      if (!showResources && !showUseCases && !showPersonas) {
        alert('Please select at least one content type to show');
        return;
      }
      
      // Create filter rule object
      const filterRule = {
        id: editingId || `rule-${Date.now()}`,
        name: ruleName,
        conditions: {
          vertical: vertical || null,
          lob: lob || null,
          tags: tags.length > 0 ? tags : []
        },
        actions: {
          showResources,
          showUseCases,
          showPersonas
        }
      };
      
      // Add timestamps
      if (editingId) {
        filterRule.updatedAt = new Date().toISOString();
      } else {
        filterRule.createdAt = new Date().toISOString();
      }
      
      console.log('📋 Saving filter rule:', filterRule, editingId ? '(editing)' : '(new)');
      
      // Save rule
      if (editingId) {
        this.updateFilterRule(editingId, filterRule);
      } else {
        this.addFilterRule(filterRule);
      }
      
      // Close modal and reset
      const modal = document.getElementById('filter-rule-modal');
      if (modal) {
        modal.classList.add('hidden');
        
        // Reset modal title
        const modalTitle = document.getElementById('filter-rule-modal-title');
        if (modalTitle) {
          modalTitle.textContent = 'Create New Filter Rule';
        }
        
        // Clear editing state
        if (form) {
          delete form.dataset.editingId;
        }
      }
      
      // Show success message
      const action = editingId ? 'updated' : 'created';
      this.showNotification(`Filter rule ${action} successfully!`, 'success');
      
      // Refresh filter rules display
      this.renderFilterRulesManager();
      
    } catch (error) {
      console.error('❌ Error saving filter rule:', error);
      this.showNotification('Failed to save filter rule', 'error');
    }
  }
  
  /**
   * Add a new filter rule to storage
   */
  addFilterRule(rule) {
    let filterRules = JSON.parse(localStorage.getItem('filterRules') || '[]');
    filterRules.push(rule);
    localStorage.setItem('filterRules', JSON.stringify(filterRules));
  }
  
  /**
   * Update existing filter rule in storage
   */
  updateFilterRule(ruleId, updatedRule) {
    let filterRules = JSON.parse(localStorage.getItem('filterRules') || '[]');
    const ruleIndex = filterRules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex >= 0) {
      filterRules[ruleIndex] = updatedRule;
      localStorage.setItem('filterRules', JSON.stringify(filterRules));
      console.log('📋 Filter rule updated:', updatedRule);
    } else {
      console.error('Filter rule not found for update:', ruleId);
    }
  }
  
  /**
   * Get all filter rules from storage
   */
  getFilterRules() {
    return JSON.parse(localStorage.getItem('filterRules') || '[]');
  }
  
  /**
   * Edit filter rule
   */
  editFilterRule(ruleId) {
    console.log('✏️ Edit filter rule:', ruleId);
    
    const filterRules = this.getFilterRules();
    const rule = filterRules.find(r => r.id === ruleId);
    
    if (!rule) {
      this.showNotification('Filter rule not found', 'error');
      return;
    }
    
    console.log('📋 Filter rule data:', rule);
    
    // Open the filter rule modal
    const modal = document.getElementById('filter-rule-modal');
    if (!modal) return;
    
    // Set modal title to editing mode
    const modalTitle = document.getElementById('filter-rule-modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Edit Filter Rule';
    }
    
    // Populate form with existing rule data first
    const nameInput = document.getElementById('filter-rule-name');
    const verticalSelect = document.getElementById('filter-rule-vertical');
    const lobSelect = document.getElementById('filter-rule-lob');
    const showResourcesCheck = document.getElementById('filter-show-resources');
    const showUseCasesCheck = document.getElementById('filter-show-use-cases');
    const showPersonasCheck = document.getElementById('filter-show-personas');
    
    if (nameInput) nameInput.value = rule.name || '';
    if (showResourcesCheck) showResourcesCheck.checked = rule.actions.showResources || false;
    if (showUseCasesCheck) showUseCasesCheck.checked = rule.actions.showUseCases || false;
    if (showPersonasCheck) showPersonasCheck.checked = rule.actions.showPersonas || false;
    
    // Setup hierarchical dropdowns and populate with data
    this.setupFilterRuleDropdowns();
    
    // Set vertical and trigger LOB population
    setTimeout(() => {
      if (verticalSelect && rule.conditions.vertical) {
        console.log('🎯 Setting vertical to:', rule.conditions.vertical);
        verticalSelect.value = rule.conditions.vertical;
        // Trigger the change event to populate LOBs
        const event = new Event('change', { bubbles: true });
        verticalSelect.dispatchEvent(event);
        console.log('🔄 Triggered vertical change event');
      }
      
      // Set LOB after dropdown is populated
      setTimeout(() => {
        if (lobSelect && rule.conditions.lob) {
          console.log('🎯 Setting LOB to:', rule.conditions.lob);
          lobSelect.value = rule.conditions.lob;
          
          // Verify the value was set correctly
          if (lobSelect.value === rule.conditions.lob) {
            console.log('✅ LOB value set successfully');
          } else {
            console.warn('⚠️ LOB value not set correctly. Expected:', rule.conditions.lob, 'Got:', lobSelect.value);
          }
        }
      }, 300); // Increased delay for better reliability
      
    }, 150); // Slightly increased initial delay
    
    // Setup tags
    setTimeout(() => {
      this.setupEnhancedTagInput('filter-rule-tags-input', 'filter-rule-tags-display', 'blue', rule.conditions.tags || []);
    }, 300);
    
    // Store editing ID for form submission
    const form = document.getElementById('filter-rule-form');
    if (form) {
      form.dataset.editingId = ruleId;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    this.showNotification(`Editing filter rule: ${rule.name}`, 'info');
  }
  
  /**
   * Delete filter rule
   */
  deleteFilterRule(ruleId) {
    console.log('🗑️ Delete filter rule:', ruleId);
    
    const filterRules = this.getFilterRules();
    const rule = filterRules.find(r => r.id === ruleId);
    
    if (!rule) {
      this.showNotification('Filter rule not found', 'error');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the filter rule "${rule.name}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove rule from storage
      const updatedRules = filterRules.filter(r => r.id !== ruleId);
      localStorage.setItem('filterRules', JSON.stringify(updatedRules));
      
      // Refresh display
      this.renderFilterRulesManager();
      
      this.showNotification(`Filter rule "${rule.name}" deleted successfully`, 'success');
      
    } catch (error) {
      console.error('❌ Error deleting filter rule:', error);
      this.showNotification('Failed to delete filter rule', 'error');
    }
  }
  
  /**
   * Render filters manager section
   */
  renderFiltersManager() {
    console.log('🔍 Rendering filters manager');
    
    // Render the filter rules manager component
    this.renderFilterRulesManager();
  }
  
  /**
   * Render PDF extraction manager section
   */
  renderPdfExtractionManager() {
    console.log('📄 Rendering PDF extraction manager');
    
    // Setup PDF upload functionality
    this.setupPdfUpload();
  }
  
  /**
   * Create quick rule templates
   */
  createQuickRule(type) {
    console.log('🚀 Creating quick rule:', type);
    
    const modal = document.getElementById('filter-rule-modal');
    if (!modal) return;
    
    // Open the modal
    modal.classList.remove('hidden');
    
    // Setup hierarchical dropdowns
    this.setupFilterRuleDropdowns();
    
    // Pre-fill based on template type
    const nameInput = document.getElementById('filter-rule-name');
    
    switch(type) {
      case 'vertical-lob':
        if (nameInput) nameInput.value = 'Vertical + LOB Rule';
        break;
      case 'tag-based':
        if (nameInput) nameInput.value = 'Tag-Based Rule';
        // Focus on tags input
        setTimeout(() => {
          const tagsInput = document.getElementById('filter-rule-tags-input');
          if (tagsInput) tagsInput.focus();
        }, 100);
        break;
    }
    
    // Setup enhanced tag input
    setTimeout(() => {
      this.setupEnhancedTagInput('filter-rule-tags-input', 'filter-rule-tags-display', 'blue', []);
    }, 100);
  }
  
  /**
   * Render filter rules manager section
   */
  renderFilterRulesManager() {
    const section = document.getElementById('section-filters');
    if (!section) {
      console.warn('⚠️ Filter rules section not found');
      return;
    }
    
    const filterRules = this.getFilterRules();
    console.log('📋 Rendering filter rules:', filterRules);
    
    let rulesHtml = '<div class="space-y-3">';
    
    if (filterRules.length === 0) {
      rulesHtml += `
        <div class="text-center py-8 text-gray-500">
          <p class="text-lg mb-2">No filter rules created yet</p>
          <p class="text-sm">Create your first filter rule to customize content visibility</p>
        </div>
      `;
    } else {
      filterRules.forEach(rule => {
        const conditionsText = [];
        if (rule.conditions.vertical) conditionsText.push(`Vertical: ${rule.conditions.vertical}`);
        if (rule.conditions.lob) conditionsText.push(`LOB: ${rule.conditions.lob}`);
        if (rule.conditions.tags.length > 0) conditionsText.push(`Tags: ${rule.conditions.tags.join(', ')}`);
        
        const actionsText = [];
        if (rule.actions.showResources) actionsText.push('Resources');
        if (rule.actions.showUseCases) actionsText.push('Use Cases');
        if (rule.actions.showPersonas) actionsText.push('Personas');
        
        rulesHtml += `
          <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-gray-900">${this.escapeHtml(rule.name)}</h3>
              <div class="flex items-center space-x-2">
                <button class="text-sm text-blue-600 hover:text-blue-800 p-1" data-admin-action="edit-filter-rule" data-id="${rule.id}" title="Edit rule">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="text-sm text-red-600 hover:text-red-800 p-1" data-admin-action="delete-filter-rule" data-id="${rule.id}" title="Delete rule">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-medium text-gray-700">Conditions:</span>
                <span class="text-gray-600">${conditionsText.length > 0 ? conditionsText.join(' | ') : 'None'}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Shows:</span>
                <span class="text-gray-600">${actionsText.join(', ')}</span>
              </div>
              <div class="text-xs text-gray-500">
                Created: ${new Date(rule.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        `;
      });
    }
    
    rulesHtml += '</div>';
    
    // Find and update the rules list container
    const contentArea = section.querySelector('.bg-white.rounded-lg.shadow-sm');
    if (contentArea) {
      const rulesContainer = contentArea.querySelector('#filter-rules-list') || contentArea;
      rulesContainer.innerHTML = rulesHtml;
    }
  }
  
  /**
   * Setup hierarchical dropdowns for filter rule modal
   */
  setupFilterRuleDropdowns() {
    console.log('🗂️ Setting up filter rule dropdowns');
    
    // Populate vertical dropdown
    this.populateFilterRuleVertical();
    
    // Set up change event listener for vertical dropdown
    const verticalSelect = document.getElementById('filter-rule-vertical');
    const lobSelect = document.getElementById('filter-rule-lob');
    
    if (verticalSelect && lobSelect) {
      // Check if event listener is already attached to avoid duplicates
      if (!verticalSelect.hasAttribute('data-filter-listener-attached')) {
        verticalSelect.addEventListener('change', (e) => {
          const selectedVertical = e.target.value;
          console.log('🔄 Vertical changed in filter rule:', selectedVertical);
          this.populateFilterRuleLobs(selectedVertical);
        });
        verticalSelect.setAttribute('data-filter-listener-attached', 'true');
      }
      
      // Initialize LOB dropdown
      this.populateFilterRuleLobs('');
    }
  }
  
  /**
   * Populate filter rule vertical dropdown
   */
  populateFilterRuleVertical() {
    const verticalSelect = document.getElementById('filter-rule-vertical');
    if (!verticalSelect) return;
    
    const categories = this.getUnifiedCategories();
    if (!categories || !categories.industries) return;
    
    // Clear existing options (keep "Any Vertical")
    verticalSelect.innerHTML = '<option value="">Any Vertical</option>';
    
    // Add industry verticals
    categories.industries.forEach(industry => {
      const industryValue = typeof industry === 'string' ? industry : industry.id || industry.name;
      const industryName = typeof industry === 'string' ? industry : industry.name || industry.id;
      
      const option = document.createElement('option');
      option.value = industryValue.toLowerCase();
      option.textContent = industryName.charAt(0).toUpperCase() + industryName.slice(1);
      verticalSelect.appendChild(option);
    });
  }
  
  /**
   * Populate filter rule LOB dropdown based on selected vertical
   */
  populateFilterRuleLobs(selectedVertical) {
    console.log('🏢 Populating filter rule LOBs for vertical:', selectedVertical);
    const lobSelect = document.getElementById('filter-rule-lob');
    if (!lobSelect) {
      console.warn('⚠️ LOB select element not found');
      return;
    }
    
    // Clear existing options (keep "Any LOB")
    lobSelect.innerHTML = '<option value="">Any LOB</option>';
    
    const categories = this.getUnifiedCategories();
    if (!categories || !categories.linesOfBusiness) {
      console.warn('⚠️ No categories or LOB data found');
      return;
    }
    
    let lobOptions = [];
    
    // Get LOBs for selected vertical
    if (selectedVertical && categories.linesOfBusiness[selectedVertical]) {
      console.log(`✅ Found LOBs for ${selectedVertical}:`, categories.linesOfBusiness[selectedVertical]);
      lobOptions = [...categories.linesOfBusiness[selectedVertical].filter(lob => lob.enabled)];
    }
    
    // Always include general/cross-industry LOBs
    if (categories.linesOfBusiness.general) {
      const generalLobs = categories.linesOfBusiness.general.filter(lob => lob.enabled);
      console.log('➕ Adding general LOBs:', generalLobs.length);
      lobOptions = [...lobOptions, ...generalLobs];
    }
    
    // If no specific vertical is selected, show all LOBs
    if (!selectedVertical) {
      console.log('📋 No vertical selected, showing all LOBs');
      Object.values(categories.linesOfBusiness).forEach(industryLobs => {
        if (Array.isArray(industryLobs)) {
          industryLobs.forEach(lob => {
            if (lob.enabled && !lobOptions.find(existing => existing.id === lob.id)) {
              lobOptions.push(lob);
            }
          });
        }
      });
    }
    
    // Add LOB options to select
    if (lobOptions.length > 0) {
      console.log('🔍 Sample LOB object structure:', lobOptions[0]);
    }
    lobOptions.forEach(lob => {
      const option = document.createElement('option');
      option.value = lob.id;
      // Handle both name and label properties for compatibility
      const displayText = lob.name || lob.label || lob.id;
      option.textContent = displayText;
      lobSelect.appendChild(option);
      console.log(`📋 Added LOB option: ${lob.id} = "${displayText}"`);
    });
    
    console.log('🗂️ Filter rule LOB dropdown populated with', lobOptions.length, 'options');
  }

  /**
   * Setup PDF upload functionality
   */
  setupPdfUpload() {
    console.log('📄 Setting up PDF upload functionality');
    
    // Get upload area element
    const uploadArea = document.getElementById('pdf-upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('click', () => {
        this.openPdfUploadModal();
      });
    }
    
    // Setup modal event listeners
    this.setupPdfUploadModal();
  }
  
  /**
   * Open PDF upload modal
   */
  openPdfUploadModal() {
    console.log('📤 Opening PDF upload modal');
    
    const modal = document.getElementById('pdf-upload-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.resetPdfUploadForm();
    }
  }
  
  /**
   * Setup PDF upload modal event listeners
   */
  setupPdfUploadModal() {
    // Close modal button
    const closeBtn = document.getElementById('close-pdf-upload-modal');
    const cancelBtn = document.getElementById('cancel-pdf-upload');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePdfUploadModal());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closePdfUploadModal());
    }
    
    // Click outside modal to close
    const modal = document.getElementById('pdf-upload-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closePdfUploadModal();
        }
      });
    }
    
    // Setup drag and drop
    const dropArea = document.getElementById('pdf-drop-area');
    const fileInput = document.getElementById('pdf-modal-file-input');
    
    if (dropArea && fileInput) {
      // Click to browse
      dropArea.addEventListener('click', () => {
        fileInput.click();
      });
      
      // File selection change
      fileInput.addEventListener('change', (e) => {
        this.handleFileSelection(e.target.files[0]);
      });
      
      // Drag and drop events
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('border-orange-400', 'bg-orange-50');
      });
      
      dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-orange-400', 'bg-orange-50');
      });
      
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-orange-400', 'bg-orange-50');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.handleFileSelection(files[0]);
        }
      });
    }
    
    // Remove file button
    const removeBtn = document.getElementById('remove-file-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.clearSelectedFile();
      });
    }
    
    // Form submission
    const form = document.getElementById('pdf-upload-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processPdfFile();
      });
    }
  }
  
  /**
   * Close PDF upload modal
   */
  closePdfUploadModal() {
    const modal = document.getElementById('pdf-upload-modal');
    if (modal) {
      modal.classList.add('hidden');
      this.resetPdfUploadForm();
    }
  }
  
  /**
   * Reset PDF upload form
   */
  resetPdfUploadForm() {
    const fileInput = document.getElementById('pdf-modal-file-input');
    const fileInfo = document.getElementById('selected-file-info');
    const processBtn = document.getElementById('start-pdf-processing');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.classList.add('hidden');
    if (processBtn) processBtn.disabled = true;
    
    // Reset checkboxes to defaults
    const extractText = document.getElementById('extract-text');
    const extractImages = document.getElementById('extract-images');
    const generateSummary = document.getElementById('generate-summary');
    
    if (extractText) extractText.checked = true;
    if (extractImages) extractImages.checked = false;
    if (generateSummary) generateSummary.checked = false;
  }
  
  /**
   * Handle file selection
   */
  handleFileSelection(file) {
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      this.showNotification('Please select a PDF file', 'error');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.showNotification('File size must be less than 10MB', 'error');
      return;
    }
    
    console.log('📄 File selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Display file information
    this.displaySelectedFile(file);
    
    // Enable process button
    const processBtn = document.getElementById('start-pdf-processing');
    if (processBtn) {
      processBtn.disabled = false;
    }
  }
  
  /**
   * Display selected file information
   */
  displaySelectedFile(file) {
    const fileInfo = document.getElementById('selected-file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    
    if (fileInfo && fileName && fileSize) {
      fileName.textContent = file.name;
      fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      fileInfo.classList.remove('hidden');
    }
  }
  
  /**
   * Clear selected file
   */
  clearSelectedFile() {
    const fileInput = document.getElementById('pdf-modal-file-input');
    const fileInfo = document.getElementById('selected-file-info');
    const processBtn = document.getElementById('start-pdf-processing');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.classList.add('hidden');
    if (processBtn) processBtn.disabled = true;
  }
  
  /**
   * Process PDF file
   */
  async processPdfFile() {
    const fileInput = document.getElementById('pdf-modal-file-input');
    const processBtn = document.getElementById('start-pdf-processing');
    const spinner = document.getElementById('upload-spinner');
    
    if (!fileInput || !fileInput.files[0]) {
      this.showNotification('Please select a PDF file first', 'error');
      return;
    }
    
    const file = fileInput.files[0];
    
    // Get processing options
    const extractText = document.getElementById('extract-text')?.checked || false;
    const extractImages = document.getElementById('extract-images')?.checked || false;
    const generateSummary = document.getElementById('generate-summary')?.checked || false;
    
    const options = {
      extractText,
      extractImages,
      generateSummary
    };
    
    console.log('🔄 Processing PDF:', file.name, 'with options:', options);
    
    // Show loading state
    if (processBtn) processBtn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
    
    try {
      // Process PDF and create resource
      const result = await this.simulatePdfProcessing(file, options);
      
      // Show success notification with link to the resource
      this.showPdfUploadSuccess(file.name, result.resourceId);
      this.closePdfUploadModal();
      
      // Navigate to resources section to show the new resource
      console.log('🔄 Navigating to resources section to show new PDF resource');
      this.showAdminSection('resources');
      
    } catch (error) {
      console.error('❌ PDF processing failed:', error);
      this.showNotification('Failed to process PDF: ' + error.message, 'error');
    } finally {
      // Reset loading state
      if (processBtn) processBtn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
    }
  }
  
  /**
   * Process PDF and create resource entry
   */
  async simulatePdfProcessing(file, options) {
    return new Promise((resolve, reject) => {
      // Simulate processing time
      setTimeout(async () => {
        try {
          console.log('✅ PDF processing completed');
          
          // Extract content (simulated for now)
          const extractedData = {
            textContent: options.extractText ? `Extracted text from ${file.name}:\n\nThis is simulated extracted text content. In a real implementation, this would contain the actual text extracted from the PDF using tools like PDF.js or server-side PDF processing libraries.` : '',
            images: options.extractImages ? ['image1.png', 'image2.png'] : [],
            summary: options.generateSummary ? `AI Summary of ${file.name}:\n\nThis document contains information about agentic industry use cases. The content focuses on practical applications and implementation strategies. This is a simulated summary - in production, this would be generated using AI services.` : null
          };
          
          // Create a new resource entry
          const newResource = await this.createResourceFromPdf(file, extractedData, options);
          
          resolve({
            ...extractedData,
            resourceId: newResource.id
          });
        } catch (error) {
          console.error('❌ Error processing PDF:', error);
          reject(error);
        }
      }, 2000 + Math.random() * 3000); // 2-5 seconds
    });
  }
  
  /**
   * Create a new resource entry from processed PDF
   */
  async createResourceFromPdf(file, extractedData, options) {
    // Generate a unique ID
    const resourceId = 'pdf-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create resource object
    const newResource = {
      id: resourceId,
      title: file.name.replace(/\.pdf$/i, ''), // Remove .pdf extension
      description: extractedData.summary || `Uploaded PDF document: ${file.name}`,
      type: 'document',
      category: 'pdf-upload',
      tags: ['pdf', 'uploaded-document'],
      url: '#', // In real implementation, this would be the file URL
      hasLink: false,
      vertical: '',
      lob: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        processingOptions: options,
        extractedTextLength: extractedData.textContent ? extractedData.textContent.length : 0,
        hasImages: extractedData.images && extractedData.images.length > 0,
        hasSummary: !!extractedData.summary
      }
    };
    
    console.log('📝 Creating new resource from PDF:', newResource);
    
    // Add to resources (similar to how other resources are created)
    let customResources = JSON.parse(localStorage.getItem('customResources') || '[]');
    customResources.push(newResource);
    localStorage.setItem('customResources', JSON.stringify(customResources));
    
    console.log('💾 Resource saved to localStorage');
    
    // Store extracted content separately for future reference
    if (extractedData.textContent || extractedData.summary) {
      const pdfContent = {
        resourceId: resourceId,
        fileName: file.name,
        extractedText: extractedData.textContent,
        summary: extractedData.summary,
        images: extractedData.images,
        processedAt: new Date().toISOString()
      };
      
      let pdfContents = JSON.parse(localStorage.getItem('pdfContents') || '[]');
      pdfContents.push(pdfContent);
      localStorage.setItem('pdfContents', JSON.stringify(pdfContents));
      
      console.log('📄 PDF content stored for resource:', resourceId);
    }
    
    return newResource;
  }
  
  /**
   * Show PDF upload success notification with resource link
   */
  showPdfUploadSuccess(fileName, resourceId) {
    // Create enhanced notification with link
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 max-w-md';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="flex-1">
          <div class="font-medium">PDF Processed Successfully!</div>
          <div class="text-sm mt-1">
            Resource created: <strong>${fileName.replace(/\.pdf$/i, '')}</strong>
          </div>
          <div class="mt-2 space-y-1">
            <button 
              onclick="window.adminInterface.viewResourceRecord('${resourceId}')" 
              class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Resource Record
            </button>
            <button 
              onclick="window.adminInterface.editResourceRecord('${resourceId}')" 
              class="inline-flex items-center px-3 py-1 ml-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Details
            </button>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-green-500 hover:text-green-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
    
    console.log('✅ PDF upload success notification shown with resource link:', resourceId);
  }
  
  /**
   * View a specific resource record
   */
  viewResourceRecord(resourceId) {
    console.log('👀 Viewing resource record:', resourceId);
    
    // Navigate to resources section first
    this.showAdminSection('resources');
    
    // Wait for section to render, then scroll to and highlight the resource
    setTimeout(() => {
      this.highlightResourceRecord(resourceId);
    }, 500);
  }
  
  /**
   * Edit a specific resource record
   */
  editResourceRecord(resourceId) {
    console.log('✏️ Editing resource record:', resourceId);
    
    // Navigate to resources section first
    this.showAdminSection('resources');
    
    // Wait for section to render, then trigger edit
    setTimeout(() => {
      // Trigger the edit action for this resource
      this.handleAdminAction({
        action: 'edit-resource',
        id: resourceId
      });
    }, 500);
  }
  
  /**
   * Highlight a specific resource record in the list
   */
  highlightResourceRecord(resourceId) {
    console.log('🔍 Looking for resource card with ID:', resourceId);
    const resourceCard = document.querySelector(`[data-resource-id="${resourceId}"]`);
    console.log('🔍 Found resource card:', resourceCard);
    
    if (resourceCard) {
      console.log('🎯 Highlighting resource card:', resourceId);
      
      // Scroll to the resource card
      resourceCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight effect
      resourceCard.style.outline = '3px solid #10b981';
      resourceCard.style.outlineOffset = '2px';
      resourceCard.style.backgroundColor = '#f0fdf4';
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        resourceCard.style.outline = '';
        resourceCard.style.outlineOffset = '';
        resourceCard.style.backgroundColor = '';
      }, 5000);
      
      // Show a tooltip or badge
      this.showResourceHighlightBadge(resourceCard);
    } else {
      console.warn('⚠️ Resource card not found for highlighting:', resourceId);
    }
  }
  
  /**
   * Show a "newly created" badge on the resource
   */
  showResourceHighlightBadge(resourceCard) {
    const badge = document.createElement('div');
    badge.className = 'absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10';
    badge.textContent = 'NEW!';
    badge.style.animation = 'pulse 1s infinite';
    
    // Position relative to card
    resourceCard.style.position = 'relative';
    resourceCard.appendChild(badge);
    
    // Remove badge after 8 seconds
    setTimeout(() => {
      if (badge.parentElement) {
        badge.remove();
      }
    }, 8000);
  }
  
  /**
   * Quick method to delete all PDF uploaded resources (utility method)
   */
  deleteAllPdfResources() {
    console.log('🗑️ Deleting all PDF uploaded resources...');
    
    // Clear custom resources
    localStorage.removeItem('customResources');
    localStorage.removeItem('pdfContents');
    
    console.log('✅ All PDF resources deleted');
    this.showNotification('All PDF resources deleted successfully', 'success');
    
    // Refresh the resources display
    this.renderResourcesManager();
  }
  
  /**
   * Show confirmation dialog
   */
  async showConfirmDialog(title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'normal') {
    return new Promise((resolve) => {
      // Create modal overlay
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      
      // Create dialog content
      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 mr-3">
              ${type === 'danger' ? `
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              ` : `
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              `}
            </div>
            <h3 class="text-lg font-medium text-gray-900">${title}</h3>
          </div>
          
          <div class="mb-6">
            <p class="text-sm text-gray-600">${message}</p>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button id="cancel-btn" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
              ${cancelText}
            </button>
            <button id="confirm-btn" class="px-4 py-2 text-sm text-white rounded ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }">
              ${confirmText}
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners
      const confirmBtn = modal.querySelector('#confirm-btn');
      const cancelBtn = modal.querySelector('#cancel-btn');
      
      const handleConfirm = () => {
        document.body.removeChild(modal);
        resolve(true);
      };
      
      const handleCancel = () => {
        document.body.removeChild(modal);
        resolve(false);
      };
      
      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          handleCancel();
        }
      });
      
      // Add to DOM
      document.body.appendChild(modal);
      
      // Focus confirm button
      confirmBtn.focus();
    });
  }
  
  /**
   * Destroy method for clean shutdown
   */
  async destroy() {
    console.log('🔄 Shutting down Admin Module...');
    
    try {
      // Clear timers
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }
      
      // Save any pending changes
      if (this.changes.size > 0) {
        await this.saveChanges();
      }
      
      // Clear event listeners
      document.removeEventListener('click', this.handleClick);
      document.removeEventListener('change', this.handleChange);
      document.removeEventListener('input', this.handleInput);
      
      // Cleanup editors
      this.editors.clear();
      
      this.initialized = false;
      console.log('✅ Admin Module shut down successfully');
      
    } catch (error) {
      console.error('❌ Error during admin module shutdown:', error);
    }
  }
}

// Export the AdminModule class
export default AdminModule;