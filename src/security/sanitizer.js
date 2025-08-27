/**
 * HTML Sanitization Module
 * Prevents XSS attacks by sanitizing all dynamic HTML content
 */

class Sanitizer {
  constructor() {
    // Allowed HTML tags and attributes for different contexts
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li'],
      formatting: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    };
    
    this.allowedAttributes = {
      'a': ['href', 'target', 'rel'],
      'span': ['class'],
      'div': ['class'],
      'p': ['class'],
      'h1': ['class'],
      'h2': ['class'],
      'h3': ['class'],
      'h4': ['class'],
      'h5': ['class'],
      'h6': ['class']
    };
  }

  /**
   * Sanitize HTML content for safe insertion
   * @param {string} html - Raw HTML content
   * @param {string} level - Security level: 'strict', 'basic', 'links'
   * @returns {string} Sanitized HTML
   */
  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    
    // For strict mode, only allow text content
    if (level === 'strict') {
      return this.escapeHtml(html);
    }
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get allowed tags for this level
    const allowedTagsForLevel = this.getAllowedTagsForLevel(level);
    
    // Recursively clean the DOM
    this.cleanNode(temp, allowedTagsForLevel);
    
    return temp.innerHTML;
  }

  /**
   * Escape HTML entities for safe text display
   * @param {string} text - Raw text
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get allowed tags for security level
   * @param {string} level - Security level
   * @returns {Set} Set of allowed tags
   */
  getAllowedTagsForLevel(level) {
    const tags = new Set(this.allowedTags.basic);
    
    if (level === 'links' || level === 'full') {
      this.allowedTags.links.forEach(tag => tags.add(tag));
      this.allowedTags.lists.forEach(tag => tags.add(tag));
    }
    
    if (level === 'full') {
      this.allowedTags.formatting.forEach(tag => tags.add(tag));
    }
    
    return tags;
  }

  /**
   * Recursively clean DOM nodes
   * @param {Element} node - DOM node to clean
   * @param {Set} allowedTags - Set of allowed tag names
   */
  cleanNode(node, allowedTags) {
    const children = Array.from(node.childNodes);
    
    children.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();
        
        if (!allowedTags.has(tagName)) {
          // Remove disallowed tags but keep their text content
          const textNode = document.createTextNode(child.textContent);
          node.replaceChild(textNode, child);
        } else {
          // Clean attributes
          this.cleanAttributes(child);
          // Recursively clean children
          this.cleanNode(child, allowedTags);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        // Text nodes are safe, keep them
      } else {
        // Remove other node types (comments, etc.)
        node.removeChild(child);
      }
    });
  }

  /**
   * Clean element attributes
   * @param {Element} element - DOM element to clean
   */
  cleanAttributes(element) {
    const tagName = element.tagName.toLowerCase();
    const allowedAttrs = this.allowedAttributes[tagName] || [];
    
    // Get all attributes
    const attributes = Array.from(element.attributes);
    
    attributes.forEach(attr => {
      if (!allowedAttrs.includes(attr.name)) {
        element.removeAttribute(attr.name);
      } else {
        // Sanitize attribute values
        const sanitizedValue = this.sanitizeAttributeValue(attr.name, attr.value);
        element.setAttribute(attr.name, sanitizedValue);
      }
    });
  }

  /**
   * Sanitize attribute values
   * @param {string} attrName - Attribute name
   * @param {string} attrValue - Attribute value
   * @returns {string} Sanitized value
   */
  sanitizeAttributeValue(attrName, attrValue) {
    if (attrName === 'href') {
      // Only allow safe URL schemes
      const safeSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
      try {
        const url = new URL(attrValue, window.location.origin);
        if (!safeSchemes.includes(url.protocol)) {
          return '#';
        }
        return attrValue;
      } catch (e) {
        return '#';
      }
    }
    
    if (attrName === 'target') {
      return attrValue === '_blank' ? '_blank' : '_self';
    }
    
    if (attrName === 'rel') {
      return 'noopener noreferrer';
    }
    
    if (attrName === 'class') {
      // Only allow alphanumeric, dash, underscore in class names
      return attrValue.replace(/[^a-zA-Z0-9\-_ ]/g, '');
    }
    
    return this.escapeHtml(attrValue);
  }

  /**
   * Safe innerHTML replacement
   * @param {Element} element - Target element
   * @param {string} html - HTML content
   * @param {string} level - Security level
   */
  safeSetHTML(element, html, level = 'basic') {
    if (!element || !html) return;
    
    const sanitizedHTML = this.sanitize(html, level);
    element.innerHTML = sanitizedHTML;
  }
}

// Export the class for module system
export { Sanitizer };

// Create singleton instance
const sanitizer = new Sanitizer();

// Export singleton as default for direct usage
export default sanitizer;

// Global fallback
if (typeof window !== 'undefined') {
  window.HTMLSanitizer = sanitizer;
}