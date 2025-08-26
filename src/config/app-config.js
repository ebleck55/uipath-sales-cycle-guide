/**
 * Application Configuration
 * Centralized configuration management
 */

export const APP_CONFIG = {
  // Application metadata
  name: 'UiPath Sales Cycle Guide',
  version: '2.0.0',
  description: 'Comprehensive sales cycle management tool for UiPath solutions',

  // Security settings
  security: {
    // Content Security Policy
    csp: {
      enableCSP: true,
      reportViolations: true,
      strictMode: false // Set to true for production
    },
    
    // API security
    api: {
      maxRetries: 3,
      timeoutMs: 30000,
      rateLimitPerMinute: 10,
      keyExpiryHours: 24
    },
    
    // Input validation
    validation: {
      maxInputLength: 10000,
      allowedFileTypes: ['json', 'txt'],
      maxFileSize: 1024 * 1024 // 1MB
    }
  },

  // Performance settings
  performance: {
    debounceDelayMs: 300,
    throttleDelayMs: 100,
    virtualScrollThreshold: 100,
    cacheExpiryMs: 3600000, // 1 hour
    lazyLoadThreshold: '50px'
  },

  // UI configuration
  ui: {
    // Animation durations
    animations: {
      fadeMs: 300,
      slideMs: 250,
      scaleMs: 200
    },
    
    // Responsive breakpoints
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    },
    
    // Theme configuration
    theme: {
      primaryColor: '#FA4616', // UiPath Orange
      secondaryColor: '#1E40AF', // UiPath Blue
      successColor: '#10B981',
      errorColor: '#EF4444',
      warningColor: '#F59E0B'
    }
  },

  // Feature flags
  features: {
    enableAI: true,
    enableExport: true,
    enableImport: true,
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: false, // Disabled for privacy
    enableAutoSave: false, // Disabled per user request
    enablePWA: true
  },

  // API endpoints
  api: {
    claude: {
      baseUrl: 'https://api.anthropic.com/v1',
      version: '2023-06-01',
      models: {
        default: 'claude-3-haiku-20240307',
        premium: 'claude-3-sonnet-20240229'
      }
    }
  },

  // Storage configuration
  storage: {
    // Use sessionStorage for temporary data, no localStorage persistence
    useSessionStorage: true,
    keyPrefix: 'uipath_sales_',
    encryptSensitiveData: true,
    maxStorageSize: 5 * 1024 * 1024 // 5MB
  },

  // Industry configuration
  industries: [
    {
      id: 'banking',
      name: 'Banking & Financial Services',
      icon: 'bank',
      color: '#1E40AF'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: 'shield',
      color: '#7C3AED'
    }
  ],

  // Export/Import settings
  export: {
    formats: ['json', 'csv', 'txt'],
    defaultFormat: 'json',
    includeMetadata: true,
    compressOutput: false
  },

  // Error handling
  errorHandling: {
    showUserFriendlyMessages: true,
    logToConsole: true,
    maxRetries: 3,
    retryDelayMs: 1000
  },

  // Development settings
  development: {
    enableDebugMode: false,
    enablePerformanceMonitoring: false,
    enableStateLogging: false,
    mockAIResponses: false
  },

  // Accessibility settings
  accessibility: {
    enableHighContrast: false,
    enableReducedMotion: false,
    enableScreenReaderSupport: true,
    enableKeyboardNavigation: true
  },

  // PWA settings
  pwa: {
    enableServiceWorker: true,
    enableOfflineMode: true,
    enableInstallPrompt: true,
    cacheStrategy: 'cacheFirst',
    updateStrategy: 'prompt'
  }
};

/**
 * Get configuration value
 * @param {string} path - Configuration path (dot notation)
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
export function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let value = APP_CONFIG;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Check if feature is enabled
 * @param {string} featureName - Feature name
 * @returns {boolean} Feature status
 */
export function isFeatureEnabled(featureName) {
  return getConfig(`features.${featureName}`, false);
}

/**
 * Get API configuration
 * @param {string} service - API service name
 * @returns {Object} API configuration
 */
export function getAPIConfig(service = 'claude') {
  return getConfig(`api.${service}`, {});
}

/**
 * Get security configuration
 * @returns {Object} Security configuration
 */
export function getSecurityConfig() {
  return getConfig('security', {});
}

/**
 * Get performance configuration
 * @returns {Object} Performance configuration
 */
export function getPerformanceConfig() {
  return getConfig('performance', {});
}

/**
 * Get UI configuration
 * @returns {Object} UI configuration
 */
export function getUIConfig() {
  return getConfig('ui', {});
}

/**
 * Update configuration (for dynamic updates)
 * @param {string} path - Configuration path
 * @param {*} value - New value
 */
export function updateConfig(path, value) {
  const keys = path.split('.');
  let current = APP_CONFIG;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Validate configuration
 * @returns {Array} Array of validation errors
 */
export function validateConfig() {
  const errors = [];
  
  // Validate required fields
  if (!APP_CONFIG.name) errors.push('App name is required');
  if (!APP_CONFIG.version) errors.push('App version is required');
  
  // Validate security settings
  if (APP_CONFIG.security.api.rateLimitPerMinute < 1) {
    errors.push('Rate limit must be at least 1 request per minute');
  }
  
  // Validate performance settings
  if (APP_CONFIG.performance.debounceDelayMs < 0) {
    errors.push('Debounce delay must be non-negative');
  }
  
  return errors;
}

// Validate configuration on load
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error('Configuration validation errors:', configErrors);
}

export default APP_CONFIG;