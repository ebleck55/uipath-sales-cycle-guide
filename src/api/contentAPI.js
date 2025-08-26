/**
 * Content API - Data Access Layer for UiPath Sales Guide
 * Provides clean interface to structured content with caching and filtering
 */

class ContentAPI {
  constructor() {
    this.cache = new Map();
    this.baseUrl = '../src/data/';
  }

  /**
   * Load and cache JSON data from file
   */
  async loadData(filename) {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const response = await fetch(`${this.baseUrl}${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return null;
    }
  }

  /**
   * Get all personas for a specific vertical
   */
  async getPersonas(vertical = null) {
    const data = await this.loadData('personas.json');
    if (!data) return [];

    if (vertical) {
      return data.personas[vertical] || [];
    }

    // Return all personas from all verticals
    return Object.values(data.personas).flat();
  }

  /**
   * Get personas filtered by tags
   */
  async getPersonasByTags(tags = [], vertical = null) {
    const personas = await this.getPersonas(vertical);
    
    if (!tags.length) return personas;

    return personas.filter(persona => {
      const personaTags = [
        ...(persona.tags.primary || []),
        ...(persona.tags.secondary || []),
        ...(persona.tags.pain_points || []),
        ...(persona.tags.interests || [])
      ];
      
      return tags.some(tag => personaTags.includes(tag));
    });
  }

  /**
   * Get personas by LOB (Line of Business)
   */
  async getPersonasByLOB(lob, vertical = null) {
    const personas = await this.getPersonas(vertical);
    
    return personas.filter(persona => 
      persona.lob.includes(lob) || persona.lob.includes('all')
    );
  }

  /**
   * Get personas by influence level (decision-maker, influencer, user)
   */
  async getPersonasByInfluence(influence, vertical = null) {
    const personas = await this.getPersonas(vertical);
    
    return personas.filter(persona => persona.influence === influence);
  }

  /**
   * Get tag metadata for building filters
   */
  async getTagMetadata() {
    const data = await this.loadData('personas.json');
    return data?.metadata || {};
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for use in other modules
window.ContentAPI = ContentAPI;