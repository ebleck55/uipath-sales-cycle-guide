/**
 * API Security Module
 * Handles secure API key management and API calls without CORS proxy
 */

class APISecurityManager {
  constructor() {
    this.encryptionKey = null;
    this.initializeEncryption();
    this.rateLimiter = new Map();
  }

  /**
   * Initialize client-side encryption for API keys
   * Note: This is obfuscation, not true security. For production, use a backend.
   */
  async initializeEncryption() {
    // Generate a session-specific key for obfuscation
    const sessionId = this.generateSessionId();
    this.encryptionKey = await this.deriveKey(sessionId);
  }

  /**
   * Generate a session-specific ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  /**
   * Derive encryption key from session ID
   * @param {string} sessionId - Session identifier
   * @returns {Promise<string>} Derived key
   */
  async deriveKey(sessionId) {
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(sessionId);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('WebCrypto not available, using fallback encryption');
      }
    }
    
    // Fallback for older browsers
    return this.simpleHash(sessionId);
  }

  /**
   * Simple hash function for fallback
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Obfuscate API key for storage
   * @param {string} apiKey - Raw API key
   * @returns {string} Obfuscated key
   */
  obfuscateApiKey(apiKey) {
    if (!apiKey || !this.encryptionKey) return '';
    
    const combined = apiKey + this.encryptionKey;
    return btoa(combined).split('').reverse().join('');
  }

  /**
   * Deobfuscate API key from storage
   * @param {string} obfuscatedKey - Obfuscated key
   * @returns {string} Raw API key
   */
  deobfuscateApiKey(obfuscatedKey) {
    if (!obfuscatedKey || !this.encryptionKey) return '';
    
    try {
      const reversed = obfuscatedKey.split('').reverse().join('');
      const decoded = atob(reversed);
      return decoded.replace(this.encryptionKey, '');
    } catch (error) {
      console.error('Failed to deobfuscate API key');
      return '';
    }
  }

  /**
   * Securely store API key
   * @param {string} apiKey - API key to store
   */
  async storeApiKey(apiKey) {
    if (!apiKey) return;
    
    const obfuscated = this.obfuscateApiKey(apiKey);
    
    // Store with session expiry (24 hours)
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    const keyData = {
      key: obfuscated,
      expiry: expiry,
      checksum: this.createChecksum(apiKey)
    };
    
    sessionStorage.setItem('secure_api_key', JSON.stringify(keyData));
  }

  /**
   * Retrieve stored API key
   * @returns {string|null} API key or null if not found/expired
   */
  getStoredApiKey() {
    try {
      const keyData = JSON.parse(sessionStorage.getItem('secure_api_key') || '{}');
      
      // Check if expired
      if (!keyData.expiry || Date.now() > keyData.expiry) {
        this.clearStoredApiKey();
        return null;
      }
      
      const apiKey = this.deobfuscateApiKey(keyData.key);
      
      // Verify integrity
      if (this.createChecksum(apiKey) !== keyData.checksum) {
        this.clearStoredApiKey();
        return null;
      }
      
      return apiKey;
    } catch (error) {
      console.error('Failed to retrieve API key');
      this.clearStoredApiKey();
      return null;
    }
  }

  /**
   * Clear stored API key
   */
  clearStoredApiKey() {
    sessionStorage.removeItem('secure_api_key');
  }

  /**
   * Create checksum for integrity verification
   * @param {string} data - Data to checksum
   * @returns {string} Checksum
   */
  createChecksum(data) {
    return this.simpleHash(data + 'integrity_salt');
  }

  /**
   * Rate limiting for API calls
   * @param {string} endpoint - API endpoint
   * @param {number} maxCalls - Maximum calls per minute
   * @returns {boolean} Whether call is allowed
   */
  isRateLimited(endpoint, maxCalls = 10) {
    const now = Date.now();
    const windowStart = now - (60 * 1000); // 1 minute window
    
    if (!this.rateLimiter.has(endpoint)) {
      this.rateLimiter.set(endpoint, []);
    }
    
    const calls = this.rateLimiter.get(endpoint);
    
    // Remove old calls outside the window
    const recentCalls = calls.filter(timestamp => timestamp > windowStart);
    this.rateLimiter.set(endpoint, recentCalls);
    
    if (recentCalls.length >= maxCalls) {
      return true; // Rate limited
    }
    
    // Add current call
    recentCalls.push(now);
    return false; // Not rate limited
  }

  /**
   * Make secure API call without CORS proxy
   * Uses direct API calls with proper headers
   * @param {string} url - API URL
   * @param {Object} options - Request options
   * @returns {Promise<Response>} API response
   */
  async secureApiCall(url, options = {}) {
    const apiKey = this.getStoredApiKey();
    if (!apiKey) {
      throw new Error('No API key available. Please configure your API key.');
    }

    // Check rate limiting
    if (this.isRateLimited(url)) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    // Prepare secure headers
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'User-Agent': 'UiPath-Sales-Guide/1.0',
      ...options.headers
    };

    // Remove any potential XSS headers
    delete headers['X-Forwarded-For'];
    delete headers['X-Real-IP'];

    const requestOptions = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit' // Don't send cookies
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Log API usage for monitoring
      this.logApiUsage(url, response.status);
      
      return response;
    } catch (error) {
      console.error('API call failed:', error.message);
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  /**
   * Log API usage for monitoring
   * @param {string} url - API URL
   * @param {number} status - Response status
   */
  logApiUsage(url, status) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      url: url.replace(/key=[^&]+/, 'key=***'), // Hide API key in logs
      status,
      userAgent: navigator.userAgent
    };
    
    // Store in sessionStorage for debugging (limit to last 100 entries)
    const logs = JSON.parse(sessionStorage.getItem('api_logs') || '[]');
    logs.push(logEntry);
    
    if (logs.length > 100) {
      logs.shift(); // Remove oldest entry
    }
    
    sessionStorage.setItem('api_logs', JSON.stringify(logs));
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Whether key format is valid
   */
  validateApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // Claude API keys typically start with 'sk-ant-' and are around 100+ characters
    return /^sk-ant-[a-zA-Z0-9\-_]{50,}$/.test(apiKey);
  }

  /**
   * Get API security status
   * @returns {Object} Security status information
   */
  getSecurityStatus() {
    const hasApiKey = !!this.getStoredApiKey();
    const rateLimitStatus = Array.from(this.rateLimiter.entries()).map(([endpoint, calls]) => ({
      endpoint,
      recentCalls: calls.length
    }));

    return {
      hasApiKey,
      keyExpiry: this.getKeyExpiry(),
      rateLimitStatus,
      encryptionEnabled: !!this.encryptionKey
    };
  }

  /**
   * Get API key expiry time
   * @returns {number|null} Expiry timestamp or null
   */
  getKeyExpiry() {
    try {
      const keyData = JSON.parse(sessionStorage.getItem('secure_api_key') || '{}');
      return keyData.expiry || null;
    } catch {
      return null;
    }
  }
}

// Create singleton instance
const apiSecurity = new APISecurityManager();

// Export for module usage
export default apiSecurity;

// Global fallback
if (typeof window !== 'undefined') {
  window.APISecurityManager = apiSecurity;
}