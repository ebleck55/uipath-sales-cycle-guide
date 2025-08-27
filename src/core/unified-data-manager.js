/**
 * Unified Data Manager for UiPath Sales Guide
 * Single source of truth for all application data
 * Ensures admin changes sync immediately to frontend
 */

class UnifiedDataManager {
  constructor() {
    this.initialized = false;
    this.dataStore = {
      // Categories & Types (Admin-driven)
      categories: {
        industries: [
          { id: 'banking', label: 'Banking', enabled: true },
          { id: 'insurance', label: 'Insurance', enabled: true }
        ],
        linesOfBusiness: {
          banking: [
            { id: 'consumer-banking', label: 'Consumer Banking', enabled: true },
            { id: 'commercial-banking', label: 'Commercial Banking', enabled: true },
            { id: 'capital-markets', label: 'Capital Markets', enabled: true },
            { id: 'wealth-management', label: 'Wealth Management', enabled: true },
            { id: 'operations', label: 'Operations', enabled: true },
            { id: 'compliance-risk', label: 'Compliance & Risk', enabled: true },
            { id: 'payments', label: 'Payments', enabled: true },
            { id: 'lending', label: 'Lending', enabled: true },
            { id: 'trading', label: 'Trading Operations', enabled: true }
          ],
          insurance: [
            { id: 'property-casualty', label: 'Property & Casualty', enabled: true },
            { id: 'life-annuities', label: 'Life & Annuities', enabled: true },
            { id: 'health-insurance', label: 'Health Insurance', enabled: true },
            { id: 'commercial-lines', label: 'Commercial Lines', enabled: true },
            { id: 'claims', label: 'Claims Processing', enabled: true },
            { id: 'underwriting', label: 'Underwriting', enabled: true },
            { id: 'actuarial', label: 'Actuarial', enabled: true },
            { id: 'customer-service', label: 'Customer Service', enabled: true },
            { id: 'reinsurance', label: 'Reinsurance', enabled: true }
          ],
          general: [
            { id: 'operations', label: 'Operations', enabled: true },
            { id: 'finance', label: 'Finance', enabled: true },
            { id: 'hr', label: 'Human Resources', enabled: true },
            { id: 'procurement', label: 'Procurement', enabled: true },
            { id: 'customer-service', label: 'Customer Service', enabled: true },
            { id: 'it', label: 'Information Technology', enabled: true },
            { id: 'legal', label: 'Legal & Compliance', enabled: true },
            { id: 'marketing', label: 'Marketing', enabled: true },
            { id: 'sales', label: 'Sales', enabled: true }
          ]
        },
        personaLevels: [
          { id: 'c-suite', label: 'C-Suite Executive', enabled: true },
          { id: 'vp', label: 'Vice President', enabled: true },
          { id: 'director', label: 'Director', enabled: true },
          { id: 'manager', label: 'Manager', enabled: true },
          { id: 'analyst', label: 'Analyst', enabled: true },
          { id: 'specialist', label: 'Specialist', enabled: true }
        ],
        contentTypes: [
          { id: 'use-case', label: 'Use Case', enabled: true },
          { id: 'resource', label: 'Resource', enabled: true },
          { id: 'whitepaper', label: 'Whitepaper', enabled: true },
          { id: 'case-study', label: 'Case Study', enabled: true },
          { id: 'demo', label: 'Demo', enabled: true },
          { id: 'webinar', label: 'Webinar', enabled: true },
          { id: 'datasheet', label: 'Datasheet', enabled: true }
        ],
        tags: {
          painPoints: [
            { id: 'manual-processes', label: 'Manual Processes', color: '#ef4444' },
            { id: 'high-costs', label: 'High Costs', color: '#f97316' },
            { id: 'compliance-risk', label: 'Compliance Risk', color: '#eab308' },
            { id: 'customer-experience', label: 'Customer Experience', color: '#22c55e' },
            { id: 'operational-risk', label: 'Operational Risk', color: '#8b5cf6' },
            { id: 'scalability', label: 'Scalability Issues', color: '#06b6d4' }
          ],
          outcomes: [
            { id: 'cost-reduction', label: 'Cost Reduction', color: '#10b981' },
            { id: 'efficiency-gains', label: 'Efficiency Gains', color: '#3b82f6' },
            { id: 'risk-mitigation', label: 'Risk Mitigation', color: '#6366f1' },
            { id: 'compliance-improvement', label: 'Compliance Improvement', color: '#8b5cf6' },
            { id: 'customer-satisfaction', label: 'Customer Satisfaction', color: '#ec4899' },
            { id: 'revenue-growth', label: 'Revenue Growth', color: '#f59e0b' }
          ],
          technologies: [
            { id: 'ai-agents', label: 'AI Agents', color: '#3b82f6' },
            { id: 'rpa', label: 'RPA', color: '#10b981' },
            { id: 'document-ai', label: 'Document AI', color: '#8b5cf6' },
            { id: 'process-mining', label: 'Process Mining', color: '#f59e0b' },
            { id: 'test-automation', label: 'Test Automation', color: '#06b6d4' }
          ]
        }
      },
      
      // Application content (Admin-managed)
      personas: new Map(),
      resources: new Map(),
      useCases: new Map(),
      salesStages: new Map(),
      
      // Application state
      currentIndustry: 'banking',
      currentLOB: '',
      
      // Metadata
      lastModified: Date.now(),
      version: '2.0.0'  // Increment to invalidate old cached data
    };
    
    this.subscribers = new Set();
    this.initialized = false;
    
    this.init();
  }

  /**
   * Initialize the data manager
   */
  async init() {
    if (this.initialized) return;
    
    try {
      console.log('🗄️ Initializing Unified Data Manager...');
      
      // Load existing data from various sources
      await this.loadExistingData();
      
      // Setup auto-sync
      this.setupAutoSync();
      
      // Setup storage persistence
      this.setupPersistence();
      
      this.initialized = true;
      console.log('✅ Unified Data Manager initialized');
      
      // Notify subscribers
      this.notifySubscribers('initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Unified Data Manager:', error);
      throw error;
    }
  }

  /**
   * Load existing data from all sources
   */
  async loadExistingData() {
    try {
      // Load from localStorage if available
      const stored = localStorage.getItem('uipath-unified-data');
      if (stored) {
        const data = JSON.parse(stored);
        // Temporarily force fresh load to clear any corrupted localStorage data
        if (false && this.isValidDataStructure(data) && data.version === this.dataStore.version) {
          // Merge data while preserving Map objects
          Object.keys(data).forEach(key => {
            if (key === 'personas' || key === 'resources' || key === 'useCases' || key === 'salesStages') {
              // Convert stored arrays back to Maps
              if (Array.isArray(data[key]) && data[key].length > 0 && Array.isArray(data[key][0]) && data[key][0].length === 2) {
                // This looks like Map entries: [[key, value], [key, value], ...]
                this.dataStore[key] = new Map(data[key]);
                console.log(`📦 Restored ${key} Map with ${this.dataStore[key].size} entries from localStorage`);
              } else if (data[key] && typeof data[key] === 'object') {
                this.dataStore[key] = new Map(Object.entries(data[key]));
                console.log(`📦 Converted ${key} object to Map with ${this.dataStore[key].size} entries from localStorage`);
              }
            } else {
              this.dataStore[key] = data[key];
            }
          });
          console.log('📦 Loaded data from localStorage');
        } else {
          // Clear old/incompatible cached data
          localStorage.removeItem('uipath-unified-data');
          console.log('🗑️ Cleared outdated cached data');
        }
      }
      
      // Load hardcoded personas from data.js if available
      if (typeof SALES_CYCLE_DATA !== 'undefined') {
        await this.migrateFromLegacyData(SALES_CYCLE_DATA);
      }
      
      // Load admin data files if available
      await this.loadAdminData();
      
    } catch (error) {
      console.warn('Warning loading existing data:', error);
    }
  }

  /**
   * Migrate data from legacy SALES_CYCLE_DATA format
   */
  async migrateFromLegacyData(legacyData) {
    if (!legacyData.personas) return;
    
    console.log('🔄 Migrating legacy persona data...');
    
    Object.entries(legacyData.personas).forEach(([industry, personas]) => {
      personas.forEach((persona, index) => {
        const personaId = `${industry}-${index}`;
        const standardizedPersona = {
          id: personaId,
          title: persona.title,
          industry: industry,
          lob: this.inferLOBFromTitle(persona.title, industry),
          level: this.inferLevelFromTitle(persona.title),
          description: persona.world || persona.description || '',
          priorities: persona.cares ? [persona.cares] : [],
          painPoints: this.extractPainPoints(persona.world || ''),
          interests: [],
          useCase: persona.help || '',
          outcomesBenefits: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          source: 'legacy_migration'
        };
        
        this.dataStore.personas.set(personaId, standardizedPersona);
      });
    });
    
    console.log(`✅ Migrated ${this.dataStore.personas.size} personas`);
  }

  /**
   * Load admin-managed data files
   */
  async loadAdminData() {
    try {
      // Try to load from admin data directory
      const dataFiles = ['personas.json', 'resources.json', 'use-cases.json'];
      
      for (const file of dataFiles) {
        try {
          const response = await fetch(`../../src/data/${file}`);
          if (response.ok) {
            const data = await response.json();
            this.mergeAdminData(file, data);
          }
        } catch (error) {
          console.log(`Info: ${file} not found, using defaults`);
        }
      }
      
    } catch (error) {
      console.log('Info: Admin data directory not accessible, using defaults');
    }
  }

  /**
   * Merge admin data files into the data store
   */
  mergeAdminData(filename, data) {
    console.log(`📥 Loading ${filename}...`);
    
    switch (filename) {
      case 'personas.json':
        if (data.personas) {
          Object.entries(data.personas).forEach(([industry, personas]) => {
            personas.forEach((persona, index) => {
              const personaId = `${industry}-${index}`;
              // Extract the first LOB from the lob array, or use the industry as fallback
              const primaryLob = Array.isArray(persona.lob) && persona.lob.length > 0 
                ? (persona.lob[0] === 'all' ? '' : persona.lob[0])
                : '';
              
              this.dataStore.personas.set(personaId, {
                ...persona,
                id: personaId,
                industry,
                lob: primaryLob,
                enabled: true
              });
            });
          });
          console.log(`✅ Loaded ${this.dataStore.personas.size} personas`);
        }
        break;
        
      case 'resources.json':
        if (data.resources) {
          Object.entries(data.resources).forEach(([industry, lobResources]) => {
            Object.entries(lobResources).forEach(([lob, resources]) => {
              resources.forEach((resource, index) => {
                const resourceId = `${industry}-${lob}-${index}`;
                this.dataStore.resources.set(resourceId, {
                  ...resource,
                  id: resourceId,
                  industry,
                  lob,
                  enabled: true
                });
              });
            });
          });
          console.log(`✅ Loaded ${this.dataStore.resources.size} resources`);
        }
        break;
        
      case 'use-cases.json':
        if (data.useCases) {
          Object.entries(data.useCases).forEach(([industry, lobUseCases]) => {
            Object.entries(lobUseCases).forEach(([lob, useCases]) => {
              useCases.forEach((useCase, index) => {
                const useCaseId = `${industry}-${lob}-${index}`;
                this.dataStore.useCases.set(useCaseId, {
                  ...useCase,
                  id: useCaseId,
                  industry,
                  lob,
                  enabled: true
                });
              });
            });
          });
          console.log(`✅ Loaded ${this.dataStore.useCases.size} use cases`);
        }
        break;
        
      default:
        console.warn(`Unknown data file: ${filename}`);
    }
  }

  /**
   * Get categories for dropdowns (admin-driven)
   */
  getCategories() {
    return {
      industries: this.dataStore.categories.industries.filter(i => i.enabled),
      linesOfBusiness: this.dataStore.categories.linesOfBusiness,
      personaLevels: this.dataStore.categories.personaLevels.filter(l => l.enabled),
      contentTypes: this.dataStore.categories.contentTypes.filter(t => t.enabled),
      tags: this.dataStore.categories.tags
    };
  }

  /**
   * Get LOBs for specific industry
   */
  getLOBsForIndustry(industryId) {
    const lobs = this.dataStore.categories.linesOfBusiness[industryId] || [];
    return lobs.filter(lob => lob.enabled);
  }

  /**
   * Update categories (admin function)
   */
  updateCategories(categoryType, updates) {
    if (!this.dataStore.categories[categoryType]) {
      throw new Error(`Invalid category type: ${categoryType}`);
    }
    
    this.dataStore.categories[categoryType] = updates;
    this.dataStore.lastModified = Date.now();
    
    // Persist changes
    this.persistData();
    
    // Notify subscribers
    this.notifySubscribers('categories_updated', { categoryType, updates });
    
    console.log(`📝 Updated ${categoryType} categories`);
  }

  /**
   * Add new industry
   */
  addIndustry(industry) {
    const newIndustry = {
      id: industry.id || this.generateId(),
      label: industry.label,
      enabled: industry.enabled !== false
    };
    
    this.dataStore.categories.industries.push(newIndustry);
    
    // Initialize empty LOB array for new industry
    if (!this.dataStore.categories.linesOfBusiness[newIndustry.id]) {
      this.dataStore.categories.linesOfBusiness[newIndustry.id] = [];
    }
    
    this.dataStore.lastModified = Date.now();
    this.persistData();
    this.notifySubscribers('industry_added', newIndustry);
    
    return newIndustry;
  }

  /**
   * Add new LOB to industry
   */
  addLOBToIndustry(industryId, lob) {
    if (!this.dataStore.categories.linesOfBusiness[industryId]) {
      this.dataStore.categories.linesOfBusiness[industryId] = [];
    }
    
    const newLOB = {
      id: lob.id || this.generateId(),
      label: lob.label,
      enabled: lob.enabled !== false
    };
    
    this.dataStore.categories.linesOfBusiness[industryId].push(newLOB);
    this.dataStore.lastModified = Date.now();
    this.persistData();
    this.notifySubscribers('lob_added', { industryId, lob: newLOB });
    
    return newLOB;
  }

  /**
   * Get personas with filtering
   */
  getPersonas(filters = {}) {
    let personas = Array.from(this.dataStore.personas.values());
    
    if (filters.industry) {
      personas = personas.filter(p => p.industry === filters.industry);
    }
    
    if (filters.lob) {
      personas = personas.filter(p => p.lob === filters.lob);
    }
    
    if (filters.level) {
      personas = personas.filter(p => p.level === filters.level);
    }
    
    return personas;
  }

  /**
   * Get use cases with filtering
   */
  getUseCases(filters = {}) {
    let useCases = Array.from(this.dataStore.useCases.values());
    
    if (filters.industry) {
      useCases = useCases.filter(uc => uc.industry === filters.industry);
    }
    
    if (filters.lob) {
      useCases = useCases.filter(uc => uc.lob === filters.lob);
    }
    
    return useCases;
  }

  /**
   * Get resources with filtering
   */
  getResources(filters = {}) {
    let resources = Array.from(this.dataStore.resources.values());
    
    if (filters.industry) {
      resources = resources.filter(r => r.industry === filters.industry);
    }
    
    if (filters.lob) {
      resources = resources.filter(r => r.lob === filters.lob);
    }
    
    return resources;
  }

  /**
   * Add or update persona
   */
  savePersona(persona) {
    const personaId = persona.id || this.generateId();
    const timestamp = Date.now();
    
    const savedPersona = {
      ...persona,
      id: personaId,
      updatedAt: timestamp,
      createdAt: persona.createdAt || timestamp
    };
    
    this.dataStore.personas.set(personaId, savedPersona);
    this.dataStore.lastModified = timestamp;
    
    this.persistData();
    this.notifySubscribers('persona_saved', savedPersona);
    
    return savedPersona;
  }

  /**
   * Delete persona
   */
  deletePersona(personaId) {
    const persona = this.dataStore.personas.get(personaId);
    if (!persona) return false;
    
    this.dataStore.personas.delete(personaId);
    this.dataStore.lastModified = Date.now();
    
    this.persistData();
    this.notifySubscribers('persona_deleted', { id: personaId, persona });
    
    return true;
  }

  /**
   * Subscribe to data changes
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of changes
   */
  notifySubscribers(eventType, data = {}) {
    this.subscribers.forEach(callback => {
      try {
        callback({ type: eventType, data, timestamp: Date.now() });
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Setup auto-sync with admin panel
   */
  setupAutoSync() {
    // Listen for admin panel messages
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      
      const { type, data } = event.data || {};
      
      switch (type) {
        case 'admin:data-changed':
          this.handleAdminDataChange(data);
          break;
        case 'admin:categories-updated':
          this.handleCategoriesUpdate(data);
          break;
        case 'admin:persona-saved':
          this.handlePersonaUpdate(data);
          break;
      }
    });

    // Auto-save every 30 seconds if there are changes
    setInterval(() => {
      this.persistData();
    }, 30000);
  }

  /**
   * Handle admin data changes
   */
  handleAdminDataChange(data) {
    console.log('🔄 Received admin data change:', data);
    
    // Reload affected data
    if (data.type === 'categories') {
      this.loadCategories();
    } else if (data.type === 'personas') {
      this.loadPersonas();
    }
    
    // Notify frontend to refresh
    this.notifySubscribers('admin_data_changed', data);
  }

  /**
   * Setup persistence
   */
  setupPersistence() {
    // Save to localStorage
    this.persistData();
    
    // Setup before unload save
    window.addEventListener('beforeunload', () => {
      this.persistData();
    });
  }

  /**
   * Force refresh data (clear cache and reload)
   */
  async forceRefresh() {
    console.log('🔄 Force refreshing data...');
    
    // Clear cached data
    localStorage.removeItem('uipath-unified-data');
    
    // Reset data store to defaults
    this.initialized = false;
    this.dataStore = {
      // Reset to default structure...
      categories: {
        industries: [
          { id: 'banking', label: 'Banking', enabled: true },
          { id: 'insurance', label: 'Insurance', enabled: true },
          { id: 'corporate', label: 'Corporate', enabled: true }
        ],
        linesOfBusiness: {
          banking: [
            { id: 'consumer-banking', label: 'Consumer Banking', enabled: true },
            { id: 'commercial-banking', label: 'Commercial Banking', enabled: true },
            { id: 'capital-markets', label: 'Capital Markets', enabled: true },
            { id: 'wealth-management', label: 'Wealth Management', enabled: true },
            { id: 'operations', label: 'Operations', enabled: true },
            { id: 'compliance-risk', label: 'Compliance & Risk', enabled: true },
            { id: 'payments', label: 'Payments', enabled: true },
            { id: 'lending', label: 'Lending', enabled: true },
            { id: 'trading', label: 'Trading Operations', enabled: true }
          ],
          // ... other industries
        }
      }
    };
    
    // Re-initialize
    await this.init();
    
    // Notify subscribers
    this.notifySubscribers('force_refresh', {});
    
    console.log('✅ Data refreshed successfully');
  }

  /**
   * Persist data to localStorage
   */
  persistData() {
    try {
      const dataToSave = {
        categories: this.dataStore.categories,
        personas: Array.from(this.dataStore.personas.entries()),
        resources: Array.from(this.dataStore.resources.entries()),
        useCases: Array.from(this.dataStore.useCases.entries()),
        salesStages: Array.from(this.dataStore.salesStages.entries()),
        currentIndustry: this.dataStore.currentIndustry,
        currentLOB: this.dataStore.currentLOB,
        lastModified: this.dataStore.lastModified,
        version: this.dataStore.version
      };
      
      localStorage.setItem('uipath-unified-data', JSON.stringify(dataToSave));
      console.log('💾 Data persisted to localStorage');
      
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      categories: this.dataStore.categories,
      personas: Array.from(this.dataStore.personas.entries()),
      resources: Array.from(this.dataStore.resources.entries()),
      useCases: Array.from(this.dataStore.useCases.entries()),
      metadata: {
        lastModified: this.dataStore.lastModified,
        version: this.dataStore.version,
        exportedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Import data
   */
  importData(importedData) {
    try {
      if (importedData.categories) {
        this.dataStore.categories = importedData.categories;
      }
      
      if (importedData.personas) {
        this.dataStore.personas = new Map(importedData.personas);
      }
      
      if (importedData.resources) {
        this.dataStore.resources = new Map(importedData.resources);
      }
      
      if (importedData.useCases) {
        this.dataStore.useCases = new Map(importedData.useCases);
      }
      
      this.dataStore.lastModified = Date.now();
      this.persistData();
      this.notifySubscribers('data_imported', importedData);
      
      console.log('✅ Data imported successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      return false;
    }
  }

  // Utility methods
  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  inferLOBFromTitle(title, industry) {
    const titleLower = title.toLowerCase();
    const lobMap = this.dataStore.categories.linesOfBusiness[industry] || [];
    
    for (const lob of lobMap) {
      if (titleLower.includes(lob.id.replace('-', ' ')) || titleLower.includes(lob.label.toLowerCase())) {
        return lob.id;
      }
    }
    
    return '';
  }

  inferLevelFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('chief') || titleLower.includes('cio') || titleLower.includes('cto') || titleLower.includes('coo')) {
      return 'c-suite';
    } else if (titleLower.includes('head of') || titleLower.includes('vp') || titleLower.includes('vice president')) {
      return 'vp';
    } else if (titleLower.includes('director')) {
      return 'director';
    } else if (titleLower.includes('manager')) {
      return 'manager';
    }
    
    return 'specialist';
  }

  extractPainPoints(text) {
    const commonPainPoints = [
      'manual processes', 'high costs', 'compliance risk', 
      'operational risk', 'customer experience', 'scalability'
    ];
    
    const textLower = text.toLowerCase();
    return commonPainPoints.filter(painPoint => textLower.includes(painPoint));
  }

  isValidDataStructure(data) {
    return data && typeof data === 'object' && data.categories && data.lastModified;
  }
}

// Export for ES6 modules
export default UnifiedDataManager;
export { UnifiedDataManager };

// Make available globally
if (typeof window !== 'undefined') {
  window.UnifiedDataManager = UnifiedDataManager;
}