/**
 * Optimized Timeline Navigation UiPath Sales Cycle Guide
 * Integrates timeline functionality with performance, security, and UX optimizations
 * Maintains full compatibility with existing admin system and rapid updates
 */

// ==================== OPTIMIZED SECURITY MODULE ====================
class OptimizedHTMLSanitizer {
  constructor() {
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li'],
      formatting: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']
    };
    
    this.allowedAttributes = {
      'a': ['href', 'title', 'target', 'rel'],
      'span': ['class'],
      'div': ['class'],
      'p': ['class']
    };
    
    // DOMPurify-style configuration
    this.config = {
      ALLOWED_TAGS: [...this.allowedTags.basic, ...this.allowedTags.links, ...this.allowedTags.lists, ...this.allowedTags.formatting],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
      KEEP_CONTENT: true,
      RETURN_DOM: false
    };
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    
    // Use DOMParser for more robust sanitization
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script tags and event handlers
    this.removeUnsafeElements(doc);
    this.removeUnsafeAttributes(doc);
    
    return doc.body.innerHTML || this.escapeHtml(html);
  }

  removeUnsafeElements(doc) {
    const unsafeTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'];
    unsafeTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
  }

  removeUnsafeAttributes(doc) {
    const unsafeAttrs = /^on|javascript:|data:/i;
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    
    let node;
    while (node = walker.nextNode()) {
      const attributes = Array.from(node.attributes);
      attributes.forEach(attr => {
        if (unsafeAttrs.test(attr.name) || unsafeAttrs.test(attr.value)) {
          node.removeAttribute(attr.name);
        }
      });
    }
  }

  renderSafeHTML(content) {
    if (typeof content !== 'string') return '';
    
    // Enhanced safe rendering with more comprehensive tag support
    return content
      .replace(/&lt;(\/?)strong&gt;/gi, '<$1strong>')
      .replace(/&lt;(\/?)em&gt;/gi, '<$1em>')
      .replace(/&lt;(\/?)p&gt;/gi, '<$1p>')
      .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
      .replace(/&lt;(\/?)h([1-6])&gt;/gi, '<$1h$2>')
      .replace(/&lt;(\/?)ul&gt;/gi, '<$1ul>')
      .replace(/&lt;(\/?)ol&gt;/gi, '<$1ol>')
      .replace(/&lt;(\/?)li&gt;/gi, '<$1li>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
}

// ==================== OPTIMIZED APPLICATION CLASS ====================
class OptimizedTimelineApp {
  constructor() {
    this.sanitizer = new OptimizedHTMLSanitizer();
    this.state = { checklists: {}, notes: {} };
    this.currentStage = 0;
    this.currentIndustry = 'banking';
    this.modules = new Map();
    this.initialized = false;
    
    // Performance tracking
    this.performanceMarks = new Map();
    this.renderQueue = [];
    this.isRendering = false;
    
    // Feature flags
    this.features = {
      analytics: true,
      performance: true,
      uxEnhancements: true,
      advancedCaching: true,
      offlineSupport: true,
      adminIntegration: true
    };
    
    this.init();
  }

  /**
   * Initialize the optimized application
   */
  async init() {
    if (this.initialized) return;
    
    try {
      performance.mark('app-init-start');
      console.log('🚀 Initializing Optimized Timeline App...');
      
      // Initialize optimization modules
      await this.initializeOptimizationModules();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize core functionality
      await this.initializeCore();
      
      // Load and render data
      await this.loadApplicationData();
      
      // Initialize admin integration
      this.initializeAdminIntegration();
      
      // Setup performance monitoring
      this.initializePerformanceMonitoring();
      
      this.initialized = true;
      performance.mark('app-init-end');
      performance.measure('app-initialization', 'app-init-start', 'app-init-end');
      
      console.log('✅ Optimized Timeline App initialized successfully');
      this.dispatchCustomEvent('app:ready', { timestamp: Date.now() });
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize optimization modules
   */
  async initializeOptimizationModules() {
    // Initialize modules if classes are available
    if (typeof PerformanceManager !== 'undefined' && this.features.performance) {
      const perfManager = new PerformanceManager();
      this.modules.set('performance', perfManager);
      console.log('✅ Performance Manager initialized');
    }

    if (typeof DataManager !== 'undefined' && this.features.advancedCaching) {
      const dataManager = new DataManager();
      this.modules.set('dataManager', dataManager);
      console.log('✅ Data Manager initialized');
    }

    if (typeof AnalyticsManager !== 'undefined' && this.features.analytics) {
      const analyticsManager = new AnalyticsManager();
      this.modules.set('analytics', analyticsManager);
      console.log('✅ Analytics Manager initialized');
    }

    if (typeof UXEnhancer !== 'undefined' && this.features.uxEnhancements) {
      const uxEnhancer = new UXEnhancer();
      this.modules.set('uxEnhancer', uxEnhancer);
      console.log('✅ UX Enhancer initialized');
    }
  }

  /**
   * Initialize core functionality
   */
  async initializeCore() {
    // Load persisted state
    this.loadState();
    
    // Setup DOM utilities
    this.$ = (s, r = document) => r.querySelector(s);
    this.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    
    // Setup intersection observer for performance
    this.setupIntersectionObserver();
    
    // Initialize virtual scrolling for large lists
    this.initializeVirtualScrolling();
  }

  /**
   * Load application data with caching
   */
  async loadApplicationData() {
    try {
      // Check if data manager is available for caching
      const dataManager = this.modules.get('dataManager');
      
      if (dataManager) {
        // Use cached data if available
        const cachedData = await dataManager.getCachedData('salesCycleData');
        if (cachedData) {
          this.appData = cachedData;
          console.log('📦 Loaded data from cache');
        }
      }
      
      // Fall back to global data
      if (!this.appData && typeof SALES_CYCLE_DATA !== 'undefined') {
        this.appData = SALES_CYCLE_DATA;
        
        // Cache the data if data manager is available
        if (dataManager) {
          await dataManager.cacheData('salesCycleData', this.appData);
        }
      }
      
      // Fall back to LOB options and personas database
      if (!this.appData) {
        this.appData = {
          lobOptions: typeof LOB_OPTIONS !== 'undefined' ? LOB_OPTIONS : {},
          personasDatabase: typeof PERSONAS_DATABASE !== 'undefined' ? PERSONAS_DATABASE : {}
        };
      }
      
    } catch (error) {
      console.error('Failed to load application data:', error);
      this.appData = { lobOptions: {}, personasDatabase: {} };
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Optimized event delegation
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('change', this.handleChange.bind(this));
    document.addEventListener('input', this.handleInput.bind(this));
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Touch and gesture support
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
    
    // Performance monitoring
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Optimized click handler with event delegation
   */
  handleClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.getAttribute('data-action');
    const data = this.extractDataFromElement(target);
    
    // Track user interaction
    this.trackUserAction('click', action, data);
    
    // Handle specific actions
    switch (action) {
      case 'toggle-persona':
        this.togglePersona(data.index, data.industry);
        break;
      case 'navigate-stage':
        this.navigateToStage(parseInt(data.stage));
        break;
      case 'toggle-checkbox':
        this.toggleCheckbox(data.id);
        break;
      case 'change-industry':
        this.changeIndustry(data.industry);
        break;
      case 'change-lob':
        this.changeLOB(data.lob);
        break;
      case 'clear-form':
        this.clearFormState();
        break;
      case 'export-data':
        this.exportData();
        break;
      case 'admin-mode':
        this.toggleAdminMode();
        break;
    }
  }

  /**
   * Handle form changes
   */
  handleChange(event) {
    const target = event.target;
    
    if (target.type === 'checkbox') {
      this.handleCheckboxChange(target);
    } else if (target.classList.contains('note-textarea')) {
      this.handleNoteChange(target);
    } else if (target.id === 'industry-selector') {
      this.changeIndustry(target.value);
    } else if (target.id === 'lob-selector') {
      this.changeLOB(target.value);
    }
  }

  /**
   * Handle input events with debouncing
   */
  handleInput(event) {
    if (event.target.classList.contains('note-textarea')) {
      this.debounce(() => {
        this.handleNoteChange(event.target);
      }, 500)();
    }
  }

  /**
   * Enhanced keyboard navigation
   */
  handleKeydown(event) {
    // Let UX Enhancer handle keyboard shortcuts if available
    const uxEnhancer = this.modules.get('uxEnhancer');
    if (uxEnhancer && uxEnhancer.handleKeydown) {
      if (uxEnhancer.handleKeydown(event)) {
        return; // Event was handled
      }
    }
    
    // Handle timeline-specific shortcuts
    switch (event.key) {
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.previousStage();
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.nextStage();
        }
        break;
      case 'Escape':
        this.handleEscape();
        break;
    }
  }

  /**
   * Enhanced touch handling for mobile optimization
   */
  handleTouchStart(event) {
    if (event.touches.length === 1) {
      this.touchStartPos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        time: Date.now()
      };
    }
  }

  handleTouchMove(event) {
    if (!this.touchStartPos || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStartPos.x;
    const deltaY = touch.clientY - this.touchStartPos.y;
    
    // Detect horizontal swipe for stage navigation
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      // Prevent default scrolling during horizontal swipe
      event.preventDefault();
    }
  }

  handleTouchEnd(event) {
    if (!this.touchStartPos) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartPos.x;
    const deltaY = touch.clientY - this.touchStartPos.y;
    const deltaTime = Date.now() - this.touchStartPos.time;
    
    // Swipe detection
    if (deltaTime < 500 && Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
      if (deltaX > 0) {
        this.previousStage();
      } else {
        this.nextStage();
      }
      
      this.trackUserAction('gesture', 'swipe', { direction: deltaX > 0 ? 'right' : 'left' });
    }
    
    this.touchStartPos = null;
  }

  /**
   * Performance-optimized rendering with batching
   */
  async render() {
    if (this.isRendering) {
      return;
    }
    
    this.isRendering = true;
    performance.mark('render-start');
    
    try {
      // Use requestAnimationFrame for smooth rendering
      await new Promise(resolve => {
        requestAnimationFrame(async () => {
          await this.renderPersonas();
          await this.renderSalesStages();
          await this.renderProgressIndicators();
          await this.updateUIState();
          resolve();
        });
      });
      
      performance.mark('render-end');
      performance.measure('render-duration', 'render-start', 'render-end');
      
    } finally {
      this.isRendering = false;
    }
  }

  /**
   * Optimized persona rendering with virtualization
   */
  async renderPersonas() {
    const personasContainer = this.$('#personas-container');
    if (!personasContainer) return;
    
    const industries = ['banking', 'insurance'];
    const fragment = document.createDocumentFragment();
    
    for (const industry of industries) {
      const industrySection = this.createPersonaSection(industry);
      if (industrySection) {
        fragment.appendChild(industrySection);
      }
    }
    
    // Batch DOM update
    personasContainer.innerHTML = '';
    personasContainer.appendChild(fragment);
    
    // Setup lazy loading for persona content
    this.setupLazyLoading();
  }

  /**
   * Create persona section with optimized rendering
   */
  createPersonaSection(industry) {
    const personasData = this.appData.personasDatabase?.[industry];
    if (!personasData) return null;
    
    const section = document.createElement('section');
    section.className = `personas-section personas-${industry}`;
    section.setAttribute('data-industry', industry);
    
    const header = document.createElement('h3');
    header.className = 'text-xl font-bold mb-4 capitalize';
    header.textContent = `${industry} Personas`;
    section.appendChild(header);
    
    const personasList = document.createElement('div');
    personasList.className = 'personas-list space-y-4';
    
    // Create personas for each LOB
    Object.entries(personasData).forEach(([lob, personas]) => {
      if (Array.isArray(personas)) {
        personas.forEach((persona, index) => {
          const personaCard = this.createPersonaCard(persona, industry, index);
          if (personaCard) {
            personasList.appendChild(personaCard);
          }
        });
      }
    });
    
    section.appendChild(personasList);
    return section;
  }

  /**
   * Create optimized persona card
   */
  createPersonaCard(persona, industry, index) {
    const card = document.createElement('div');
    card.className = 'persona-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md';
    card.setAttribute('data-persona-index', index);
    card.setAttribute('data-industry', industry);
    
    // Use template literals for better performance
    card.innerHTML = `
      <div class="persona-header p-4 cursor-pointer" data-action="toggle-persona" data-index="${index}" data-industry="${industry}">
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-semibold text-gray-900">${this.sanitizer.escapeHtml(persona.title)}</h4>
            <p class="text-sm text-gray-600">${this.sanitizer.escapeHtml(persona.description || '')}</p>
          </div>
          <svg class="chevron w-5 h-5 text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
      <div class="persona-content hidden p-4 pt-0 border-t border-gray-100">
        ${this.createPersonaContent(persona)}
      </div>
    `;
    
    return card;
  }

  /**
   * Create persona content with safe HTML rendering
   */
  createPersonaContent(persona) {
    const sections = [];
    
    if (persona.priorities?.length) {
      sections.push(`
        <div class="mb-4">
          <h5 class="font-medium text-gray-900 mb-2">Key Priorities</h5>
          <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
            ${persona.priorities.map(priority => `<li>${this.sanitizer.escapeHtml(priority)}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    if (persona.painPoints?.length) {
      sections.push(`
        <div class="mb-4">
          <h5 class="font-medium text-gray-900 mb-2">Pain Points</h5>
          <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
            ${persona.painPoints.map(point => `<li>${this.sanitizer.escapeHtml(point)}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    if (persona.interests?.length) {
      sections.push(`
        <div class="mb-4">
          <h5 class="font-medium text-gray-900 mb-2">Key Interests</h5>
          <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
            ${persona.interests.map(interest => `<li>${this.sanitizer.escapeHtml(interest)}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    return sections.join('');
  }

  /**
   * Render sales stages with timeline visualization
   */
  async renderSalesStages() {
    const stagesContainer = this.$('#sales-stages-container');
    if (!stagesContainer) return;
    
    const stagesData = this.appData.stages || this.getDefaultStages();
    const fragment = document.createDocumentFragment();
    
    stagesData.forEach((stage, index) => {
      const stageElement = this.createStageElement(stage, index);
      if (stageElement) {
        fragment.appendChild(stageElement);
      }
    });
    
    stagesContainer.innerHTML = '';
    stagesContainer.appendChild(fragment);
    
    // Update timeline indicators
    this.updateTimelineIndicators();
  }

  /**
   * Create stage element with enhanced functionality
   */
  createStageElement(stage, index) {
    const stageDiv = document.createElement('div');
    stageDiv.className = `stage-container ${index === this.currentStage ? 'active' : ''} mb-8 p-6 bg-white rounded-lg shadow-sm border`;
    stageDiv.setAttribute('data-stage', index);
    
    // Stage header with timeline indicator
    const header = document.createElement('div');
    header.className = 'stage-header flex items-center mb-4 cursor-pointer';
    header.setAttribute('data-action', 'navigate-stage');
    header.setAttribute('data-stage', index);
    
    header.innerHTML = `
      <div class="timeline-indicator w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-colors duration-200 ${
        index === this.currentStage ? 'bg-orange-500 border-orange-500 text-white' : 
        index < this.currentStage ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-600'
      }">
        <span class="text-sm font-medium">${index + 1}</span>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900">${this.sanitizer.escapeHtml(stage.title)}</h3>
        <p class="text-sm text-gray-600">${this.sanitizer.escapeHtml(stage.subtitle || '')}</p>
      </div>
      <svg class="chevron w-5 h-5 text-gray-400 transform transition-transform duration-200 ${index === this.currentStage ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    `;
    
    // Stage content (collapsed by default except current stage)
    const content = document.createElement('div');
    content.className = `stage-content ${index === this.currentStage ? 'expanded' : 'collapsed'}`;
    content.innerHTML = this.createStageContent(stage, index);
    
    stageDiv.appendChild(header);
    stageDiv.appendChild(content);
    
    return stageDiv;
  }

  /**
   * Create stage content with checklists and notes
   */
  createStageContent(stage, stageIndex) {
    let content = '';
    
    if (stage.description) {
      content += `
        <div class="stage-description mb-6 text-gray-700">
          ${this.sanitizer.renderSafeHTML(stage.description)}
        </div>
      `;
    }
    
    if (stage.checklist?.length) {
      content += `
        <div class="checklist-section mb-6">
          <h4 class="font-medium text-gray-900 mb-3">Action Items</h4>
          <div class="space-y-2">
            ${stage.checklist.map((item, itemIndex) => {
              const checkboxId = `stage-${stageIndex}-item-${itemIndex}`;
              const isChecked = this.state.checklists[checkboxId] || false;
              return `
                <label class="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer ${isChecked ? 'checked-item' : ''}">
                  <input type="checkbox" 
                         class="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" 
                         id="${checkboxId}"
                         data-action="toggle-checkbox"
                         data-id="${checkboxId}"
                         ${isChecked ? 'checked' : ''}>
                  <span class="text-sm text-gray-700 ${isChecked ? 'line-through text-gray-500' : ''}">${this.sanitizer.escapeHtml(item)}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    // Notes section
    const notesId = `stage-${stageIndex}-notes`;
    const notesValue = this.state.notes[notesId] || '';
    content += `
      <div class="notes-section">
        <label for="${notesId}" class="block text-sm font-medium text-gray-700 mb-2">Notes & Insights</label>
        <textarea id="${notesId}" 
                  class="note-textarea w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px] resize-vertical"
                  placeholder="Add your notes, insights, and next steps here...">${this.sanitizer.escapeHtml(notesValue)}</textarea>
      </div>
    `;
    
    return content;
  }

  /**
   * Toggle persona expansion with smooth animation
   */
  togglePersona(index, industry) {
    const personaCard = this.$(`[data-persona-index="${index}"][data-industry="${industry}"]`);
    if (!personaCard) return;
    
    const content = personaCard.querySelector('.persona-content');
    const chevron = personaCard.querySelector('.chevron');
    
    if (!content) return;
    
    const isExpanded = !content.classList.contains('hidden');
    
    if (isExpanded) {
      // Collapse
      content.style.maxHeight = content.scrollHeight + 'px';
      requestAnimationFrame(() => {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        chevron?.classList.remove('rotate-90');
      });
      
      setTimeout(() => {
        content.classList.add('hidden');
        content.style.maxHeight = '';
        content.style.opacity = '';
      }, 200);
      
    } else {
      // Expand
      content.classList.remove('hidden');
      content.style.maxHeight = '0px';
      content.style.opacity = '0';
      
      requestAnimationFrame(() => {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        chevron?.classList.add('rotate-90');
      });
      
      setTimeout(() => {
        content.style.maxHeight = '';
      }, 200);
    }
    
    // Track persona interaction
    this.trackUserAction('persona_expanded', 'persona_interaction', { 
      personaIndex: index, 
      industry: industry,
      action: isExpanded ? 'collapsed' : 'expanded'
    });
  }

  /**
   * Navigate to specific stage with smooth transition
   */
  navigateToStage(stageIndex) {
    if (stageIndex === this.currentStage) return;
    
    const previousStage = this.currentStage;
    this.currentStage = stageIndex;
    
    // Update stage visibility
    this.$$('.stage-container').forEach((stage, index) => {
      const content = stage.querySelector('.stage-content');
      const chevron = stage.querySelector('.chevron');
      const indicator = stage.querySelector('.timeline-indicator');
      
      if (index === stageIndex) {
        // Expand current stage
        stage.classList.add('active');
        content?.classList.remove('collapsed');
        content?.classList.add('expanded');
        chevron?.classList.add('rotate-90');
        
        if (indicator) {
          indicator.className = indicator.className.replace(/bg-\w+-\d+|border-\w+-\d+|text-\w+/g, '');
          indicator.classList.add('bg-orange-500', 'border-orange-500', 'text-white');
        }
        
      } else {
        // Collapse other stages
        stage.classList.remove('active');
        content?.classList.remove('expanded');
        content?.classList.add('collapsed');
        chevron?.classList.remove('rotate-90');
        
        if (indicator) {
          indicator.className = indicator.className.replace(/bg-\w+-\d+|border-\w+-\d+|text-\w+/g, '');
          if (index < stageIndex) {
            indicator.classList.add('bg-green-500', 'border-green-500', 'text-white');
          } else {
            indicator.classList.add('bg-gray-200', 'border-gray-300', 'text-gray-600');
          }
        }
      }
    });
    
    // Smooth scroll to active stage
    const activeStage = this.$(`[data-stage="${stageIndex}"]`);
    if (activeStage) {
      activeStage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
    
    // Track stage navigation
    this.trackUserAction('stage_navigation', 'navigation', {
      fromStage: previousStage,
      toStage: stageIndex,
      method: 'click'
    });
    
    // Update progress indicators
    this.updateProgressIndicators();
  }

  /**
   * Enhanced checkbox handling with state persistence
   */
  handleCheckboxChange(checkbox) {
    const checkboxId = checkbox.id;
    const isChecked = checkbox.checked;
    
    // Update state
    this.state.checklists[checkboxId] = isChecked;
    
    // Update UI
    const label = checkbox.closest('label');
    const textSpan = label?.querySelector('span');
    
    if (label && textSpan) {
      if (isChecked) {
        label.classList.add('checked-item');
        textSpan.classList.add('line-through', 'text-gray-500');
        textSpan.classList.remove('text-gray-700');
      } else {
        label.classList.remove('checked-item');
        textSpan.classList.remove('line-through', 'text-gray-500');
        textSpan.classList.add('text-gray-700');
      }
    }
    
    // Update progress
    this.updateProgressIndicators();
    
    // Save state
    this.saveState();
    
    // Track completion
    this.trackUserAction('checkbox_toggle', 'interaction', {
      checkboxId: checkboxId,
      checked: isChecked
    });
  }

  /**
   * Enhanced note handling with auto-save
   */
  handleNoteChange(textarea) {
    const noteId = textarea.id;
    const value = textarea.value;
    
    // Update state
    this.state.notes[noteId] = value;
    
    // Save state
    this.saveState();
    
    // Track note taking
    this.trackUserAction('note_update', 'interaction', {
      noteId: noteId,
      hasContent: value.length > 0,
      length: value.length
    });
  }

  /**
   * Industry change with optimized re-rendering
   */
  changeIndustry(industry) {
    if (industry === this.currentIndustry) return;
    
    const previousIndustry = this.currentIndustry;
    this.currentIndustry = industry;
    
    // Update industry selector
    const industrySelector = this.$('#industry-selector');
    if (industrySelector) {
      industrySelector.value = industry;
    }
    
    // Update visible personas
    this.$$('.personas-section').forEach(section => {
      const sectionIndustry = section.getAttribute('data-industry');
      if (sectionIndustry === industry) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
    
    // Update LOB options
    this.updateLOBOptions(industry);
    
    // Track industry change
    this.trackUserAction('industry_changed', 'selection', {
      from: previousIndustry,
      to: industry
    });
    
    // Re-render if needed
    this.deferredRender();
  }

  /**
   * Update LOB options based on industry
   */
  updateLOBOptions(industry) {
    const lobSelector = this.$('#lob-selector');
    if (!lobSelector) return;
    
    const options = this.appData.lobOptions?.[industry] || this.appData.lobOptions?.general || [];
    
    lobSelector.innerHTML = options.map(option => 
      `<option value="${option.value}">${this.sanitizer.escapeHtml(option.label)}</option>`
    ).join('');
  }

  /**
   * Update progress indicators
   */
  updateProgressIndicators() {
    // Update individual stage progress
    this.$$('.stage-container').forEach((stage, index) => {
      const progressBar = stage.querySelector('.progress-bar');
      if (progressBar) {
        const checkboxes = stage.querySelectorAll('input[type="checkbox"]');
        const checkedBoxes = stage.querySelectorAll('input[type="checkbox"]:checked');
        const progress = checkboxes.length > 0 ? (checkedBoxes.length / checkboxes.length) * 100 : 0;
        progressBar.style.width = `${progress}%`;
      }
    });
    
    // Update overall progress
    const allCheckboxes = this.$$('input[type="checkbox"]');
    const allChecked = this.$$('input[type="checkbox"]:checked');
    const overallProgress = allCheckboxes.length > 0 ? (allChecked.length / allCheckboxes.length) * 100 : 0;
    
    const overallProgressBar = this.$('#overall-progress-bar');
    if (overallProgressBar) {
      overallProgressBar.style.width = `${overallProgress}%`;
    }
    
    const progressText = this.$('#progress-text');
    if (progressText) {
      progressText.textContent = `${Math.round(overallProgress)}% Complete`;
    }
  }

  /**
   * Clear form state with confirmation
   */
  clearFormState() {
    if (!confirm('Are you sure you want to clear all progress and notes? This cannot be undone.')) {
      return;
    }
    
    // Clear state
    this.state = { checklists: {}, notes: {} };
    
    // Clear UI
    this.$$('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
      const label = checkbox.closest('label');
      const textSpan = label?.querySelector('span');
      if (label && textSpan) {
        label.classList.remove('checked-item');
        textSpan.classList.remove('line-through', 'text-gray-500');
        textSpan.classList.add('text-gray-700');
      }
    });
    
    this.$$('.note-textarea').forEach(textarea => {
      textarea.value = '';
    });
    
    // Update progress
    this.updateProgressIndicators();
    
    // Clear storage
    this.clearStorage();
    
    // Track action
    this.trackUserAction('form_cleared', 'action');
    
    console.log('Form state cleared');
  }

  /**
   * Export data functionality
   */
  exportData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      currentStage: this.currentStage,
      currentIndustry: this.currentIndustry,
      checklists: this.state.checklists,
      notes: this.state.notes,
      progress: this.calculateProgress(),
      analytics: this.modules.get('analytics')?.exportData() || null
    };
    
    // Create and trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uipath-sales-guide-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Track export
    this.trackUserAction('data_exported', 'action');
  }

  /**
   * Calculate overall progress
   */
  calculateProgress() {
    const allCheckboxes = this.$$('input[type="checkbox"]');
    const allChecked = this.$$('input[type="checkbox"]:checked');
    const notesWithContent = Object.values(this.state.notes).filter(note => note.trim().length > 0);
    
    return {
      checklistProgress: allCheckboxes.length > 0 ? (allChecked.length / allCheckboxes.length) * 100 : 0,
      notesCount: notesWithContent.length,
      totalCheckboxes: allCheckboxes.length,
      completedCheckboxes: allChecked.length,
      currentStage: this.currentStage,
      stagesCompleted: this.calculateCompletedStages()
    };
  }

  calculateCompletedStages() {
    let completed = 0;
    this.$$('.stage-container').forEach((stage, index) => {
      const checkboxes = stage.querySelectorAll('input[type="checkbox"]');
      const checkedBoxes = stage.querySelectorAll('input[type="checkbox"]:checked');
      if (checkboxes.length > 0 && checkedBoxes.length === checkboxes.length) {
        completed++;
      }
    });
    return completed;
  }

  /**
   * State management
   */
  loadState() {
    try {
      const saved = localStorage.getItem('uipathSalesGuideState');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { 
          checklists: parsed.checklists || {}, 
          notes: parsed.notes || {} 
        };
        this.currentStage = parsed.currentStage || 0;
        this.currentIndustry = parsed.currentIndustry || 'banking';
      }
    } catch (error) {
      console.warn('Failed to load state:', error);
      this.state = { checklists: {}, notes: {} };
    }
  }

  saveState() {
    try {
      const stateToSave = {
        ...this.state,
        currentStage: this.currentStage,
        currentIndustry: this.currentIndustry,
        timestamp: Date.now()
      };
      localStorage.setItem('uipathSalesGuideState', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }

  clearStorage() {
    try {
      localStorage.removeItem('uipathSalesGuideState');
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }

  /**
   * Admin integration
   */
  initializeAdminIntegration() {
    if (!this.features.adminIntegration) return;
    
    // Listen for admin updates
    window.addEventListener('message', this.handleAdminMessage.bind(this));
    
    // Setup live reload capability for admin changes
    this.setupLiveReload();
  }

  handleAdminMessage(event) {
    if (event.origin !== window.location.origin) return;
    
    const { type, data } = event.data || {};
    
    switch (type) {
      case 'admin:content-updated':
        this.handleContentUpdate(data);
        break;
      case 'admin:data-changed':
        this.reloadData();
        break;
      case 'admin:style-updated':
        this.refreshStyles();
        break;
    }
  }

  handleContentUpdate(data) {
    console.log('🔄 Content updated from admin panel:', data);
    
    // Refresh specific sections or full reload
    if (data.section) {
      this.refreshSection(data.section);
    } else {
      this.reloadData();
    }
  }

  setupLiveReload() {
    // Check for updates every 30 seconds in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setInterval(() => {
        this.checkForUpdates();
      }, 30000);
    }
  }

  async checkForUpdates() {
    // Implementation for checking admin updates
    // This would typically check a timestamp or version number
  }

  /**
   * Utility methods
   */
  extractDataFromElement(element) {
    const data = {};
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        const key = attr.name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        data[key] = attr.value;
      }
    });
    return data;
  }

  trackUserAction(eventType, category, data = {}) {
    const analytics = this.modules.get('analytics');
    if (analytics && analytics.trackEvent) {
      analytics.trackEvent(eventType, { category, ...data });
    }
    
    console.log(`📊 ${eventType}:`, { category, ...data });
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

  dispatchCustomEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Create fallback UI
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-fallback bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-4';
    errorMessage.innerHTML = `
      <h3 class="font-semibold mb-2">Application Error</h3>
      <p class="text-sm">The application failed to initialize properly. Please refresh the page or contact support.</p>
      <button onclick="window.location.reload()" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
        Refresh Page
      </button>
    `;
    
    document.body.insertBefore(errorMessage, document.body.firstChild);
  }

  // Navigation helpers
  nextStage() {
    if (this.currentStage < this.getStageCount() - 1) {
      this.navigateToStage(this.currentStage + 1);
    }
  }

  previousStage() {
    if (this.currentStage > 0) {
      this.navigateToStage(this.currentStage - 1);
    }
  }

  getStageCount() {
    return this.$$('.stage-container').length || 5;
  }

  handleEscape() {
    // Close any open modals or dropdowns
    const openDropdowns = this.$$('.dropdown-open');
    openDropdowns.forEach(dropdown => {
      dropdown.classList.remove('dropdown-open');
    });
    
    // Focus management
    const activeElement = document.activeElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  }

  // Performance optimizations
  deferredRender() {
    if (!this.renderTimeout) {
      this.renderTimeout = setTimeout(() => {
        this.render();
        this.renderTimeout = null;
      }, 16); // ~60fps
    }
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, { rootMargin: '50px' });
    }
  }

  setupLazyLoading() {
    const lazyElements = this.$$('[data-lazy]');
    if (this.observer) {
      lazyElements.forEach(el => this.observer.observe(el));
    }
  }

  initializeVirtualScrolling() {
    // Implement virtual scrolling for large persona lists if needed
    const longLists = this.$$('.personas-list');
    longLists.forEach(list => {
      if (list.children.length > 20) {
        // Implement virtual scrolling
        this.applyVirtualScrolling(list);
      }
    });
  }

  applyVirtualScrolling(container) {
    // Simple virtual scrolling implementation
    // In a production app, you might use a more sophisticated solution
    const items = Array.from(container.children);
    const itemHeight = 200; // estimated item height
    const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    
    let scrollTop = 0;
    
    const updateVisibleItems = () => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      
      items.forEach((item, index) => {
        if (index >= startIndex && index <= endIndex) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    };
    
    container.addEventListener('scroll', this.debounce(() => {
      scrollTop = container.scrollTop;
      updateVisibleItems();
    }, 10));
    
    updateVisibleItems();
  }

  handleBeforeUnload() {
    // Save state before page unload
    this.saveState();
    
    // Track session end
    this.trackUserAction('session_end', 'navigation');
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.saveState();
      this.trackUserAction('page_hidden', 'navigation');
    } else {
      this.trackUserAction('page_visible', 'navigation');
    }
  }

  initializePerformanceMonitoring() {
    const perfManager = this.modules.get('performance');
    if (perfManager) {
      perfManager.startMonitoring();
    }
    
    // Monitor app-specific metrics
    this.monitorAppPerformance();
  }

  monitorAppPerformance() {
    // Monitor render performance
    const renderObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.startsWith('render-')) {
          this.trackUserAction('performance_metric', 'performance', {
            metric: entry.name,
            duration: entry.duration
          });
        }
      }
    });
    
    renderObserver.observe({ entryTypes: ['measure'] });
    
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.trackUserAction('memory_usage', 'performance', {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        });
      }, 60000); // Every minute
    }
  }

  // Default data fallbacks
  getDefaultStages() {
    return [
      {
        title: "Discovery",
        subtitle: "Find Impact, Build Trust",
        description: "Understand the customer's current state and identify opportunities for automation.",
        checklist: [
          "Conduct stakeholder interviews",
          "Map current processes",
          "Identify pain points",
          "Quantify potential impact"
        ]
      },
      {
        title: "Business Qualification", 
        subtitle: "Value, Sponsor, Compelling Event",
        description: "Establish business value and decision-making process.",
        checklist: [
          "Define business case",
          "Identify executive sponsor",
          "Establish timeline and budget",
          "Map decision criteria"
        ]
      },
      {
        title: "Technical Qualification",
        subtitle: "Feasibility, Risk, Architecture", 
        description: "Assess technical requirements and implementation approach.",
        checklist: [
          "Evaluate technical architecture",
          "Assess integration requirements",
          "Review security and compliance",
          "Plan implementation approach"
        ]
      },
      {
        title: "Proposal & Negotiation",
        subtitle: "Commercials, Scope, Success Plan",
        description: "Present solution and negotiate terms.",
        checklist: [
          "Prepare detailed proposal",
          "Present to stakeholders",
          "Negotiate terms and pricing",
          "Finalize success criteria"
        ]
      },
      {
        title: "Implement & Expand", 
        subtitle: "Deliver Value, Land & Expand",
        description: "Ensure successful implementation and identify expansion opportunities.",
        checklist: [
          "Execute implementation plan",
          "Monitor success metrics",
          "Gather feedback and iterate",
          "Identify expansion opportunities"
        ]
      }
    ];
  }
}

// ==================== INITIALIZATION ====================
let optimizedApp = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOptimizedApp);
} else {
  initializeOptimizedApp();
}

function initializeOptimizedApp() {
  if (optimizedApp) {
    console.warn('Optimized Timeline App already initialized');
    return;
  }
  
  optimizedApp = new OptimizedTimelineApp();
  
  // Make globally available
  window.OptimizedTimelineApp = OptimizedTimelineApp;
  window.optimizedApp = optimizedApp;
  
  console.log('🚀 Optimized Timeline App ready for initialization');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OptimizedTimelineApp };
}