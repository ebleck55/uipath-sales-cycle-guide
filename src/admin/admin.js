/**
 * UiPath Sales Guide - Admin Interface
 * Provides content management for Resources, Use Cases, Personas, and Tags
 */

class AdminInterface {
  constructor() {
    this.contentAPI = new ContentAPI();
    // Override base URL for admin interface since it's in a subdirectory
    this.contentAPI.baseUrl = '../data/';
    this.currentSection = 'resources';
    this.resources = [];
    this.personas = [];
    this.useCases = [];
    this.tags = {};
    this.editingResourceId = null;
    this.editingUseCaseId = null;
    this.editingPersonaId = null;
    this.unsavedChanges = false;

    this.initializeInterface();
    this.loadAllContent();
    this.handleImportExport();
    this.initializePDFExtraction();
    this.initializeAIService();
    this.initializeAnalytics();
    this.exposeAnalyticsGlobally();
  }

  async initializeInterface() {
    // Navigation event listeners
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchSection(e.target.dataset.section);
      });
    });

    // Modal controls
    document.getElementById('add-resource-btn').addEventListener('click', () => {
      this.openResourceModal();
    });

    document.getElementById('close-resource-modal').addEventListener('click', () => {
      this.closeResourceModal();
    });

    document.getElementById('cancel-resource-btn').addEventListener('click', () => {
      this.closeResourceModal();
    });

    document.getElementById('resource-form').addEventListener('submit', (e) => {
      this.saveResource(e);
    });

    // Search and filter controls
    document.getElementById('resource-search').addEventListener('input', () => {
      this.filterResources();
    });

    document.querySelectorAll('#resource-vertical-filter, #resource-type-filter').forEach(select => {
      select.addEventListener('change', () => {
        this.filterResources();
      });
    });

    // Save all changes
    document.getElementById('save-all-btn').addEventListener('click', () => {
      this.saveAllChanges();
    });

    // Preview changes
    document.getElementById('preview-btn').addEventListener('click', () => {
      this.previewChanges();
    });

    // Use Case Modal controls
    document.getElementById('close-use-case-modal').addEventListener('click', () => {
      this.closeUseCaseModal();
    });

    document.getElementById('cancel-use-case-btn').addEventListener('click', () => {
      this.closeUseCaseModal();
    });

    document.getElementById('use-case-form').addEventListener('submit', (e) => {
      this.saveUseCase(e);
    });

    // Persona Modal controls
    document.getElementById('close-persona-modal').addEventListener('click', () => {
      this.closePersonaModal();
    });

    document.getElementById('cancel-persona-btn').addEventListener('click', () => {
      this.closePersonaModal();
    });

    document.getElementById('persona-form').addEventListener('submit', (e) => {
      this.savePersona(e);
    });

    // Tag Management
    const addTagBtn = document.getElementById('add-new-tag-btn');
    if (addTagBtn) {
      addTagBtn.addEventListener('click', () => {
        this.openTagModal();
      });
    }

    // Tag Modal controls
    const closeTagModal = document.getElementById('close-tag-modal');
    if (closeTagModal) {
      closeTagModal.addEventListener('click', () => {
        this.closeTagModal();
      });
    }

    const cancelTagBtn = document.getElementById('cancel-tag-btn');
    if (cancelTagBtn) {
      cancelTagBtn.addEventListener('click', () => {
        this.closeTagModal();
      });
    }

    const tagForm = document.getElementById('tag-form');
    if (tagForm) {
      tagForm.addEventListener('submit', (e) => {
        this.saveTag(e);
      });
    }

    // Filter Rules Management
    const addFilterRuleBtn = document.getElementById('add-filter-rule-btn');
    if (addFilterRuleBtn) {
      addFilterRuleBtn.addEventListener('click', () => {
        this.openFilterRuleModal();
      });
    }

    // Filter Rule Modal controls
    const closeFilterRuleModal = document.getElementById('close-filter-rule-modal');
    if (closeFilterRuleModal) {
      closeFilterRuleModal.addEventListener('click', () => {
        this.closeFilterRuleModal();
      });
    }

    const cancelFilterRuleBtn = document.getElementById('cancel-filter-rule-btn');
    if (cancelFilterRuleBtn) {
      cancelFilterRuleBtn.addEventListener('click', () => {
        this.closeFilterRuleModal();
      });
    }

    const filterRuleForm = document.getElementById('filter-rule-form');
    if (filterRuleForm) {
      filterRuleForm.addEventListener('submit', (e) => {
        this.saveFilterRule(e);
      });
    }

    // Initialize new tag input system
    this.initializeTagInputs();

    // Initialize tags display
    setTimeout(() => this.renderTagsDisplay(), 100);

    // Initialize filter rules display
    setTimeout(() => this.renderFilterRules(), 150);

    // Category tab navigation
    const categoryTabs = document.querySelectorAll('.category-tab');
    if (categoryTabs.length > 0) {
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.switchCategoryTab(e.target.dataset.tab);
        });
      });
    }

    // API Settings controls
    const toggleApiKeyVisibility = document.getElementById('toggle-api-key-visibility');
    if (toggleApiKeyVisibility) {
      toggleApiKeyVisibility.addEventListener('click', () => {
        this.toggleApiKeyVisibility();
      });
    }

    const saveApiSettings = document.getElementById('save-api-settings');
    if (saveApiSettings) {
      saveApiSettings.addEventListener('click', () => {
        this.saveAPISettings();
      });
    }

    const clearApiSettings = document.getElementById('clear-api-settings');
    if (clearApiSettings) {
      clearApiSettings.addEventListener('click', () => {
        this.clearAPISettings();
      });
    }

    // Analytics controls
    const analyzeContentGapsBtn = document.getElementById('analyze-content-gaps');
    if (analyzeContentGapsBtn) {
      analyzeContentGapsBtn.addEventListener('click', () => {
        this.analyzeContentGaps();
      });
    }

    const generateRecommendationsBtn = document.getElementById('generate-recommendations');
    if (generateRecommendationsBtn) {
      generateRecommendationsBtn.addEventListener('click', () => {
        this.generateContentRecommendations();
      });
    }

    const exportPromptDataBtn = document.getElementById('export-prompt-data');
    if (exportPromptDataBtn) {
      exportPromptDataBtn.addEventListener('click', () => {
        this.exportPromptData();
      });
    }

    // Analytics filters
    const statsTimePeriod = document.getElementById('stats-time-period');
    if (statsTimePeriod) {
      statsTimePeriod.addEventListener('change', () => {
        this.renderSiteStatistics();
      });
    }

    const promptContextFilter = document.getElementById('prompt-context-filter');
    if (promptContextFilter) {
      promptContextFilter.addEventListener('change', () => {
        this.filterPromptsTable();
      });
    }

    const testApiBtn = document.getElementById('test-api-btn');
    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => {
        this.testAPIConnection();
      });
    }

    // Site Statistics controls
    const statsTimePeriod = document.getElementById('stats-time-period');
    if (statsTimePeriod) {
      statsTimePeriod.addEventListener('change', () => {
        this.updateStatisticsPeriod();
      });
    }

    const refreshStatsBtn = document.getElementById('refresh-stats-btn');
    if (refreshStatsBtn) {
      refreshStatsBtn.addEventListener('click', () => {
        this.refreshStatistics();
      });
    }

    const exportStatsBtn = document.getElementById('export-stats-btn');
    if (exportStatsBtn) {
      exportStatsBtn.addEventListener('click', () => {
        this.exportStatistics();
      });
    }

    // Statistics tab navigation
    const statsTabs = document.querySelectorAll('.stats-tab');
    if (statsTabs.length > 0) {
      statsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.switchStatsTab(e.target.dataset.tab);
        });
      });
    }

    // Prompt Analysis controls
    const analyzeContentGaps = document.getElementById('analyze-content-gaps');
    if (analyzeContentGaps) {
      analyzeContentGaps.addEventListener('click', () => {
        this.analyzeContentGaps();
      });
    }

    const generateRecommendations = document.getElementById('generate-recommendations');
    if (generateRecommendations) {
      generateRecommendations.addEventListener('click', () => {
        this.generateContentRecommendations();
      });
    }

    const exportPrompts = document.getElementById('export-prompts');
    if (exportPrompts) {
      exportPrompts.addEventListener('click', () => {
        this.exportPromptData();
      });
    }

    const promptContextFilter = document.getElementById('prompt-context-filter');
    if (promptContextFilter) {
      promptContextFilter.addEventListener('change', () => {
        this.filterPromptsTable();
      });
    }

    console.log('Admin interface initialized');
  }

  async loadAllContent() {
    try {
      console.log('Starting to load content...');
      
      // Load resources
      console.log('Loading resources...');
      this.resources = await this.contentAPI.getResources();
      console.log(`Loaded ${this.resources.length} resources`);
      this.renderResourcesList();

      // Load personas
      console.log('Loading personas...');
      this.personas = await this.contentAPI.getPersonas();
      console.log(`Loaded ${this.personas.length} personas`);

      // Load use cases
      console.log('Loading use cases...');
      this.useCases = await this.contentAPI.getUseCases();
      console.log(`Loaded ${this.useCases.length} use cases`);

      // Load tag metadata
      console.log('Loading tag metadata...');
      const resourcesData = await this.contentAPI.loadData('resources.json');
      const personasData = await this.contentAPI.loadData('personas.json');
      
      if (resourcesData && personasData) {
        // Merge tags from both data sources
        this.tags = {};
        
        // Add resource tags
        if (resourcesData.metadata && resourcesData.metadata.tags) {
          Object.keys(resourcesData.metadata.tags).forEach(category => {
            if (!this.tags[category]) this.tags[category] = [];
            this.tags[category] = [...this.tags[category], ...resourcesData.metadata.tags[category]];
          });
        }
        
        // Add persona tags
        if (personasData.metadata && personasData.metadata.tags) {
          Object.keys(personasData.metadata.tags).forEach(category => {
            if (!this.tags[category]) this.tags[category] = [];
            // Merge and deduplicate
            this.tags[category] = [...new Set([...this.tags[category], ...personasData.metadata.tags[category]])];
          });
        }
        
        console.log('Tags loaded:', this.tags);
        this.renderTagsPools();
      } else {
        console.warn('Failed to load metadata for tags');
      }

      // Update statistics
      this.updateStatistics();

      console.log('Content loaded successfully!');
      this.showNotification('Content loaded successfully!', 'success');
    } catch (error) {
      console.error('Failed to load content:', error);
      this.showNotification(`Failed to load content: ${error.message}`, 'error');
    }
  }

  switchSection(section) {
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.remove('admin-nav-active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('admin-nav-active');

    // Show/hide sections
    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.add('hidden');
    });
    document.getElementById(`section-${section}`).classList.remove('hidden');

    this.currentSection = section;

    // Load section-specific content
    switch (section) {
      case 'resources':
        this.renderResourcesList();
        break;
      case 'use-cases':
        this.renderUseCasesList();
        break;
      case 'personas':
        this.renderPersonasList();
        break;
      case 'tags':
        this.renderTagsPools();
        break;
      case 'api-settings':
        this.loadAPISettings();
        break;
      case 'site-statistics':
        this.loadSiteStatistics();
        break;
    }
  }

  switchCategoryTab(tabName) {
    // Update tab navigation
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.remove('active', 'border-blue-500', 'text-blue-600');
      tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add('active', 'border-blue-500', 'text-blue-600');
      activeTab.classList.remove('border-transparent', 'text-gray-500');
    }

    // Show/hide tab content
    document.querySelectorAll('.category-tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
      activeContent.classList.remove('hidden');
    }
  }

  renderResourcesList() {
    const container = document.getElementById('resources-list');
    
    if (!this.resources.length) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">No resources found. Click "Add New Resource" to get started.</div>';
      return;
    }

    const resourcesHTML = this.resources.map(resource => `
      <div class="content-card" data-resource-id="${resource.id}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">${resource.name}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                ${resource.type}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                ${resource.vertical}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-3">${resource.overview}</p>
            <div class="flex flex-wrap gap-1 mb-2">
              ${(resource.tags?.primary || []).map(tag => `<span class="tag-item tag-primary">${tag}</span>`).join('')}
              ${(resource.tags?.secondary || []).slice(0, 3).map(tag => `<span class="tag-item tag-secondary">${tag}</span>`).join('')}
            </div>
            <div class="text-xs text-gray-500 mb-2">
              LOB: ${resource.lob?.join(', ') || 'General'} • 
              Complexity: ${resource.complexity} • 
              Time to Value: ${resource.timeToValue}
            </div>
            ${resource.link ? `
              <div class="mb-2">
                <a href="${resource.link}" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center px-3 py-1 text-xs text-white rounded transition-colors"
                   style="background: var(--uipath-teal); font-family: 'Inter', sans-serif; text-decoration: none;"
                   onmouseover="this.style.background='var(--uipath-teal-light)'"
                   onmouseout="this.style.background='var(--uipath-teal)'">
                  External Link
                </a>
              </div>
            ` : ''}
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button onclick="adminInterface.editResource('${resource.id}')" 
                    class="px-3 py-1 text-xs text-white rounded transition-colors"
                    style="background: var(--uipath-orange); font-family: 'Inter', sans-serif;"
                    onmouseover="this.style.background='var(--uipath-orange-light)'"
                    onmouseout="this.style.background='var(--uipath-orange)'">
              Edit
            </button>
            <button onclick="adminInterface.duplicateResource('${resource.id}')" 
                    class="px-3 py-1 text-xs text-white rounded transition-colors"
                    style="background: var(--uipath-teal); font-family: 'Inter', sans-serif;"
                    onmouseover="this.style.background='var(--uipath-teal-light)'"
                    onmouseout="this.style.background='var(--uipath-teal)'">
              Duplicate
            </button>
            <button onclick="adminInterface.deleteResource('${resource.id}')" 
                    class="px-3 py-1 text-xs text-white rounded transition-colors"
                    style="background: var(--error); font-family: 'Inter', sans-serif;"
                    onmouseover="this.style.background='var(--error-light)'"
                    onmouseout="this.style.background='var(--error)'">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = resourcesHTML;
  }

  renderPersonasList() {
    const container = document.getElementById('personas-list');
    
    if (!this.personas.length) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">No personas found.</div>';
      return;
    }

    const personasHTML = this.personas.map(persona => `
      <div class="content-card">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">${persona.title}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                ${persona.level || 'N/A'}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                ${persona.vertical}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                ${persona.influence}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-3">${(persona.world || '').substring(0, 150)}...</p>
            <div class="flex flex-wrap gap-1 mb-2">
              ${(persona.tags?.primary || []).map(tag => `<span class="tag-item tag-primary">${tag}</span>`).join('')}
            </div>
            <div class="text-xs text-gray-500">
              LOB: ${persona.lob?.join(', ') || 'General'}
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button onclick="adminInterface.editPersona('${persona.id}')"
                    class="px-3 py-1 text-xs text-white rounded transition-colors"
                    style="background: var(--uipath-purple); font-family: 'Inter', sans-serif;"
                    onmouseover="this.style.background='var(--uipath-purple-light)'"
                    onmouseout="this.style.background='var(--uipath-purple)'">
              Edit
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = personasHTML;
  }

  renderUseCasesList() {
    const container = document.getElementById('use-cases-list');
    
    if (!this.useCases.length) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">No use cases found. Use cases will be loaded from the structured data.</div>';
      return;
    }

    const useCasesHTML = this.useCases.map(useCase => `
      <div class="content-card">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">${useCase.name}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                ${useCase.category}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                ${useCase.vertical}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-3">${useCase.description}</p>
            <div class="bg-blue-50 p-3 rounded-md mb-3">
              <p class="text-sm text-blue-800"><strong>Business Value:</strong> ${useCase.businessValue}</p>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">
              ${(useCase.tags?.primary || []).map(tag => `<span class="tag-item tag-primary">${tag}</span>`).join('')}
              ${(useCase.tags?.secondary || []).slice(0, 3).map(tag => `<span class="tag-item tag-secondary">${tag}</span>`).join('')}
            </div>
            <div class="text-xs text-gray-500 mb-2">
              LOB: ${useCase.lob?.join(', ') || 'General'} • 
              Complexity: ${useCase.complexity} • 
              Time to Value: ${useCase.timeToValue} •
              ROI: ${useCase.estimatedROI || 'TBD'}
            </div>
            ${useCase.link ? `
              <div class="mb-2">
                <a href="${useCase.link}" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center px-3 py-1 text-xs text-white rounded transition-colors"
                   style="background: var(--success); font-family: 'Inter', sans-serif; text-decoration: none;"
                   onmouseover="this.style.background='var(--success-light)'"
                   onmouseout="this.style.background='var(--success)'">
                  External Link
                </a>
              </div>
            ` : ''}
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button onclick="adminInterface.editUseCase('${useCase.id}')"
                    class="px-3 py-1 text-xs text-white rounded transition-colors"
                    style="background: var(--success); font-family: 'Inter', sans-serif;"
                    onmouseover="this.style.background='var(--success-light)'"
                    onmouseout="this.style.background='var(--success)'">
              Edit
            </button>
            <button onclick="adminInterface.duplicateUseCase('${useCase.id}')"
                    class="px-3 py-1 text-xs text-white rounded transition-colors"
                    style="background: var(--uipath-teal); font-family: 'Inter', sans-serif;"
                    onmouseover="this.style.background='var(--uipath-teal-light)'"
                    onmouseout="this.style.background='var(--uipath-teal)'">
              Duplicate
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = useCasesHTML;
  }

  renderTagsPools() {
    // Render each tag category pool
    const categories = ['primary', 'secondary', 'pain_points', 'outcomes', 'interests', 'use_cases'];
    
    categories.forEach(category => {
      const container = document.getElementById(`${category.replace('_', '-')}-tags-pool`);
      if (container) {  // Check if container exists (not all may be on current page)
        const tags = this.tags[category] || [];
        
        container.innerHTML = tags.map(tag => `
          <span class="tag-item tag-${category.replace('_', '-')} draggable-tag mr-2 mb-2" 
                draggable="true" 
                data-tag="${tag}" 
                data-category="${category}">
            ${tag}
          </span>
        `).join('');
      }
    });
  }

  filterResources() {
    const search = document.getElementById('resource-search').value.toLowerCase();
    const vertical = document.getElementById('resource-vertical-filter').value;
    const type = document.getElementById('resource-type-filter').value;

    const filteredResources = this.resources.filter(resource => {
      const matchesSearch = !search || 
        resource.name.toLowerCase().includes(search) ||
        resource.overview.toLowerCase().includes(search);
      
      const matchesVertical = !vertical || resource.vertical === vertical;
      const matchesType = !type || resource.type === type;

      return matchesSearch && matchesVertical && matchesType;
    });

    // Update the resources list with filtered results
    this.resources = filteredResources;
    this.renderResourcesList();
  }

  openResourceModal(resourceId = null) {
    this.editingResourceId = resourceId;
    const modal = document.getElementById('resource-modal');
    const title = document.getElementById('resource-modal-title');
    
    if (resourceId) {
      title.textContent = 'Edit Resource';
      this.loadResourceIntoForm(resourceId);
    } else {
      title.textContent = 'Add New Resource';
      this.clearResourceForm();
    }
    
    modal.classList.remove('hidden');
  }

  closeResourceModal() {
    document.getElementById('resource-modal').classList.add('hidden');
    this.editingResourceId = null;
  }

  loadResourceIntoForm(resourceId) {
    const resource = this.resources.find(r => r.id === resourceId);
    if (!resource) return;

    document.getElementById('resource-name').value = resource.name || '';
    document.getElementById('resource-type').value = resource.type || '';
    document.getElementById('resource-vertical').value = resource.vertical || '';
    document.getElementById('resource-complexity').value = resource.complexity || 'medium';
    document.getElementById('resource-overview').value = resource.overview || '';
    document.getElementById('resource-why').value = resource.why || '';
    document.getElementById('resource-link').value = resource.link || '';

    // Load tags into the form
    this.loadResourceTagsIntoForm(resource.tags || {});
  }

  clearResourceForm() {
    document.getElementById('resource-form').reset();
    // Clear tag display areas
    this.clearTagDisplayArea('resource-primary-tags-display');
    this.clearTagDisplayArea('resource-secondary-tags-display');
  }

  loadResourceTagsIntoForm(tags) {
    this.populateTagDisplayArea('resource-primary-tags-display', tags.primary || [], 'primary');
    this.populateTagDisplayArea('resource-secondary-tags-display', tags.secondary || [], 'secondary');
  }

  async saveResource(event) {
    event.preventDefault();
    
    // Validate form data
    const validation = this.validateResourceForm();
    if (!validation.isValid) {
      this.showNotification(`Validation Error: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    const formData = {
      id: this.editingResourceId || `resource-${Date.now()}`,
      name: document.getElementById('resource-name').value.trim(),
      type: document.getElementById('resource-type').value,
      vertical: document.getElementById('resource-vertical').value,
      complexity: document.getElementById('resource-complexity').value,
      overview: document.getElementById('resource-overview').value.trim(),
      why: document.getElementById('resource-why').value.trim(),
      link: document.getElementById('resource-link').value.trim(),
      tags: this.extractTagsFromForm(),
      lob: this.determineLOBFromVertical(document.getElementById('resource-vertical').value),
      lastModified: new Date().toISOString()
    };

    try {
      if (this.editingResourceId) {
        // Update existing resource
        const index = this.resources.findIndex(r => r.id === this.editingResourceId);
        if (index !== -1) {
          this.resources[index] = { ...this.resources[index], ...formData };
        }
      } else {
        // Add new resource
        this.resources.push(formData);
      }

      this.unsavedChanges = true;
      this.renderResourcesList();
      this.updateStatistics();
      this.closeResourceModal();
      this.showNotification('Resource saved successfully!', 'success');

    } catch (error) {
      console.error('Failed to save resource:', error);
      this.showNotification('Failed to save resource', 'error');
    }
  }

  validateResourceForm() {
    const errors = [];
    const name = document.getElementById('resource-name').value.trim();
    const type = document.getElementById('resource-type').value;
    const vertical = document.getElementById('resource-vertical').value;
    const overview = document.getElementById('resource-overview').value.trim();
    const why = document.getElementById('resource-why').value.trim();

    if (!name) errors.push('Resource name is required');
    if (name.length < 3) errors.push('Resource name must be at least 3 characters');
    if (!type) errors.push('Resource type is required');
    if (!vertical) errors.push('Vertical is required');
    if (!overview) errors.push('Overview is required');
    if (overview.length < 20) errors.push('Overview must be at least 20 characters');
    if (!why) errors.push('Why section is required');
    if (why.length < 10) errors.push('Why section must be at least 10 characters');

    // Check for duplicate names (excluding current resource)
    const existingResource = this.resources.find(r => 
      r.name.toLowerCase() === name.toLowerCase() && r.id !== this.editingResourceId
    );
    if (existingResource) {
      errors.push('A resource with this name already exists');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  determineLOBFromVertical(vertical) {
    const lobMapping = {
      'banking': ['consumer-banking', 'commercial-banking', 'capital-markets'],
      'insurance': ['property-casualty', 'claims-processing', 'underwriting'],
      'general': ['finance', 'hr', 'it']
    };
    
    return lobMapping[vertical] || ['general'];
  }

  extractTagsFromForm() {
    const primaryTags = Array.from(document.querySelectorAll('#resource-primary-tags-display .tag-chip'))
      .map(el => el.dataset.tag);
    
    const secondaryTags = Array.from(document.querySelectorAll('#resource-secondary-tags-display .tag-chip'))
      .map(el => el.dataset.tag);

    return {
      primary: primaryTags,
      secondary: secondaryTags,
      use_cases: [],
      outcomes: []
    };
  }

  // Simplified Tag Input System
  initializeTagInputs() {
    // Setup resource tags input
    this.setupSimpleTagInput('resource-tags-input', 'resource-tags-display');
    // Setup use case tags input  
    this.setupSimpleTagInput('use-case-tags-input', 'use-case-tags-display');
    // Setup persona tags input
    this.setupSimpleTagInput('persona-tags-input', 'persona-tags-display');
    // Setup filter rule tags input
    this.setupSimpleTagInput('filter-rule-tags-input', 'filter-rule-tags-display');
  }

  setupSimpleTagInput(inputId, displayId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Handle Enter key and comma separation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        this.processTagInput(input, displayId);
      }
    });

    // Handle blur event (when user clicks away)
    input.addEventListener('blur', (e) => {
      if (e.target.value.trim()) {
        this.processTagInput(input, displayId);
      }
    });
  }

  processTagInput(input, displayId) {
    const value = input.value.trim();
    if (!value) return;

    // Split by commas and process each tag
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    tags.forEach(tag => {
      this.addSimpleTag(displayId, tag);
    });

    input.value = '';
  }

  addSimpleTag(displayId, tagText) {
    const displayArea = document.getElementById(displayId);
    if (!displayArea) return;

    // Remove placeholder text if present
    const placeholder = displayArea.querySelector('p.text-gray-400');
    if (placeholder) {
      placeholder.remove();
    }

    // Check if tag already exists
    const existingTags = Array.from(displayArea.querySelectorAll('.tag-chip')).map(chip => chip.dataset.tag);
    if (existingTags.includes(tagText)) {
      return; // Silent ignore duplicates
    }

    // Track tag usage
    this.trackTagUsage(tagText);

    // Create tag chip
    const tagChip = document.createElement('span');
    tagChip.className = 'tag-chip tag-chip-primary'; // Default to primary style
    tagChip.dataset.tag = tagText;
    tagChip.innerHTML = `
      ${tagText}
      <button type="button" class="tag-chip-remove" onclick="this.parentElement.remove(); adminInterface.updateTagDisplayState('${displayId}')">
        ×
      </button>
    `;

    displayArea.appendChild(tagChip);
    displayArea.classList.add('has-tags');
  }

  addCommonTag(tagText) {
    this.addSimpleTag('resource-tags-display', tagText);
  }

  addUseCaseCommonTag(tagText) {
    this.addSimpleTag('use-case-tags-display', tagText);
  }

  addPersonaCommonTag(tagText) {
    this.addSimpleTag('persona-tags-display', tagText);
  }

  addFilterCommonTag(tagText) {
    this.addSimpleTag('filter-rule-tags-display', tagText);
  }

  updateTagDisplayState(displayId) {
    const displayArea = document.getElementById(displayId);
    if (!displayArea) return;

    const hasTags = displayArea.querySelectorAll('.tag-chip').length > 0;
    displayArea.classList.toggle('has-tags', hasTags);

    if (!hasTags) {
      displayArea.innerHTML = '<p class="text-gray-400 text-sm">Tags will appear here as you add them</p>';
    }
  }

  loadResourceTagsIntoForm(tags) {
    const displayArea = document.getElementById('resource-tags-display');
    if (!displayArea) return;

    displayArea.innerHTML = '';
    
    // Combine all tag types into one list for simplified display
    const allTags = [
      ...(tags.primary || []),
      ...(tags.secondary || []),
      ...(tags.use_cases || []),
      ...(tags.outcomes || [])
    ];

    // Remove duplicates
    const uniqueTags = [...new Set(allTags)];

    uniqueTags.forEach(tag => {
      this.addSimpleTag('resource-tags-display', tag);
    });

    if (uniqueTags.length === 0) {
      this.updateTagDisplayState('resource-tags-display');
    }
  }

  clearResourceForm() {
    document.getElementById('resource-form').reset();
    this.updateTagDisplayState('resource-tags-display');
  }

  extractTagsFromForm() {
    const tags = Array.from(document.querySelectorAll('#resource-tags-display .tag-chip'))
      .map(el => el.dataset.tag);

    // For backward compatibility, put all tags in primary category
    return {
      primary: tags,
      secondary: [],
      use_cases: [],
      outcomes: []
    };
  }

  editResource(resourceId) {
    this.openResourceModal(resourceId);
  }

  duplicateResource(resourceId) {
    const resource = this.resources.find(r => r.id === resourceId);
    if (!resource) return;

    const duplicate = {
      ...resource,
      id: `resource-${Date.now()}`,
      name: `${resource.name} (Copy)`,
      lastModified: new Date().toISOString()
    };

    this.resources.push(duplicate);
    this.unsavedChanges = true;
    this.renderResourcesList();
    this.showNotification('Resource duplicated successfully!', 'success');
  }

  deleteResource(resourceId) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    this.resources = this.resources.filter(r => r.id !== resourceId);
    this.unsavedChanges = true;
    this.renderResourcesList();
    this.showNotification('Resource deleted successfully!', 'success');
  }

  // Use Case Modal Methods
  openUseCaseModal(useCaseId = null) {
    this.editingUseCaseId = useCaseId;
    const modal = document.getElementById('use-case-modal');
    const title = document.getElementById('use-case-modal-title');
    
    if (useCaseId) {
      title.textContent = 'Edit Use Case';
      this.loadUseCaseIntoForm(useCaseId);
    } else {
      title.textContent = 'Add New Use Case';
      this.clearUseCaseForm();
    }
    
    modal.classList.remove('hidden');
  }

  closeUseCaseModal() {
    document.getElementById('use-case-modal').classList.add('hidden');
    this.editingUseCaseId = null;
  }

  loadUseCaseIntoForm(useCaseId) {
    const useCase = this.useCases.find(uc => uc.id === useCaseId);
    if (!useCase) return;

    document.getElementById('use-case-name').value = useCase.name || '';
    document.getElementById('use-case-category').value = useCase.category || '';
    document.getElementById('use-case-vertical').value = useCase.vertical || '';
    document.getElementById('use-case-complexity').value = useCase.complexity || 'Medium';
    document.getElementById('use-case-time-to-value').value = useCase.timeToValue || '';
    document.getElementById('use-case-description').value = useCase.description || '';
    document.getElementById('use-case-business-value').value = useCase.businessValue || '';
    document.getElementById('use-case-roi').value = useCase.estimatedROI || '';
    document.getElementById('use-case-link').value = useCase.link || '';

    // Load tags into the form
    this.loadUseCaseTagsIntoForm(useCase.tags || {});
  }

  clearUseCaseForm() {
    document.getElementById('use-case-form').reset();
    this.updateTagDisplayState('use-case-tags-display');
  }

  loadUseCaseTagsIntoForm(tags) {
    const displayArea = document.getElementById('use-case-tags-display');
    if (!displayArea) return;

    displayArea.innerHTML = '';
    
    // Combine all tag types into one list for simplified display
    const allTags = [
      ...(tags.primary || []),
      ...(tags.secondary || []),
      ...(tags.outcomes || []),
      ...(tags.pain_points || [])
    ];

    // Remove duplicates
    const uniqueTags = [...new Set(allTags)];

    uniqueTags.forEach(tag => {
      this.addSimpleTag('use-case-tags-display', tag);
    });

    if (uniqueTags.length === 0) {
      this.updateTagDisplayState('use-case-tags-display');
    }
  }

  extractUseCaseTagsFromForm() {
    const tags = Array.from(document.querySelectorAll('#use-case-tags-display .tag-chip'))
      .map(el => el.dataset.tag);

    // For backward compatibility, put all tags in primary category
    return {
      primary: tags,
      secondary: [],
      outcomes: [],
      pain_points: []
    };
  }

  async saveUseCase(event) {
    event.preventDefault();
    
    const formData = {
      id: this.editingUseCaseId || `use-case-${Date.now()}`,
      name: document.getElementById('use-case-name').value.trim(),
      category: document.getElementById('use-case-category').value,
      vertical: document.getElementById('use-case-vertical').value,
      complexity: document.getElementById('use-case-complexity').value,
      timeToValue: document.getElementById('use-case-time-to-value').value,
      description: document.getElementById('use-case-description').value.trim(),
      businessValue: document.getElementById('use-case-business-value').value.trim(),
      estimatedROI: document.getElementById('use-case-roi').value.trim(),
      link: document.getElementById('use-case-link').value.trim(),
      lob: this.determineLOBFromVertical(document.getElementById('use-case-vertical').value),
      lastModified: new Date().toISOString(),
      tags: this.extractUseCaseTagsFromForm()
    };

    try {
      if (this.editingUseCaseId) {
        // Update existing use case
        const index = this.useCases.findIndex(uc => uc.id === this.editingUseCaseId);
        if (index !== -1) {
          this.useCases[index] = { ...this.useCases[index], ...formData };
        }
      } else {
        // Add new use case
        this.useCases.push(formData);
      }

      this.unsavedChanges = true;
      this.renderUseCasesList();
      this.updateStatistics();
      this.closeUseCaseModal();
      this.showNotification('Use case saved successfully!', 'success');

    } catch (error) {
      console.error('Failed to save use case:', error);
      this.showNotification('Failed to save use case', 'error');
    }
  }

  editUseCase(useCaseId) {
    this.openUseCaseModal(useCaseId);
  }

  duplicateUseCase(useCaseId) {
    const useCase = this.useCases.find(uc => uc.id === useCaseId);
    if (!useCase) return;

    const duplicate = {
      ...useCase,
      id: `use-case-${Date.now()}`,
      name: `${useCase.name} (Copy)`,
      lastModified: new Date().toISOString()
    };

    this.useCases.push(duplicate);
    this.unsavedChanges = true;
    this.renderUseCasesList();
    this.showNotification('Use case duplicated successfully!', 'success');
  }

  // Persona Modal Methods
  openPersonaModal(personaId = null) {
    this.editingPersonaId = personaId;
    const modal = document.getElementById('persona-modal');
    const title = document.getElementById('persona-modal-title');
    
    if (personaId) {
      title.textContent = 'Edit Persona';
      this.loadPersonaIntoForm(personaId);
    } else {
      title.textContent = 'Add New Persona';
      this.clearPersonaForm();
    }
    
    modal.classList.remove('hidden');
  }

  closePersonaModal() {
    document.getElementById('persona-modal').classList.add('hidden');
    this.editingPersonaId = null;
  }

  loadPersonaIntoForm(personaId) {
    const persona = this.personas.find(p => p.id === personaId);
    if (!persona) return;

    document.getElementById('persona-title').value = persona.title || '';
    document.getElementById('persona-level').value = persona.level || '';
    document.getElementById('persona-vertical').value = persona.vertical || '';
    document.getElementById('persona-priority').value = persona.priority || 'medium';
    document.getElementById('persona-influence').value = persona.influence || '';
    document.getElementById('persona-world').value = persona.world || '';
    document.getElementById('persona-cares').value = persona.cares || '';
    document.getElementById('persona-help').value = persona.help || '';

    // Load tags into the form
    this.loadPersonaTagsIntoForm(persona.tags || {});
  }

  clearPersonaForm() {
    document.getElementById('persona-form').reset();
    this.updateTagDisplayState('persona-tags-display');
  }

  loadPersonaTagsIntoForm(tags) {
    const displayArea = document.getElementById('persona-tags-display');
    if (!displayArea) return;

    displayArea.innerHTML = '';
    
    // Combine all tag types into one list for simplified display
    const allTags = [
      ...(tags.primary || []),
      ...(tags.secondary || []),
      ...(tags.pain_points || []),
      ...(tags.interests || [])
    ];

    // Remove duplicates
    const uniqueTags = [...new Set(allTags)];

    uniqueTags.forEach(tag => {
      this.addSimpleTag('persona-tags-display', tag);
    });

    if (uniqueTags.length === 0) {
      this.updateTagDisplayState('persona-tags-display');
    }
  }

  extractPersonaTagsFromForm() {
    const tags = Array.from(document.querySelectorAll('#persona-tags-display .tag-chip'))
      .map(el => el.dataset.tag);

    // For backward compatibility, put all tags in primary category
    return {
      primary: tags,
      secondary: [],
      pain_points: [],
      interests: []
    };
  }

  async savePersona(event) {
    event.preventDefault();
    
    const formData = {
      id: this.editingPersonaId || `persona-${Date.now()}`,
      title: document.getElementById('persona-title').value.trim(),
      level: document.getElementById('persona-level').value,
      vertical: document.getElementById('persona-vertical').value,
      priority: document.getElementById('persona-priority').value,
      influence: document.getElementById('persona-influence').value,
      world: document.getElementById('persona-world').value.trim(),
      cares: document.getElementById('persona-cares').value.trim(),
      help: document.getElementById('persona-help').value.trim(),
      lob: this.determineLOBFromVertical(document.getElementById('persona-vertical').value),
      lastModified: new Date().toISOString(),
      tags: this.extractPersonaTagsFromForm()
    };

    try {
      if (this.editingPersonaId) {
        // Update existing persona
        const index = this.personas.findIndex(p => p.id === this.editingPersonaId);
        if (index !== -1) {
          this.personas[index] = { ...this.personas[index], ...formData };
        }
      } else {
        // Add new persona
        this.personas.push(formData);
      }

      this.unsavedChanges = true;
      this.renderPersonasList();
      this.updateStatistics();
      this.closePersonaModal();
      this.showNotification('Persona saved successfully!', 'success');

    } catch (error) {
      console.error('Failed to save persona:', error);
      this.showNotification('Failed to save persona', 'error');
    }
  }

  editPersona(personaId) {
    this.openPersonaModal(personaId);
  }

  createNewTag() {
    const name = document.getElementById('new-tag-name').value.trim();
    
    if (!name) {
      this.showNotification('Please enter a tag name', 'error');
      return;
    }

    // Add to common tags for quick access
    this.addCommonTag(name);
    this.showNotification('Tag added successfully!', 'success');
    
    // Clear form
    document.getElementById('new-tag-name').value = '';
  }

  updateStatistics() {
    document.getElementById('stats-resources').textContent = this.resources.length;
    document.getElementById('stats-personas').textContent = this.personas.length;
    document.getElementById('stats-use-cases').textContent = this.useCases.length;
    
    const totalTags = Object.values(this.tags).reduce((sum, tagArray) => sum + tagArray.length, 0);
    document.getElementById('stats-tags').textContent = totalTags;
  }

  async saveAllChanges() {
    if (!this.unsavedChanges) {
      this.showNotification('No changes to save', 'info');
      return;
    }

    try {
      // Create updated data structures
      const resourcesData = {
        version: '1.0',
        lastModified: new Date().toISOString(),
        resources: this.organizeResourcesByVertical(),
        metadata: {
          types: [...new Set(this.resources.map(r => r.type))],
          verticals: ['banking', 'insurance', 'general'],
          priority_levels: ['high', 'medium', 'low'],
          complexity_levels: ['low', 'medium', 'high'],
          tags: this.tags
        }
      };

      // Save to browser downloads
      const success = await this.contentAPI.saveData('resources-updated.json', resourcesData);
      
      if (success) {
        this.unsavedChanges = false;
        this.showNotification('All changes saved successfully! File downloaded.', 'success');
      } else {
        throw new Error('Failed to save file');
      }
      
    } catch (error) {
      console.error('Failed to save changes:', error);
      this.showNotification('Failed to save changes', 'error');
    }
  }

  organizeResourcesByVertical() {
    const organized = { banking: {}, insurance: {}, general: {} };
    
    this.resources.forEach(resource => {
      const vertical = resource.vertical || 'general';
      const lobs = resource.lob || ['general'];
      
      lobs.forEach(lob => {
        if (!organized[vertical][lob]) {
          organized[vertical][lob] = [];
        }
        organized[vertical][lob].push(resource);
      });
    });
    
    return organized;
  }

  async handleImportExport() {
    // Export functionality
    document.addEventListener('click', async (e) => {
      if (e.target.textContent.includes('Export Selected')) {
        const resourcesChecked = document.querySelector('input[type="checkbox"]:checked');
        if (resourcesChecked) {
          await this.contentAPI.exportAllContent();
          this.showNotification('Content exported successfully!', 'success');
        }
      }
    });

    // Import functionality  
    document.addEventListener('change', async (e) => {
      if (e.target.type === 'file' && e.target.accept === '.json') {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const importedData = await this.contentAPI.importData(file);
          
          if (importedData.content) {
            // Handle backup file format
            if (importedData.content.resources) {
              this.mergeImportedResources(importedData.content.resources);
            }
            if (importedData.content.personas) {
              this.mergeImportedPersonas(importedData.content.personas);
            }
          } else if (importedData.resources) {
            // Handle direct resources file
            this.mergeImportedResources(importedData);
          }

          this.renderResourcesList();
          this.updateStatistics();
          this.showNotification('Content imported successfully!', 'success');
          this.unsavedChanges = true;

        } catch (error) {
          console.error('Import failed:', error);
          this.showNotification('Failed to import content: ' + error.message, 'error');
        }
      }
    });
  }

  mergeImportedResources(resourcesData) {
    if (resourcesData.resources) {
      // Handle structured format
      Object.values(resourcesData.resources).forEach(vertical => {
        Object.values(vertical).forEach(lobResources => {
          if (Array.isArray(lobResources)) {
            lobResources.forEach(resource => {
              const exists = this.resources.find(r => r.id === resource.id);
              if (!exists) {
                this.resources.push(resource);
              }
            });
          }
        });
      });
    }
  }

  mergeImportedPersonas(personasData) {
    if (personasData.personas) {
      Object.values(personasData.personas).forEach(verticalPersonas => {
        if (Array.isArray(verticalPersonas)) {
          verticalPersonas.forEach(persona => {
            const exists = this.personas.find(p => p.id === persona.id);
            if (!exists) {
              this.personas.push(persona);
            }
          });
        }
      });
    }
  }

  previewChanges() {
    // Open the main application in a new tab to preview changes
    window.open('../../index.html', '_blank');
  }

  showNotification(message, type = 'info') {
    // Create and show a notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white font-medium z-50 ${
      type === 'success' ? 'bg-green-600' : 
      type === 'error' ? 'bg-red-600' : 
      'bg-blue-600'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Filter Rule Management Methods
  openFilterRuleModal(ruleId = null) {
    const modal = document.getElementById('filter-rule-modal');
    const title = document.getElementById('filter-rule-modal-title');
    
    if (ruleId) {
      title.textContent = 'Edit Filter Rule';
      this.editingRuleId = ruleId;
      this.loadFilterRuleIntoForm(ruleId);
    } else {
      title.textContent = 'Create New Filter Rule';
      this.editingRuleId = null;
      this.clearFilterRuleForm();
    }
    
    modal.classList.remove('hidden');
  }

  closeFilterRuleModal() {
    const modal = document.getElementById('filter-rule-modal');
    modal.classList.add('hidden');
    this.clearFilterRuleForm();
    this.editingRuleId = null;
  }

  clearFilterRuleForm() {
    document.getElementById('filter-rule-form').reset();
    this.updateTagDisplayState('filter-rule-tags-display');
  }

  loadFilterRuleIntoForm(ruleId) {
    // This would load existing rule data in a real implementation
    if (this.filterRules && this.filterRules.length > 0) {
      const rule = this.filterRules.find(r => r.id === ruleId);
      if (rule) {
        document.getElementById('filter-rule-name').value = rule.name;
        document.getElementById('filter-rule-vertical').value = rule.conditions.vertical || '';
        document.getElementById('filter-rule-lob').value = rule.conditions.lob || '';
        document.getElementById('filter-rule-deployment').value = rule.conditions.deployment || '';
        document.getElementById('filter-show-resources').checked = rule.actions.showResources || false;
        document.getElementById('filter-show-use-cases').checked = rule.actions.showUseCases || false;
        document.getElementById('filter-show-personas').checked = rule.actions.showPersonas || false;
        
        // Load tags using the tag display system
        const tagsDisplay = document.getElementById('filter-rule-tags-display');
        if (tagsDisplay) {
          tagsDisplay.innerHTML = '';
          if (rule.actions.tags && rule.actions.tags.length > 0) {
            rule.actions.tags.forEach(tag => {
              this.addSimpleTag('filter-rule-tags-display', tag);
            });
          } else {
            this.updateTagDisplayState('filter-rule-tags-display');
          }
        }
      }
    }
  }

  async saveFilterRule(event) {
    event.preventDefault();
    
    const ruleName = document.getElementById('filter-rule-name').value.trim();
    const vertical = document.getElementById('filter-rule-vertical').value;
    const lob = document.getElementById('filter-rule-lob').value;
    const deployment = document.getElementById('filter-rule-deployment').value;
    // Extract tags from the tag display area
    const tags = Array.from(document.querySelectorAll('#filter-rule-tags-display .tag-chip'))
      .map(el => el.dataset.tag);
    
    const showResources = document.getElementById('filter-show-resources').checked;
    const showUseCases = document.getElementById('filter-show-use-cases').checked;
    const showPersonas = document.getElementById('filter-show-personas').checked;
    
    if (!ruleName) {
      this.showNotification('Rule name is required', 'error');
      return;
    }

    
    const newRule = {
      id: this.editingRuleId || `rule-${Date.now()}`,
      name: ruleName,
      conditions: {
        vertical: vertical || null,
        lob: lob || null,
        deployment: deployment || null
      },
      actions: {
        showResources,
        showUseCases,
        showPersonas,
        tags: tags
      },
      isActive: true,
      dateCreated: new Date().toISOString()
    };

    try {
      // Add to local filter rules collection
      if (!this.filterRules) {
        this.filterRules = [];
      }
      
      if (this.editingRuleId) {
        // Update existing rule
        const index = this.filterRules.findIndex(rule => rule.id === this.editingRuleId);
        if (index !== -1) {
          this.filterRules[index] = { ...this.filterRules[index], ...newRule };
        }
      } else {
        // Add new rule
        this.filterRules.push(newRule);
      }

      this.renderFilterRules();
      this.closeFilterRuleModal();
      this.showNotification(this.editingRuleId ? 'Filter rule updated successfully!' : 'Filter rule created successfully!', 'success');
      this.unsavedChanges = true;
      
    } catch (error) {
      console.error('Failed to save filter rule:', error);
      this.showNotification('Failed to save filter rule', 'error');
    }
  }

  createQuickRule(template) {
    this.openFilterRuleModal();
    
    // Pre-fill form based on template
    setTimeout(() => {
      switch (template) {
        case 'vertical-lob':
          document.getElementById('filter-rule-name').value = 'Vertical + LOB Rule';
          document.getElementById('filter-rule-vertical').value = 'banking';
          document.getElementById('filter-rule-lob').value = 'finance';
          document.getElementById('filter-rule-tags').value = 'banking, finance, regulatory-reporting';
          break;
        case 'tag-based':
          document.getElementById('filter-rule-name').value = 'Tag-Based Rule';
          document.getElementById('filter-rule-tags').value = 'automation, rpa, process-efficiency';
          break;
          break;
      }
    }, 100);
  }

  renderFilterRules() {
    const container = document.getElementById('filter-rules-list');
    if (!container) return;

    // Add some default rules if none exist
    if (!this.filterRules || this.filterRules.length === 0) {
      this.filterRules = [
        {
          id: 'rule-1',
          name: 'Banking + Finance Focus',
          conditions: { vertical: 'banking', lob: 'finance' },
          actions: { showResources: true, showUseCases: true, tags: ['finance', 'banking', 'regulatory-reporting'] },
          priority: 'high',
          isActive: true
        },
        {
          id: 'rule-2',
          name: 'Insurance Claims Processing',
          conditions: { vertical: 'insurance', lob: 'operations' },
          actions: { showUseCases: true, tags: ['claims-processing', 'automation', 'document-processing'] },
          priority: 'high',
          isActive: true
        }
      ];
    }

    container.innerHTML = this.filterRules.map(rule => {
      const conditionText = this.buildConditionText(rule.conditions);
      const actionText = this.buildActionText(rule.actions);
      
      return `
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="px-2 py-1 bg-${rule.isActive ? 'green' : 'gray'}-100 text-${rule.isActive ? 'green' : 'gray'}-800 text-xs font-medium rounded">
                  ${rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <span class="font-medium text-gray-900">${rule.name}</span>
              </div>
              <div class="text-sm text-gray-600 mb-2">
                <strong>When:</strong> ${conditionText}
              </div>
              <div class="text-sm text-gray-600">
                <strong>Show:</strong> ${actionText}
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
              <button onclick="adminInterface.editFilterRule('${rule.id}')" class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Edit</button>
              <button onclick="adminInterface.deleteFilterRule('${rule.id}')" class="px-3 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.updateFilterRuleStats();
  }

  buildConditionText(conditions) {
    const parts = [];
    if (conditions.vertical) parts.push(`Vertical = "${conditions.vertical}"`);
    if (conditions.lob) parts.push(`LOB = "${conditions.lob}"`);
    if (conditions.deployment) parts.push(`Deployment = "${conditions.deployment}"`);
    
    return parts.length > 0 ? parts.join(' AND ') : 'Any conditions';
  }

  buildActionText(actions) {
    const contentTypes = [];
    if (actions.showResources) contentTypes.push('Resources');
    if (actions.showUseCases) contentTypes.push('Use Cases');
    if (actions.showPersonas) contentTypes.push('Personas');
    
    const typeText = contentTypes.length > 0 ? contentTypes.join(', ') : 'No content';
    const tagText = actions.tags && actions.tags.length > 0 ? ` tagged with "${actions.tags.join('", "')}"` : '';
    
    return typeText + tagText;
  }

  updateFilterRuleStats() {
    const activeRulesEl = document.getElementById('stats-active-rules');
    const matchedItemsEl = document.getElementById('stats-rules-matched');
    const performanceEl = document.getElementById('stats-rules-performance');

    if (activeRulesEl && this.filterRules) {
      activeRulesEl.textContent = this.filterRules.filter(rule => rule.isActive).length;
    }
    if (matchedItemsEl) {
      matchedItemsEl.textContent = Math.floor(Math.random() * 1000) + 200; // Mock data
    }
    if (performanceEl) {
      performanceEl.textContent = Math.floor(Math.random() * 10) + 90 + '%'; // Mock data
    }
  }

  editFilterRule(ruleId) {
    this.openFilterRuleModal(ruleId);
  }

  deleteFilterRule(ruleId) {
    const rule = this.filterRules?.find(r => r.id === ruleId);
    if (rule && confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      this.filterRules = this.filterRules.filter(r => r.id !== ruleId);
      this.renderFilterRules();
      this.showNotification('Filter rule deleted successfully!', 'success');
      this.unsavedChanges = true;
    }
  }

  // Tag Management Methods
  openTagModal(tagName = null) {
    const modal = document.getElementById('tag-modal');
    const title = document.getElementById('tag-modal-title');
    
    if (tagName) {
      title.textContent = 'Edit Tag';
      this.editingTagName = tagName;
      // Load existing tag data if editing
      this.loadTagIntoForm(tagName);
    } else {
      title.textContent = 'Add New Tag';
      this.editingTagName = null;
      this.clearTagForm();
    }
    
    modal.classList.remove('hidden');
  }

  closeTagModal() {
    const modal = document.getElementById('tag-modal');
    modal.classList.add('hidden');
    this.clearTagForm();
    this.editingTagName = null;
  }

  clearTagForm() {
    document.getElementById('tag-form').reset();
  }

  loadTagIntoForm(tagName) {
    // This would load existing tag data in a real implementation
    document.getElementById('tag-name').value = tagName;
  }

  async saveTag(event) {
    event.preventDefault();
    
    const tagName = document.getElementById('tag-name').value.trim();
    const category = document.getElementById('tag-category').value;
    const description = document.getElementById('tag-description').value.trim();
    
    if (!tagName) {
      this.showNotification('Tag name is required', 'error');
      return;
    }

    const newTag = {
      name: tagName,
      category: category,
      description: description,
      usageCount: 0,
      dateCreated: new Date().toISOString()
    };

    try {
      // Add to local tags collection (in a real app, this would save to backend)
      if (!this.tags.custom) {
        this.tags.custom = [];
      }
      
      // Check for duplicates
      const exists = this.tags.custom.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
      if (exists && !this.editingTagName) {
        this.showNotification('Tag already exists', 'error');
        return;
      }

      if (this.editingTagName) {
        // Update existing tag
        const index = this.tags.custom.findIndex(tag => tag.name === this.editingTagName);
        if (index !== -1) {
          this.tags.custom[index] = { ...this.tags.custom[index], ...newTag };
        }
      } else {
        // Add new tag
        this.tags.custom.push(newTag);
      }

      this.renderTagsDisplay();
      this.closeTagModal();
      this.showNotification(this.editingTagName ? 'Tag updated successfully!' : 'Tag created successfully!', 'success');
      this.unsavedChanges = true;
      
    } catch (error) {
      console.error('Failed to save tag:', error);
      this.showNotification('Failed to save tag', 'error');
    }
  }

  renderTagsDisplay() {
    const display = document.getElementById('all-tags-display');
    if (!display) return;

    // Get actual tag usage stats
    const tagStats = this.getTagStats();
    const mostUsedTags = this.getMostUsedTags(50);
    
    // Combine with custom tags
    const customTags = this.tags.custom || [];
    const allTags = [];
    
    // Add tracked tags with usage stats
    mostUsedTags.forEach(tagStat => {
      allTags.push({
        name: tagStat.text,
        category: 'tracked',
        usageCount: tagStat.count,
        lastUsed: tagStat.lastUsed,
        contexts: tagStat.contexts
      });
    });
    
    // Add custom tags that aren't already tracked
    customTags.forEach(customTag => {
      const existingTag = allTags.find(t => t.name.toLowerCase() === customTag.name.toLowerCase());
      if (!existingTag) {
        allTags.push({
          name: customTag.name,
          category: customTag.category || 'custom',
          usageCount: 0,
          contexts: []
        });
      }
    });

    if (allTags.length === 0) {
      display.innerHTML = '<div class="text-center py-8"><span class="text-gray-500 text-sm">No tags created yet. Tags will appear here as you add them to resources, use cases, and personas.</span></div>';
      return;
    }

    // Sort by usage count (most used first)
    allTags.sort((a, b) => b.usageCount - a.usageCount);

    display.innerHTML = allTags.map(tag => {
      const contextBadges = tag.contexts ? tag.contexts.map(ctx => 
        `<span class="inline-block px-1 py-0 text-xs bg-gray-200 text-gray-700 rounded mr-1">${ctx}</span>`
      ).join('') : '';
      
      const lastUsedText = tag.lastUsed ? 
        new Date(tag.lastUsed).toLocaleDateString() : 'Never';
        
      return `
        <div class="border border-gray-200 rounded-lg p-3 mb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-900">${tag.name}</span>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Used ${tag.usageCount} times
              </span>
              <button type="button" onclick="adminInterface.editTag('${tag.name}')" class="text-blue-600 hover:text-blue-800 text-sm">
                ✏️
              </button>
              <button type="button" onclick="adminInterface.deleteTag('${tag.name}')" class="text-red-600 hover:text-red-800 text-sm">
                ×
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-500">
            <div class="mb-1">Last used: ${lastUsedText}</div>
            ${contextBadges ? `<div>Used in: ${contextBadges}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Update stats
    this.updateTagStats(allTags);
  }

  updateTagStats(tags) {
    const totalTags = document.getElementById('stats-total-tags');
    const usedTags = document.getElementById('stats-used-tags');
    const popularTags = document.getElementById('stats-popular-tags');
    const unusedTags = document.getElementById('stats-unused-tags');

    if (totalTags) totalTags.textContent = tags.length;
    if (usedTags) usedTags.textContent = tags.filter(tag => (tag.usageCount || 0) > 0).length;
    if (popularTags) popularTags.textContent = tags.filter(tag => (tag.usageCount || 0) > 5).length;
    if (unusedTags) unusedTags.textContent = tags.filter(tag => (tag.usageCount || 0) === 0).length;
  }

  editTag(tagName) {
    this.openTagModal(tagName);
  }

  deleteTag(tagName) {
    if (confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
      if (this.tags.custom) {
        this.tags.custom = this.tags.custom.filter(tag => tag.name !== tagName);
        this.renderTagsDisplay();
        this.showNotification('Tag deleted successfully!', 'success');
        this.unsavedChanges = true;
      }
    }
  }

  // AI Tag Suggestion Methods
  async suggestResourceTags() {
    const title = document.getElementById('resource-name')?.value || '';
    const description = document.getElementById('resource-overview')?.value || '';
    const type = document.getElementById('resource-type')?.value || '';
    
    await this.suggestTags('resource', { title, description, type }, 'resource-tags-display');
  }

  async suggestUseCaseTags() {
    const name = document.getElementById('use-case-name')?.value || '';
    const description = document.getElementById('use-case-description')?.value || '';
    const process = document.getElementById('use-case-process')?.value || '';
    const category = document.getElementById('use-case-category')?.value || '';
    
    await this.suggestTags('use-case', { name, description, process, category }, 'use-case-tags-display');
  }

  async suggestPersonaTags() {
    const title = document.getElementById('persona-title')?.value || '';
    const level = document.getElementById('persona-level')?.value || '';
    const world = document.getElementById('persona-world')?.value || '';
    const cares = document.getElementById('persona-cares')?.value || '';
    const help = document.getElementById('persona-help')?.value || '';
    
    await this.suggestTags('persona', { title, level, world, cares, help }, 'persona-tags-display');
  }

  async suggestFilterTags() {
    const ruleName = document.getElementById('filter-rule-name')?.value || '';
    const vertical = document.getElementById('filter-rule-vertical')?.value || '';
    const lob = document.getElementById('filter-rule-lob')?.value || '';
    const deployment = document.getElementById('filter-rule-deployment')?.value || '';
    
    await this.suggestTags('filter-rule', { ruleName, vertical, lob, deployment }, 'filter-rule-tags-display');
  }

  async suggestTags(contentType, contentData, displayAreaId) {
    const buttonId = contentType === 'use-case' ? 'usecase' : 
                    contentType === 'filter-rule' ? 'filter' : contentType;
    const button = document.getElementById(`ai-suggest-${buttonId}-tags`);
    
    // Check if we have enough content to generate suggestions
    const hasContent = Object.values(contentData).some(value => value.trim().length > 0);
    if (!hasContent) {
      this.showNotification('Please fill in some content fields before requesting AI tag suggestions', 'error');
      return;
    }

    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<svg class="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...';
    button.disabled = true;

    try {
      // Check if we have AI service available
      let aiService = null;
      
      if (typeof window.aiService !== 'undefined') {
        aiService = window.aiService;
      } else if (typeof aiIntegration !== 'undefined') {
        aiService = aiIntegration;
      } else {
        throw new Error('AI service not available. Please ensure Claude API is configured.');
      }

      const prompt = this.buildTagSuggestionPrompt(contentType, contentData);
      
      let response;
      if (aiService.generateResponse) {
        response = await aiService.generateResponse(prompt);
      } else {
        throw new Error('No compatible AI service found');
      }

      const suggestedTags = this.parseTagSuggestions(response);
      
      if (suggestedTags.length === 0) {
        this.showNotification('AI could not suggest relevant tags. Please add tags manually.', 'error');
        return;
      }

      // Add suggested tags to the display
      suggestedTags.forEach(tag => {
        this.addSimpleTag(displayAreaId, tag);
      });

      this.showNotification(`Added ${suggestedTags.length} AI-suggested tags!`, 'success');
      
    } catch (error) {
      console.error('AI tag suggestion error:', error);
      this.showNotification('AI tag suggestion failed. Please add tags manually.', 'error');
    } finally {
      // Restore button state
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  buildTagSuggestionPrompt(contentType, contentData) {
    const contextMap = {
      'resource': {
        fields: ['title', 'description', 'type'],
        description: 'UiPath resource/tool/playbook'
      },
      'use-case': {
        fields: ['name', 'description', 'process', 'category'],
        description: 'UiPath automation use case'
      },
      'persona': {
        fields: ['title', 'level', 'world', 'cares', 'help'],
        description: 'Business persona for UiPath automation'
      },
      'filter-rule': {
        fields: ['ruleName', 'vertical', 'lob', 'deployment'],
        description: 'Content filtering rule for UiPath sales guide'
      }
    };

    const context = contextMap[contentType];
    const contentText = context.fields
      .map(field => contentData[field])
      .filter(value => value && value.trim())
      .join(' ');

    if (contentType === 'filter-rule') {
      return `You are an expert UiPath automation consultant. Based on the following filter rule information, suggest 5-8 relevant tags that would be appropriate for filtering content in this scenario.

Filter Rule Information:
${contentText}

Context: This is for a UiPath Sales Guide content filtering system. The tags will be used to show relevant content when the filter conditions are met.

Generate tags that would be relevant for content that should appear when this filter rule is active:
- Specific to automation, RPA, and UiPath capabilities relevant to the specified conditions
- Industry-relevant tags matching the vertical (banking, insurance, healthcare, etc.)
- Business function relevant tags matching the LOB (finance, HR, operations, etc.)
- Technology relevant (document processing, API integration, etc.)
- Outcome-focused (cost-reduction, process-efficiency, compliance, etc.)

Return ONLY a comma-separated list of 5-8 relevant tags, nothing else.
Example: automation, rpa, banking, cost-reduction, document-processing, compliance

Tags:`;
    }

    return `You are an expert UiPath automation consultant. Based on the following ${context.description} information, suggest 5-8 relevant tags that would help categorize and find this content.

Content Information:
${contentText}

Context: This is for a UiPath Sales Guide system used by sales representatives to find relevant resources, use cases, and personas for customer conversations.

Generate tags that are:
- Specific to automation, RPA, and UiPath capabilities
- Industry-relevant (banking, insurance, healthcare, etc.)
- Business function relevant (finance, HR, operations, etc.)
- Technology relevant (document processing, API integration, etc.)
- Outcome-focused (cost-reduction, process-efficiency, compliance, etc.)

Return ONLY a comma-separated list of 5-8 relevant tags, nothing else.
Example: automation, rpa, banking, cost-reduction, document-processing, compliance

Tags:`;
  }

  parseTagSuggestions(response) {
    try {
      // Clean up the response
      let cleanResponse = response.trim();
      
      // Remove any extra text and keep only the comma-separated tags
      const lines = cleanResponse.split('\n');
      const tagLine = lines.find(line => 
        line.includes(',') && 
        !line.toLowerCase().includes('example') &&
        !line.toLowerCase().includes('tags:')
      ) || lines[lines.length - 1];
      
      // Extract tags
      const tags = tagLine
        .replace(/^[^:]*:/, '') // Remove any prefix like "Tags:"
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 30) // Filter reasonable tag lengths
        .slice(0, 8); // Limit to 8 tags
      
      return tags;
    } catch (error) {
      console.warn('Failed to parse tag suggestions:', error);
      return [];
    }
  }

  // Tag Frequency Tracking
  trackTagUsage(tagText) {
    const tagStats = JSON.parse(localStorage.getItem('tag_usage_stats') || '{}');
    const normalizedTag = tagText.toLowerCase().trim();
    
    if (!tagStats[normalizedTag]) {
      tagStats[normalizedTag] = {
        text: tagText,
        count: 0,
        lastUsed: null,
        contexts: []
      };
    }
    
    tagStats[normalizedTag].count++;
    tagStats[normalizedTag].lastUsed = new Date().toISOString();
    
    // Track context (which section/form this was used in)
    const currentSection = this.currentSection || 'unknown';
    if (!tagStats[normalizedTag].contexts.includes(currentSection)) {
      tagStats[normalizedTag].contexts.push(currentSection);
    }
    
    localStorage.setItem('tag_usage_stats', JSON.stringify(tagStats));
  }

  getTagStats() {
    return JSON.parse(localStorage.getItem('tag_usage_stats') || '{}');
  }

  getMostUsedTags(limit = 20) {
    const tagStats = this.getTagStats();
    return Object.values(tagStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // AI Service Integration
  initializeAIService() {
    // Initialize a simple AI service for the admin interface
    if (!window.aiService) {
      window.aiService = {
        apiKey: localStorage.getItem('claude_api_key'),
        model: localStorage.getItem('claude_model') || 'claude-3-5-sonnet-20241022',
        
        async generateResponse(prompt, options = {}) {
          if (!this.apiKey) {
            throw new Error('No API key configured. Please set up your Claude API key in API Settings.');
          }
          
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: options.model || this.model,
              max_tokens: options.maxTokens || 1000,
              temperature: options.temperature || 0.7,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ]
            })
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`AI API Error: ${error.error?.message || response.statusText}`);
          }

          const data = await response.json();
          return data.content[0].text;
        }
      };
    } else {
      // Update existing AI service with stored credentials
      const apiKey = localStorage.getItem('claude_api_key');
      const model = localStorage.getItem('claude_model');
      
      if (apiKey) {
        window.aiService.apiKey = apiKey;
      }
      if (model) {
        window.aiService.model = model;
      }
    }
  }

  // API Settings Management
  loadAPISettings() {
    const apiKey = localStorage.getItem('claude_api_key');
    const model = localStorage.getItem('claude_model') || 'claude-3-5-sonnet-20241022';
    
    document.getElementById('claude-api-key').value = apiKey || '';
    document.getElementById('claude-model').value = model;
    
    this.updateAPIStatus();
  }

  saveAPISettings() {
    const apiKey = document.getElementById('claude-api-key').value.trim();
    const model = document.getElementById('claude-model').value;
    
    if (!apiKey) {
      this.showNotification('Please enter a Claude API key', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-ant-')) {
      this.showNotification('Invalid API key format. Claude API keys start with "sk-ant-"', 'error');
      return;
    }
    
    // Store API settings
    localStorage.setItem('claude_api_key', apiKey);
    localStorage.setItem('claude_model', model);
    
    // Update the global AI service
    if (window.aiService) {
      window.aiService.apiKey = apiKey;
      window.aiService.model = model;
    }
    
    this.updateAPIStatus();
    this.showNotification('API settings saved successfully!', 'success');
  }

  clearAPISettings() {
    if (!confirm('Are you sure you want to clear all API settings? This will disable AI features.')) {
      return;
    }
    
    localStorage.removeItem('claude_api_key');
    localStorage.removeItem('claude_model');
    
    document.getElementById('claude-api-key').value = '';
    document.getElementById('claude-model').value = 'claude-3-5-sonnet-20241022';
    
    // Clear the global AI service
    if (window.aiService) {
      window.aiService.apiKey = null;
      window.aiService.model = 'claude-3-5-sonnet-20241022';
    }
    
    this.updateAPIStatus();
    this.showNotification('API settings cleared', 'success');
  }

  toggleApiKeyVisibility() {
    const input = document.getElementById('claude-api-key');
    const button = document.getElementById('toggle-api-key-visibility');
    
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
      button.title = 'Hide API key';
    } else {
      input.type = 'password';
      button.textContent = '👁️';
      button.title = 'Show API key';
    }
  }

  updateAPIStatus() {
    const apiKey = localStorage.getItem('claude_api_key');
    const statusElement = document.getElementById('api-status');
    const testButton = document.getElementById('test-api-btn');
    
    if (apiKey) {
      statusElement.textContent = 'Configured';
      statusElement.className = 'text-sm text-green-600';
      testButton.disabled = false;
    } else {
      statusElement.textContent = 'Not configured';
      statusElement.className = 'text-sm text-gray-500';
      testButton.disabled = true;
    }
  }

  async testAPIConnection() {
    const apiKey = localStorage.getItem('claude_api_key');
    const model = localStorage.getItem('claude_model') || 'claude-3-5-sonnet-20241022';
    
    if (!apiKey) {
      this.showNotification('Please save API settings first', 'error');
      return;
    }

    const testButton = document.getElementById('test-api-btn');
    const originalText = testButton.textContent;
    
    try {
      testButton.disabled = true;
      testButton.textContent = 'Testing...';
      
      // Simple test request to Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Say "test successful" if you can read this.'
            }
          ]
        })
      });

      if (response.ok) {
        this.showNotification('API connection successful! ✅', 'success');
        const statusElement = document.getElementById('api-status');
        statusElement.textContent = 'Connected ✅';
        statusElement.className = 'text-sm text-green-600';
      } else {
        const error = await response.json();
        this.showNotification(`API test failed: ${error.error?.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      this.showNotification(`Connection failed: ${error.message}`, 'error');
    } finally {
      testButton.disabled = false;
      testButton.textContent = originalText;
    }
  }

  // Utility function for debouncing
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

  // Site Statistics & Analytics System
  loadSiteStatistics() {
    this.initializeAnalytics();
    this.renderStatisticsDashboard();
    this.switchStatsTab('content-performance');
  }

  initializeAnalytics() {
    // Initialize analytics tracking if not already done
    if (!window.siteAnalytics) {
      window.siteAnalytics = {
        // Session tracking
        sessionId: this.generateSessionId(),
        sessionStart: new Date(),
        pageViews: [],
        interactions: [],
        searchQueries: [],
        filterUsage: [],
        externalLinks: [],
        
        // Track user interaction
        trackEvent: (eventType, eventData) => {
          const event = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            sessionId: window.siteAnalytics.sessionId,
            timestamp: new Date().toISOString(),
            type: eventType,
            data: eventData,
            url: window.location.pathname,
            userAgent: navigator.userAgent
          };
          
          this.storeAnalyticsEvent(event);
        },
        
        // Track prompts with context
        trackPrompt: (context, prompt, response, responseQuality) => {
          const event = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            sessionId: window.siteAnalytics.sessionId,
            timestamp: new Date().toISOString(),
            type: 'prompt_submission',
            data: {
              context: context, // competitive, company, objection, discovery
              prompt: prompt,
              response: response,
              responseQuality: responseQuality, // weak, moderate, strong
              responseLength: response ? response.length : 0,
              keywords: this.extractKeywords(prompt)
            },
            url: window.location.pathname,
            userAgent: navigator.userAgent
          };
          
          this.storeAnalyticsEvent(event);
        },
        
        // Extract keywords from prompt
        extractKeywords: (text) => {
          const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for', 'can', 'you', 'what', 'how', 'why', 'when', 'where', 'who'];
          return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 10);
        }
      };
      
      // Start tracking immediately
      this.startAnalyticsTracking();
    }
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  startAnalyticsTracking() {
    // Track page views
    this.trackPageView();
    
    // Track clicks on external links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="http"]')) {
        window.siteAnalytics.trackEvent('external_link_click', {
          url: e.target.href,
          text: e.target.textContent.trim(),
          context: e.target.closest('section')?.id || 'unknown'
        });
      }
      
      // Track tag clicks
      if (e.target.matches('.tag, .tag-chip')) {
        window.siteAnalytics.trackEvent('tag_click', {
          tag: e.target.textContent.trim().replace('×', ''),
          context: e.target.closest('section')?.id || 'unknown'
        });
      }
      
      // Track resource/content interactions
      if (e.target.matches('[data-resource-id]')) {
        window.siteAnalytics.trackEvent('resource_interaction', {
          resourceId: e.target.dataset.resourceId,
          action: 'view'
        });
      }
    });
    
    // Track search queries
    const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
    searchInputs.forEach(input => {
      input.addEventListener('input', this.debounce((e) => {
        if (e.target.value.length > 2) {
          window.siteAnalytics.trackEvent('search_query', {
            query: e.target.value,
            context: e.target.closest('section')?.id || 'main-search'
          });
        }
      }, 500));
    });
    
    // Track filter usage
    const filterInputs = document.querySelectorAll('select[id*="filter"], input[id*="filter"]');
    filterInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        window.siteAnalytics.trackEvent('filter_usage', {
          filterId: e.target.id,
          value: e.target.value,
          type: e.target.type
        });
      });
    });
  }

  trackPageView() {
    window.siteAnalytics.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }

  storeAnalyticsEvent(event) {
    const events = JSON.parse(localStorage.getItem('site_analytics_events') || '[]');
    events.push(event);
    
    // Keep only last 10000 events to prevent storage overflow
    if (events.length > 10000) {
      events.splice(0, events.length - 10000);
    }
    
    localStorage.setItem('site_analytics_events', JSON.stringify(events));
  }

  getAnalyticsEvents(timeFilter = 'month') {
    const events = JSON.parse(localStorage.getItem('site_analytics_events') || '[]');
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeFilter) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'all':
        cutoffDate = new Date(0);
        break;
    }
    
    return events.filter(event => new Date(event.timestamp) >= cutoffDate);
  }

  renderStatisticsDashboard() {
    const timeFilter = document.getElementById('stats-time-period').value;
    const events = this.getAnalyticsEvents(timeFilter);
    
    // Calculate overview metrics
    this.updateOverviewMetrics(events);
    
    // Update current tab content
    const activeTab = document.querySelector('.stats-tab.active')?.dataset.tab || 'content-performance';
    this.renderStatsTabContent(activeTab, events);
  }

  updateOverviewMetrics(events) {
    const pageViews = events.filter(e => e.type === 'page_view');
    const uniqueSessionIds = [...new Set(events.map(e => e.sessionId))];
    const externalLinkClicks = events.filter(e => e.type === 'external_link_click');
    
    // Calculate session duration
    const sessions = {};
    events.forEach(event => {
      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = { start: event.timestamp, end: event.timestamp };
      } else {
        sessions[event.sessionId].end = event.timestamp;
      }
    });
    
    const sessionDurations = Object.values(sessions).map(session => 
      new Date(session.end) - new Date(session.start)
    );
    const avgDuration = sessionDurations.length ? 
      sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length : 0;
    
    // Update UI
    document.getElementById('total-page-views').textContent = pageViews.length.toLocaleString();
    document.getElementById('unique-visitors').textContent = uniqueSessionIds.length.toLocaleString();
    document.getElementById('avg-session-duration').textContent = this.formatDuration(avgDuration);
    document.getElementById('external-links-clicked').textContent = externalLinkClicks.length.toLocaleString();
    
    // You could add period comparison here by fetching previous period data
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  }

  switchStatsTab(tabName) {
    // Update tab navigation
    document.querySelectorAll('.stats-tab').forEach(tab => {
      tab.classList.remove('active', 'border-blue-500', 'text-blue-600');
      tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add('active', 'border-blue-500', 'text-blue-600');
      activeTab.classList.remove('border-transparent', 'text-gray-500');
    }

    // Show/hide tab content
    document.querySelectorAll('.stats-tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
      activeContent.classList.remove('hidden');
    }
    
    // Render tab-specific content
    const events = this.getAnalyticsEvents(document.getElementById('stats-time-period').value);
    this.renderStatsTabContent(tabName, events);
  }

  renderStatsTabContent(tabName, events) {
    switch (tabName) {
      case 'content-performance':
        this.renderContentPerformance(events);
        break;
      case 'user-behavior':
        this.renderUserBehavior(events);
        break;
      case 'search-filters':
        this.renderSearchFilters(events);
        break;
      case 'engagement':
        this.renderEngagement(events);
        break;
      case 'prompt-analysis':
        this.renderPromptAnalysis(events);
        break;
    }
  }

  renderContentPerformance(events) {
    // Top Resources
    const resourceInteractions = events.filter(e => e.type === 'resource_interaction');
    const resourceCounts = {};
    resourceInteractions.forEach(event => {
      resourceCounts[event.data.resourceId] = (resourceCounts[event.data.resourceId] || 0) + 1;
    });
    
    const topResources = Object.entries(resourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
      
    const topResourcesList = document.getElementById('top-resources-list');
    if (topResourcesList) {
      topResourcesList.innerHTML = topResources.length ? topResources.map(([id, count]) => `
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-900">${id}</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${count} views</span>
        </div>
      `).join('') : '<p class="text-sm text-gray-500">No resource interactions yet</p>';
    }

    // Popular Tags
    const tagClicks = events.filter(e => e.type === 'tag_click');
    const tagCounts = {};
    tagClicks.forEach(event => {
      tagCounts[event.data.tag] = (tagCounts[event.data.tag] || 0) + 1;
    });
    
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
      
    const popularTagsList = document.getElementById('popular-tags-list');
    if (popularTagsList) {
      popularTagsList.innerHTML = popularTags.length ? popularTags.map(([tag, count]) => `
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ${tag} <span class="ml-1 text-gray-600">${count}</span>
        </span>
      `).join('') : '<p class="text-sm text-gray-500">No tag interactions yet</p>';
    }
  }

  renderUserBehavior(events) {
    // Navigation patterns
    const pageViews = events.filter(e => e.type === 'page_view');
    const pathCounts = {};
    pageViews.forEach(event => {
      pathCounts[event.data.path || '/'] = (pathCounts[event.data.path || '/'] || 0) + 1;
    });
    
    const topPaths = Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
      
    const navigationPatterns = document.getElementById('navigation-patterns');
    if (navigationPatterns) {
      navigationPatterns.innerHTML = topPaths.length ? topPaths.map(([path, count]) => `
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-900">${path}</span>
          <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">${count} visits</span>
        </div>
      `).join('') : '<p class="text-sm text-gray-500">No navigation data yet</p>';
    }
  }

  renderSearchFilters(events) {
    // Search queries
    const searches = events.filter(e => e.type === 'search_query');
    const queryCounts = {};
    searches.forEach(event => {
      queryCounts[event.data.query] = (queryCounts[event.data.query] || 0) + 1;
    });
    
    const topQueries = Object.entries(queryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
      
    const topSearches = document.getElementById('top-searches');
    if (topSearches) {
      topSearches.innerHTML = topQueries.length ? topQueries.map(([query, count]) => `
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-900">"${query}"</span>
          <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">${count} searches</span>
        </div>
      `).join('') : '<p class="text-sm text-gray-500">No search queries yet</p>';
    }

    // Filter usage
    const filterEvents = events.filter(e => e.type === 'filter_usage');
    const filterCounts = {};
    filterEvents.forEach(event => {
      filterCounts[event.data.filterId] = (filterCounts[event.data.filterId] || 0) + 1;
    });
    
    const topFilters = Object.entries(filterCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
      
    const filterUsage = document.getElementById('filter-usage');
    if (filterUsage) {
      filterUsage.innerHTML = topFilters.length ? topFilters.map(([filter, count]) => `
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-900">${filter.replace('-filter', '')}</span>
          <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">${count} uses</span>
        </div>
      `).join('') : '<p class="text-sm text-gray-500">No filter usage yet</p>';
    }
  }

  renderEngagement(events) {
    // External links
    const linkClicks = events.filter(e => e.type === 'external_link_click');
    const linkCounts = {};
    linkClicks.forEach(event => {
      linkCounts[event.data.url] = (linkCounts[event.data.url] || 0) + 1;
    });
    
    const topLinks = Object.entries(linkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
      
    const topExternalLinks = document.getElementById('top-external-links');
    if (topExternalLinks) {
      topExternalLinks.innerHTML = topLinks.length ? topLinks.map(([url, count]) => `
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-900 truncate" title="${url}">${new URL(url).hostname}</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${count} clicks</span>
        </div>
      `).join('') : '<p class="text-sm text-gray-500">No external link clicks yet</p>';
    }

    // Content interaction metrics
    const resourceViews = events.filter(e => e.type === 'resource_interaction').length;
    const tagClicks = events.filter(e => e.type === 'tag_click').length;
    
    document.getElementById('resources-opened').textContent = resourceViews.toLocaleString();
    document.getElementById('tags-clicked').textContent = tagClicks.toLocaleString();
  }

  updateStatisticsPeriod() {
    this.renderStatisticsDashboard();
  }

  refreshStatistics() {
    this.renderStatisticsDashboard();
    this.showNotification('Statistics refreshed successfully!', 'success');
  }

  exportStatistics() {
    const timeFilter = document.getElementById('stats-time-period').value;
    const events = this.getAnalyticsEvents(timeFilter);
    
    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeFilter: timeFilter,
      totalEvents: events.length,
      events: events
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-statistics-${timeFilter}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Statistics exported successfully!', 'success');
  }

  // Prompt Analysis Methods
  renderPromptAnalysis(events) {
    const promptEvents = events.filter(e => e.type === 'prompt_submission');
    
    // Context statistics
    const contextCounts = {
      competitive: 0,
      company: 0,
      objection: 0,
      discovery: 0
    };
    
    promptEvents.forEach(event => {
      if (event.data.context && contextCounts.hasOwnProperty(event.data.context)) {
        contextCounts[event.data.context]++;
      }
    });
    
    document.getElementById('competitive-prompts').textContent = contextCounts.competitive.toLocaleString();
    document.getElementById('company-prompts').textContent = contextCounts.company.toLocaleString();
    document.getElementById('objection-prompts').textContent = contextCounts.objection.toLocaleString();
    document.getElementById('discovery-prompts').textContent = contextCounts.discovery.toLocaleString();
    
    // Recent prompts
    const recentPrompts = promptEvents
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
      
    const recentPromptsList = document.getElementById('recent-prompts-list');
    if (recentPromptsList) {
      recentPromptsList.innerHTML = recentPrompts.length ? recentPrompts.map(event => `
        <div class="border-l-4 ${this.getContextColor(event.data.context)} pl-3 py-2">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs font-medium text-gray-500">${this.getContextLabel(event.data.context)}</span>
            <span class="text-xs text-gray-400">${new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
          <p class="text-sm text-gray-800 line-clamp-2">${event.data.prompt}</p>
          <div class="mt-1 flex items-center space-x-2">
            <span class="text-xs px-2 py-0.5 rounded ${this.getQualityBadge(event.data.responseQuality)}">${event.data.responseQuality || 'Unknown'}</span>
            <span class="text-xs text-gray-500">${event.data.responseLength || 0} chars</span>
          </div>
        </div>
      `).join('') : '<p class="text-sm text-gray-500">No prompts submitted yet</p>';
    }
    
    // Popular keywords
    const allKeywords = {};
    promptEvents.forEach(event => {
      if (event.data.keywords) {
        event.data.keywords.forEach(keyword => {
          allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
        });
      }
    });
    
    const topKeywords = Object.entries(allKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);
      
    const promptKeywords = document.getElementById('prompt-keywords');
    if (promptKeywords) {
      promptKeywords.innerHTML = topKeywords.length ? topKeywords.map(([keyword, count]) => `
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ${keyword} <span class="ml-1 text-gray-600">${count}</span>
        </span>
      `).join('') : '<p class="text-sm text-gray-500">No keywords found yet</p>';
    }
    
    // Update prompts table
    this.updatePromptsTable(promptEvents);
  }

  getContextColor(context) {
    const colors = {
      competitive: 'border-blue-400',
      company: 'border-green-400', 
      objection: 'border-red-400',
      discovery: 'border-purple-400'
    };
    return colors[context] || 'border-gray-400';
  }

  getContextLabel(context) {
    const labels = {
      competitive: '🏢 Competitive',
      company: '🏭 Company',
      objection: '⚠️ Objection', 
      discovery: '❓ Discovery'
    };
    return labels[context] || '❓ Unknown';
  }

  getQualityBadge(quality) {
    const badges = {
      weak: 'bg-red-100 text-red-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      strong: 'bg-green-100 text-green-800'
    };
    return badges[quality] || 'bg-gray-100 text-gray-800';
  }

  updatePromptsTable(promptEvents) {
    const tableBody = document.getElementById('prompts-table-body');
    if (!tableBody) return;
    
    const contextFilter = document.getElementById('prompt-context-filter')?.value;
    const filteredEvents = contextFilter ? 
      promptEvents.filter(e => e.data.context === contextFilter) : 
      promptEvents;
    
    const recentEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);
    
    tableBody.innerHTML = recentEvents.length ? recentEvents.map(event => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${new Date(event.timestamp).toLocaleString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm font-medium">${this.getContextLabel(event.data.context)}</span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-900 max-w-md">
          <div class="truncate" title="${event.data.prompt}">
            ${event.data.prompt}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getQualityBadge(event.data.responseQuality)}">
            ${event.data.responseQuality || 'Unknown'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-blue-600 hover:text-blue-900" onclick="adminInterface.viewPromptDetails('${event.id}')">
            View
          </button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="px-6 py-4 text-sm text-gray-500 text-center">No prompts found</td></tr>';
  }

  filterPromptsTable() {
    const timeFilter = document.getElementById('stats-time-period').value;
    const events = this.getAnalyticsEvents(timeFilter);
    const promptEvents = events.filter(e => e.type === 'prompt_submission');
    this.updatePromptsTable(promptEvents);
  }

  async analyzeContentGaps() {
    const button = document.getElementById('analyze-content-gaps');
    const originalText = button.textContent;
    
    try {
      button.disabled = true;
      button.textContent = 'Analyzing...';
      
      const timeFilter = document.getElementById('stats-time-period').value;
      const events = this.getAnalyticsEvents(timeFilter);
      const promptEvents = events.filter(e => e.type === 'prompt_submission');
      
      if (promptEvents.length === 0) {
        document.getElementById('content-gap-analysis').innerHTML = 
          '<p class="text-sm text-red-700">No prompt data available for analysis.</p>';
        return;
      }

      // Group prompts by response quality to identify weak responses
      const weakResponses = promptEvents.filter(e => e.data.responseQuality === 'weak');
      const moderateResponses = promptEvents.filter(e => e.data.responseQuality === 'moderate');
      
      // Analyze keywords from weak responses
      const gapKeywords = {};
      [...weakResponses, ...moderateResponses].forEach(event => {
        if (event.data.keywords) {
          event.data.keywords.forEach(keyword => {
            gapKeywords[keyword] = (gapKeywords[keyword] || 0) + 1;
          });
        }
      });
      
      const topGapKeywords = Object.entries(gapKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      // Use AI to analyze content gaps if API key is available
      const apiKey = localStorage.getItem('claude_api_key');
      if (apiKey && window.aiService) {
        const prompt = this.buildContentGapAnalysisPrompt(promptEvents, weakResponses);
        const response = await window.aiService.generateResponse(prompt);
        
        document.getElementById('content-gap-analysis').innerHTML = `
          <div class="space-y-3">
            <div class="bg-white p-3 rounded border">
              <h4 class="font-medium text-red-900 mb-2">AI Analysis Results</h4>
              <div class="text-sm text-red-800 whitespace-pre-wrap">${response}</div>
            </div>
            <div class="bg-white p-3 rounded border">
              <h4 class="font-medium text-red-900 mb-2">Keywords Needing Attention</h4>
              <div class="flex flex-wrap gap-1">
                ${topGapKeywords.map(([keyword, count]) => `
                  <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">${keyword} (${count})</span>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } else {
        // Fallback analysis without AI
        const contextGaps = {};
        weakResponses.forEach(event => {
          contextGaps[event.data.context] = (contextGaps[event.data.context] || 0) + 1;
        });
        
        document.getElementById('content-gap-analysis').innerHTML = `
          <div class="space-y-3">
            <div class="bg-white p-3 rounded border">
              <h4 class="font-medium text-red-900 mb-2">Content Gaps Identified</h4>
              <p class="text-sm text-red-800">Found ${weakResponses.length} weak responses and ${moderateResponses.length} moderate responses that suggest content gaps.</p>
            </div>
            <div class="bg-white p-3 rounded border">
              <h4 class="font-medium text-red-900 mb-2">Context Areas Needing Improvement</h4>
              <div class="space-y-1">
                ${Object.entries(contextGaps).map(([context, count]) => `
                  <div class="flex justify-between text-sm">
                    <span>${this.getContextLabel(context)}</span>
                    <span class="font-medium">${count} weak responses</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="bg-white p-3 rounded border">
              <h4 class="font-medium text-red-900 mb-2">Top Keywords Needing Content</h4>
              <div class="flex flex-wrap gap-1">
                ${topGapKeywords.map(([keyword, count]) => `
                  <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">${keyword} (${count})</span>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }
      
      this.showNotification('Content gap analysis completed!', 'success');
    } catch (error) {
      console.error('Content gap analysis failed:', error);
      this.showNotification('Content gap analysis failed. Please check your API key.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  buildContentGapAnalysisPrompt(promptEvents, weakResponses) {
    const contexts = [...new Set(weakResponses.map(e => e.data.context))];
    const keywords = {};
    weakResponses.forEach(event => {
      if (event.data.keywords) {
        event.data.keywords.forEach(keyword => {
          keywords[keyword] = (keywords[keyword] || 0) + 1;
        });
      }
    });
    
    const topKeywords = Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword]) => keyword);

    return `You are a UiPath sales content strategist. Analyze user prompt data to identify content gaps.

PROMPT ANALYTICS DATA:
- Total prompts: ${promptEvents.length}
- Weak responses: ${weakResponses.length} 
- Contexts with weak responses: ${contexts.join(', ')}
- Top keywords from weak responses: ${topKeywords.join(', ')}

SAMPLE WEAK RESPONSE PROMPTS:
${weakResponses.slice(0, 5).map(e => `- [${e.data.context}]: ${e.data.prompt}`).join('\n')}

Please provide:
1. CONTENT GAPS: Identify specific missing content types needed
2. PRIORITY AREAS: Which contexts (competitive/company/objection/discovery) need most attention
3. SUGGESTED CONTENT: Specific resources, use cases, or materials to create
4. KEYWORDS TO TARGET: Key terms that need better coverage

Format your response in clear sections with actionable recommendations for the content team.`;
  }

  async generateContentRecommendations() {
    const button = document.getElementById('generate-recommendations');
    const originalText = button.textContent;
    
    try {
      button.disabled = true;
      button.textContent = 'Generating...';
      
      const timeFilter = document.getElementById('stats-time-period').value;
      const events = this.getAnalyticsEvents(timeFilter);
      const promptEvents = events.filter(e => e.type === 'prompt_submission');
      
      if (promptEvents.length === 0) {
        document.getElementById('content-recommendations').innerHTML = 
          '<p class="text-sm text-blue-700">No prompt data available for recommendations.</p>';
        return;
      }

      const apiKey = localStorage.getItem('claude_api_key');
      if (!apiKey || !window.aiService) {
        this.showNotification('Please configure your Claude API key in API Settings first.', 'error');
        return;
      }

      const prompt = this.buildContentRecommendationPrompt(promptEvents);
      const response = await window.aiService.generateResponse(prompt);
      
      document.getElementById('content-recommendations').innerHTML = `
        <div class="bg-white p-4 rounded border">
          <h4 class="font-medium text-blue-900 mb-3">AI Content Recommendations</h4>
          <div class="text-sm text-blue-800 whitespace-pre-wrap">${response}</div>
        </div>
      `;
      
      this.showNotification('Content recommendations generated successfully!', 'success');
    } catch (error) {
      console.error('Content recommendations failed:', error);
      this.showNotification('Failed to generate recommendations. Please check your API key.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  buildContentRecommendationPrompt(promptEvents) {
    const contextCounts = {};
    const allKeywords = {};
    const qualityCounts = { weak: 0, moderate: 0, strong: 0 };
    
    promptEvents.forEach(event => {
      contextCounts[event.data.context] = (contextCounts[event.data.context] || 0) + 1;
      qualityCounts[event.data.responseQuality] = (qualityCounts[event.data.responseQuality] || 0) + 1;
      
      if (event.data.keywords) {
        event.data.keywords.forEach(keyword => {
          allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
        });
      }
    });
    
    const topKeywords = Object.entries(allKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 25)
      .map(([keyword]) => keyword);

    return `You are a UiPath sales enablement expert. Based on user prompt analytics, suggest new content to create.

ANALYTICS SUMMARY:
- Total prompts: ${promptEvents.length}
- Context distribution: ${Object.entries(contextCounts).map(([k,v]) => `${k}: ${v}`).join(', ')}
- Response quality: Strong: ${qualityCounts.strong}, Moderate: ${qualityCounts.moderate}, Weak: ${qualityCounts.weak}
- Top keywords: ${topKeywords.join(', ')}

SAMPLE RECENT PROMPTS:
${promptEvents.slice(0, 8).map(e => `- [${e.data.context}] ${e.data.prompt}`).join('\n')}

Based on this data, recommend:

**HIGH PRIORITY CONTENT:**
1. [List 3-5 specific pieces of content to create]

**RESOURCE TYPES TO DEVELOP:**
2. [Suggest specific resource types: demos, case studies, battlecards, etc.]

**USE CASES TO HIGHLIGHT:**
3. [Recommend use cases based on keyword patterns]

**PERSONA-SPECIFIC CONTENT:**
4. [Suggest content for specific buyer personas]

**COMPETITIVE POSITIONING:**
5. [If competitive prompts are high, suggest competitive content]

Make recommendations specific to UiPath automation solutions and enterprise sales scenarios. Focus on actionable content that can be created by the sales enablement team.`;
  }

  exportPromptData() {
    const timeFilter = document.getElementById('stats-time-period').value;
    const contextFilter = document.getElementById('prompt-context-filter').value;
    const events = this.getAnalyticsEvents(timeFilter);
    let promptEvents = events.filter(e => e.type === 'prompt_submission');
    
    if (contextFilter) {
      promptEvents = promptEvents.filter(e => e.data.context === contextFilter);
    }
    
    const exportData = {
      exportDate: new Date().toISOString(),
      timeFilter: timeFilter,
      contextFilter: contextFilter || 'all',
      totalPrompts: promptEvents.length,
      prompts: promptEvents.map(event => ({
        timestamp: event.timestamp,
        context: event.data.context,
        prompt: event.data.prompt,
        responseQuality: event.data.responseQuality,
        responseLength: event.data.responseLength,
        keywords: event.data.keywords
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-analysis-${timeFilter}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Prompt data exported successfully!', 'success');
  }

  viewPromptDetails(eventId) {
    const events = JSON.parse(localStorage.getItem('site_analytics_events') || '[]');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      this.showNotification('Prompt details not found', 'error');
      return;
    }
    
    // Create a simple modal to show prompt details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Prompt Details</h3>
            <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">✕</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Context</label>
              <span class="text-sm">${this.getContextLabel(event.data.context)}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Timestamp</label>
              <span class="text-sm">${new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Prompt</label>
              <div class="text-sm bg-gray-50 p-3 rounded border">${event.data.prompt}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Response Quality</label>
              <span class="px-2 py-1 text-xs rounded ${this.getQualityBadge(event.data.responseQuality)}">${event.data.responseQuality || 'Unknown'}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Keywords</label>
              <div class="flex flex-wrap gap-1 mt-1">
                ${(event.data.keywords || []).map(keyword => `
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${keyword}</span>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Response Length</label>
              <span class="text-sm">${event.data.responseLength || 0} characters</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Expose analytics globally for use by other components
   */
  exposeAnalyticsGlobally() {
    if (window.siteAnalytics) {
      // Analytics already initialized, just ensure trackPrompt method exists
      if (!window.siteAnalytics.trackPrompt) {
        window.siteAnalytics.trackPrompt = (context, prompt, response, responseQuality, additionalData = {}) => {
          const eventId = 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          const event = {
            id: eventId,
            timestamp: new Date().toISOString(),
            type: 'prompt_submission',
            data: {
              context: context,
              prompt: prompt,
              response: response,
              responseQuality: responseQuality,
              ...additionalData
            }
          };
          
          // Store the event
          const events = JSON.parse(localStorage.getItem('site_analytics_events') || '[]');
          events.push(event);
          
          // Keep only last 1000 events to prevent localStorage overflow
          if (events.length > 1000) {
            events.splice(0, events.length - 1000);
          }
          
          localStorage.setItem('site_analytics_events', JSON.stringify(events));
        };
      }
    }
  }

  // PDF Extraction Methods
  initializePDFExtraction() {
    const uploadArea = document.getElementById('pdf-upload-area');
    const fileInput = document.getElementById('pdf-file-input');
    const acceptBtn = document.getElementById('accept-extraction');
    const editBtn = document.getElementById('edit-extraction');
    const retryBtn = document.getElementById('retry-extraction');

    // Upload area click handler
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('border-orange-400', 'bg-orange-50');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-orange-400', 'bg-orange-50');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-orange-400', 'bg-orange-50');
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === 'application/pdf') {
        this.processPDFFile(files[0]);
      } else {
        this.showNotification('Please upload a PDF file', 'error');
      }
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.processPDFFile(e.target.files[0]);
      }
    });

    // Extraction result buttons
    acceptBtn.addEventListener('click', () => {
      this.acceptExtraction();
    });

    editBtn.addEventListener('click', () => {
      this.editExtraction();
    });

    retryBtn.addEventListener('click', () => {
      this.retryExtraction();
    });

    // Initialize AI status
    this.checkAIStatus();
  }

  async processPDFFile(file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.showNotification('File too large. Please upload a PDF under 10MB.', 'error');
      return;
    }

    try {
      this.showExtractionLoading(true);
      this.updateExtractionStatus('Reading PDF...');

      // Convert PDF to base64
      const base64 = await this.convertPDFToBase64(file);
      
      this.updateExtractionStatus('Extracting content with AI...');
      
      // Extract content using Claude API
      const extractedData = await this.extractContentFromPDF(base64, file.name);
      
      // Display results
      this.displayExtractionResults(extractedData);
      
      this.showExtractionLoading(false);
      this.updateExtractionStatus('Extraction completed');

    } catch (error) {
      console.error('PDF processing error:', error);
      this.showNotification(`Failed to process PDF: ${error.message}`, 'error');
      this.showExtractionLoading(false);
      this.updateExtractionStatus('');
    }
  }

  async convertPDFToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  async extractContentFromPDF(base64PDF, filename) {
    // Check if we have AI service available
    let aiService = null;
    
    // Try to use the modern AI service first
    if (typeof window.aiService !== 'undefined') {
      aiService = window.aiService;
    } else if (typeof aiIntegration !== 'undefined') {
      aiService = aiIntegration;
    } else {
      throw new Error('AI service not available. Please ensure Claude API is configured.');
    }

    const extractionType = document.querySelector('input[name="extraction-type"]:checked').value;
    const autoTag = document.getElementById('auto-tag').checked;

    const prompt = this.buildExtractionPrompt(extractionType, autoTag, filename);

    try {
      let response;
      
      // For Claude API, we need to send the PDF as a message with media
      if (aiService.generateResponse) {
        // Construct message with PDF attachment for Claude
        const apiKey = aiService.getApiKey ? aiService.getApiKey() : (aiIntegration?.config?.apiKeys?.claude);
        
        if (!apiKey) {
          throw new Error('Claude API key not configured. Please set up your API key.');
        }

        // Use Claude's Messages API directly with PDF support
        response = await this.callClaudeWithPDF(prompt, base64PDF, apiKey);
      } else {
        throw new Error('No compatible AI service found for PDF processing');
      }

      return this.parseExtractionResponse(response, extractionType);
    } catch (error) {
      console.error('AI extraction error:', error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  async callClaudeWithPDF(prompt, base64PDF, apiKey) {
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    
    const payload = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64PDF
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        // Fallback to legacy AI integration with proxy
        if (typeof aiIntegration !== 'undefined') {
          return await aiIntegration.generateResponse(prompt + '\n\nNote: PDF content analysis may be limited due to API constraints.');
        }
      }
      throw error;
    }
  }

  buildExtractionPrompt(extractionType, autoTag, filename) {
    let basePrompt = `You are an expert content analyst helping to extract structured information from a PDF document for a UiPath Sales Guide admin system.

Document filename: "${filename}"
Extraction type: ${extractionType === 'resource' ? 'Key Resource' : 'Use Case'}
Auto-generate tags: ${autoTag ? 'Yes' : 'No'}

Please analyze the PDF content and extract the following information in JSON format:

{
  "title": "Clear, descriptive title (max 100 chars)",
  "category": "${extractionType === 'resource' ? 'Category like: Playbook, Calculator, Template, Guide, etc.' : 'Category like: RPA, IDP, Agentic, etc.'}",
  "description": "Brief description (2-3 sentences)",
  "keyPoints": "${extractionType === 'resource' ? 'Key features, benefits, or contents as bullet points' : 'Process steps, automation opportunities, or implementation highlights as bullet points'}",`;

    if (autoTag) {
      basePrompt += `
  "tags": ["relevant", "automation", "keywords", "from", "content"],`;
    } else {
      basePrompt += `
  "tags": [],`;
    }

    basePrompt += `
  "suggestedLOB": "finance|hr|it|operations|sales|legal|procurement|all",
  "complexity": "${extractionType === 'resource' ? 'basic|intermediate|advanced' : 'low|medium|high'}",
  "timeToValue": "${extractionType === 'resource' ? 'immediate|short-term|long-term' : 'weeks|months|quarters'}"
}

Focus on extracting information that would be useful for UiPath sales representatives. Be concise but comprehensive.

IMPORTANT: Return ONLY the JSON object, no additional text or formatting.`;

    return basePrompt;
  }

  parseExtractionResponse(response, extractionType) {
    try {
      // Clean up the response and extract JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\n?|\n?```/g, '');
      
      // Try to find JSON object in response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanResponse);
      
      // Validate required fields
      if (!parsed.title || !parsed.description) {
        throw new Error('Missing required fields in AI response');
      }

      return {
        title: parsed.title || 'Extracted Content',
        category: parsed.category || (extractionType === 'resource' ? 'Document' : 'RPA'),
        description: parsed.description || 'Content extracted from PDF',
        keyPoints: parsed.keyPoints || 'No key points extracted',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        suggestedLOB: parsed.suggestedLOB || '',
        complexity: parsed.complexity || (extractionType === 'resource' ? 'intermediate' : 'medium'),
        timeToValue: parsed.timeToValue || (extractionType === 'resource' ? 'short-term' : 'months')
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Return fallback data
      return {
        title: 'Extracted PDF Content',
        category: extractionType === 'resource' ? 'Document' : 'RPA',
        description: 'Content extracted from uploaded PDF. Please review and edit as needed.',
        keyPoints: 'Please review the original PDF and add key points manually.',
        tags: ['pdf-extracted'],
        suggestedLOB: '',
        complexity: extractionType === 'resource' ? 'intermediate' : 'medium',
        timeToValue: extractionType === 'resource' ? 'short-term' : 'months'
      };
    }
  }

  displayExtractionResults(data) {
    // Populate form fields
    document.getElementById('extracted-title').value = data.title;
    document.getElementById('extracted-category').value = data.category;
    document.getElementById('extracted-description').value = data.description;
    document.getElementById('extracted-key-points').value = data.keyPoints;
    document.getElementById('extracted-lob').value = data.suggestedLOB;

    // Display tags
    const tagsDisplay = document.getElementById('extracted-tags-display');
    tagsDisplay.innerHTML = '';
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        const tagChip = document.createElement('span');
        tagChip.className = 'tag-chip tag-chip-primary';
        tagChip.dataset.tag = tag;
        tagChip.innerHTML = `${tag} <button type="button" class="tag-remove-btn" onclick="this.parentElement.remove()">×</button>`;
        tagsDisplay.appendChild(tagChip);
      });
    } else {
      tagsDisplay.innerHTML = '<span class="text-gray-500 text-sm">No tags extracted</span>';
    }

    // Store extraction data for later use
    this.currentExtraction = data;

    // Show results section
    document.getElementById('extraction-results').classList.remove('hidden');
  }

  acceptExtraction() {
    if (!this.currentExtraction) return;

    const extractionType = document.querySelector('input[name="extraction-type"]:checked').value;
    
    if (extractionType === 'resource') {
      this.saveExtractedAsResource();
    } else {
      this.saveExtractedAsUseCase();
    }
  }

  editExtraction() {
    // Make fields editable
    const fields = ['extracted-title', 'extracted-category', 'extracted-description', 'extracted-key-points'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      field.readOnly = false;
      field.classList.add('bg-white');
    });

    // Update button visibility
    document.getElementById('edit-extraction').textContent = '💾 Save Edits';
    document.getElementById('edit-extraction').onclick = () => this.saveEdits();
  }

  saveEdits() {
    // Update current extraction with edited values
    this.currentExtraction.title = document.getElementById('extracted-title').value;
    this.currentExtraction.category = document.getElementById('extracted-category').value;
    this.currentExtraction.description = document.getElementById('extracted-description').value;
    this.currentExtraction.keyPoints = document.getElementById('extracted-key-points').value;
    this.currentExtraction.suggestedLOB = document.getElementById('extracted-lob').value;

    // Make fields readonly again
    const fields = ['extracted-title', 'extracted-category', 'extracted-description', 'extracted-key-points'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      field.readOnly = true;
      field.classList.remove('bg-white');
    });

    // Restore button
    document.getElementById('edit-extraction').textContent = '✏️ Edit Before Save';
    document.getElementById('edit-extraction').onclick = () => this.editExtraction();

    this.showNotification('Edits saved. You can now accept the extraction.', 'success');
  }

  retryExtraction() {
    document.getElementById('extraction-results').classList.add('hidden');
    this.currentExtraction = null;
    this.updateExtractionStatus('Ready for new extraction');
  }

  async saveExtractedAsResource() {
    const newResource = {
      id: `resource-${Date.now()}`,
      title: this.currentExtraction.title,
      description: this.currentExtraction.description,
      type: this.currentExtraction.category.toLowerCase(),
      complexity: this.currentExtraction.complexity,
      timeToValue: this.currentExtraction.timeToValue,
      lob: [this.currentExtraction.suggestedLOB || 'all'],
      link: '', // PDF was not stored, just extracted
      tags: {
        primary: this.currentExtraction.tags || [],
        secondary: [],
        use_cases: [],
        outcomes: []
      },
      lastModified: new Date().toISOString()
    };

    this.resources.push(newResource);
    this.unsavedChanges = true;
    this.renderResourcesList();
    this.showNotification('Resource created successfully from PDF extraction!', 'success');
    
    // Switch to resources section
    this.switchSection('resources');
    this.retryExtraction();
  }

  async saveExtractedAsUseCase() {
    const newUseCase = {
      id: `use-case-${Date.now()}`,
      name: this.currentExtraction.title,
      description: this.currentExtraction.description,
      category: this.currentExtraction.category,
      complexity: this.currentExtraction.complexity,
      timeToValue: this.currentExtraction.timeToValue,
      lob: [this.currentExtraction.suggestedLOB || 'all'],
      process: this.currentExtraction.keyPoints,
      link: '', // PDF was not stored, just extracted
      tags: {
        primary: this.currentExtraction.tags || [],
        secondary: [],
        outcomes: [],
        pain_points: []
      },
      lastModified: new Date().toISOString()
    };

    this.useCases.push(newUseCase);
    this.unsavedChanges = true;
    this.renderUseCasesList();
    this.showNotification('Use Case created successfully from PDF extraction!', 'success');
    
    // Switch to use cases section
    this.switchSection('use-cases');
    this.retryExtraction();
  }

  showExtractionLoading(show) {
    const loadingDiv = document.getElementById('extraction-loading');
    const resultsDiv = document.getElementById('extraction-results');
    
    if (show) {
      loadingDiv.classList.remove('hidden');
      resultsDiv.classList.add('hidden');
    } else {
      loadingDiv.classList.add('hidden');
    }
  }

  updateExtractionStatus(status) {
    document.getElementById('extraction-status').textContent = status;
  }

  async checkAIStatus() {
    const indicator = document.getElementById('ai-status-indicator');
    const statusText = indicator.nextElementSibling;

    try {
      // Check if AI service is available and configured
      let hasAI = false;
      
      if (typeof window.aiService !== 'undefined') {
        hasAI = true;
      } else if (typeof aiIntegration !== 'undefined') {
        hasAI = true;
      }

      if (hasAI) {
        indicator.className = 'w-2 h-2 bg-green-500 rounded-full';
        statusText.textContent = 'AI Ready';
      } else {
        indicator.className = 'w-2 h-2 bg-red-500 rounded-full';
        statusText.textContent = 'AI Not Available';
      }
    } catch (error) {
      indicator.className = 'w-2 h-2 bg-yellow-500 rounded-full';
      statusText.textContent = 'AI Status Unknown';
    }
  }
}

// Initialize admin interface when page loads
let adminInterface;
document.addEventListener('DOMContentLoaded', () => {
  adminInterface = new AdminInterface();
});