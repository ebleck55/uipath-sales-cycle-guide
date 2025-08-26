/**
 * Application State Management
 * Centralized state management with event-driven updates
 */

class AppState {
  constructor() {
    this.state = {
      // UI state
      currentIndustry: 'banking',
      adminMode: false,
      loading: false,
      
      // Data state
      personas: [],
      stages: [],
      
      // Form state (session-only, not persisted)
      checkboxes: new Map(),
      notes: new Map(),
      
      // AI state
      aiEnabled: false,
      apiKeyConfigured: false,
      
      // Navigation state
      activeSection: null,
      collapsedSections: new Set()
    };
    
    this.listeners = new Map();
    this.middleware = [];
    
    // Initialize from data
    this.initializeFromData();
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Get state value
   * @param {string} key - State key
   * @returns {*} State value
   */
  get(key) {
    const keys = key.split('.');
    let value = this.state;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value;
  }

  /**
   * Set state value
   * @param {string} key - State key
   * @param {*} value - New value
   * @param {boolean} notify - Whether to notify listeners (default: true)
   */
  set(key, value, notify = true) {
    const oldValue = this.get(key);
    
    // Apply middleware
    for (const middleware of this.middleware) {
      const result = middleware(key, value, oldValue);
      if (result !== undefined) {
        value = result;
      }
    }
    
    // Set value
    const keys = key.split('.');
    let current = this.state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Notify listeners
    if (notify) {
      this.notifyListeners(key, value, oldValue);
    }
  }

  /**
   * Update state with partial object
   * @param {Object} updates - State updates
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value, false);
    });
    
    // Notify all listeners at once
    Object.keys(updates).forEach(key => {
      this.notifyListeners(key, this.get(key));
    });
  }

  /**
   * Add middleware for state changes
   * @param {Function} middleware - Middleware function
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Notify listeners of state changes
   * @param {string} key - Changed key
   * @param {*} newValue - New value
   * @param {*} oldValue - Old value
   */
  notifyListeners(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  }

  /**
   * Initialize state from data
   */
  async initializeFromData() {
    try {
      // Import data dynamically to avoid dependency issues
      const { SALES_CYCLE_DATA } = await import('../../js/data.js');
      
      this.set('personas', SALES_CYCLE_DATA.personas);
      this.set('stages', SALES_CYCLE_DATA.stages);
      this.set('currentIndustry', SALES_CYCLE_DATA.industry);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  /**
   * Toggle checkbox state
   * @param {string} checkboxId - Checkbox identifier
   * @param {boolean} checked - Checked state
   */
  toggleCheckbox(checkboxId, checked) {
    const checkboxes = new Map(this.get('checkboxes'));
    checkboxes.set(checkboxId, checked);
    this.set('checkboxes', checkboxes);
  }

  /**
   * Update note content
   * @param {string} noteId - Note identifier
   * @param {string} content - Note content
   */
  updateNote(noteId, content) {
    const notes = new Map(this.get('notes'));
    notes.set(noteId, content);
    this.set('notes', notes);
  }

  /**
   * Clear all form state
   */
  clearFormState() {
    this.set('checkboxes', new Map());
    this.set('notes', new Map());
  }

  /**
   * Toggle section collapse state
   * @param {string} sectionId - Section identifier
   * @param {boolean} collapsed - Collapsed state
   */
  toggleSection(sectionId, collapsed) {
    const collapsedSections = new Set(this.get('collapsedSections'));
    
    if (collapsed) {
      collapsedSections.add(sectionId);
    } else {
      collapsedSections.delete(sectionId);
    }
    
    this.set('collapsedSections', collapsedSections);
  }

  /**
   * Switch industry
   * @param {string} industry - Industry identifier
   */
  switchIndustry(industry) {
    if (['banking', 'insurance'].includes(industry)) {
      this.set('currentIndustry', industry);
    }
  }

  /**
   * Toggle admin mode
   * @param {boolean} enabled - Admin mode state
   */
  toggleAdminMode(enabled) {
    this.set('adminMode', enabled);
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading(loading) {
    this.set('loading', loading);
  }

  /**
   * Set AI configuration
   * @param {boolean} enabled - AI enabled state
   * @param {boolean} apiKeyConfigured - API key configured state
   */
  setAIConfig(enabled, apiKeyConfigured) {
    this.update({
      aiEnabled: enabled,
      apiKeyConfigured: apiKeyConfigured
    });
  }

  /**
   * Get current form state
   * @returns {Object} Form state summary
   */
  getFormState() {
    const checkboxes = this.get('checkboxes');
    const notes = this.get('notes');
    
    return {
      totalCheckboxes: checkboxes.size,
      checkedCount: Array.from(checkboxes.values()).filter(Boolean).length,
      totalNotes: notes.size,
      notesWithContent: Array.from(notes.values()).filter(content => content.trim()).length
    };
  }

  /**
   * Export current state (for debugging)
   * @returns {Object} Current state
   */
  exportState() {
    return JSON.parse(JSON.stringify({
      ...this.state,
      checkboxes: Array.from(this.state.checkboxes.entries()),
      notes: Array.from(this.state.notes.entries()),
      collapsedSections: Array.from(this.state.collapsedSections)
    }));
  }

  /**
   * Reset state to defaults
   */
  reset() {
    this.state = {
      currentIndustry: 'banking',
      adminMode: false,
      loading: false,
      personas: [],
      stages: [],
      checkboxes: new Map(),
      notes: new Map(),
      aiEnabled: false,
      apiKeyConfigured: false,
      activeSection: null,
      collapsedSections: new Set()
    };
    
    // Reinitialize from data
    this.initializeFromData();
  }
}

// Create singleton instance
const appState = new AppState();

// Add logging middleware in development
if (process?.env?.NODE_ENV === 'development') {
  appState.addMiddleware((key, newValue, oldValue) => {
    console.log(`State change: ${key}`, { oldValue, newValue });
  });
}

export default appState;