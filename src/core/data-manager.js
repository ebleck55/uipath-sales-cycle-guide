/**
 * Enhanced Data Management System
 * Optimized for scale with smart caching, lazy loading, and data synchronization
 */

class DataManager {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.observers = new Set();
    this.config = {
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
      maxCacheSize: 50, // Maximum number of cached items
      preloadThreshold: 3, // Preload when 3 or fewer items remaining
      retryAttempts: 3,
      retryDelay: 1000
    };
    
    this.setupStorageListener();
    this.initializeIndexedDB();
  }

  /**
   * Initialize IndexedDB for persistent storage
   */
  async initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('UiPathSalesGuide', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('personas')) {
          const personasStore = db.createObjectStore('personas', { keyPath: 'id' });
          personasStore.createIndex('industry', 'vertical', { unique: false });
          personasStore.createIndex('level', 'level', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('resources')) {
          const resourcesStore = db.createObjectStore('resources', { keyPath: 'id' });
          resourcesStore.createIndex('category', 'category', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('useCases')) {
          const useCasesStore = db.createObjectStore('useCases', { keyPath: 'id' });
          useCasesStore.createIndex('industry', 'vertical', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Load data with intelligent caching and retries
   */
  async loadData(key, loader, options = {}) {
    const cacheKey = this.getCacheKey(key, options);
    
    // Check memory cache first
    const cached = this.getFromCache(cacheKey);
    if (cached && !this.isCacheExpired(cached)) {
      this.notifyObservers('cache-hit', { key: cacheKey, data: cached.data });
      return cached.data;
    }
    
    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    
    // Load data with retry logic
    const loadPromise = this.loadWithRetry(loader, options.retryAttempts || this.config.retryAttempts);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const data = await loadPromise;
      
      // Cache the result
      await this.setCache(cacheKey, data, options.timeout);
      
      // Store in IndexedDB for persistence
      if (options.persist) {
        await this.persistToIndexedDB(key, data);
      }
      
      this.notifyObservers('data-loaded', { key: cacheKey, data });
      return data;
      
    } catch (error) {
      // Try to load from IndexedDB as fallback
      if (options.fallbackToDB) {
        const fallbackData = await this.loadFromIndexedDB(key);
        if (fallbackData) {
          this.notifyObservers('fallback-used', { key: cacheKey, data: fallbackData });
          return fallbackData;
        }
      }
      
      this.notifyObservers('load-error', { key: cacheKey, error });
      throw error;
      
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Load with retry logic
   */
  async loadWithRetry(loader, attempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await loader();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await this.delay(this.config.retryDelay * Math.pow(2, i));
      }
    }
  }

  /**
   * Load personas with optimizations
   */
  async loadPersonas(industry, options = {}) {
    const loader = async () => {
      // Try service worker cache first
      const cachedResponse = await this.fetchFromCache(`src/data/personas.json`);
      
      let personas;
      if (cachedResponse) {
        personas = await cachedResponse.json();
      } else {
        const response = await fetch('src/data/personas.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        personas = await response.json();
      }
      
      // Filter by industry if specified
      if (industry) {
        return personas.personas[industry] || [];
      }
      
      return personas;
    };

    return this.loadData(`personas-${industry}`, loader, {
      persist: true,
      fallbackToDB: true,
      timeout: 30 * 60 * 1000, // 30 minutes
      ...options
    });
  }

  /**
   * Load resources with lazy loading
   */
  async loadResources(category, page = 1, pageSize = 20) {
    const loader = async () => {
      const response = await fetch('src/data/resources.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // Filter and paginate
      let resources = data.resources || [];
      
      if (category) {
        resources = resources.filter(r => r.category === category);
      }
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        data: resources.slice(start, end),
        total: resources.length,
        page,
        pageSize,
        hasMore: end < resources.length
      };
    };

    return this.loadData(`resources-${category}-${page}`, loader, {
      persist: true,
      timeout: 15 * 60 * 1000 // 15 minutes
    });
  }

  /**
   * Load use cases with intelligent preloading
   */
  async loadUseCases(industry, options = {}) {
    const loader = async () => {
      const response = await fetch('src/data/use-cases.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      return data.useCases[industry] || [];
    };

    // Preload related industries
    if (options.preload) {
      this.preloadRelatedUseCases(industry);
    }

    return this.loadData(`use-cases-${industry}`, loader, {
      persist: true,
      fallbackToDB: true,
      timeout: 20 * 60 * 1000 // 20 minutes
    });
  }

  /**
   * Preload related use cases
   */
  async preloadRelatedUseCases(currentIndustry) {
    const relatedIndustries = this.getRelatedIndustries(currentIndustry);
    
    relatedIndustries.forEach(industry => {
      // Preload in background
      setTimeout(() => {
        this.loadUseCases(industry, { preload: false })
          .catch(error => console.warn(`Preload failed for ${industry}:`, error));
      }, 100);
    });
  }

  /**
   * Get related industries for preloading
   */
  getRelatedIndustries(industry) {
    const relations = {
      'banking': ['insurance', 'financial-services'],
      'insurance': ['banking', 'healthcare'],
      'healthcare': ['insurance', 'government'],
      'government': ['healthcare', 'education']
    };
    
    return relations[industry] || [];
  }

  /**
   * Search functionality with caching
   */
  async search(query, filters = {}, options = {}) {
    const searchKey = `search-${this.hashQuery(query, filters)}`;
    
    const loader = async () => {
      // Load all necessary data
      const [personas, resources, useCases] = await Promise.all([
        this.loadPersonas(filters.industry),
        this.loadResources(filters.category, 1, 100),
        this.loadUseCases(filters.industry)
      ]);

      // Perform search
      const results = this.performSearch(query, { personas, resources: resources.data, useCases }, filters);
      
      return {
        query,
        filters,
        results,
        timestamp: Date.now()
      };
    };

    return this.loadData(searchKey, loader, {
      timeout: 5 * 60 * 1000, // 5 minutes for search results
      ...options
    });
  }

  /**
   * Perform actual search logic
   */
  performSearch(query, data, filters) {
    const results = {
      personas: [],
      resources: [],
      useCases: [],
      total: 0
    };

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    // Search personas
    if (data.personas) {
      results.personas = data.personas.filter(persona => {
        const searchableText = [
          persona.title,
          persona.world,
          persona.cares,
          persona.help,
          ...(persona.tags?.primary || []),
          ...(persona.tags?.secondary || [])
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    // Search resources
    if (data.resources) {
      results.resources = data.resources.filter(resource => {
        const searchableText = [
          resource.name,
          resource.overview,
          resource.why,
          resource.category,
          ...(resource.tags?.primary || [])
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    // Search use cases
    if (data.useCases) {
      results.useCases = data.useCases.filter(useCase => {
        const searchableText = [
          useCase.name,
          useCase.description,
          useCase.businessValue,
          useCase.category
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    results.total = results.personas.length + results.resources.length + results.useCases.length;
    
    // Sort by relevance
    this.sortByRelevance(results, searchTerms);
    
    return results;
  }

  /**
   * Sort results by relevance
   */
  sortByRelevance(results, searchTerms) {
    const calculateScore = (item, textFields) => {
      const text = textFields.map(field => item[field] || '').join(' ').toLowerCase();
      let score = 0;
      
      searchTerms.forEach(term => {
        const matches = (text.match(new RegExp(term, 'g')) || []).length;
        score += matches;
        
        // Bonus for title matches
        if (item.title && item.title.toLowerCase().includes(term)) {
          score += 2;
        }
      });
      
      return score;
    };

    results.personas.sort((a, b) => 
      calculateScore(b, ['title', 'world', 'cares', 'help']) - 
      calculateScore(a, ['title', 'world', 'cares', 'help'])
    );

    results.resources.sort((a, b) => 
      calculateScore(b, ['name', 'overview', 'why']) - 
      calculateScore(a, ['name', 'overview', 'why'])
    );

    results.useCases.sort((a, b) => 
      calculateScore(b, ['name', 'description', 'businessValue']) - 
      calculateScore(a, ['name', 'description', 'businessValue'])
    );
  }

  /**
   * Cache management
   */
  setCache(key, data, timeout = this.config.cacheTimeout) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout
    });
  }

  getFromCache(key) {
    return this.cache.get(key);
  }

  isCacheExpired(cacheEntry) {
    return Date.now() - cacheEntry.timestamp > cacheEntry.timeout;
  }

  clearCache(pattern) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    this.notifyObservers('cache-cleared', { pattern });
  }

  /**
   * IndexedDB operations
   */
  async persistToIndexedDB(key, data) {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    await store.put({
      key,
      data,
      timestamp: Date.now()
    });
  }

  async loadFromIndexedDB(key) {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    const result = await store.get(key);
    
    return result?.data;
  }

  /**
   * Observer pattern for data changes
   */
  subscribe(observer) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      try {
        observer(event, data);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Utility methods
   */
  getCacheKey(key, options) {
    const optionsHash = this.hashObject(options);
    return `${key}-${optionsHash}`;
  }

  hashQuery(query, filters) {
    return this.hashObject({ query, ...filters });
  }

  hashObject(obj) {
    return btoa(JSON.stringify(obj)).slice(0, 8);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchFromCache(url) {
    if ('caches' in window) {
      const cache = await caches.open('data-v2.1.0');
      return await cache.match(url);
    }
    return null;
  }

  /**
   * Storage event listener for cross-tab synchronization
   */
  setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'uipath-data-sync') {
        const data = JSON.parse(event.newValue);
        this.notifyObservers('external-update', data);
      }
    });
  }

  /**
   * Sync data across tabs
   */
  broadcastUpdate(type, data) {
    localStorage.setItem('uipath-data-sync', JSON.stringify({
      type,
      data,
      timestamp: Date.now()
    }));
    
    // Clean up after broadcasting
    setTimeout(() => {
      localStorage.removeItem('uipath-data-sync');
    }, 1000);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      memoryCache: {
        size: this.cache.size,
        maxSize: this.config.maxCacheSize,
        items: Array.from(this.cache.keys())
      },
      loadingPromises: this.loadingPromises.size,
      observers: this.observers.size
    };

    return stats;
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.cache.clear();
    this.loadingPromises.clear();
    this.observers.clear();
    
    if (this.db) {
      this.db.close();
    }
  }
}

// Export for use
window.DataManager = DataManager;