/**
 * Main Application Entry Point
 * Hardened UiPath Sales Cycle Guide
 */

// Import security modules first
import { initializeSecurity } from './security/csp-config.js';
import sanitizer from './security/sanitizer.js';
import apiSecurity from './security/api-security.js';

// Import core modules
import appState from './stores/app-state.js';
import aiService from './services/ai-service.js';
import stageComponent from './components/stage-component.js';
import { $, $$, addEventListener, copyToClipboard, debounce } from './utils/dom.js';
import { APP_CONFIG, isFeatureEnabled, getConfig } from './config/app-config.js';

class UiPathSalesApp {
  constructor() {
    this.initialized = false;
    this.components = new Map();
    this.eventListeners = new Map();
    
    // Bind methods
    this.handleExportNotes = this.handleExportNotes.bind(this);
    this.handleClearAll = this.handleClearAll.bind(this);
    this.handleAdminToggle = this.handleAdminToggle.bind(this);
    this.handleIndustrySwitch = this.handleIndustrySwitch.bind(this);
  }

  /**
   * Initialize the application
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log(`Initializing ${APP_CONFIG.name} v${APP_CONFIG.version}`);
      
      // Initialize security first
      await this.initializeSecurity();
      
      // Initialize core systems
      await this.initializeCore();
      
      // Initialize UI components
      this.initializeUI();
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      // Initialize features
      await this.initializeFeatures();
      
      this.initialized = true;
      console.log('Application initialized successfully');
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('Application initialization failed:', error);
      this.showErrorMessage('Failed to initialize application. Please refresh and try again.');
    }
  }

  /**
   * Initialize security systems
   */
  async initializeSecurity() {
    console.log('Initializing security...');
    
    // Apply CSP and security headers
    initializeSecurity();
    
    // Initialize API security
    await apiSecurity.initializeEncryption();
    
    // Set up error monitoring
    this.setupErrorMonitoring();
    
    console.log('Security initialized');
  }

  /**
   * Initialize core application systems
   */
  async initializeCore() {
    console.log('Initializing core systems...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }
    
    // Initialize app state
    await appState.initializeFromData();
    
    console.log('Core systems initialized');
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    console.log('Initializing UI...');
    
    // Initialize stage component
    this.components.set('stages', stageComponent);
    
    // Initialize other UI elements
    this.initializeNavigation();
    this.initializeMobileMenu();
    this.initializeModals();
    this.initializeProgressBars();
    
    // Apply initial state
    this.updateUIState();
    
    console.log('UI initialized');
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Global event listeners
    this.addEventListeners([
      // Export/Clear buttons
      { selector: '.export-notes-btn', event: 'click', handler: this.handleExportNotes },
      { selector: '.clear-all-btn', event: 'click', handler: this.handleClearAll },
      
      // Admin mode toggle
      { selector: '#admin-mode-btn', event: 'click', handler: this.handleAdminToggle },
      
      // Industry switcher
      { selector: '.industry-btn', event: 'click', handler: this.handleIndustrySwitch },
      
      // Edit buttons
      { selector: '.edit-icon', event: 'click', handler: this.handleEditClick },
      
      // Mobile menu
      { selector: '#mobile-menu-btn', event: 'click', handler: this.toggleMobileMenu },
      
      // Navigation links
      { selector: '.nav-link', event: 'click', handler: this.handleNavigation }
    ]);
    
    // State change listeners
    this.setupStateListeners();
    
    // Window events
    addEventListener(window, 'resize', debounce(this.handleResize.bind(this), 250));
    addEventListener(window, 'beforeunload', this.handleBeforeUnload.bind(this));
    
    console.log('Event listeners initialized');
  }

  /**
   * Initialize optional features
   */
  async initializeFeatures() {
    console.log('Initializing features...');
    
    // Initialize AI if enabled
    if (isFeatureEnabled('enableAI')) {
      await this.initializeAI();
    }
    
    // Initialize PWA if enabled
    if (isFeatureEnabled('enablePWA')) {
      this.initializePWA();
    }
    
    // Initialize offline mode if enabled
    if (isFeatureEnabled('enableOfflineMode')) {
      this.initializeOfflineMode();
    }
    
    console.log('Features initialized');
  }

  /**
   * Add multiple event listeners
   * @param {Array} listeners - Array of listener configurations
   */
  addEventListeners(listeners) {
    listeners.forEach(({ selector, event, handler, options = {} }) => {
      // Use event delegation for dynamic elements
      addEventListener(document, event, (e) => {
        const target = e.target.closest(selector);
        if (target) {
          handler(e, target);
        }
      }, options);
    });
  }

  /**
   * Setup state change listeners
   */
  setupStateListeners() {
    appState.subscribe('adminMode', (enabled) => {
      document.body.classList.toggle('admin-mode', enabled);
      this.updateAdminUI(enabled);
    });

    appState.subscribe('currentIndustry', (industry) => {
      this.updateIndustryUI(industry);
    });

    appState.subscribe('loading', (loading) => {
      this.updateLoadingUI(loading);
    });
  }

  /**
   * Initialize AI features
   */
  async initializeAI() {
    try {
      // Check if API key is already configured
      const hasApiKey = !!apiSecurity.getStoredApiKey();
      appState.setAIConfig(hasApiKey, hasApiKey);
      
      if (hasApiKey) {
        const isConnected = await aiService.testConnection();
        appState.setAIConfig(isConnected, true);
      }
    } catch (error) {
      console.error('AI initialization failed:', error);
    }
  }

  /**
   * Initialize PWA features
   */
  initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
    }

    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      const installBtn = $('#install-btn');
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.addEventListener('click', async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            console.log('Install prompt result:', result);
            deferredPrompt = null;
            installBtn.classList.add('hidden');
          }
        });
      }
    });
  }

  /**
   * Initialize offline mode
   */
  initializeOfflineMode() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.showNotification('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('Working offline', 'warning');
    });
  }

  /**
   * Handle export notes
   * @param {Event} e - Click event
   */
  async handleExportNotes(e) {
    e.preventDefault();
    
    try {
      const notes = this.collectAllNotes();
      const success = await copyToClipboard(notes);
      
      if (success) {
        this.showNotification('Notes copied to clipboard', 'success');
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showErrorMessage('Failed to export notes. Please try again.');
    }
  }

  /**
   * Handle clear all
   * @param {Event} e - Click event
   */
  handleClearAll(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to clear all checkboxes and notes? This cannot be undone.')) {
      appState.clearFormState();
      this.clearUIState();
      this.showNotification('All data cleared', 'success');
    }
  }

  /**
   * Handle admin mode toggle
   * @param {Event} e - Click event
   */
  handleAdminToggle(e) {
    e.preventDefault();
    
    const currentMode = appState.get('adminMode');
    appState.toggleAdminMode(!currentMode);
  }

  /**
   * Handle industry switch
   * @param {Event} e - Click event
   * @param {Element} target - Target element
   */
  handleIndustrySwitch(e, target) {
    e.preventDefault();
    
    const industry = target.dataset.industry;
    if (industry) {
      appState.switchIndustry(industry);
    }
  }

  /**
   * Handle edit button clicks
   * @param {Event} e - Click event
   * @param {Element} target - Target element
   */
  handleEditClick(e, target) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetId = target.dataset.target;
    if (!targetId) return;
    
    // Handle different edit types
    if (targetId.startsWith('persona-')) {
      this.openPersonaEditModal(targetId);
    } else {
      this.openSimpleEditModal(targetId);
    }
  }

  /**
   * Collect all notes from the form
   * @returns {string} Formatted notes text
   */
  collectAllNotes() {
    const notes = [];
    const stages = appState.get('stages');
    
    stages.forEach(stage => {
      const stageNotes = [];
      const textareas = $$(`#${stage.id} .note-textarea`);
      
      textareas.forEach(textarea => {
        const value = textarea.value.trim();
        if (value) {
          const label = this.getTextareaLabel(textarea);
          stageNotes.push(`${label}: ${value}`);
        }
      });
      
      if (stageNotes.length > 0) {
        notes.push(`\n=== ${stage.title} ===\n${stageNotes.join('\n')}`);
      }
    });
    
    return notes.join('\n\n');
  }

  /**
   * Get label for textarea
   * @param {Element} textarea - Textarea element
   * @returns {string} Label text
   */
  getTextareaLabel(textarea) {
    const container = textarea.closest('.bg-white');
    if (container) {
      const questionElement = container.querySelector('p');
      if (questionElement) {
        return questionElement.textContent.trim();
      }
    }
    return 'Note';
  }

  /**
   * Clear UI state
   */
  clearUIState() {
    // Clear checkboxes
    $$('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.closest('label')?.classList.remove('checked-item');
    });
    
    // Clear textareas
    $$('.note-textarea').forEach(textarea => {
      textarea.value = '';
    });
    
    // Reset progress bars
    $$('.progress-bar').forEach(bar => {
      bar.style.width = '0%';
    });
  }

  /**
   * Update UI state
   */
  updateUIState() {
    const currentIndustry = appState.get('currentIndustry');
    const adminMode = appState.get('adminMode');
    
    this.updateIndustryUI(currentIndustry);
    this.updateAdminUI(adminMode);
  }

  /**
   * Update industry UI
   * @param {string} industry - Industry identifier
   */
  updateIndustryUI(industry) {
    // Update industry buttons
    $$('.industry-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.industry === industry);
    });
    
    // Update industry-specific content
    $$('[data-industry]').forEach(element => {
      element.classList.toggle('hidden', element.dataset.industry !== industry);
    });
  }

  /**
   * Update admin UI
   * @param {boolean} enabled - Admin mode status
   */
  updateAdminUI(enabled) {
    const adminBtn = $('#admin-mode-btn');
    const adminStatus = $('#admin-status');
    
    if (adminBtn) {
      adminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
      adminBtn.classList.toggle('active', enabled);
    }
    
    if (adminStatus) {
      adminStatus.classList.toggle('hidden', !enabled);
    }
  }

  /**
   * Update loading UI
   * @param {boolean} loading - Loading status
   */
  updateLoadingUI(loading) {
    const loadingElements = $$('.loading-indicator');
    loadingElements.forEach(element => {
      element.classList.toggle('hidden', !loading);
    });
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Setup error monitoring
   */
  setupErrorMonitoring() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Don't show user notification for every error to avoid spam
      if (event.error?.name !== 'ChunkLoadError') {
        this.showErrorMessage('An unexpected error occurred.');
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      if (event.reason?.message?.includes('fetch')) {
        this.showErrorMessage('Network error. Please check your connection.');
      }
    });
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Update responsive layouts
    this.updateResponsiveLayout();
  }

  /**
   * Handle before unload
   * @param {Event} e - Beforeunload event
   */
  handleBeforeUnload(e) {
    // Check if there's unsaved data
    const formState = appState.getFormState();
    
    if (formState.checkedCount > 0 || formState.notesWithContent > 0) {
      const message = 'You have unsaved changes. Are you sure you want to leave?';
      e.returnValue = message;
      return message;
    }
  }

  /**
   * Initialize navigation
   */
  initializeNavigation() {
    // Setup smooth scrolling
    $$('a[href^="#"]').forEach(anchor => {
      addEventListener(anchor, 'click', (e) => {
        e.preventDefault();
        const target = $(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Initialize mobile menu
   */
  initializeMobileMenu() {
    const mobileMenuBtn = $('#mobile-menu-btn');
    const mobileMenu = $('#mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
      addEventListener(mobileMenuBtn, 'click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  }

  /**
   * Initialize modals
   */
  initializeModals() {
    // Modal close handlers
    $$('.modal-close, .modal-backdrop').forEach(element => {
      addEventListener(element, 'click', (e) => {
        if (e.target === element) {
          this.closeModal();
        }
      });
    });
    
    // Escape key handler
    addEventListener(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  /**
   * Initialize progress bars
   */
  initializeProgressBars() {
    // Progress bars are handled by stage components
  }

  /**
   * Close modal
   */
  closeModal() {
    $$('.modal').forEach(modal => {
      modal.classList.add('hidden');
    });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const mobileMenu = $('#mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  }

  /**
   * Handle navigation
   * @param {Event} e - Click event
   * @param {Element} target - Target element
   */
  handleNavigation(e, target) {
    const href = target.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetElement = $(href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * Update responsive layout
   */
  updateResponsiveLayout() {
    const width = window.innerWidth;
    const breakpoints = getConfig('ui.breakpoints');
    
    document.body.classList.toggle('mobile', width < breakpoints.md);
    document.body.classList.toggle('tablet', width >= breakpoints.md && width < breakpoints.lg);
    document.body.classList.toggle('desktop', width >= breakpoints.lg);
  }

  /**
   * Open persona edit modal
   * @param {string} personaId - Persona identifier
   */
  openPersonaEditModal(personaId) {
    // Implementation for persona editing
    console.log('Opening persona edit modal:', personaId);
  }

  /**
   * Open simple edit modal
   * @param {string} targetId - Target identifier
   */
  openSimpleEditModal(targetId) {
    // Implementation for simple editing
    console.log('Opening simple edit modal:', targetId);
  }

  /**
   * Get application info
   * @returns {Object} Application information
   */
  getAppInfo() {
    return {
      name: APP_CONFIG.name,
      version: APP_CONFIG.version,
      initialized: this.initialized,
      components: Array.from(this.components.keys()),
      features: Object.entries(APP_CONFIG.features)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name)
    };
  }
}

// Create and initialize application
const app = new UiPathSalesApp();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
  app.initialize();
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.UiPathSalesApp = app;
}

export default app;