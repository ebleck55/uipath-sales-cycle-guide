/**
 * Integration Manager - Orchestrates all optimization modules
 * Provides a unified interface for enhanced functionality
 */

class IntegrationManager {
  constructor() {
    this.modules = new Map();
    this.initialized = false;
    this.config = {
      enableAnalytics: true,
      enablePerformanceMonitoring: true,
      enableUXEnhancements: true,
      enableAdvancedCaching: true,
      enableServiceWorker: true,
      debugMode: false
    };
    
    this.init();
  }

  /**
   * Initialize all optimization modules
   */
  async init() {
    if (this.initialized) return;
    
    try {
      console.log('🚀 Initializing Integration Manager...');
      
      // Initialize modules in order of dependency
      await this.initializeServiceWorker();
      await this.initializePerformanceManager();
      await this.initializeDataManager();
      await this.initializeAnalytics();
      await this.initializeUXEnhancer();
      
      // Setup module interactions
      this.setupModuleIntegrations();
      
      // Enhance existing timeline app
      this.enhanceTimelineApp();
      
      this.initialized = true;
      console.log('✅ Integration Manager fully initialized');
      
      // Notify application that optimizations are ready
      this.dispatchEvent('optimizations:ready');
      
    } catch (error) {
      console.error('❌ Integration Manager initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize Service Worker
   */
  async initializeServiceWorker() {
    if (!this.config.enableServiceWorker || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-optimized.js');
      console.log('✅ Service Worker registered:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.handleServiceWorkerUpdate();
          }
        });
      });
      
      this.modules.set('serviceWorker', registration);
      
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  /**
   * Initialize Performance Manager
   */
  async initializePerformanceManager() {
    if (!this.config.enablePerformanceMonitoring) return;
    
    const performanceManager = new PerformanceManager();
    performanceManager.preloadCriticalResources();
    
    this.modules.set('performance', performanceManager);
    console.log('✅ Performance Manager initialized');
  }

  /**
   * Initialize Data Manager
   */
  async initializeDataManager() {
    if (!this.config.enableAdvancedCaching) return;
    
    const dataManager = new DataManager();
    await dataManager.initializeIndexedDB();
    
    // Subscribe to data events for analytics
    if (this.modules.has('analytics')) {
      dataManager.subscribe((event, data) => {
        this.modules.get('analytics').trackEvent(`data_${event}`, data);
      });
    }
    
    this.modules.set('data', dataManager);
    console.log('✅ Data Manager initialized');
  }

  /**
   * Initialize Analytics
   */
  async initializeAnalytics() {
    if (!this.config.enableAnalytics) return;
    
    const analytics = new AnalyticsManager();
    this.modules.set('analytics', analytics);
    console.log('✅ Analytics Manager initialized');
  }

  /**
   * Initialize UX Enhancer
   */
  async initializeUXEnhancer() {
    if (!this.config.enableUXEnhancements) return;
    
    // UXEnhancer initializes itself, just store reference
    this.modules.set('ux', window.uxEnhancer);
    console.log('✅ UX Enhancer integrated');
  }

  /**
   * Setup integrations between modules
   */
  setupModuleIntegrations() {
    const analytics = this.modules.get('analytics');
    const performance = this.modules.get('performance');
    const data = this.modules.get('data');
    
    if (analytics && performance) {
      // Track performance metrics in analytics
      performance.observers.performance?.observe({
        entryTypes: ['navigation', 'measure', 'paint']
      });
    }
    
    if (analytics && data) {
      // Track data operations
      data.subscribe((event, eventData) => {
        analytics.trackEvent(`data_${event}`, eventData);
      });
    }

    console.log('🔗 Module integrations configured');
  }

  /**
   * Enhance the existing TimelineApp with optimizations
   */
  enhanceTimelineApp() {
    if (!window.TimelineApp) {
      console.warn('TimelineApp not found, skipping enhancements');
      return;
    }

    const app = window.TimelineApp;
    const analytics = this.modules.get('analytics');
    const data = this.modules.get('data');
    const performance = this.modules.get('performance');

    // Enhance persona rendering with caching
    if (app.renderPersonas && data) {
      const originalRenderPersonas = app.renderPersonas.bind(app);
      app.renderPersonas = async function() {
        const startTime = performance.now();
        
        try {
          // Use data manager for personas
          const industry = window.appState?.get('currentIndustry') || 'banking';
          const personas = await data.loadPersonas(industry);
          
          // Update app's persona data
          if (app.adminPersonas) {
            app.adminPersonas = { personas: { [industry]: personas } };
          }
          
          // Call original method
          const result = originalRenderPersonas();
          
          // Track performance
          if (analytics) {
            analytics.trackPerformance('persona_render_time', performance.now() - startTime);
          }
          
          return result;
          
        } catch (error) {
          console.warn('Enhanced persona rendering failed, falling back:', error);
          return originalRenderPersonas();
        }
      };
    }

    // Enhance persona toggle with analytics
    if (app.togglePersonaCard && analytics) {
      const originalToggle = app.togglePersonaCard.bind(app);
      app.togglePersonaCard = function(index) {
        analytics.trackPersonaInteraction(index, 'toggle');
        return originalToggle(index);
      };
    }

    // Enhance stage navigation with analytics
    if (app.navigateToStage && analytics) {
      const originalNavigate = app.navigateToStage?.bind(app);
      if (originalNavigate) {
        app.navigateToStage = function(stageIndex) {
          const currentStage = window.appState?.get('currentStage');
          analytics.trackStageNavigation(currentStage, stageIndex, 'click');
          return originalNavigate(stageIndex);
        };
      }
    }

    // Add search enhancement
    this.enhanceSearch();

    console.log('🎯 TimelineApp enhanced with optimizations');
  }

  /**
   * Enhance search functionality
   */
  enhanceSearch() {
    const searchInput = document.getElementById('llm-prompt-input');
    const data = this.modules.get('data');
    const analytics = this.modules.get('analytics');
    
    if (!searchInput || !data) return;

    // Enhanced search with debouncing and caching
    const enhancedSearch = this.debounce(async (query) => {
      if (query.length < 3) return;

      try {
        const startTime = performance.now();
        const results = await data.search(query, {
          industry: window.appState?.get('currentIndustry')
        });
        
        const searchTime = performance.now() - startTime;
        
        if (analytics) {
          analytics.trackSearch(query, results, { searchTime });
        }
        
        // Display results
        this.displaySearchResults(results);
        
      } catch (error) {
        console.error('Enhanced search failed:', error);
        if (analytics) {
          analytics.trackEvent('search_error', { query, error: error.message });
        }
      }
    }, 300);

    // Replace existing search functionality
    searchInput.addEventListener('input', (e) => {
      enhancedSearch(e.target.value);
    });

    console.log('🔍 Enhanced search functionality added');
  }

  /**
   * Display search results
   */
  displaySearchResults(results) {
    // Create or update search results container
    let resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.id = 'search-results';
      resultsContainer.className = 'absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto z-50';
      
      const searchContainer = document.querySelector('.flex-1.relative');
      if (searchContainer) {
        searchContainer.appendChild(resultsContainer);
      }
    }

    if (!results.query) {
      resultsContainer.classList.add('hidden');
      return;
    }

    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = this.buildSearchResultsHTML(results);
  }

  /**
   * Build search results HTML
   */
  buildSearchResultsHTML(results) {
    if (results.total === 0) {
      return `
        <div class="p-4 text-center text-gray-500">
          <p>No results found for "${results.query}"</p>
          <p class="text-sm mt-2">Try a different search term or browse personas directly</p>
        </div>
      `;
    }

    let html = `
      <div class="p-4">
        <div class="text-sm text-gray-600 mb-3">
          Found ${results.total} results for "${results.query}"
        </div>
    `;

    // Personas results
    if (results.results.personas.length > 0) {
      html += `
        <div class="mb-4">
          <h4 class="font-semibold text-gray-800 mb-2">👥 Personas</h4>
          ${results.results.personas.slice(0, 3).map(persona => `
            <div class="p-2 hover:bg-gray-50 rounded cursor-pointer" onclick="window.integrationManager.selectSearchResult('persona', '${persona.id}')">
              <div class="font-medium text-blue-700">${persona.title}</div>
              <div class="text-sm text-gray-600">${persona.world?.substring(0, 100)}...</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Resources results
    if (results.results.resources.length > 0) {
      html += `
        <div class="mb-4">
          <h4 class="font-semibold text-gray-800 mb-2">📄 Resources</h4>
          ${results.results.resources.slice(0, 2).map(resource => `
            <div class="p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div class="font-medium text-green-700">${resource.name}</div>
              <div class="text-sm text-gray-600">${resource.overview?.substring(0, 100)}...</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Handle search result selection
   */
  selectSearchResult(type, id) {
    const analytics = this.modules.get('analytics');
    
    if (analytics) {
      analytics.trackEvent('search_result_clicked', { type, id });
    }

    // Hide search results
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.classList.add('hidden');
    }

    // Navigate to result based on type
    switch (type) {
      case 'persona':
        this.navigateToPersona(id);
        break;
      case 'resource':
        this.navigateToResource(id);
        break;
      case 'use-case':
        this.navigateToUseCase(id);
        break;
    }
  }

  /**
   * Navigate to specific persona
   */
  navigateToPersona(personaId) {
    // Scroll to personas section and expand specific persona
    const personasSection = document.getElementById('personas-section');
    if (personasSection) {
      personasSection.scrollIntoView({ behavior: 'smooth' });
      
      // Find and expand the persona
      const personaCards = document.querySelectorAll('.persona-card');
      personaCards.forEach((card, index) => {
        const cardData = card.dataset.personaData;
        if (cardData && JSON.parse(cardData).id === personaId) {
          setTimeout(() => {
            if (window.TimelineApp?.togglePersonaCard) {
              window.TimelineApp.togglePersonaCard(index);
            }
          }, 500);
        }
      });
    }
  }

  /**
   * Handle service worker updates
   */
  handleServiceWorkerUpdate() {
    console.log('🔄 Service Worker update available');
    
    // Show update notification
    this.showNotification(
      'App update available! Refresh to get the latest features.',
      'info',
      {
        actions: [
          { text: 'Refresh', action: () => window.location.reload() },
          { text: 'Later', action: () => {} }
        ]
      }
    );
  }

  /**
   * Handle initialization errors gracefully
   */
  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Disable failed modules but continue with others
    const failedModule = error.module || 'unknown';
    console.warn(`Disabling ${failedModule} due to initialization failure`);
    
    // Attempt to continue with basic functionality
    this.dispatchEvent('optimizations:partial', { error, failedModule });
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info', options = {}) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    let html = `<div class="flex items-start">
      <div class="flex-1">${message}</div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-current opacity-50 hover:opacity-100">×</button>
    </div>`;
    
    if (options.actions) {
      html += `<div class="mt-3 flex gap-2">`;
      options.actions.forEach(action => {
        html += `<button onclick="(${action.action.toString()})(); this.closest('.fixed').remove();" class="px-3 py-1 text-sm bg-current bg-opacity-10 rounded hover:bg-opacity-20">${action.text}</button>`;
      });
      html += `</div>`;
    }
    
    notification.innerHTML = html;
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds if no actions
    if (!options.actions) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }
  }

  /**
   * Dispatch custom events
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
  }

  /**
   * Get optimization status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      modules: Array.from(this.modules.keys()),
      config: this.config,
      performance: this.modules.get('performance')?.getMetrics(),
      analytics: this.modules.get('analytics')?.getInsights(),
      dataCache: this.modules.get('data')?.getCacheStats()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuration updated:', this.config);
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    // Cleanup all modules
    this.modules.forEach((module, name) => {
      if (module && typeof module.destroy === 'function') {
        module.destroy();
      }
    });
    
    this.modules.clear();
    this.initialized = false;
    
    console.log('🧹 Integration Manager destroyed');
  }

  /**
   * Utility methods
   */
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    window.integrationManager = new IntegrationManager();
  });
} else {
  window.integrationManager = new IntegrationManager();
}

// Export for debugging and external access
window.IntegrationManager = IntegrationManager;