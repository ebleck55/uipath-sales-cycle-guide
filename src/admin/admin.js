/**
 * UiPath Sales Guide - Admin Interface
 * Provides content management for Resources, Use Cases, Personas, and Tags
 */

class AdminInterface {
  constructor() {
    this.contentAPI = new ContentAPI();
    this.currentSection = 'resources';
    this.resources = [];
    this.personas = [];
    this.useCases = [];
    this.tags = {};
    this.editingResourceId = null;
    this.unsavedChanges = false;

    this.initializeInterface();
    this.loadAllContent();
    this.handleImportExport();
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

    document.querySelectorAll('#resource-vertical-filter, #resource-type-filter, #resource-priority-filter').forEach(select => {
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

    // Tag creation
    document.getElementById('create-tag-btn').addEventListener('click', () => {
      this.createNewTag();
    });

    // Initialize drag and drop for tags
    this.initializeDragAndDrop();

    console.log('Admin interface initialized');
  }

  async loadAllContent() {
    try {
      // Load resources
      this.resources = await this.contentAPI.getResources();
      this.renderResourcesList();

      // Load personas
      this.personas = await this.contentAPI.getPersonas();

      // Load use cases
      this.useCases = await this.contentAPI.getUseCases();

      // Load tag metadata
      const resourcesData = await this.contentAPI.loadData('resources.json');
      const personasData = await this.contentAPI.loadData('personas.json');
      
      if (resourcesData && personasData) {
        this.tags = {
          ...resourcesData.metadata.tags,
          ...personasData.metadata.tags
        };
        this.renderTagsPools();
      }

      // Update statistics
      this.updateStatistics();

      console.log('Content loaded successfully');
    } catch (error) {
      console.error('Failed to load content:', error);
      this.showNotification('Failed to load content', 'error');
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
              ${resource.priority === 'high' ? '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">High Priority</span>' : ''}
            </div>
            <p class="text-gray-600 text-sm mb-3">${resource.overview}</p>
            <div class="flex flex-wrap gap-1 mb-2">
              ${(resource.tags?.primary || []).map(tag => `<span class="tag-item tag-primary">${tag}</span>`).join('')}
              ${(resource.tags?.secondary || []).slice(0, 3).map(tag => `<span class="tag-item tag-secondary">${tag}</span>`).join('')}
            </div>
            <div class="text-xs text-gray-500">
              LOB: ${resource.lob?.join(', ') || 'General'} • 
              Complexity: ${resource.complexity} • 
              Time to Value: ${resource.timeToValue}
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button onclick="adminInterface.editResource('${resource.id}')" 
                    class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
              ✏️ Edit
            </button>
            <button onclick="adminInterface.duplicateResource('${resource.id}')" 
                    class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
              📋 Duplicate
            </button>
            <button onclick="adminInterface.deleteResource('${resource.id}')" 
                    class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
              🗑️ Delete
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
            <button class="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
              ✏️ Edit
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
              ${useCase.priority === 'high' ? '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">High Priority</span>' : ''}
            </div>
            <p class="text-gray-600 text-sm mb-3">${useCase.description}</p>
            <div class="bg-blue-50 p-3 rounded-md mb-3">
              <p class="text-sm text-blue-800"><strong>Business Value:</strong> ${useCase.businessValue}</p>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">
              ${(useCase.tags?.primary || []).map(tag => `<span class="tag-item tag-primary">${tag}</span>`).join('')}
              ${(useCase.tags?.secondary || []).slice(0, 3).map(tag => `<span class="tag-item tag-secondary">${tag}</span>`).join('')}
            </div>
            <div class="text-xs text-gray-500">
              LOB: ${useCase.lob?.join(', ') || 'General'} • 
              Complexity: ${useCase.complexity} • 
              Time to Value: ${useCase.timeToValue} •
              ROI: ${useCase.estimatedROI || 'TBD'}
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
              ✏️ Edit
            </button>
            <button class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
              📋 Duplicate
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = useCasesHTML;
  }

  renderTagsPools() {
    // Render each tag category pool
    const categories = ['primary', 'secondary', 'pain_points', 'outcomes'];
    
    categories.forEach(category => {
      const container = document.getElementById(`${category.replace('_', '-')}-tags-pool`);
      const tags = this.tags[category] || [];
      
      container.innerHTML = tags.map(tag => `
        <span class="tag-item tag-${category.replace('_', '-')} draggable-tag mr-2 mb-2" 
              draggable="true" 
              data-tag="${tag}" 
              data-category="${category}">
          ${tag}
        </span>
      `).join('');
    });
  }

  filterResources() {
    const search = document.getElementById('resource-search').value.toLowerCase();
    const vertical = document.getElementById('resource-vertical-filter').value;
    const type = document.getElementById('resource-type-filter').value;
    const priority = document.getElementById('resource-priority-filter').value;

    const filteredResources = this.resources.filter(resource => {
      const matchesSearch = !search || 
        resource.name.toLowerCase().includes(search) ||
        resource.overview.toLowerCase().includes(search);
      
      const matchesVertical = !vertical || resource.vertical === vertical;
      const matchesType = !type || resource.type === type;
      const matchesPriority = !priority || resource.priority === priority;

      return matchesSearch && matchesVertical && matchesType && matchesPriority;
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
    document.getElementById('resource-priority').value = resource.priority || 'medium';
    document.getElementById('resource-complexity').value = resource.complexity || 'medium';
    document.getElementById('resource-overview').value = resource.overview || '';
    document.getElementById('resource-why').value = resource.why || '';

    // Load tags into the form
    this.loadTagsIntoForm(resource.tags || {});
  }

  clearResourceForm() {
    document.getElementById('resource-form').reset();
    // Clear tag areas
    document.getElementById('resource-primary-tags').innerHTML = '<p class="text-gray-400 text-sm">Drag primary tags here...</p>';
    document.getElementById('resource-secondary-tags').innerHTML = '<p class="text-gray-400 text-sm">Drag secondary tags here...</p>';
  }

  loadTagsIntoForm(tags) {
    const primaryContainer = document.getElementById('resource-primary-tags');
    const secondaryContainer = document.getElementById('resource-secondary-tags');

    primaryContainer.innerHTML = (tags.primary || []).map(tag => 
      `<span class="tag-item tag-primary mr-2 mb-2">${tag} <button type="button" onclick="this.parentElement.remove()" class="ml-1 text-red-600">×</button></span>`
    ).join('') || '<p class="text-gray-400 text-sm">Drag primary tags here...</p>';

    secondaryContainer.innerHTML = (tags.secondary || []).map(tag => 
      `<span class="tag-item tag-secondary mr-2 mb-2">${tag} <button type="button" onclick="this.parentElement.remove()" class="ml-1 text-red-600">×</button></span>`
    ).join('') || '<p class="text-gray-400 text-sm">Drag secondary tags here...</p>';
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
      priority: document.getElementById('resource-priority').value,
      complexity: document.getElementById('resource-complexity').value,
      overview: document.getElementById('resource-overview').value.trim(),
      why: document.getElementById('resource-why').value.trim(),
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
    const primaryTags = Array.from(document.querySelectorAll('#resource-primary-tags .tag-item'))
      .map(el => el.textContent.trim().replace(' ×', ''));
    
    const secondaryTags = Array.from(document.querySelectorAll('#resource-secondary-tags .tag-item'))
      .map(el => el.textContent.trim().replace(' ×', ''));

    return {
      primary: primaryTags,
      secondary: secondaryTags,
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

  createNewTag() {
    const name = document.getElementById('new-tag-name').value.trim();
    const category = document.getElementById('new-tag-category').value;
    const color = document.getElementById('new-tag-color').value;

    if (!name) {
      this.showNotification('Please enter a tag name', 'error');
      return;
    }

    // Add to tags collection
    if (!this.tags[category]) {
      this.tags[category] = [];
    }
    
    if (!this.tags[category].includes(name)) {
      this.tags[category].push(name);
      this.renderTagsPools();
      this.showNotification('Tag created successfully!', 'success');
      
      // Clear form
      document.getElementById('new-tag-name').value = '';
    } else {
      this.showNotification('Tag already exists in this category', 'error');
    }
  }

  initializeDragAndDrop() {
    // Enable drag and drop for all draggable tags
    this.setupTagDragHandlers();
    this.setupDropZones();
    console.log('Drag and drop functionality initialized');
  }

  setupTagDragHandlers() {
    // Add drag event listeners to all draggable tags
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('draggable-tag')) {
        e.dataTransfer.setData('text/plain', e.target.dataset.tag);
        e.dataTransfer.setData('category', e.target.dataset.category);
        e.target.style.opacity = '0.5';
      }
    });

    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('draggable-tag')) {
        e.target.style.opacity = '1';
      }
    });
  }

  setupDropZones() {
    // Add drop zone event listeners
    document.addEventListener('dragover', (e) => {
      if (e.target.classList.contains('drag-drop-zone')) {
        e.preventDefault();
        e.target.classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', (e) => {
      if (e.target.classList.contains('drag-drop-zone')) {
        e.target.classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', (e) => {
      if (e.target.classList.contains('drag-drop-zone')) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        
        const tagName = e.dataTransfer.getData('text/plain');
        const category = e.dataTransfer.getData('category');
        
        if (tagName && category) {
          this.addTagToDropZone(e.target, tagName, category);
        }
      }
    });
  }

  addTagToDropZone(dropZone, tagName, category) {
    // Check if tag already exists in drop zone
    const existingTags = Array.from(dropZone.querySelectorAll('.tag-item')).map(el => 
      el.textContent.trim().replace(' ×', '')
    );
    
    if (existingTags.includes(tagName)) {
      this.showNotification('Tag already added to this section', 'info');
      return;
    }

    // Remove placeholder text if present
    const placeholder = dropZone.querySelector('p.text-gray-400');
    if (placeholder) {
      placeholder.remove();
    }

    // Add the tag with remove button
    const tagElement = document.createElement('span');
    tagElement.className = `tag-item tag-${category.replace('_', '-')} mr-2 mb-2`;
    tagElement.innerHTML = `${tagName} <button type="button" onclick="this.parentElement.remove(); adminInterface.checkDropZoneEmpty()" class="ml-1 text-red-600 hover:text-red-800">×</button>`;
    
    dropZone.appendChild(tagElement);
    this.showNotification(`Tag "${tagName}" added successfully!`, 'success');
  }

  checkDropZoneEmpty() {
    // Add placeholder text back if drop zone becomes empty
    document.querySelectorAll('.drag-drop-zone').forEach(zone => {
      if (!zone.querySelector('.tag-item') && !zone.querySelector('p.text-gray-400')) {
        const placeholder = document.createElement('p');
        placeholder.className = 'text-gray-400 text-sm';
        
        if (zone.id === 'resource-primary-tags') {
          placeholder.textContent = 'Drag primary tags here...';
        } else if (zone.id === 'resource-secondary-tags') {
          placeholder.textContent = 'Drag secondary tags here...';
        } else {
          placeholder.textContent = 'Drag tags here...';
        }
        
        zone.appendChild(placeholder);
      }
    });
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
}

// Initialize admin interface when page loads
let adminInterface;
document.addEventListener('DOMContentLoaded', () => {
  adminInterface = new AdminInterface();
});