/**
 * UX Enhancer Module
 * Improves user experience with keyboard shortcuts, accessibility, and mobile optimizations
 */

class UXEnhancer {
  constructor() {
    this.shortcuts = new Map();
    this.focusHistory = [];
    this.gestureStartPos = null;
    this.touchStartTime = null;
    this.isTouch = 'ontouchstart' in window;
    this.prefersReducedMotion = this.checkReducedMotion();
    
    this.init();
  }

  /**
   * Initialize UX enhancements
   */
  init() {
    this.setupKeyboardShortcuts();
    this.setupAccessibility();
    this.setupMobileOptimizations();
    this.setupFocusManagement();
    this.setupPreferencesDetection();
    this.setupPerformanceOptimizations();
    
    console.log('🎯 UX Enhancer initialized with accessibility and mobile optimizations');
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Global shortcuts
    this.registerShortcut('/', () => this.focusSearch(), 'Focus search');
    this.registerShortcut('Escape', () => this.handleEscape(), 'Close/Cancel');
    this.registerShortcut('h', () => this.showHelp(), 'Show help');
    this.registerShortcut('?', () => this.showShortcuts(), 'Show shortcuts');
    
    // Navigation shortcuts
    this.registerShortcut('j', () => this.navigateNext(), 'Next item');
    this.registerShortcut('k', () => this.navigatePrevious(), 'Previous item');
    this.registerShortcut('Enter', () => this.activateSelected(), 'Activate selected');
    this.registerShortcut('Space', () => this.toggleSelected(), 'Toggle selected');
    
    // Timeline shortcuts
    this.registerShortcut('ArrowLeft', () => this.previousStage(), 'Previous stage');
    this.registerShortcut('ArrowRight', () => this.nextStage(), 'Next stage');
    this.registerShortcut('Home', () => this.firstStage(), 'First stage');
    this.registerShortcut('End', () => this.lastStage(), 'Last stage');
    
    // Persona shortcuts
    this.registerShortcut('p', () => this.togglePersonasSection(), 'Toggle personas');
    this.registerShortcut('u', () => this.toggleUseCasesSection(), 'Toggle use cases');
    this.registerShortcut('a', () => this.toggleAdminMode(), 'Toggle admin');
    
    // Quick actions
    this.registerShortcut('Ctrl+k', () => this.openCommandPalette(), 'Command palette');
    this.registerShortcut('Ctrl+/', () => this.toggleShortcutsModal(), 'Toggle shortcuts');

    // Setup event listener
    document.addEventListener('keydown', (event) => this.handleKeydown(event));
  }

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(key, handler, description) {
    this.shortcuts.set(key, { handler, description });
  }

  /**
   * Handle keydown events
   */
  handleKeydown(event) {
    // Skip if user is typing in an input
    if (this.isTyping(event.target)) return;
    
    // Build key combination
    const key = this.buildKeyCombo(event);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.handler();
    }
  }

  /**
   * Build key combination string
   */
  buildKeyCombo(event) {
    const parts = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey && event.key !== 'Shift') parts.push('Shift');
    
    if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift' && event.key !== 'Meta') {
      parts.push(event.key);
    }
    
    return parts.join('+');
  }

  /**
   * Check if user is typing in an input element
   */
  isTyping(element) {
    const typingElements = ['input', 'textarea', 'select'];
    const isTypingElement = typingElements.includes(element.tagName.toLowerCase());
    const isContentEditable = element.contentEditable === 'true';
    
    return isTypingElement || isContentEditable;
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    this.setupARIALabels();
    this.setupLiveRegions();
    this.setupSkipLinks();
    this.setupHighContrastMode();
    this.setupScreenReaderOptimizations();
  }

  /**
   * Setup ARIA labels and roles
   */
  setupARIALabels() {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('.persona-header').forEach((header, index) => {
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', `persona-content-${index}`);
      header.setAttribute('aria-label', `Expand persona details`);
      
      // Add corresponding IDs to content
      const content = header.nextElementSibling;
      if (content) {
        content.id = `persona-content-${index}`;
      }
    });

    // Timeline navigation
    document.querySelectorAll('.timeline-dot').forEach((dot, index) => {
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Go to stage ${index + 1}`);
      dot.setAttribute('tabindex', '0');
    });

    // Search functionality
    const searchInput = document.getElementById('llm-prompt-input');
    if (searchInput) {
      searchInput.setAttribute('aria-label', 'Search sales content');
      searchInput.setAttribute('aria-describedby', 'search-instructions');
    }
  }

  /**
   * Setup live regions for screen readers
   */
  setupLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);

    // Create assertive live region for urgent updates
    const assertiveLiveRegion = document.createElement('div');
    assertiveLiveRegion.id = 'assertive-live-region';
    assertiveLiveRegion.setAttribute('aria-live', 'assertive');
    assertiveLiveRegion.setAttribute('aria-atomic', 'true');
    assertiveLiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveLiveRegion);
  }

  /**
   * Announce to screen readers
   */
  announce(message, urgent = false) {
    const region = document.getElementById(urgent ? 'assertive-live-region' : 'live-region');
    if (region) {
      region.textContent = message;
      setTimeout(() => region.textContent = '', 1000);
    }
  }

  /**
   * Setup skip links for keyboard navigation
   */
  setupSkipLinks() {
    const skipLinks = `
      <div id="skip-links" class="fixed top-0 left-0 z-50">
        <a href="#timeline-section" class="skip-link">Skip to timeline</a>
        <a href="#personas-section" class="skip-link">Skip to personas</a>
        <a href="#use-cases-section" class="skip to use cases</a>
        <a href="#main-content" class="skip-link">Skip to main content</a>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', skipLinks);
  }

  /**
   * Setup mobile optimizations
   */
  setupMobileOptimizations() {
    this.setupTouchGestures();
    this.setupMobileNavigation();
    this.setupViewportOptimizations();
    this.setupMobilePerformance();
  }

  /**
   * Setup touch gestures
   */
  setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      if (event.touches.length > 0) return;
      
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;
      
      // Swipe detection
      const minSwipeDistance = 100;
      const maxSwipeTime = 300;
      
      if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.handleSwipeRight();
          } else {
            this.handleSwipeLeft();
          }
        }
      }
      
      // Double tap detection
      if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        this.handleDoubleTap(touch.clientX, touch.clientY);
      }
    }, { passive: true });
  }

  /**
   * Handle swipe gestures
   */
  handleSwipeLeft() {
    // Next stage or close expanded content
    if (this.hasExpandedPersona()) {
      this.collapseAllPersonas();
    } else {
      this.nextStage();
    }
    this.announce('Swiped left');
  }

  handleSwipeRight() {
    // Previous stage
    this.previousStage();
    this.announce('Swiped right');
  }

  handleDoubleTap(x, y) {
    const element = document.elementFromPoint(x, y);
    const personaCard = element.closest('.persona-card');
    
    if (personaCard) {
      this.togglePersonaCard(personaCard);
      this.announce('Double tapped persona');
    }
  }

  /**
   * Setup mobile navigation improvements
   */
  setupMobileNavigation() {
    // Add mobile-friendly touch targets
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .persona-header {
          min-height: 44px !important;
          padding: 12px !important;
        }
        
        .timeline-dot {
          min-width: 44px !important;
          min-height: 44px !important;
        }
        
        button, .clickable {
          min-height: 44px;
          min-width: 44px;
        }
        
        .mobile-optimized {
          font-size: 16px !important; /* Prevent zoom on iOS */
        }
      }
    `;
    document.head.appendChild(style);

    // Add mobile navigation hints
    if (this.isTouch) {
      this.addMobileHints();
    }
  }

  /**
   * Add mobile usage hints
   */
  addMobileHints() {
    const hints = document.createElement('div');
    hints.id = 'mobile-hints';
    hints.className = 'fixed bottom-4 left-4 right-4 bg-blue-100 text-blue-800 p-3 rounded-lg text-sm z-30';
    hints.innerHTML = `
      <div class="flex justify-between items-center">
        <span>💡 Swipe left/right to navigate stages, double-tap personas to expand</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 font-bold">&times;</button>
      </div>
    `;
    
    document.body.appendChild(hints);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (hints.parentElement) {
        hints.remove();
      }
    }, 5000);
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Track focus for better keyboard navigation
    document.addEventListener('focusin', (event) => {
      this.focusHistory.push(event.target);
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    });

    // Improve focus visibility
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
      .focus-visible {
        outline: 2px solid #3B82F6 !important;
        outline-offset: 2px !important;
      }
      
      .persona-header:focus-visible {
        background-color: #EBF5FF !important;
      }
      
      .skip-link {
        position: absolute;
        top: -100px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    document.head.appendChild(focusStyle);
  }

  /**
   * Setup preference detection
   */
  setupPreferencesDetection() {
    // Detect reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    this.prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Detect color scheme preference
    this.prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply preferences
    this.applyUserPreferences();
    
    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.applyMotionPreference();
    });
  }

  /**
   * Apply user preferences
   */
  applyUserPreferences() {
    if (this.prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
    }
    
    if (this.prefersHighContrast) {
      document.body.classList.add('high-contrast');
    }
    
    if (this.prefersDarkMode) {
      document.body.classList.add('dark-mode-preferred');
    }
  }

  /**
   * Check reduced motion preference
   */
  checkReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Debounced scroll handler
    const debouncedScrollHandler = this.debounce((event) => {
      this.handleScroll(event);
    }, 16); // ~60fps
    
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    
    // Throttled resize handler
    const throttledResizeHandler = this.throttle((event) => {
      this.handleResize(event);
    }, 250);
    
    window.addEventListener('resize', throttledResizeHandler, { passive: true });
  }

  /**
   * Shortcut implementations
   */
  focusSearch() {
    const searchInput = document.getElementById('llm-prompt-input');
    if (searchInput) {
      searchInput.focus();
      this.announce('Search focused');
    }
  }

  handleEscape() {
    // Close modals, expanded personas, etc.
    this.collapseAllPersonas();
    this.closeAllModals();
    
    // Return focus to main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.focus();
    
    this.announce('Closed');
  }

  showHelp() {
    // Show help modal or navigate to help section
    console.log('Help requested');
    this.announce('Help opened');
  }

  showShortcuts() {
    this.toggleShortcutsModal();
  }

  navigateNext() {
    // Navigate to next focusable persona or item
    const current = document.activeElement;
    const personas = document.querySelectorAll('.persona-header[tabindex="0"]');
    const currentIndex = Array.from(personas).indexOf(current);
    
    if (currentIndex < personas.length - 1) {
      personas[currentIndex + 1].focus();
      this.announce('Next persona');
    }
  }

  navigatePrevious() {
    // Navigate to previous focusable persona or item
    const current = document.activeElement;
    const personas = document.querySelectorAll('.persona-header[tabindex="0"]');
    const currentIndex = Array.from(personas).indexOf(current);
    
    if (currentIndex > 0) {
      personas[currentIndex - 1].focus();
      this.announce('Previous persona');
    }
  }

  activateSelected() {
    const focused = document.activeElement;
    if (focused && focused.click) {
      focused.click();
    }
  }

  toggleSelected() {
    this.activateSelected();
  }

  previousStage() {
    if (window.TimelineApp) {
      const current = window.appState?.get('currentStage') || 0;
      if (current > 0) {
        window.TimelineApp.navigateToStage(current - 1);
        this.announce(`Stage ${current} selected`);
      }
    }
  }

  nextStage() {
    if (window.TimelineApp) {
      const current = window.appState?.get('currentStage') || 0;
      const maxStage = window.SALES_CYCLE_DATA?.stages?.length - 1 || 0;
      if (current < maxStage) {
        window.TimelineApp.navigateToStage(current + 1);
        this.announce(`Stage ${current + 2} selected`);
      }
    }
  }

  firstStage() {
    if (window.TimelineApp) {
      window.TimelineApp.navigateToStage(0);
      this.announce('First stage selected');
    }
  }

  lastStage() {
    if (window.TimelineApp && window.SALES_CYCLE_DATA?.stages) {
      const lastIndex = window.SALES_CYCLE_DATA.stages.length - 1;
      window.TimelineApp.navigateToStage(lastIndex);
      this.announce('Last stage selected');
    }
  }

  togglePersonasSection() {
    const section = document.getElementById('personas-section');
    if (section) {
      const header = section.querySelector('.collapsible-header');
      if (header) {
        header.click();
        this.announce('Personas section toggled');
      }
    }
  }

  toggleUseCasesSection() {
    const section = document.getElementById('use-cases-section');
    if (section) {
      const header = section.querySelector('.collapsible-header');
      if (header) {
        header.click();
        this.announce('Use cases section toggled');
      }
    }
  }

  toggleAdminMode() {
    const adminBtn = document.getElementById('admin-mode-btn');
    if (adminBtn) {
      adminBtn.click();
      this.announce('Admin mode toggled');
    }
  }

  openCommandPalette() {
    console.log('Command palette requested');
    this.announce('Command palette opened');
  }

  toggleShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.classList.toggle('hidden');
    } else {
      this.createShortcutsModal();
    }
  }

  /**
   * Create shortcuts modal
   */
  createShortcutsModal() {
    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    const shortcutsList = Array.from(this.shortcuts.entries())
      .map(([key, {description}]) => `
        <div class="flex justify-between items-center py-2 border-b border-gray-200">
          <span class="text-gray-700">${description}</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono">${key}</kbd>
        </div>
      `).join('');
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Keyboard Shortcuts</h3>
            <button onclick="this.closest('#shortcuts-modal').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-1">
            ${shortcutsList}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus the modal
    modal.focus();
    
    // Close on escape or outside click
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Utility methods
   */
  hasExpandedPersona() {
    return document.querySelector('.persona-content:not(.hidden)') !== null;
  }

  collapseAllPersonas() {
    document.querySelectorAll('.persona-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    document.querySelectorAll('.persona-chevron').forEach(chevron => {
      chevron.style.transform = 'rotate(0deg)';
    });
  }

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.add('hidden');
    });
  }

  togglePersonaCard(card) {
    const index = card.dataset.personaIndex;
    if (window.TimelineApp && window.TimelineApp.togglePersonaCard) {
      window.TimelineApp.togglePersonaCard(parseInt(index));
    }
  }

  handleScroll(event) {
    // Handle scroll optimizations
  }

  handleResize(event) {
    // Handle resize optimizations
    this.updateViewportClass();
  }

  updateViewportClass() {
    const width = window.innerWidth;
    document.body.className = document.body.className.replace(/viewport-\w+/g, '');
    
    if (width < 768) {
      document.body.classList.add('viewport-mobile');
    } else if (width < 1024) {
      document.body.classList.add('viewport-tablet');
    } else {
      document.body.classList.add('viewport-desktop');
    }
  }

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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.uxEnhancer = new UXEnhancer();
  });
} else {
  window.uxEnhancer = new UXEnhancer();
}

// Export for use
window.UXEnhancer = UXEnhancer;