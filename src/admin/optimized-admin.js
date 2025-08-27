/**
 * Optimized Admin Panel System
 * Provides rapid content updates, enhanced usability, and real-time synchronization
 * Maintains compatibility with existing admin functionality while adding optimizations
 */

class OptimizedAdminPanel {
  constructor() {
    this.initialized = false;
    this.isOnline = navigator.onLine;
    this.changes = new Map();
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 5000; // 5 seconds
    this.maxUndoSteps = 50;
    this.undoStack = [];
    this.redoStack = [];
    
    // Editor instances
    this.editors = new Map();
    this.dragDropHandler = null;
    this.searchIndex = new Map();
    
    // Feature flags
    this.features = {
      autoSave: true,
      realTimePreview: true,
      bulkOperations: true,
      advancedSearch: true,
      undoRedo: true,
      dragDropReorder: true,
      importExport: true,
      collaborativeEditing: false,
      analytics: true
    };
    
    this.init();
  }

  /**
   * Initialize the optimized admin panel
   */
  async init() {
    if (this.initialized) return;
    
    try {
      console.log('🔧 Initializing Optimized Admin Panel...');
      
      // Initialize Unified Data Manager
      await this.initializeUnifiedDataManager();
      
      // Initialize core components
      this.initializeDataStore();
      this.setupEventListeners();
      this.initializeEditors();
      this.setupAutoSave();
      this.setupKeyboardShortcuts();
      this.initializeSearch();
      
      // Enhanced features
      if (this.features.dragDropReorder) this.initializeDragDrop();
      if (this.features.realTimePreview) this.setupRealTimePreview();
      if (this.features.undoRedo) this.setupUndoRedo();
      if (this.features.analytics) this.initializeAnalytics();
      
      // Load existing data
      await this.loadDataFromSources();
      
      // Render interface
      await this.renderInterface();
      
      this.initialized = true;
      console.log('✅ Optimized Admin Panel initialized successfully');
      
      // Notify parent window if embedded
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'admin:ready' }, '*');
      }
      
    } catch (error) {
      console.error('❌ Admin panel initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize data store with caching and synchronization
   */
  initializeDataStore() {
    this.dataStore = {
      personas: new Map(),
      stages: new Map(),
      resources: new Map(),
      useCases: new Map(),
      metadata: {
        lastModified: Date.now(),
        version: '2.0.0',
        schemaVersion: 2
      }
    };
    
    // Setup change tracking
    this.changeTracker = new Proxy(this.dataStore, {
      set: (target, property, value) => {
        if (property !== 'metadata') {
          this.trackChange(property, value);
        }
        target[property] = value;
        return true;
      }
    });
  }

  /**
   * Enhanced event listeners with delegation and optimization
   */
  setupEventListeners() {
    // Optimized event delegation
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('change', this.handleChange.bind(this));
    document.addEventListener('input', this.debounce(this.handleInput.bind(this), 300));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Form submission
    document.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Drag and drop
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    
    // Network status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Before unload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Visibility change for auto-save optimization
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Initialize rich text editors with security
   */
  initializeEditors() {
    this.editorConfig = {
      theme: 'snow',
      placeholder: 'Enter content...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      },
      formats: ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']
    };
    
    // Initialize editors for existing elements
    const editorElements = document.querySelectorAll('.rich-editor');
    editorElements.forEach(element => {
      this.createEditor(element);
    });
  }

  /**
   * Create a secure rich text editor
   */
  createEditor(element) {
    if (typeof Quill === 'undefined') {
      console.warn('Quill editor not available, falling back to textarea');
      return null;
    }
    
    const editorId = element.id || this.generateId();
    const editor = new Quill(element, this.editorConfig);
    
    // Security: Sanitize content on change
    editor.on('text-change', () => {
      const content = editor.getContents();
      this.validateAndSanitizeContent(content, editorId);
    });
    
    this.editors.set(editorId, editor);
    return editor;
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    if (!this.features.autoSave) return;
    
    this.autoSaveTimer = setInterval(() => {
      if (this.changes.size > 0 && this.isOnline) {
        this.saveChanges();
      }
    }, this.autoSaveInterval);
    
    console.log('💾 Auto-save enabled');
  }

  /**
   * Setup keyboard shortcuts for power users
   */
  setupKeyboardShortcuts() {
    this.shortcuts = new Map([
      ['ctrl+s', () => this.saveChanges()],
      ['ctrl+z', () => this.undo()],
      ['ctrl+y', () => this.redo()],
      ['ctrl+f', () => this.focusSearch()],
      ['ctrl+n', () => this.createNew()],
      ['ctrl+d', () => this.duplicate()],
      ['escape', () => this.cancelOperation()],
      ['ctrl+shift+p', () => this.openPreview()],
      ['ctrl+shift+e', () => this.exportData()],
      ['ctrl+shift+i', () => this.importData()]
    ]);
    
    // Add visual shortcuts guide
    this.createShortcutsPanel();
  }

  /**
   * Initialize advanced search functionality
   */
  initializeSearch() {
    if (!this.features.advancedSearch) return;
    
    this.searchConfig = {
      caseSensitive: false,
      fuzzyMatching: true,
      searchFields: ['title', 'description', 'content', 'tags', 'category'],
      maxResults: 50
    };
    
    this.buildSearchIndex();
    this.setupSearchUI();
  }

  /**
   * Initialize drag and drop reordering
   */
  initializeDragDrop() {
    if (!this.features.dragDropReorder) return;
    
    this.dragDropHandler = {
      draggedElement: null,
      draggedData: null,
      dropZones: new Set()
    };
    
    // Setup sortable lists
    this.setupSortableLists();
    console.log('🔄 Drag & drop reordering enabled');
  }

  /**
   * Setup real-time preview
   */
  setupRealTimePreview() {
    if (!this.features.realTimePreview) return;
    
    this.previewFrame = document.getElementById('preview-frame');
    if (this.previewFrame) {
      this.previewUpdateTimer = null;
      console.log('👁️ Real-time preview enabled');
    }
  }

  /**
   * Setup undo/redo system
   */
  setupUndoRedo() {
    if (!this.features.undoRedo) return;
    
    this.createUndoRedoUI();
    this.updateUndoRedoState();
    console.log('⏮️ Undo/Redo system enabled');
  }

  /**
   * Initialize analytics for admin usage
   */
  initializeAnalytics() {
    if (!this.features.analytics) return;
    
    this.analytics = {
      sessionStart: Date.now(),
      actions: [],
      editingTime: 0,
      savesPerformed: 0,
      errorsEncountered: 0
    };
    
    this.trackAdminAction('session_start');
  }

  /**
   * Load data from various sources
   */
  async loadDataFromSources() {
    try {
      // Load from localStorage first (fastest)
      await this.loadFromLocalStorage();
      
      // Load from server if available
      if (this.isOnline) {
        await this.loadFromServer();
      }
      
      // Load from backup files
      await this.loadFromBackupFiles();
      
      console.log('📊 Data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load data:', error);
      this.handleDataLoadError(error);
    }
  }

  /**
   * Render the admin interface
   */
  async renderInterface() {
    performance.mark('admin-render-start');
    
    try {
      // Render navigation
      this.renderNavigation();
      
      // Render main content areas
      this.renderPersonasManager();
      this.renderStagesManager();
      this.renderResourcesManager();
      this.renderUseCasesManager();
      
      // Render utilities
      this.renderUtilitiesPanel();
      this.renderStatusBar();
      
      // Initialize interactive elements
      this.initializeInteractiveElements();
      
      performance.mark('admin-render-end');
      performance.measure('admin-render-duration', 'admin-render-start', 'admin-render-end');
      
    } catch (error) {
      console.error('Interface rendering failed:', error);
      this.showErrorMessage('Failed to render admin interface');
    }
  }

  /**
   * Enhanced click handler with action routing
   */
  handleClick(event) {
    const target = event.target.closest('[data-admin-action]');
    if (!target) return;
    
    const action = target.getAttribute('data-admin-action');
    const data = this.extractDataFromElement(target);
    
    this.trackAdminAction('click', { action, ...data });
    
    switch (action) {
      case 'add-persona':
        this.addPersona(data);
        break;
      case 'edit-persona':
        this.editPersona(data.id);
        break;
      case 'delete-persona':
        this.deletePersona(data.id);
        break;
      case 'add-stage':
        this.addStage(data);
        break;
      case 'edit-stage':
        this.editStage(data.id);
        break;
      case 'delete-stage':
        this.deleteStage(data.id);
        break;
      case 'save-changes':
        this.saveChanges();
        break;
      case 'preview':
        this.openPreview();
        break;
      case 'export':
        this.exportData();
        break;
      case 'import':
        this.importData();
        break;
      case 'toggle-section':
        this.toggleSection(data.section);
        break;
      case 'bulk-edit':
        this.openBulkEdit(data.type);
        break;
      case 'duplicate':
        this.duplicateItem(data.type, data.id);
        break;
      case 'reorder':
        this.handleReorder(data);
        break;
    }
  }

  /**
   * Enhanced form handling
   */
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const action = form.getAttribute('data-admin-form');
    
    this.trackAdminAction('form_submit', { action });
    
    switch (action) {
      case 'persona-form':
        this.handlePersonaSubmit(formData);
        break;
      case 'stage-form':
        this.handleStageSubmit(formData);
        break;
      case 'bulk-edit-form':
        this.handleBulkEditSubmit(formData);
        break;
      case 'import-form':
        this.handleImportSubmit(formData);
        break;
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeydown(event) {
    const key = this.getKeyboardShortcut(event);
    const handler = this.shortcuts.get(key);
    
    if (handler) {
      event.preventDefault();
      handler();
      this.trackAdminAction('keyboard_shortcut', { shortcut: key });
    }
  }

  /**
   * Add new persona with enhanced UX
   */
  async addPersona(data = {}) {
    const personaId = this.generateId();
    const defaultPersona = {
      id: personaId,
      title: data.title || 'New Persona',
      description: data.description || '',
      industry: data.industry || 'banking',
      lob: data.lob || '',
      level: data.level || 'manager',
      priorities: [],
      painPoints: [],
      interests: [],
      useCase: data.useCase || '',
      outcomesBenefits: data.outcomesBenefits || '',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Add to store
    this.dataStore.personas.set(personaId, defaultPersona);
    this.trackChange('personas', { action: 'add', id: personaId, data: defaultPersona });
    
    // Render persona card
    const personaCard = this.createPersonaCard(defaultPersona);
    const container = this.getPersonaContainer(defaultPersona.industry);
    
    if (container) {
      container.appendChild(personaCard);
      
      // Scroll into view and focus
      personaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.focusPersona(personaId);
    }
    
    // Show success message
    this.showNotification('Persona added successfully', 'success');
    this.trackAdminAction('persona_added', { id: personaId });
    
    // Auto-save
    if (this.features.autoSave) {
      this.deferredSave();
    }
    
    return personaId;
  }

  /**
   * Edit persona with inline editing
   */
  editPersona(personaId) {
    const persona = this.dataStore.personas.get(personaId);
    if (!persona) {
      this.showErrorMessage('Persona not found');
      return;
    }
    
    const personaCard = document.querySelector(`[data-persona-id="${personaId}"]`);
    if (!personaCard) {
      this.showErrorMessage('Persona card not found in UI');
      return;
    }
    
    // Create inline editing interface
    this.createInlineEditor(personaCard, persona);
    this.trackAdminAction('persona_edit_started', { id: personaId });
  }

  /**
   * Create inline editor for personas
   */
  createInlineEditor(container, data) {
    const originalContent = container.innerHTML;
    
    // Create editing interface
    const editorHTML = `
      <div class="inline-editor bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg">
        <div class="editor-header flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Editing: ${this.escapeHtml(data.title)}</h3>
          <div class="editor-controls">
            <button type="button" class="save-btn bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700">Save</button>
            <button type="button" class="cancel-btn bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </div>
        
        <form class="editor-form space-y-4">
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Title</label>
            <input type="text" name="title" value="${this.escapeHtml(data.title)}" 
                   class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows="3" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${this.escapeHtml(data.description)}</textarea>
          </div>
          
          <div class="form-row grid grid-cols-3 gap-4">
            <div class="form-group">
              <label class="block text-sm font-medium mb-1">Industry</label>
              <select name="industry" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="banking" ${data.industry === 'banking' ? 'selected' : ''}>Banking</option>
                <option value="insurance" ${data.industry === 'insurance' ? 'selected' : ''}>Insurance</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium mb-1">Level</label>
              <select name="level" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="executive" ${data.level === 'executive' ? 'selected' : ''}>Executive</option>
                <option value="manager" ${data.level === 'manager' ? 'selected' : ''}>Manager</option>
                <option value="analyst" ${data.level === 'analyst' ? 'selected' : ''}>Analyst</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium mb-1">LOB</label>
              <input type="text" name="lob" value="${this.escapeHtml(data.lob || '')}" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Priorities (one per line)</label>
            <textarea name="priorities" rows="4" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${(data.priorities || []).join('\\n')}</textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Pain Points (one per line)</label>
            <textarea name="painPoints" rows="4" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${(data.painPoints || []).join('\\n')}</textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Interests (one per line)</label>
            <textarea name="interests" rows="4" 
                     class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">${(data.interests || []).join('\\n')}</textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Use Case</label>
            <div class="rich-editor-container">
              <div class="rich-editor" data-field="useCase">${data.useCase || ''}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Outcomes & Benefits</label>
            <div class="rich-editor-container">
              <div class="rich-editor" data-field="outcomesBenefits">${data.outcomesBenefits || ''}</div>
            </div>
          </div>
        </form>
      </div>
    `;
    
    container.innerHTML = editorHTML;
    
    // Initialize rich text editors
    const richEditors = container.querySelectorAll('.rich-editor');
    richEditors.forEach(editor => {
      this.createEditor(editor);
    });
    
    // Setup event handlers
    const saveBtn = container.querySelector('.save-btn');
    const cancelBtn = container.querySelector('.cancel-btn');
    const form = container.querySelector('.editor-form');
    
    saveBtn.addEventListener('click', () => {
      this.saveInlineEdit(data.id, form, container, originalContent);
    });
    
    cancelBtn.addEventListener('click', () => {
      this.cancelInlineEdit(container, originalContent);
    });
    
    // Focus first input
    const firstInput = form.querySelector('input, textarea');
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }
  }

  /**
   * Save inline edit changes
   */
  saveInlineEdit(personaId, form, container, originalContent) {
    try {
      const formData = new FormData(form);
      const updatedPersona = this.dataStore.personas.get(personaId);
      
      if (!updatedPersona) {
        throw new Error('Persona not found');
      }
      
      // Update persona data
      updatedPersona.title = formData.get('title') || updatedPersona.title;
      updatedPersona.description = formData.get('description') || updatedPersona.description;
      updatedPersona.industry = formData.get('industry') || updatedPersona.industry;
      updatedPersona.level = formData.get('level') || updatedPersona.level;
      updatedPersona.lob = formData.get('lob') || updatedPersona.lob;
      
      // Parse multi-line fields
      updatedPersona.priorities = this.parseMultilineField(formData.get('priorities'));
      updatedPersona.painPoints = this.parseMultilineField(formData.get('painPoints'));
      updatedPersona.interests = this.parseMultilineField(formData.get('interests'));
      
      // Get rich editor content
      const useCaseEditor = this.editors.get(container.querySelector('[data-field="useCase"]')?.id);
      const benefitsEditor = this.editors.get(container.querySelector('[data-field="outcomesBenefits"]')?.id);
      
      if (useCaseEditor) {
        updatedPersona.useCase = useCaseEditor.root.innerHTML;
      }
      if (benefitsEditor) {
        updatedPersona.outcomesBenefits = benefitsEditor.root.innerHTML;
      }
      
      updatedPersona.updatedAt = Date.now();
      
      // Track change
      this.trackChange('personas', { action: 'update', id: personaId, data: updatedPersona });
      
      // Re-render persona card
      const newPersonaCard = this.createPersonaCard(updatedPersona);
      container.parentNode.replaceChild(newPersonaCard, container);
      
      // Show success message
      this.showNotification('Persona updated successfully', 'success');
      this.trackAdminAction('persona_updated', { id: personaId });
      
      // Auto-save
      if (this.features.autoSave) {
        this.deferredSave();
      }
      
      // Update search index
      this.updateSearchIndex();
      
      // Update real-time preview
      if (this.features.realTimePreview) {
        this.updatePreview();
      }
      
    } catch (error) {
      console.error('Failed to save persona:', error);
      this.showErrorMessage('Failed to save persona: ' + error.message);
      
      // Revert to original content
      container.innerHTML = originalContent;
    }
  }

  /**
   * Cancel inline edit
   */
  cancelInlineEdit(container, originalContent) {
    if (confirm('Cancel editing? Any unsaved changes will be lost.')) {
      container.innerHTML = originalContent;
      this.trackAdminAction('persona_edit_cancelled');
    }
  }

  /**
   * Delete persona with confirmation
   */
  async deletePersona(personaId) {
    const persona = this.dataStore.personas.get(personaId);
    if (!persona) {
      this.showErrorMessage('Persona not found');
      return;
    }
    
    const confirmed = await this.showConfirmDialog(
      'Delete Persona',
      `Are you sure you want to delete "${persona.title}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (!confirmed) return;
    
    // Create undo point
    if (this.features.undoRedo) {
      this.createUndoPoint('delete_persona', { personaId, persona: { ...persona } });
    }
    
    // Remove from store
    this.dataStore.personas.delete(personaId);
    this.trackChange('personas', { action: 'delete', id: personaId });
    
    // Remove from UI
    const personaCard = document.querySelector(`[data-persona-id="${personaId}"]`);
    if (personaCard) {
      // Animate removal
      personaCard.style.transition = 'all 0.3s ease-out';
      personaCard.style.opacity = '0';
      personaCard.style.transform = 'translateX(-100%)';
      
      setTimeout(() => {
        personaCard.remove();
      }, 300);
    }
    
    // Show success message
    this.showNotification('Persona deleted successfully', 'success');
    this.trackAdminAction('persona_deleted', { id: personaId });
    
    // Auto-save
    if (this.features.autoSave) {
      this.deferredSave();
    }
    
    // Update search index
    this.updateSearchIndex();
  }

  /**
   * Create persona card for admin interface
   */
  createPersonaCard(persona) {
    const card = document.createElement('div');
    card.className = 'persona-admin-card bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow';
    card.setAttribute('data-persona-id', persona.id);
    card.setAttribute('data-industry', persona.industry);
    card.draggable = true;
    
    card.innerHTML = `
      <div class="card-header flex justify-between items-start mb-3">
        <div class="persona-info flex-1">
          <h4 class="font-semibold text-lg text-gray-900">${this.escapeHtml(persona.title)}</h4>
          <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(persona.description)}</p>
          <div class="persona-meta flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span class="industry-badge bg-blue-100 text-blue-800 px-2 py-1 rounded">${this.escapeHtml(persona.industry)}</span>
            <span class="level-badge bg-purple-100 text-purple-800 px-2 py-1 rounded">${this.escapeHtml(persona.level)}</span>
            ${persona.lob ? `<span class="lob-badge bg-green-100 text-green-800 px-2 py-1 rounded">${this.escapeHtml(persona.lob)}</span>` : ''}
          </div>
        </div>
        
        <div class="card-actions flex items-center space-x-2">
          <button class="edit-btn text-blue-600 hover:text-blue-800 p-1" 
                  data-admin-action="edit-persona" 
                  data-id="${persona.id}"
                  title="Edit persona">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          
          <button class="duplicate-btn text-green-600 hover:text-green-800 p-1" 
                  data-admin-action="duplicate" 
                  data-type="persona" 
                  data-id="${persona.id}"
                  title="Duplicate persona">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
          
          <button class="delete-btn text-red-600 hover:text-red-800 p-1" 
                  data-admin-action="delete-persona" 
                  data-id="${persona.id}"
                  title="Delete persona">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="card-content">
        ${this.renderPersonaPreview(persona)}
      </div>
      
      <div class="card-footer mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <span>Updated: ${new Date(persona.updatedAt).toLocaleDateString()}</span>
        <span class="status-badge ${persona.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded">
          ${persona.status || 'draft'}
        </span>
      </div>
    `;
    
    return card;
  }

  /**
   * Render persona preview in admin card
   */
  renderPersonaPreview(persona) {
    let preview = '';
    
    if (persona.priorities?.length) {
      preview += `<div class="preview-section mb-2">
        <span class="preview-label font-medium text-xs">Priorities:</span>
        <span class="preview-content text-xs text-gray-600">${persona.priorities.slice(0, 2).join(', ')}${persona.priorities.length > 2 ? '...' : ''}</span>
      </div>`;
    }
    
    if (persona.painPoints?.length) {
      preview += `<div class="preview-section mb-2">
        <span class="preview-label font-medium text-xs">Pain Points:</span>
        <span class="preview-content text-xs text-gray-600">${persona.painPoints.slice(0, 2).join(', ')}${persona.painPoints.length > 2 ? '...' : ''}</span>
      </div>`;
    }
    
    if (persona.useCase) {
      const useCaseText = this.stripHtml(persona.useCase);
      preview += `<div class="preview-section mb-2">
        <span class="preview-label font-medium text-xs">Use Case:</span>
        <span class="preview-content text-xs text-gray-600">${useCaseText.substring(0, 100)}${useCaseText.length > 100 ? '...' : ''}</span>
      </div>`;
    }
    
    return preview || '<div class="text-xs text-gray-500 italic">No content preview available</div>';
  }

  /**
   * Enhanced save functionality
   */
  async saveChanges() {
    if (this.changes.size === 0) {
      this.showNotification('No changes to save', 'info');
      return;
    }
    
    const saveBtn = document.querySelector('[data-admin-action="save-changes"]');
    const originalText = saveBtn?.textContent;
    
    try {
      // Show saving state
      if (saveBtn) {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
      }
      
      // Create backup before saving
      await this.createBackup();
      
      // Save to local storage
      await this.saveToLocalStorage();
      
      // Save to server if online
      if (this.isOnline) {
        await this.saveToServer();
      }
      
      // Generate export files
      await this.generateExportFiles();
      
      // Update metadata
      this.dataStore.metadata.lastModified = Date.now();
      this.dataStore.metadata.version = this.incrementVersion(this.dataStore.metadata.version);
      
      // Clear changes
      this.changes.clear();
      
      // Show success
      this.showNotification(`Changes saved successfully (v${this.dataStore.metadata.version})`, 'success');
      this.trackAdminAction('changes_saved', { 
        version: this.dataStore.metadata.version,
        changesCount: this.changes.size 
      });
      
      // Notify parent window
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'admin:content-updated', 
          data: { version: this.dataStore.metadata.version } 
        }, '*');
      }
      
    } catch (error) {
      console.error('Failed to save changes:', error);
      this.showErrorMessage('Failed to save changes: ' + error.message);
      this.analytics.errorsEncountered++;
      
    } finally {
      // Reset save button
      if (saveBtn) {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }
    }
  }

  /**
   * Export data with multiple formats
   */
  async exportData() {
    const exportData = {
      metadata: {
        ...this.dataStore.metadata,
        exportedAt: new Date().toISOString(),
        exportedBy: 'admin-panel',
        schemaVersion: 2
      },
      personas: Array.from(this.dataStore.personas.values()),
      stages: Array.from(this.dataStore.stages.values()),
      resources: Array.from(this.dataStore.resources.values()),
      useCases: Array.from(this.dataStore.useCases.values())
    };
    
    try {
      // Create multiple export formats
      const exports = {
        json: this.exportAsJSON(exportData),
        csv: this.exportAsCSV(exportData),
        yaml: this.exportAsYAML(exportData)
      };
      
      // Create zip file with all formats
      if (typeof JSZip !== 'undefined') {
        const zip = new JSZip();
        
        Object.entries(exports).forEach(([format, content]) => {
          zip.file(`uipath-sales-guide-${new Date().toISOString().split('T')[0]}.${format}`, content);
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(zipBlob, `uipath-sales-guide-export-${new Date().toISOString().split('T')[0]}.zip`);
        
      } else {
        // Fallback to JSON only
        const jsonBlob = new Blob([exports.json], { type: 'application/json' });
        this.downloadFile(jsonBlob, `uipath-sales-guide-${new Date().toISOString().split('T')[0]}.json`);
      }
      
      this.showNotification('Data exported successfully', 'success');
      this.trackAdminAction('data_exported', { formats: Object.keys(exports) });
      
    } catch (error) {
      console.error('Export failed:', error);
      this.showErrorMessage('Export failed: ' + error.message);
    }
  }

  /**
   * Utility methods
   */
  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  parseMultilineField(value) {
    if (!value) return [];
    return value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
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

  trackChange(collection, change) {
    this.changes.set(`${collection}_${change.id || Date.now()}`, {
      collection,
      timestamp: Date.now(),
      ...change
    });
    
    // Update UI indicators
    this.updateChangeIndicators();
  }

  trackAdminAction(action, data = {}) {
    if (!this.features.analytics) return;
    
    this.analytics.actions.push({
      action,
      timestamp: Date.now(),
      ...data
    });
    
    console.log(`📊 Admin: ${action}`, data);
  }

  showNotification(message, type = 'info') {
    // Create or update notification
    let notification = document.getElementById('admin-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'admin-notification';
      notification.className = 'fixed top-4 right-4 z-50 max-w-sm';
      document.body.appendChild(notification);
    }
    
    const typeClasses = {
      success: 'bg-green-100 border-green-500 text-green-700',
      error: 'bg-red-100 border-red-500 text-red-700',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      info: 'bg-blue-100 border-blue-500 text-blue-700'
    };
    
    notification.innerHTML = `
      <div class="notification-content ${typeClasses[type] || typeClasses.info} border-l-4 p-4 rounded shadow-lg">
        <div class="flex justify-between items-center">
          <span>${this.escapeHtml(message)}</span>
          <button class="ml-4 text-current opacity-70 hover:opacity-100" onclick="this.closest('#admin-notification').remove()">×</button>
        </div>
      </div>
    `;
    
    // Auto-hide after 5 seconds for non-error notifications
    if (type !== 'error') {
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    }
  }

  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Initialize unified data manager
   */
  async initializeUnifiedDataManager() {
    try {
      // Check if UnifiedDataManager is available
      if (typeof UnifiedDataManager !== 'undefined') {
        this.unifiedDataManager = new UnifiedDataManager();
        await this.unifiedDataManager.init();
        
        // Subscribe to data changes
        this.unifiedDataManager.subscribe(this.handleUnifiedDataChange.bind(this));
        
        console.log('✅ Unified Data Manager connected to admin panel');
        return true;
      } else {
        console.warn('⚠️ Unified Data Manager not available, using local data store');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Unified Data Manager:', error);
      return false;
    }
  }

  /**
   * Handle unified data changes
   */
  handleUnifiedDataChange(event) {
    const { type, data } = event;
    console.log(`🔄 Unified data change in admin: ${type}`, data);
    
    // Update local data store to stay in sync
    switch (type) {
      case 'persona_saved':
        this.dataStore.personas.set(data.id, data);
        this.updatePersonaUI(data);
        break;
      case 'persona_deleted':
        this.dataStore.personas.delete(data.id);
        this.removePersonaFromUI(data.id);
        break;
      case 'categories_updated':
        this.updateCategoriesUI(data);
        break;
    }
  }

  /**
   * Save persona using unified data manager
   */
  async savePersonaToUnified(personaData) {
    if (this.unifiedDataManager) {
      try {
        const savedPersona = this.unifiedDataManager.savePersona(personaData);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:persona-saved',
            data: savedPersona
          }, '*');
        }
        
        return savedPersona;
      } catch (error) {
        console.error('Failed to save persona to unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local save
      return this.savePersonaLocal(personaData);
    }
  }

  /**
   * Delete persona using unified data manager
   */
  async deletePersonaFromUnified(personaId) {
    if (this.unifiedDataManager) {
      try {
        const result = this.unifiedDataManager.deletePersona(personaId);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:persona-deleted',
            data: { id: personaId }
          }, '*');
        }
        
        return result;
      } catch (error) {
        console.error('Failed to delete persona from unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local delete
      return this.deletePersonaLocal(personaId);
    }
  }

  /**
   * Update categories using unified data manager
   */
  async updateCategoriesInUnified(categoryType, updates) {
    if (this.unifiedDataManager) {
      try {
        this.unifiedDataManager.updateCategories(categoryType, updates);
        
        // Notify parent window about the change
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:categories-updated',
            data: { categoryType, updates }
          }, '*');
        }
        
        return true;
      } catch (error) {
        console.error('Failed to update categories in unified data:', error);
        throw error;
      }
    } else {
      // Fall back to local update
      return this.updateCategoriesLocal(categoryType, updates);
    }
  }

  /**
   * Add new industry using unified data manager
   */
  async addIndustryToUnified(industry) {
    if (this.unifiedDataManager) {
      try {
        const newIndustry = this.unifiedDataManager.addIndustry(industry);
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:industry-added',
            data: newIndustry
          }, '*');
        }
        
        // Update admin UI
        this.updateIndustrySelector();
        
        return newIndustry;
      } catch (error) {
        console.error('Failed to add industry:', error);
        throw error;
      }
    }
  }

  /**
   * Add new LOB using unified data manager
   */
  async addLOBToUnified(industryId, lob) {
    if (this.unifiedDataManager) {
      try {
        const newLOB = this.unifiedDataManager.addLOBToIndustry(industryId, lob);
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'admin:lob-added',
            data: { industryId, lob: newLOB }
          }, '*');
        }
        
        // Update admin UI
        this.updateLOBSelectors();
        
        return newLOB;
      } catch (error) {
        console.error('Failed to add LOB:', error);
        throw error;
      }
    }
  }

  /**
   * Get categories from unified data manager
   */
  getUnifiedCategories() {
    if (this.unifiedDataManager) {
      return this.unifiedDataManager.getCategories();
    }
    return null;
  }

  /**
   * Get personas from unified data manager
   */
  getUnifiedPersonas(filters = {}) {
    if (this.unifiedDataManager) {
      return this.unifiedDataManager.getPersonas(filters);
    }
    return [];
  }

  /**
   * Update persona UI after change
   */
  updatePersonaUI(persona) {
    // Find and update the persona card in the UI
    const personaCard = document.querySelector(`[data-persona-id="${persona.id}"]`);
    if (personaCard) {
      const newCard = this.createPersonaCard(persona);
      personaCard.parentNode.replaceChild(newCard, personaCard);
    } else {
      // Add new persona card
      this.addPersonaCardToUI(persona);
    }
  }

  /**
   * Remove persona from UI
   */
  removePersonaFromUI(personaId) {
    const personaCard = document.querySelector(`[data-persona-id="${personaId}"]`);
    if (personaCard) {
      personaCard.remove();
    }
  }

  /**
   * Update categories UI after change
   */
  updateCategoriesUI(data) {
    // Update various selectors and dropdowns
    this.updateIndustrySelector();
    this.updateLOBSelectors();
    this.updatePersonaLevelSelectors();
  }

  /**
   * Update industry selector with current data
   */
  updateIndustrySelector() {
    const categories = this.getUnifiedCategories();
    if (!categories) return;
    
    const industrySelectors = document.querySelectorAll('.industry-selector');
    industrySelectors.forEach(selector => {
      selector.innerHTML = categories.industries.map(industry => 
        `<option value="${industry.id}">${this.escapeHtml(industry.label)}</option>`
      ).join('');
    });
  }

  /**
   * Update LOB selectors with current data
   */
  updateLOBSelectors() {
    const categories = this.getUnifiedCategories();
    if (!categories) return;
    
    const lobSelectors = document.querySelectorAll('.lob-selector');
    lobSelectors.forEach(selector => {
      const industry = selector.getAttribute('data-industry');
      if (industry && categories.linesOfBusiness[industry]) {
        const lobs = categories.linesOfBusiness[industry];
        selector.innerHTML = [
          '<option value="">All LOBs</option>',
          ...lobs.map(lob => `<option value="${lob.id}">${this.escapeHtml(lob.label)}</option>`)
        ].join('');
      }
    });
  }

  /**
   * Update persona level selectors
   */
  updatePersonaLevelSelectors() {
    const categories = this.getUnifiedCategories();
    if (!categories) return;
    
    const levelSelectors = document.querySelectorAll('.persona-level-selector');
    levelSelectors.forEach(selector => {
      selector.innerHTML = categories.personaLevels.map(level => 
        `<option value="${level.id}">${this.escapeHtml(level.label)}</option>`
      ).join('');
    });
  }

  // Initialize the admin panel
  static async initialize() {
    if (window.optimizedAdminPanel) {
      console.warn('Admin panel already initialized');
      return window.optimizedAdminPanel;
    }
    
    const adminPanel = new OptimizedAdminPanel();
    window.optimizedAdminPanel = adminPanel;
    
    return adminPanel;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => OptimizedAdminPanel.initialize());
} else {
  OptimizedAdminPanel.initialize();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OptimizedAdminPanel };
}