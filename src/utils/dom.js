/**
 * DOM Utility Functions
 * Safe DOM manipulation utilities
 */

import sanitizer from '../security/sanitizer.js';

/**
 * Safe querySelector wrapper
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} Found element
 */
export function $(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error('Invalid selector:', selector, error);
    return null;
  }
}

/**
 * Safe querySelectorAll wrapper
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList} Found elements
 */
export function $$(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.error('Invalid selector:', selector, error);
    return [];
  }
}

/**
 * Safe element creation with sanitized content
 * @param {string} tagName - Tag name
 * @param {Object} options - Element options
 * @returns {Element} Created element
 */
export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  
  if (options.className) {
    element.className = sanitizer.sanitize(options.className, 'strict');
  }
  
  if (options.textContent) {
    element.textContent = options.textContent;
  }
  
  if (options.innerHTML) {
    sanitizer.safeSetHTML(element, options.innerHTML, options.securityLevel || 'basic');
  }
  
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, sanitizer.sanitize(value, 'strict'));
    });
  }
  
  if (options.eventListeners) {
    Object.entries(options.eventListeners).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }
  
  return element;
}

/**
 * Safe innerHTML replacement
 * @param {Element} element - Target element
 * @param {string} html - HTML content
 * @param {string} securityLevel - Security level for sanitization
 */
export function safeSetHTML(element, html, securityLevel = 'basic') {
  if (!element) return;
  sanitizer.safeSetHTML(element, html, securityLevel);
}

/**
 * Safe event listener addition
 * @param {Element|string} target - Target element or selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function addEventListener(target, event, handler, options = {}) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;
  
  const safeHandler = (e) => {
    try {
      handler(e);
    } catch (error) {
      console.error('Event handler error:', error);
    }
  };
  
  element.addEventListener(event, safeHandler, options);
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
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
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
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

/**
 * Show element with animation
 * @param {Element} element - Element to show
 * @param {string} animation - Animation class
 */
export function showElement(element, animation = 'fade-in') {
  if (!element) return;
  
  element.classList.remove('hidden');
  if (animation) {
    element.classList.add(animation);
  }
}

/**
 * Hide element with animation
 * @param {Element} element - Element to hide
 * @param {string} animation - Animation class
 */
export function hideElement(element, animation = 'fade-out') {
  if (!element) return;
  
  if (animation) {
    element.classList.add(animation);
    setTimeout(() => {
      element.classList.add('hidden');
      element.classList.remove(animation);
    }, 300);
  } else {
    element.classList.add('hidden');
  }
}

/**
 * Toggle element visibility
 * @param {Element} element - Element to toggle
 * @param {boolean} force - Force show (true) or hide (false)
 */
export function toggleElement(element, force) {
  if (!element) return;
  
  if (typeof force === 'boolean') {
    if (force) {
      showElement(element);
    } else {
      hideElement(element);
    }
  } else {
    const isHidden = element.classList.contains('hidden');
    if (isHidden) {
      showElement(element);
    } else {
      hideElement(element);
    }
  }
}

/**
 * Safe form data extraction
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data
 */
export function getFormData(form) {
  if (!form) return {};
  
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    // Sanitize form values
    data[key] = sanitizer.sanitize(value, 'strict');
  }
  
  return data;
}

/**
 * Copy text to clipboard safely
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}