// Performance optimizations for UiPath Sales Cycle Guide

// Lazy loading for images (if any are added later)
const observerOptions = {
  threshold: 0.1,
  rootMargin: '50px'
};

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('skeleton');
        imageObserver.unobserve(img);
      }
    }
  });
}, observerOptions);

// Debounce utility for scroll and resize events
function debounce(func, wait) {
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

// Throttle utility for high-frequency events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Virtual scrolling for large lists (future enhancement)
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.scrollTop = 0;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.init();
  }

  init() {
    this.container.addEventListener('scroll', throttle(() => {
      this.updateVisibleItems();
    }, 16));
    
    window.addEventListener('resize', debounce(() => {
      this.updateVisibleItems();
    }, 100));
  }

  setItems(items) {
    this.items = items;
    this.updateVisibleItems();
  }

  updateVisibleItems() {
    const containerHeight = this.container.clientHeight;
    const scrollTop = this.container.scrollTop;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.min(
      this.visibleStart + Math.ceil(containerHeight / this.itemHeight) + 1,
      this.items.length
    );
    
    this.render();
  }

  render() {
    // Implementation for rendering only visible items
    // This would be used for very large datasets
  }
}

// Performance monitoring
const performanceMonitor = {
  metrics: {},
  
  start(name) {
    this.metrics[name] = performance.now();
  },
  
  end(name) {
    if (this.metrics[name]) {
      const duration = performance.now() - this.metrics[name];
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      delete this.metrics[name];
      return duration;
    }
  },
  
  measure(name, fn) {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }
};

// Service Worker registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Progressive Web App features
function initPWA() {
  // Add to homescreen prompt
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if desired
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      });
    }
  });
}

// Critical resource hints
function addResourceHints() {
  const head = document.head;
  
  // Preconnect to critical domains
  const preconnects = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.tailwindcss.com'
  ];
  
  preconnects.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (url.includes('gstatic')) {
      link.crossOrigin = true;
    }
    head.appendChild(link);
  });
}

// Memory management
const memoryManager = {
  cleanup() {
    // Clean up any cached data that's no longer needed
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  },
  
  monitor() {
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  }
};

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  initPWA();
  
  // Performance monitoring for page load
  performanceMonitor.start('pageLoad');
  
  window.addEventListener('load', () => {
    performanceMonitor.end('pageLoad');
    
    // Monitor memory usage in development
    if (process?.env?.NODE_ENV === 'development') {
      memoryManager.monitor();
      
      // Set up periodic memory monitoring
      setInterval(() => {
        memoryManager.monitor();
      }, 30000); // Every 30 seconds
    }
  });
});

// Export utilities for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    throttle,
    performanceMonitor,
    memoryManager,
    VirtualScroller
  };
}