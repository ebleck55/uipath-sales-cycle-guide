/**
 * Module Manager - Central module loading and dependency management
 * Handles initialization order, dependencies, and error handling
 */
class ModuleManager {
  constructor() {
    this.modules = new Map();
    this.config = null;
    this.initialized = false;
    this.loadingState = 'idle'; // idle, loading, loaded, error
  }

  /**
   * Initialize the module system
   */
  async init(config) {
    if (this.initialized) return;
    
    this.config = config;
    this.loadingState = 'loading';
    
    try {
      console.log('🚀 Initializing Module Manager...');
      
      // Load core modules in order
      await this.loadCoreModules();
      
      // Load feature modules
      await this.loadFeatureModules();
      
      // Setup inter-module communication
      this.setupModuleCommunication();
      
      this.initialized = true;
      this.loadingState = 'loaded';
      
      console.log('✅ Module Manager initialized successfully');
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('modules:ready'));
      
    } catch (error) {
      this.loadingState = 'error';
      console.error('❌ Module Manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load core modules that everything else depends on
   */
  async loadCoreModules() {
    const coreModules = [
      { name: 'config', path: 'src/config/app-config.js', class: 'AppConfig' },
      { name: 'sanitizer', path: 'src/security/sanitizer.js', class: 'Sanitizer' },
      { name: 'dataManager', path: 'src/core/unified-data-manager.js', class: 'UnifiedDataManager' },
      { name: 'security', path: 'src/security/api-security.js', class: 'ApiSecurity' }
    ];

    for (const module of coreModules) {
      await this.loadModule(module);
    }
  }

  /**
   * Load feature modules
   */
  async loadFeatureModules() {
    const featureModules = [
      { name: 'ai', path: 'src/ai/ai-module.js', class: 'AIModule', optional: true },
      { name: 'admin', path: 'src/admin/optimized-admin.js', class: 'AdminModule', optional: true, config: { renderInterface: false } },
      { name: 'performance', path: 'src/core/performance.js', class: 'PerformanceManager', optional: true },
      { name: 'analytics', path: 'src/core/analytics.js', class: 'Analytics', optional: true }
    ];

    for (const module of featureModules) {
      try {
        await this.loadModule(module);
      } catch (error) {
        if (!module.optional) {
          throw error;
        }
        console.warn(`⚠️ Optional module ${module.name} failed to load:`, error.message);
      }
    }
  }

  /**
   * Load a single module
   */
  async loadModule(moduleConfig) {
    const { name, path, class: className, config: moduleSpecificConfig } = moduleConfig;
    
    try {
      // Check if already loaded
      if (this.modules.has(name)) {
        return this.modules.get(name);
      }

      // Import the module with cache busting for analytics
      const cacheBuster = name === 'analytics' ? `?v=${Date.now()}` : '';
      const moduleExport = await import(`../../${path}${cacheBuster}`);
      let ModuleClass = moduleExport[className] || moduleExport.default;
      
      // Special handling for singleton modules like sanitizer
      if (!ModuleClass) {
        throw new Error(`Class ${className} not found in ${path}`);
      }
      
      // If we get an instance instead of a class (singleton pattern), use it directly
      if (typeof ModuleClass === 'object' && ModuleClass.constructor && typeof ModuleClass.constructor === 'function') {
        // For singleton modules, store the instance directly
        this.modules.set(name, ModuleClass);
        console.log(`✅ Module ${name} loaded successfully (singleton)`);
        return ModuleClass;
      }

      // Initialize the module normally
      const moduleInstance = new ModuleClass();
      
      // Initialize if it has an init method
      if (typeof moduleInstance.init === 'function') {
        const config = { ...this.config, ...moduleSpecificConfig };
        await moduleInstance.init(config);
      }

      // Store the module
      this.modules.set(name, moduleInstance);
      
      console.log(`✅ Module ${name} loaded successfully`);
      return moduleInstance;
      
    } catch (error) {
      console.error(`❌ Failed to load module ${name}:`, error);
      throw new Error(`Module loading failed: ${name} - ${error.message}`);
    }
  }

  /**
   * Get a loaded module
   */
  getModule(name) {
    const module = this.modules.get(name);
    if (!module) {
      console.warn(`⚠️ Module ${name} not found or not loaded`);
    }
    return module;
  }

  /**
   * Check if a module is loaded
   */
  hasModule(name) {
    return this.modules.has(name);
  }

  /**
   * Setup communication between modules
   */
  setupModuleCommunication() {
    // Create a simple event bus for modules
    const eventBus = {
      events: new Map(),
      
      emit(event, data) {
        const handlers = this.events.get(event) || [];
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      },
      
      on(event, handler) {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event).push(handler);
      },
      
      off(event, handler) {
        const handlers = this.events.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };

    // Make event bus available to all modules
    this.modules.forEach(module => {
      if (module && typeof module === 'object') {
        module.eventBus = eventBus;
      }
    });

    // Store event bus for external access
    this.eventBus = eventBus;
  }

  /**
   * Gracefully shutdown all modules
   */
  async shutdown() {
    console.log('🔄 Shutting down modules...');
    
    for (const [name, module] of this.modules) {
      try {
        if (typeof module.destroy === 'function') {
          await module.destroy();
          console.log(`✅ Module ${name} shut down successfully`);
        }
      } catch (error) {
        console.error(`❌ Error shutting down module ${name}:`, error);
      }
    }

    this.modules.clear();
    this.initialized = false;
    this.loadingState = 'idle';
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      loadingState: this.loadingState,
      modulesCount: this.modules.size,
      modules: Array.from(this.modules.keys())
    };
  }
}

// Export singleton instance
const moduleManager = new ModuleManager();
export default moduleManager;
export { ModuleManager };