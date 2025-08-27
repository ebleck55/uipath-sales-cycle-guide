/**
 * Analytics Service
 * Centralized analytics and tracking for the application
 */

class AnalyticsService {
  constructor() {
    this.sessionId = null;
    this.sessionStart = null;
    this.events = [];
    this.initialized = false;
  }

  /**
   * Initialize analytics service
   */
  initialize() {
    if (this.initialized) return;
    
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.loadStoredEvents();
    this.exposeGlobalInterface();
    this.initialized = true;
    
    console.log('Analytics service initialized');
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Load stored events from localStorage
   */
  loadStoredEvents() {
    try {
      const stored = localStorage.getItem('site_analytics_events');
      this.events = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
      this.events = [];
    }
  }

  /**
   * Store events to localStorage
   */
  storeEvents() {
    try {
      // Keep only last 1000 events to prevent localStorage overflow
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }
      localStorage.setItem('site_analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to store analytics events:', error);
    }
  }

  /**
   * Track a generic event
   */
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
    
    // Debug logging
    if (window.location.search.includes('debug=analytics')) {
      console.log('Analytics Event:', event);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page, additionalData = {}) {
    this.trackEvent('page_view', {
      page: page,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element, action, additionalData = {}) {
    this.trackEvent('user_interaction', {
      element: element,
      action: action,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track link click
   */
  trackLinkClick(url, linkType = 'external', additionalData = {}) {
    this.trackEvent('link_click', {
      url: url,
      linkType: linkType,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track prompt submission with detailed analysis
   */
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

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature, action, additionalData = {}) {
    this.trackEvent('feature_usage', {
      feature: feature,
      action: action,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Get events filtered by time period
   */
  getEvents(timePeriod = 'all') {
    if (timePeriod === 'all') {
      return this.events;
    }
    
    const now = new Date();
    let cutoff;
    
    switch (timePeriod) {
      case '24h':
        cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      case '7d':
        cutoff = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '30d':
        cutoff = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        return this.events;
    }
    
    return this.events.filter(event => new Date(event.timestamp) >= cutoff);
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(timePeriod = '7d') {
    const events = this.getEvents(timePeriod);
    const summary = {
      totalEvents: events.length,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      pageViews: events.filter(e => e.type === 'page_view').length,
      interactions: events.filter(e => e.type === 'user_interaction').length,
      linkClicks: events.filter(e => e.type === 'link_click').length,
      promptSubmissions: events.filter(e => e.type === 'prompt_submission').length,
      featureUsage: events.filter(e => e.type === 'feature_usage').length
    };
    
    return summary;
  }

  /**
   * Get prompt analytics
   */
  getPromptAnalytics(timePeriod = '7d') {
    const promptEvents = this.getEvents(timePeriod).filter(e => e.type === 'prompt_submission');
    
    const contextCounts = {};
    const qualityCounts = { weak: 0, moderate: 0, strong: 0 };
    const keywords = {};
    
    promptEvents.forEach(event => {
      // Context distribution
      contextCounts[event.data.context] = (contextCounts[event.data.context] || 0) + 1;
      
      // Quality distribution
      if (event.data.responseQuality) {
        qualityCounts[event.data.responseQuality] = (qualityCounts[event.data.responseQuality] || 0) + 1;
      }
      
      // Keyword extraction
      if (event.data.keywords && Array.isArray(event.data.keywords)) {
        event.data.keywords.forEach(keyword => {
          keywords[keyword] = (keywords[keyword] || 0) + 1;
        });
      }
    });
    
    return {
      totalPrompts: promptEvents.length,
      contextDistribution: contextCounts,
      qualityDistribution: qualityCounts,
      topKeywords: Object.entries(keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20),
      recentPrompts: promptEvents
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    };
  }

  /**
   * Export analytics data
   */
  exportData(format = 'json', timePeriod = 'all') {
    const events = this.getEvents(timePeriod);
    const exportData = {
      exportDate: new Date().toISOString(),
      timePeriod: timePeriod,
      sessionInfo: {
        sessionId: this.sessionId,
        sessionStart: this.sessionStart,
        totalEvents: events.length
      },
      events: events
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export for events
      const headers = ['timestamp', 'type', 'sessionId', 'data'];
      const rows = events.map(event => [
        event.timestamp,
        event.type,
        event.sessionId,
        JSON.stringify(event.data)
      ]);
      
      return [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
    }
    
    return exportData;
  }

  /**
   * Clear all analytics data
   */
  clearData() {
    this.events = [];
    localStorage.removeItem('site_analytics_events');
  }

  /**
   * Expose global interface for external components
   */
  exposeGlobalInterface() {
    if (typeof window !== 'undefined') {
      window.siteAnalytics = {
        trackEvent: this.trackEvent.bind(this),
        trackPageView: this.trackPageView.bind(this),
        trackInteraction: this.trackInteraction.bind(this),
        trackLinkClick: this.trackLinkClick.bind(this),
        trackPrompt: this.trackPrompt.bind(this),
        trackFeatureUsage: this.trackFeatureUsage.bind(this),
        getEvents: this.getEvents.bind(this),
        getSummary: this.getAnalyticsSummary.bind(this),
        getPromptAnalytics: this.getPromptAnalytics.bind(this),
        exportData: this.exportData.bind(this),
        clearData: this.clearData.bind(this)
      };
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;