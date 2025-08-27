/**
 * Application Configuration
 * Central configuration management for all environments
 */
class AppConfig {
  constructor() {
    this.config = null;
    this.environment = null;
  }

  /**
   * Initialize configuration
   */
  init() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    
    console.log(`🔧 App configured for ${this.environment} environment`);
    return this.config;
  }

  /**
   * Detect current environment
   */
  detectEnvironment() {
    // Check for development indicators
    if (location.hostname === 'localhost' || 
        location.hostname === '127.0.0.1' || 
        location.port === '3000' ||
        location.protocol === 'file:') {
      return 'development';
    }
    
    // Check for staging
    if (location.hostname.includes('staging') || 
        location.hostname.includes('test')) {
      return 'staging';
    }
    
    // Production by default
    return 'production';
  }

  /**
   * Load environment-specific configuration
   */
  loadConfiguration() {
    const baseConfig = {
      app: {
        name: 'UiPath Sales Cycle Guide',
        version: '2.0.0',
        debug: false
      },
      features: {
        ai: true,
        analytics: true,
        performance: true,
        admin: true,
        offline: false
      },
      api: {
        timeout: 30000,
        retries: 3,
        baseUrl: ''
      },
      ui: {
        theme: 'default',
        animations: true,
        lazy: true
      },
      cache: {
        version: '2.1.0',
        prefix: 'uipath-sales-',
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      },
      security: {
        csp: true,
        sanitize: true,
        apiKeys: {
          storage: 'localStorage', // or 'sessionStorage'
          encryption: true, // Enable encryption for API keys
          keyPrefix: 'enc_'
        },
        cors: {
          enabled: true,
          allowedOrigins: ['*']
        }
      },
      modules: {
        loadOptional: true,
        failSafe: true
      }
    };

    // Environment-specific overrides
    const envConfig = {
      development: {
        app: {
          debug: true
        },
        api: {
          timeout: 60000
        },
        ui: {
          animations: false
        },
        security: {
          csp: false,
          apiKeys: {
            encryption: false // Disable encryption in dev for easier debugging
          }
        }
      },
      staging: {
        features: {
          analytics: false
        }
      },
      production: {
        features: {
          admin: false, // Hide admin in production
          debug: false
        },
        cache: {
          ttl: 7 * 24 * 60 * 60 * 1000 // 7 days in production
        },
        security: {
          csp: true,
          cors: {
            allowedOrigins: [] // Restrict CORS in production
          }
        }
      }
    };

    // Merge configurations
    const currentEnvConfig = envConfig[this.environment] || {};
    return this.deepMerge(baseConfig, currentEnvConfig);
  }

  /**
   * Deep merge configuration objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Get configuration value with dot notation
   */
  get(path, defaultValue = null) {
    if (!this.config) {
      console.warn('Configuration not initialized');
      return defaultValue;
    }

    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set configuration value with dot notation
   */
  set(path, value) {
    if (!this.config) {
      this.config = {};
    }

    const keys = path.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false);
  }

  /**
   * Get environment
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * Get full configuration
   */
  getAll() {
    return this.config;
  }

  /**
   * Get API configuration for a specific service
   */
  getApiConfig(serviceName) {
    const apiConfig = this.get('api', {});
    const serviceConfig = apiConfig[serviceName] || {};
    
    return {
      timeout: serviceConfig.timeout || apiConfig.timeout || 30000,
      retries: serviceConfig.retries || apiConfig.retries || 3,
      baseUrl: serviceConfig.baseUrl || apiConfig.baseUrl || '',
      headers: serviceConfig.headers || apiConfig.headers || {}
    };
  }

  /**
   * Check if a feature is enabled for current environment
   */
  isFeatureEnabledForEnvironment(featureName) {
    const environmentFeatures = this.get(`environments.${this.environment}.features`, {});
    const globalFeatures = this.get('features', {});
    
    // Environment-specific setting takes precedence
    if (environmentFeatures.hasOwnProperty(featureName)) {
      return environmentFeatures[featureName];
    }
    
    return globalFeatures[featureName] || false;
  }

  /**
   * Get security settings for current environment
   */
  getSecurityConfig() {
    const securityConfig = this.get('security', {});
    const envSecurityConfig = this.get(`environments.${this.environment}.security`, {});
    
    return this.deepMerge(securityConfig, envSecurityConfig);
  }

  /**
   * Validate configuration
   */
  validate() {
    const required = [
      'app.name',
      'app.version',
      'cache.version'
    ];

    const missing = required.filter(path => this.get(path) === null);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    // Validate environment-specific requirements
    if (this.environment === 'production') {
      const prodRequired = ['security.csp'];
      const prodMissing = prodRequired.filter(path => !this.get(path));
      
      if (prodMissing.length > 0) {
        console.warn(`Production configuration recommendations missing: ${prodMissing.join(', ')}`);
      }
    }

    return true;
  }
}

export default AppConfig;
export { AppConfig };