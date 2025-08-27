/**
 * Performance Optimization Module
 * Handles lazy loading, caching, and performance monitoring
 */

class PerformanceManager {
  constructor() {
    this.cache = new Map();
    this.observers = {
      intersection: null,
      performance: null
    };
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0
    };
    this.config = null;
    this.initialized = false;
  }

  /**
   * Initialize the performance manager with configuration
   * @param {Object} config - Configuration from app config
   */
  async init(config = {}) {
    if (this.initialized) return;
    
    this.config = config;
    this.initializeObservers();
    this.setupPerformanceMonitoring();
    this.setupCaching();
    this.initialized = true;
    
    console.log('⚡ Performance Manager initialized');
  }

  /**
   * Start monitoring performance (alias for setupPerformanceMonitoring)
   */
  startMonitoring() {
    if (this.initialized) {
      // Already started during init, but can restart if needed
      this.setupPerformanceMonitoring();
    } else {
      console.warn('⚠️ Performance Manager not initialized yet');
    }
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  initializeObservers() {
    // Lazy loading observer
    if ('IntersectionObserver' in window) {
      this.observers.intersection = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        { 
          rootMargin: '100px',
          threshold: 0.1
        }
      );
    }

    // Performance observer
    if ('PerformanceObserver' in window) {
      this.observers.performance = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
          }
          if (entry.entryType === 'measure') {
            this.metrics.renderTime = entry.duration;
          }
        }
      });
      
      this.observers.performance.observe({
        entryTypes: ['navigation', 'measure', 'paint']
      });
    }
  }

  /**
   * Handle intersection observer entries for lazy loading
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Lazy load images
        if (element.tagName === 'IMG' && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
          this.observers.intersection.unobserve(element);
        }
        
        // Lazy load content sections
        if (element.classList.contains('lazy-content')) {
          this.loadContentSection(element);
          this.observers.intersection.unobserve(element);
        }
      }
    });
  }

  /**
   * Load content section on demand
   */
  async loadContentSection(element) {
    const sectionId = element.dataset.section;
    const startTime = performance.now();
    
    try {
      // Check cache first
      if (this.cache.has(sectionId)) {
        element.innerHTML = this.cache.get(sectionId);
        element.classList.remove('lazy-content');
        return;
      }
      
      // Load content based on section type
      let content = '';
      switch (sectionId) {
        case 'personas':
          content = await this.loadPersonasContent();
          break;
        case 'use-cases':
          content = await this.loadUseCasesContent();
          break;
        case 'resources':
          content = await this.loadResourcesContent();
          break;
        default:
          console.warn(`Unknown section: ${sectionId}`);
          return;
      }
      
      // Cache and render
      this.cache.set(sectionId, content);
      element.innerHTML = content;
      element.classList.remove('lazy-content');
      
      // Trigger any necessary post-render setup
      this.triggerPostRender(element, sectionId);
      
      const loadTime = performance.now() - startTime;
      console.log(`Lazy loaded ${sectionId} in ${loadTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error(`Failed to lazy load ${sectionId}:`, error);
      element.innerHTML = `<p class="text-red-500">Failed to load content. <button onclick="location.reload()">Retry</button></p>`;
    }
  }

  /**
   * Load personas content on demand
   */
  async loadPersonasContent() {
    // This will be called by the main app when needed
    return '<div class="personas-placeholder">Loading personas...</div>';
  }

  /**
   * Load use cases content on demand
   */
  async loadUseCasesContent() {
    return '<div class="use-cases-placeholder">Loading use cases...</div>';
  }

  /**
   * Load resources content on demand
   */
  async loadResourcesContent() {
    return '<div class="resources-placeholder">Loading resources...</div>';
  }

  /**
   * Trigger post-render setup for dynamically loaded content
   */
  triggerPostRender(element, sectionId) {
    // Dispatch custom event for the main app to handle
    const event = new CustomEvent('contentLoaded', {
      detail: { element, sectionId }
    });
    document.dispatchEvent(event);
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.measureCLS();
    this.measureFID();
    this.measureLCP();
    
    // Custom metrics
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
    });
  }

  /**
   * Setup caching based on configuration
   */
  setupCaching() {
    const cacheConfig = this.config?.cache || {};
    
    this.cacheSettings = {
      maxSize: cacheConfig.maxSize || 50,
      ttl: cacheConfig.ttl || 15 * 60 * 1000, // 15 minutes
      version: cacheConfig.version || '1.0.0',
      prefix: cacheConfig.prefix || 'perf-cache-'
    };

    // Clear cache if version changed
    const storedVersion = localStorage.getItem(`${this.cacheSettings.prefix}version`);
    if (storedVersion !== this.cacheSettings.version) {
      this.clearCache();
      localStorage.setItem(`${this.cacheSettings.prefix}version`, this.cacheSettings.version);
    }

    // Setup cache cleanup interval
    setInterval(() => this.cleanupExpiredCache(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clear all cached content
   */
  clearCache() {
    this.cache.clear();
    
    // Clear localStorage cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.cacheSettings.prefix)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Performance cache cleared');
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp && now - value.timestamp > this.cacheSettings.ttl) {
        this.cache.delete(key);
      }
    }
    
    // Limit cache size
    if (this.cache.size > this.cacheSettings.maxSize) {
      const entriesToRemove = this.cache.size - this.cacheSettings.maxSize;
      let removed = 0;
      
      for (const key of this.cache.keys()) {
        if (removed >= entriesToRemove) break;
        this.cache.delete(key);
        removed++;
      }
    }
  }

  /**
   * Measure Cumulative Layout Shift
   */
  measureCLS() {
    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsEntries.push(entry);
          clsValue += entry.value;
        }
      }
    });

    observer.observe({entryTypes: ['layout-shift']});
    
    // Log CLS after 5 seconds
    setTimeout(() => {
      console.log('Cumulative Layout Shift:', clsValue);
    }, 5000);
  }

  /**
   * Measure First Input Delay
   */
  measureFID() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const FID = entry.processingStart - entry.startTime;
        console.log('First Input Delay:', FID);
      }
    });

    observer.observe({entryTypes: ['first-input']});
  }

  /**
   * Measure Largest Contentful Paint
   */
  measureLCP() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('Largest Contentful Paint:', lastEntry.startTime);
    });

    observer.observe({entryTypes: ['largest-contentful-paint']});
  }

  /**
   * Cache management
   */
  clearCache() {
    this.cache.clear();
    console.log('Performance cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of cache
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2; // 2 bytes per character
      totalSize += value.length * 2;
    }
    return Math.round(totalSize / 1024) + ' KB';
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      'src/data/personas.json',
      'js/data.js',
      'css/styles.css'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.js') ? 'script' : 
                resource.endsWith('.css') ? 'style' : 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Debounce function for performance optimization
   */
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cache: this.getCacheStats(),
      timing: performance.timing,
      navigation: performance.navigation
    };
  }
}

// ES6 Module Export
export { PerformanceManager };
export default PerformanceManager;

// Also make available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.PerformanceManager = PerformanceManager;
}