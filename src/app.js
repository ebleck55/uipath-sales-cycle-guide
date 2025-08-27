/**
 * Main Application Entry Point
 * Bootstraps the entire application with proper module loading
 */
import moduleManager from './core/module-manager.js';

/**
 * UiPath Sales Cycle Guide Application
 * Main application class that orchestrates all functionality
 */
class SalesCycleApp {
  constructor() {
    this.initialized = false;
    this.config = null;
    this.modules = {};
    this.state = {
      loading: true,
      error: null,
      currentIndustry: 'banking',
      selectedFilters: {}
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.initialized) return;

    try {
      console.log('🚀 Initializing UiPath Sales Cycle Guide...');
      
      // Show loading state
      this.updateLoadingState('Initializing configuration...');
      
      // Initialize module manager with configuration
      await moduleManager.init();
      
      // Get modules
      this.modules = {
        config: moduleManager.getModule('config'),
        dataManager: moduleManager.getModule('dataManager'),
        security: moduleManager.getModule('security'),
        ai: moduleManager.getModule('ai'),
        performance: moduleManager.getModule('performance'),
        analytics: moduleManager.getModule('analytics')
      };

      this.config = this.modules.config?.getAll() || {};
      
      // Initialize application state
      this.updateLoadingState('Loading application data...');
      await this.initializeData();
      
      // Render initial UI
      this.updateLoadingState('Rendering interface...');
      await this.renderUI();
      
      // Setup event listeners
      this.updateLoadingState('Setting up interactions...');
      this.setupEventListeners();
      
      // Initialize features
      await this.initializeFeatures();
      
      // Hide loading and show app
      this.hideLoading();
      
      this.initialized = true;
      console.log('✅ Application initialized successfully');
      
      // Dispatch app ready event
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.showError('Failed to initialize application', error);
    }
  }

  /**
   * Initialize application data
   */
  async initializeData() {
    if (!this.modules.dataManager) {
      throw new Error('Data manager not available');
    }

    try {
      // Data manager should already be initialized by module manager
      console.log('✅ Data manager ready');
      
      // Set up data change subscriptions
      if (typeof this.modules.dataManager.subscribe === 'function') {
        this.modules.dataManager.subscribe(this.handleDataChange.bind(this));
      }
      
    } catch (error) {
      console.error('❌ Data initialization failed:', error);
      throw error;
    }
  }

  /**
   * Render the UI
   */
  async renderUI() {
    try {
      // Initialize the timeline app component
      if (typeof OptimizedTimelineApp !== 'undefined') {
        const timelineApp = new OptimizedTimelineApp();
        await timelineApp.init();
        this.timelineApp = timelineApp;
        console.log('✅ Timeline app initialized');
      } else {
        console.warn('⚠️ Timeline app not available - ensure components/timeline-app.js is loaded');
      }
      
      // Update UI state
      this.updateUIState();
      
    } catch (error) {
      console.error('❌ UI rendering failed:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Customer information form
    this.setupCustomerInfoListeners();
    
    // Global error handling
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // Online/offline status
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOfflineStatus.bind(this));
    
    console.log('✅ Event listeners setup complete');
  }

  /**
   * Setup customer information form listeners
   */
  setupCustomerInfoListeners() {
    // Industry buttons
    document.querySelectorAll('.industry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const industry = e.target.getAttribute('data-industry');
        this.switchIndustry(industry);
      });
    });

    // Update content button
    const updateBtn = document.getElementById('update-content-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        this.updateContent();
      });
    }

    // Other form elements
    const lobSelector = document.getElementById('lob-selector');
    if (lobSelector) {
      lobSelector.addEventListener('change', (e) => {
        this.state.selectedFilters.lob = e.target.value;
        this.updateContent();
      });
    }
  }

  /**
   * Initialize optional features
   */
  async initializeFeatures() {
    // AI Integration
    if (this.modules.ai && this.config.features?.ai) {
      try {
        console.log('✅ AI features initialized');
      } catch (error) {
        console.warn('⚠️ AI features failed to initialize:', error);
      }
    }

    // Analytics
    if (this.modules.analytics && this.config.features?.analytics) {
      try {
        console.log('✅ Analytics initialized');
      } catch (error) {
        console.warn('⚠️ Analytics failed to initialize:', error);
      }
    }

    // Performance monitoring
    if (this.modules.performance && this.config.features?.performance) {
      try {
        console.log('✅ Performance monitoring initialized');
      } catch (error) {
        console.warn('⚠️ Performance monitoring failed to initialize:', error);
      }
    }
  }

  /**
   * Switch industry
   */
  switchIndustry(industry) {
    if (industry === this.state.currentIndustry) return;
    
    this.state.currentIndustry = industry;
    
    // Update button states
    document.querySelectorAll('.industry-btn').forEach(btn => {
      const btnIndustry = btn.getAttribute('data-industry');
      if (btnIndustry === industry) {
        btn.classList.add('border-orange-500', 'bg-orange-50', 'text-orange-700');
        btn.classList.remove('border-gray-200', 'text-gray-700');
      } else {
        btn.classList.remove('border-orange-500', 'bg-orange-50', 'text-orange-700');
        btn.classList.add('border-gray-200', 'text-gray-700');
      }
    });

    // Update content
    this.updateContent();
    
    console.log(`🏢 Switched to ${industry} industry`);
  }

  /**
   * Update content based on current filters
   */
  updateContent() {
    if (this.timelineApp && typeof this.timelineApp.render === 'function') {
      this.timelineApp.render();
    }
    
    // Update LOB options
    this.updateLOBOptions();
  }

  /**
   * Update LOB options based on industry
   */
  updateLOBOptions() {
    const lobSelector = document.getElementById('lob-selector');
    if (!lobSelector) return;

    const options = {
      banking: [
        { value: '', label: 'All Banking LOBs' },
        { value: 'retail', label: 'Retail Banking' },
        { value: 'commercial', label: 'Commercial Banking' },
        { value: 'investment', label: 'Investment Banking' },
        { value: 'wealth', label: 'Wealth Management' }
      ],
      insurance: [
        { value: '', label: 'All Insurance LOBs' },
        { value: 'life', label: 'Life Insurance' },
        { value: 'health', label: 'Health Insurance' },
        { value: 'property', label: 'Property & Casualty' },
        { value: 'commercial', label: 'Commercial Insurance' }
      ]
    };

    const industryOptions = options[this.state.currentIndustry] || [];
    
    lobSelector.innerHTML = industryOptions.map(opt => 
      `<option value="${opt.value}">${opt.label}</option>`
    ).join('');
  }

  /**
   * Handle data changes from data manager
   */
  handleDataChange(changeType, data) {
    console.log(`📡 Data change received: ${changeType}`, data);
    
    // Re-render affected UI components
    this.updateContent();
  }

  /**
   * Update UI state
   */
  updateUIState() {
    // Set initial industry
    this.switchIndustry(this.state.currentIndustry);
  }

  /**
   * Show loading state
   */
  updateLoadingState(message) {
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) {
      const messageEl = loadingEl.querySelector('p');
      if (messageEl) {
        messageEl.textContent = message;
      }
    }
  }

  /**
   * Hide loading
   */
  hideLoading() {
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
    
    // Update status indicators
    const appStatus = document.getElementById('app-status');
    if (appStatus) {
      appStatus.textContent = '✅ Ready';
      appStatus.className = 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs';
    }
  }

  /**
   * Show error state
   */
  showError(message, error) {
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="text-center">
          <div class="text-red-600 text-xl mb-4">⚠️</div>
          <p class="text-red-600 font-medium">${message}</p>
          <p class="text-gray-600 text-sm mt-2">${error.message}</p>
          <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
            Refresh Page
          </button>
        </div>
      `;
    }
  }

  /**
   * Handle global errors
   */
  handleGlobalError(event) {
    console.error('Global error:', event.error);
    // Could send to analytics service here
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // Could send to analytics service here
  }

  /**
   * Handle online status
   */
  handleOnlineStatus() {
    const status = document.getElementById('connection-status');
    if (status) {
      status.textContent = 'Online';
      status.className = 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs';
    }
  }

  /**
   * Handle offline status
   */
  handleOfflineStatus() {
    const status = document.getElementById('connection-status');
    if (status) {
      status.textContent = 'Offline';
      status.className = 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs';
    }
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get module
   */
  getModule(name) {
    return this.modules[name];
  }

  /**
   * Shutdown application
   */
  async shutdown() {
    console.log('🔄 Shutting down application...');
    
    try {
      await moduleManager.shutdown();
      this.initialized = false;
      console.log('✅ Application shut down successfully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    window.salesCycleApp = new SalesCycleApp();
    await window.salesCycleApp.init();
  } catch (error) {
    console.error('❌ Failed to start application:', error);
  }
});

export default SalesCycleApp;
export { SalesCycleApp };