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
   * Get all resources for a specific vertical
   */
  async getResources(vertical = null, lob = null) {
    const data = await this.loadData('resources.json');
    if (!data) return [];

    if (vertical && lob) {
      // Get resources for specific vertical and LOB
      return data.resources[vertical]?.[lob] || [];
    } else if (vertical) {
      // Get all resources from the vertical
      const verticalResources = data.resources[vertical];
      if (!verticalResources) return [];
      return Object.values(verticalResources).flat();
    }

    // Return all resources from all verticals
    return Object.values(data.resources).flatMap(vertical => 
      Object.values(vertical).flat()
    );
  }

  /**
   * Get resources filtered by tags
   */
  async getResourcesByTags(tags = [], vertical = null) {
    const resources = await this.getResources(vertical);
    
    if (!tags.length) return resources;

    return resources.filter(resource => {
      const resourceTags = [
        ...(resource.tags.primary || []),
        ...(resource.tags.secondary || []),
        ...(resource.tags.use_cases || []),
        ...(resource.tags.outcomes || [])
      ];
      
      return tags.some(tag => resourceTags.includes(tag));
    });
  }

  /**
   * Get resources by type (calculator, playbook, etc.)
   */
  async getResourcesByType(type, vertical = null) {
    const resources = await this.getResources(vertical);
    
    return resources.filter(resource => resource.type === type);
  }

  /**
   * Get resources by complexity level
   */
  async getResourcesByComplexity(complexity, vertical = null) {
    const resources = await this.getResources(vertical);
    
    return resources.filter(resource => resource.complexity === complexity);
  }

  /**
   * Get resources by time to value
   */
  async getResourcesByTimeToValue(timeToValue, vertical = null) {
    const resources = await this.getResources(vertical);
    
    return resources.filter(resource => resource.timeToValue === timeToValue);
  }

  /**
   * Get filtered resources using advanced criteria (similar to original filtering logic)
   */
  async getFilteredResources(context = {}) {
    let resources = [];
    
    // Start with exact matches first (highest priority)
    if (context.lob && context.vertical) {
      const exactMatch = await this.getResources(context.vertical, context.lob);
      resources.push(...exactMatch);
    }
    
    // Add all resources from the selected vertical (if any)
    if (context.vertical) {
      const allVerticalResources = await this.getResources(context.vertical);
      // Add resources that aren't already included
      allVerticalResources.forEach(resource => {
        if (!resources.some(r => r.id === resource.id)) {
          resources.push(resource);
        }
      });
    }
    
    // Add general resources based on LOB (if selected)
    if (context.lob) {
      const generalLOBResources = await this.getResources('general', context.lob);
      generalLOBResources.forEach(resource => {
        if (!resources.some(r => r.id === resource.id)) {
          resources.push(resource);
        }
      });
    }
    
    // If we still don't have many resources, add more general resources
    if (resources.length < 3) {
      const generalResources = await this.getResources('general');
      // Add finance, IT, HR resources as they're generally applicable
      const broadResources = generalResources.filter(r => 
        ['finance', 'it', 'hr'].some(lob => r.lob.includes(lob))
      );
      
      broadResources.forEach(resource => {
        if (!resources.some(r => r.id === resource.id)) {
          resources.push(resource);
        }
      });
    }
    
    return this.applyContextualFilters(resources, context);
  }

  /**
   * Apply contextual filters for deployment and customer type
   */
  applyContextualFilters(resources, context) {
    return resources.map(resource => {
      const enhanced = { ...resource };
      
      // Add deployment context if available
      if (context.deployment && resource.deploymentContext) {
        enhanced.currentDeploymentContext = resource.deploymentContext[context.deployment];
      }
      
      // Add customer context if available  
      if (context.customerType && resource.customerContext) {
        enhanced.currentCustomerContext = resource.customerContext[context.customerType];
      }
      
      return enhanced;
    });
  }

  /**
   * Save data to JSON file (browser download)
   */
  async saveData(filename, data) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Data saved as ${filename}`);
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  /**
   * Import data from JSON file
   */
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Export all content as backup
   */
  async exportAllContent() {
    try {
      const [personas, resources, useCases] = await Promise.all([
        this.loadData('personas.json'),
        this.loadData('resources.json'),
        this.loadData('use-cases.json')
      ]);

      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        content: {
          personas: personas || {},
          resources: resources || {},
          useCases: useCases || {}
        }
      };

      return this.saveData(`uipath-sales-guide-backup-${Date.now()}.json`, backup);
    } catch (error) {
      console.error('Failed to export content:', error);
      return false;
    }
  }

  /**
   * Update cached data (for admin interface)
   */
  updateCachedData(filename, data) {
    this.cache.set(filename, data);
  }

  /**
   * Get use cases with filtering
   */
  async getUseCases(vertical = null, lob = null) {
    const data = await this.loadData('use-cases.json');
    if (!data) return [];

    if (vertical && lob) {
      // Get use cases for specific vertical and LOB
      return data.useCases[vertical]?.[lob] || [];
    } else if (vertical) {
      // Get all use cases from the vertical
      const verticalUseCases = data.useCases[vertical];
      if (!verticalUseCases) return [];
      return Object.values(verticalUseCases).flat();
    }

    // Return all use cases from all verticals
    return Object.values(data.useCases).flatMap(vertical => 
      Object.values(vertical).flat()
    );
  }

  /**
   * Get use cases filtered by tags
   */
  async getUseCasesByTags(tags = [], vertical = null) {
    const useCases = await this.getUseCases(vertical);
    
    if (!tags.length) return useCases;

    return useCases.filter(useCase => {
      const useCaseTags = [
        ...(useCase.tags?.primary || []),
        ...(useCase.tags?.secondary || []),
        ...(useCase.tags?.outcomes || []),
        ...(useCase.tags?.pain_points || [])
      ];
      
      return tags.some(tag => useCaseTags.includes(tag));
    });
  }

  /**
   * Get use cases by category (RPA, IDP, Agentic, etc.)
   */
  async getUseCasesByCategory(category, vertical = null) {
    const useCases = await this.getUseCases(vertical);
    
    return useCases.filter(useCase => useCase.category === category);
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for use in other modules
export { ContentAPI };
export default ContentAPI;

// Also make available globally for backwards compatibility
if (typeof window !== 'undefined') {
  window.ContentAPI = ContentAPI;
}