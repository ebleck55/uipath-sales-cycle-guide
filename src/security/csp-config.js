/**
 * Content Security Policy Configuration
 * Defines CSP headers for enhanced security
 */

export const CSP_CONFIG = {
  // Directive definitions
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for inline scripts in GitHub Pages
      "https://cdn.tailwindcss.com",
      "https://fonts.googleapis.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for inline styles
      "https://fonts.googleapis.com",
      "https://cdn.tailwindcss.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:"
    ],
    'connect-src': [
      "'self'",
      "https://api.anthropic.com" // Claude API
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },

  // Generate CSP header string
  generateHeader() {
    return Object.entries(this.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
};

/**
 * Apply CSP via meta tag (for GitHub Pages)
 */
export function applyCSSSecurityPolicy() {
  // Remove existing CSP meta tag
  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) {
    existingMeta.remove();
  }

  // Create new CSP meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = CSP_CONFIG.generateHeader();
  document.head.appendChild(meta);

  console.log('CSP applied:', meta.content);
}

/**
 * Additional security headers via meta tags
 */
export function applySecurityHeaders() {
  const securityHeaders = [
    // Prevent MIME type sniffing
    { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
    
    // Prevent clickjacking
    { httpEquiv: 'X-Frame-Options', content: 'DENY' },
    
    // Enable XSS protection
    { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
    
    // Referrer policy
    { name: 'referrer', content: 'strict-origin-when-cross-origin' }
  ];

  securityHeaders.forEach(header => {
    const meta = document.createElement('meta');
    if (header.httpEquiv) {
      meta.httpEquiv = header.httpEquiv;
    } else if (header.name) {
      meta.name = header.name;
    }
    meta.content = header.content;
    document.head.appendChild(meta);
  });
}

/**
 * Initialize all security policies
 */
export function initializeSecurity() {
  // Apply CSP
  applyCSSSecurityPolicy();
  
  // Apply additional security headers
  applySecurityHeaders();
  
  // Set up security monitoring
  setupSecurityMonitoring();
}

/**
 * Set up security event monitoring
 */
function setupSecurityMonitoring() {
  // Monitor CSP violations
  document.addEventListener('securitypolicyviolation', (event) => {
    console.error('CSP Violation:', {
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      originalPolicy: event.originalPolicy
    });
    
    // Log violation for analysis
    logSecurityViolation(event);
  });

  // Monitor for potential XSS attempts
  window.addEventListener('error', (event) => {
    if (event.message.includes('script') || event.message.includes('eval')) {
      console.warn('Potential XSS attempt detected:', event);
      logSecurityViolation(event);
    }
  });
}

/**
 * Log security violations
 * @param {Event} event - Security violation event
 */
function logSecurityViolation(event) {
  const violation = {
    timestamp: new Date().toISOString(),
    type: event.type,
    message: event.message || 'CSP Violation',
    details: {
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      source: event.source,
      lineno: event.lineno,
      colno: event.colno
    },
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Store violations in sessionStorage for debugging
  const violations = JSON.parse(sessionStorage.getItem('security_violations') || '[]');
  violations.push(violation);
  
  // Keep only last 50 violations
  if (violations.length > 50) {
    violations.shift();
  }
  
  sessionStorage.setItem('security_violations', JSON.stringify(violations));
}