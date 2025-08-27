/**
 * Analytics and User Behavior Tracking System
 * Provides insights into user interactions and application performance
 */

class AnalyticsManager {
  constructor() {
    this.events = [];
    this.sessions = new Map();
    this.userActions = {
      personaExpansions: new Map(),
      stageNavigations: [],
      searchQueries: [],
      timeOnStage: new Map(),
      industryChanges: [],
      adminActions: []
    };
    
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    
    this.config = {
      maxEvents: 1000,
      batchSize: 50,
      sendInterval: 30000, // 30 seconds
      storageKey: 'uipath-analytics',
      privacyMode: true // Don't track PII
    };
    
    this.init();
  }

  /**
   * Initialize analytics system
   */
  init() {
    this.loadStoredData();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    this.scheduleDataSync();
    
    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer || 'direct',
      timestamp: Date.now()
    });
    
    console.log('📊 Analytics Manager initialized');
  }

  /**
   * Track user events
   */
  trackEvent(eventType, data = {}) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.pathname,
      ...data
    };

    this.events.push(event);
    this.updateLastActivity();
    
    // Specific event handlers
    this.handleSpecificEvent(eventType, data);
    
    // Maintain event limit
    if (this.events.length > this.config.maxEvents) {
      this.events.shift();
    }
    
    // Store locally
    this.storeData();
    
    console.log(`📊 Event tracked: ${eventType}`, event);
  }

  /**
   * Handle specific event types
   */
  handleSpecificEvent(eventType, data) {
    switch (eventType) {
      case 'persona_expanded':
        const personaId = data.personaId || data.index;
        if (!this.userActions.personaExpansions.has(personaId)) {
          this.userActions.personaExpansions.set(personaId, 0);
        }
        this.userActions.personaExpansions.set(personaId, 
          this.userActions.personaExpansions.get(personaId) + 1);
        break;
        
      case 'stage_navigation':
        this.userActions.stageNavigations.push({
          from: data.fromStage,
          to: data.toStage,
          method: data.method, // click, keyboard, swipe
          timestamp: Date.now()
        });
        
        // Track time on previous stage
        if (data.fromStage !== undefined) {
          const timeOnStage = Date.now() - (this.lastStageTime || this.startTime);
          if (!this.userActions.timeOnStage.has(data.fromStage)) {
            this.userActions.timeOnStage.set(data.fromStage, []);
          }
          this.userActions.timeOnStage.get(data.fromStage).push(timeOnStage);
        }
        this.lastStageTime = Date.now();
        break;
        
      case 'search_performed':
        this.userActions.searchQueries.push({
          query: this.sanitizeSearchQuery(data.query),
          results: data.results || 0,
          timestamp: Date.now()
        });
        break;
        
      case 'industry_changed':
        this.userActions.industryChanges.push({
          from: data.from,
          to: data.to,
          timestamp: Date.now()
        });
        break;
        
      case 'admin_action':
        if (this.config.privacyMode) {
          // Only track action type, not content
          this.userActions.adminActions.push({
            action: data.action,
            section: data.section,
            timestamp: Date.now()
          });
        }
        break;
    }
  }

  /**
   * Track persona interaction
   */
  trackPersonaInteraction(personaIndex, action, additionalData = {}) {
    this.trackEvent('persona_interaction', {
      personaIndex,
      action, // expanded, collapsed, viewed
      ...additionalData
    });
  }

  /**
   * Track stage navigation
   */
  trackStageNavigation(fromStage, toStage, method = 'click') {
    this.trackEvent('stage_navigation', {
      fromStage,
      toStage,
      method,
      duration: this.getStageTime(fromStage)
    });
  }

  /**
   * Track search behavior
   */
  trackSearch(query, results, filters = {}) {
    this.trackEvent('search_performed', {
      query: this.sanitizeSearchQuery(query),
      resultsCount: results?.total || 0,
      filters,
      hasResults: (results?.total || 0) > 0
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric, value, context = {}) {
    this.trackEvent('performance_metric', {
      metric,
      value,
      context
    });
  }

  /**
   * Track user flow patterns
   */
  trackUserFlow(flowType, step, data = {}) {
    this.trackEvent('user_flow', {
      flowType, // onboarding, persona_discovery, stage_completion
      step,
      ...data
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature, action, data = {}) {
    this.trackEvent('feature_usage', {
      feature, // keyboard_shortcuts, mobile_gestures, admin_panel
      action, // used, discovered, dismissed
      ...data
    });
  }

  /**
   * Setup event listeners for automatic tracking
   */
  setupEventListeners() {
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { duration: Date.now() - this.lastActivity });
      } else {
        this.trackEvent('page_visible');
        this.updateLastActivity();
      }
    });

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: Date.now() - this.startTime,
        totalEvents: this.events.length
      });
      this.storeData();
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack?.substring(0, 500) // Limit stack trace
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('promise_rejection', {
        reason: event.reason?.toString().substring(0, 200)
      });
    });

    // Network status changes
    window.addEventListener('online', () => {
      this.trackEvent('network_online');
      this.syncStoredData();
    });

    window.addEventListener('offline', () => {
      this.trackEvent('network_offline');
    });

    // Viewport changes
    window.addEventListener('resize', this.debounce(() => {
      this.trackEvent('viewport_change', {
        size: `${window.innerWidth}x${window.innerHeight}`,
        orientation: screen.orientation?.type || 'unknown'
      });
    }, 500));
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.trackPerformance('page_load', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            firstByte: perfData.responseStart - perfData.requestStart,
            domInteractive: perfData.domInteractive - perfData.domContentLoadedEventStart
          });
        }
      }, 1000);
    });

    // Monitor Core Web Vitals if available
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance('lcp', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          this.trackPerformance('fid', fid);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.trackPerformance('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Get analytics insights
   */
  getInsights() {
    const insights = {
      session: {
        id: this.sessionId,
        duration: Date.now() - this.startTime,
        totalEvents: this.events.length,
        lastActivity: this.lastActivity
      },
      
      personas: {
        totalExpansions: Array.from(this.userActions.personaExpansions.values()).reduce((a, b) => a + b, 0),
        mostViewedPersona: this.getMostViewedPersona(),
        expansionRate: this.getPersonaExpansionRate()
      },
      
      navigation: {
        totalStageChanges: this.userActions.stageNavigations.length,
        averageTimePerStage: this.getAverageTimePerStage(),
        navigationMethods: this.getNavigationMethodStats(),
        mostVisitedStage: this.getMostVisitedStage()
      },
      
      search: {
        totalQueries: this.userActions.searchQueries.length,
        averageResultsPerQuery: this.getAverageSearchResults(),
        topSearchTerms: this.getTopSearchTerms(),
        searchSuccessRate: this.getSearchSuccessRate()
      },
      
      engagement: {
        activeTime: this.calculateActiveTime(),
        bounceRate: this.calculateBounceRate(),
        conversionFunnel: this.getConversionFunnel()
      },
      
      technical: {
        errorCount: this.getErrorCount(),
        performanceMetrics: this.getPerformanceInsights(),
        deviceInfo: this.getDeviceInfo()
      }
    };

    return insights;
  }

  /**
   * Helper methods for insights
   */
  getMostViewedPersona() {
    if (this.userActions.personaExpansions.size === 0) return null;
    
    let maxViews = 0;
    let mostViewed = null;
    
    for (const [personaId, views] of this.userActions.personaExpansions.entries()) {
      if (views > maxViews) {
        maxViews = views;
        mostViewed = personaId;
      }
    }
    
    return { personaId: mostViewed, views: maxViews };
  }

  getPersonaExpansionRate() {
    const personaViews = this.events.filter(e => e.type === 'persona_interaction');
    const totalPersonas = document.querySelectorAll('.persona-card').length;
    
    return totalPersonas > 0 ? (this.userActions.personaExpansions.size / totalPersonas) : 0;
  }

  getAverageTimePerStage() {
    const stageTimes = Array.from(this.userActions.timeOnStage.values()).flat();
    return stageTimes.length > 0 ? stageTimes.reduce((a, b) => a + b, 0) / stageTimes.length : 0;
  }

  getNavigationMethodStats() {
    const methods = {};
    this.userActions.stageNavigations.forEach(nav => {
      methods[nav.method] = (methods[nav.method] || 0) + 1;
    });
    return methods;
  }

  getMostVisitedStage() {
    const stageVisits = {};
    this.userActions.stageNavigations.forEach(nav => {
      stageVisits[nav.to] = (stageVisits[nav.to] || 0) + 1;
    });
    
    let maxVisits = 0;
    let mostVisited = null;
    
    for (const [stage, visits] of Object.entries(stageVisits)) {
      if (visits > maxVisits) {
        maxVisits = visits;
        mostVisited = stage;
      }
    }
    
    return { stage: mostVisited, visits: maxVisits };
  }

  getAverageSearchResults() {
    if (this.userActions.searchQueries.length === 0) return 0;
    
    const totalResults = this.userActions.searchQueries.reduce((sum, query) => sum + query.results, 0);
    return totalResults / this.userActions.searchQueries.length;
  }

  getTopSearchTerms() {
    const terms = {};
    this.userActions.searchQueries.forEach(query => {
      const words = query.query.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          terms[word] = (terms[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(terms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));
  }

  getSearchSuccessRate() {
    if (this.userActions.searchQueries.length === 0) return 0;
    
    const successfulSearches = this.userActions.searchQueries.filter(query => query.results > 0).length;
    return successfulSearches / this.userActions.searchQueries.length;
  }

  calculateActiveTime() {
    const visibilityEvents = this.events.filter(e => 
      e.type === 'page_hidden' || e.type === 'page_visible'
    );
    
    // Simple approximation based on activity
    return Date.now() - this.startTime;
  }

  calculateBounceRate() {
    // Consider it a bounce if user doesn't expand any personas or navigate stages
    const hasEngaged = this.userActions.personaExpansions.size > 0 || 
                      this.userActions.stageNavigations.length > 0;
    return hasEngaged ? 0 : 1;
  }

  getConversionFunnel() {
    return {
      pageLoaded: 1,
      industrySelected: this.userActions.industryChanges.length > 0 ? 1 : 0,
      personaViewed: this.userActions.personaExpansions.size > 0 ? 1 : 0,
      stageNavigated: this.userActions.stageNavigations.length > 0 ? 1 : 0,
      searchPerformed: this.userActions.searchQueries.length > 0 ? 1 : 0,
      adminAccessed: this.userActions.adminActions.length > 0 ? 1 : 0
    };
  }

  getErrorCount() {
    return this.events.filter(e => 
      e.type === 'javascript_error' || e.type === 'promise_rejection'
    ).length;
  }

  getPerformanceInsights() {
    const perfEvents = this.events.filter(e => e.type === 'performance_metric');
    const insights = {};
    
    perfEvents.forEach(event => {
      if (!insights[event.metric]) {
        insights[event.metric] = [];
      }
      insights[event.metric].push(event.value);
    });
    
    // Calculate averages
    for (const [metric, values] of Object.entries(insights)) {
      if (Array.isArray(values) && values.length > 0) {
        insights[metric] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    }
    
    return insights;
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      memoryInfo: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576)
      } : null
    };
  }

  /**
   * Data management
   */
  storeData() {
    try {
      const data = {
        events: this.events.slice(-100), // Keep last 100 events
        userActions: this.userActions,
        sessionId: this.sessionId,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store analytics data:', error);
    }
  }

  loadStoredData() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Only load if from the same session or recent
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          this.events = data.events || [];
          this.userActions = { ...this.userActions, ...data.userActions };
        }
      }
    } catch (error) {
      console.warn('Failed to load stored analytics data:', error);
    }
  }

  syncStoredData() {
    // In a real implementation, this would sync with a server
    console.log('📊 Syncing analytics data...');
    this.storeData();
  }

  scheduleDataSync() {
    setInterval(() => {
      if (navigator.onLine) {
        this.syncStoredData();
      }
    }, this.config.sendInterval);
  }

  /**
   * Privacy and utility methods
   */
  sanitizeSearchQuery(query) {
    if (!this.config.privacyMode) return query;
    
    // Remove potential PII patterns
    return query
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
  }

  generateSessionId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateEventId() {
    return 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }

  updateLastActivity() {
    this.lastActivity = Date.now();
  }

  getStageTime(stageIndex) {
    const stageTimes = this.userActions.timeOnStage.get(stageIndex) || [];
    return stageTimes.length > 0 ? stageTimes[stageTimes.length - 1] : 0;
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

  /**
   * Export data for analysis
   */
  exportData() {
    return {
      insights: this.getInsights(),
      events: this.events,
      userActions: this.userActions,
      meta: {
        sessionId: this.sessionId,
        exportTime: Date.now(),
        version: '2.1.0'
      }
    };
  }

  /**
   * Clear all data
   */
  clearData() {
    this.events = [];
    this.userActions = {
      personaExpansions: new Map(),
      stageNavigations: [],
      searchQueries: [],
      timeOnStage: new Map(),
      industryChanges: [],
      adminActions: []
    };
    
    localStorage.removeItem(this.config.storageKey);
    console.log('📊 Analytics data cleared');
  }
}

// Export for use
window.AnalyticsManager = AnalyticsManager;