/**
 * Stage Component
 * Handles rendering and interaction of sales stages
 */

import { $, $$, createElement, safeSetHTML, addEventListener } from '../utils/dom.js';
import sanitizer from '../security/sanitizer.js';
import appState from '../stores/app-state.js';

class StageComponent {
  constructor() {
    this.bindStateListeners();
  }

  /**
   * Bind to state changes
   */
  bindStateListeners() {
    appState.subscribe('stages', (stages) => {
      this.renderAllStages(stages);
    });

    appState.subscribe('currentIndustry', () => {
      this.updateIndustryDisplay();
    });

    appState.subscribe('collapsedSections', () => {
      this.updateCollapsedSections();
    });
  }

  /**
   * Render all stages
   * @param {Array} stages - Stage data array
   */
  renderAllStages(stages) {
    stages.forEach(stage => {
      const container = $(`#${stage.id}`);
      if (container) {
        this.renderStage(stage, container);
      }
    });
  }

  /**
   * Render individual stage
   * @param {Object} stage - Stage data
   * @param {Element} container - Container element
   */
  renderStage(stage, container) {
    const stageHTML = this.createStageHTML(stage);
    safeSetHTML(container, stageHTML, 'full');
    
    // Initialize stage interactions
    this.initializeStageInteractions(stage.id);
  }

  /**
   * Create stage HTML template
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createStageHTML(stage) {
    return `
      <h2 class="section-toggle text-2xl font-bold border-b-2 border-gray-200 pb-1 mb-1 flex justify-between items-center cursor-pointer" data-stage-id="${stage.id}">
        <span>${sanitizer.escapeHtml(stage.title)}</span>
        <svg class="toggle-icon w-6 h-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
      <div class="collapsible-content hidden pt-4">
        <div class="w-full progress-bar-bg rounded-full h-2.5 mb-6">
          <div class="progress-bar h-2.5 rounded-full" style="width:0%"></div>
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
          ${this.createOutcomesSection(stage)}
          ${this.createPersonasSection(stage)}
          ${stage.uipathTeam ? this.createUiPathTeamSection(stage) : ''}
          ${this.createResourcesSection(stage)}
        </div>
        ${this.createQuestionsSection(stage)}
        ${this.createObjectionsSection(stage)}
      </div>
    `;
  }

  /**
   * Create outcomes section
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createOutcomesSection(stage) {
    return `
      <div id="${stage.id}-outcomes" class="editable-card bg-orange-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 uipath-robotic-orange flex justify-between items-center">
          <span>Verifiable Outcomes / Exit Criteria</span>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-outcomes">
            <use href="#edit-icon"></use>
          </svg>
        </h3>
        <div class="editable-content">
          ${this.createCheckboxList(stage.outcomes, stage.id, 'outcomes')}
        </div>
      </div>
    `;
  }

  /**
   * Create personas section
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createPersonasSection(stage) {
    return `
      <div id="${stage.id}-initial-personas" class="editable-card bg-green-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 uipath-robotic-orange flex justify-between items-center">
          <span>Initial Personas to Engage</span>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-initial-personas">
            <use href="#edit-icon"></use>
          </svg>
        </h3>
        <div class="editable-content">
          ${this.createSimpleList(stage.initialPersonas)}
        </div>
      </div>
    `;
  }

  /**
   * Create UiPath team section
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createUiPathTeamSection(stage) {
    return `
      <div id="${stage.id}-uipath-team" class="editable-card bg-blue-50 p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-blue-800 flex justify-between items-center">
          <span>UiPath Team</span>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-blue-600" data-target="${stage.id}-uipath-team">
            <use href="#edit-icon"></use>
          </svg>
        </h3>
        <div class="editable-content">
          ${this.createSimpleList(stage.uipathTeam)}
        </div>
      </div>
    `;
  }

  /**
   * Create resources section
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createResourcesSection(stage) {
    return `
      <div id="${stage.id}-resources" class="editable-card bg-gray-50 p-6 rounded-lg shadow mt-3">
        <h3 class="text-xl font-semibold mb-3 uipath-robotic-orange flex justify-between items-center">
          <span data-industry="banking">Key Content & Resources (Banking)</span>
          <span data-industry="insurance" class="hidden">Key Content & Resources (Insurance)</span>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-resources">
            <use href="#edit-icon"></use>
          </svg>
        </h3>
        <div class="editable-content">
          ${this.createResourcesList(stage.resources)}
        </div>
      </div>
    `;
  }

  /**
   * Create questions section
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createQuestionsSection(stage) {
    return `
      <div id="${stage.id}-questions" class="editable-card bg-gray-50 rounded-lg shadow mt-3 collapsible-section">
        <div class="collapsible-header p-4 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors">
          <div class="flex items-center space-x-3">
            <svg class="chevron-icon w-4 h-4 text-gray-600 transition-transform transform">
              <use href="#chevron-icon"></use>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800">Key Discovery Questions</h3>
          </div>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-questions">
            <use href="#edit-icon"></use>
          </svg>
        </div>
        <div class="collapsible-content hidden p-6 pt-0">
          <div class="editable-content">
            ${this.createQuestionsContent(stage.questions)}
          </div>
          ${this.createActionButtons()}
        </div>
      </div>
    `;
  }

  /**
   * Create objections section
   * @param {Object} stage - Stage data
   * @returns {string} HTML string
   */
  createObjectionsSection(stage) {
    return `
      <div id="${stage.id}-objections" class="editable-card bg-gray-50 rounded-lg shadow mt-3 collapsible-section">
        <div class="collapsible-header p-4 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors">
          <div class="flex items-center space-x-3">
            <svg class="chevron-icon w-4 h-4 text-gray-600 transition-transform transform">
              <use href="#chevron-icon"></use>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800">Common Objections & Responses</h3>
          </div>
          <svg class="edit-icon w-5 h-5 text-gray-500 hover:text-orange-600" data-target="${stage.id}-objections">
            <use href="#edit-icon"></use>
          </svg>
        </div>
        <div class="collapsible-content hidden p-6 pt-0">
          <div class="editable-content">
            ${this.createObjectionsContent(stage.objections)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create checkbox list
   * @param {Array} items - List items
   * @param {string} stageId - Stage identifier
   * @param {string} type - Item type
   * @returns {string} HTML string
   */
  createCheckboxList(items, stageId, type) {
    if (!Array.isArray(items)) return '';
    
    return `
      <ul class="space-y-3">
        ${items.map((item, index) => {
          const checkboxId = `${stageId}-${type}-${index}`;
          return `
            <li>
              <label class="flex items-center text-gray-700 cursor-pointer">
                <input type="checkbox" class="form-checkbox h-5 w-5 rounded border-gray-300 focus:ring-orange-500" data-id="${checkboxId}">
                <span class="ml-3">${sanitizer.escapeHtml(item)}</span>
              </label>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  }

  /**
   * Create simple list
   * @param {Array} items - List items
   * @returns {string} HTML string
   */
  createSimpleList(items) {
    if (!Array.isArray(items)) return '';
    
    return `
      <ul class="space-y-3">
        ${items.map(item => `<li>${sanitizer.escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  }

  /**
   * Create resources list
   * @param {Object} resources - Resources object
   * @returns {string} HTML string
   */
  createResourcesList(resources) {
    if (!resources) return '';
    
    const banking = resources.banking || [];
    const insurance = resources.insurance || [];
    
    return `
      <div data-industry="banking">
        <ul class="space-y-4">
          ${banking.map(resource => `
            <li>
              <a href="${sanitizer.sanitize(resource.link)}" class="text-blue-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                ${sanitizer.escapeHtml(resource.name)}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
      <div data-industry="insurance" class="hidden">
        <ul class="space-y-4">
          ${insurance.map(resource => `
            <li>
              <a href="${sanitizer.sanitize(resource.link)}" class="text-blue-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                ${sanitizer.escapeHtml(resource.name)}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Create questions content
   * @param {Object} questions - Questions object
   * @returns {string} HTML string
   */
  createQuestionsContent(questions) {
    if (!questions) return '';
    
    return Object.entries(questions).map(([category, categoryQuestions]) => `
      <div class="mb-6">
        <h4 class="text-lg font-medium text-gray-800 mb-3">${sanitizer.escapeHtml(category)}</h4>
        <div class="space-y-4">
          ${categoryQuestions.map((question, index) => `
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <p class="text-gray-700 mb-2">${sanitizer.escapeHtml(question)}</p>
              <textarea 
                class="note-textarea w-full mt-2 p-2 border border-gray-300 rounded-md resize-none" 
                rows="2" 
                placeholder="Notes from customer response..."
                data-note-id="${category}-${index}"
              ></textarea>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  /**
   * Create objections content
   * @param {Array} objections - Objections array
   * @returns {string} HTML string
   */
  createObjectionsContent(objections) {
    if (!Array.isArray(objections)) return '';
    
    return `
      <div class="space-y-4">
        ${objections.map((objection, index) => `
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-medium text-red-600">${sanitizer.escapeHtml(objection.objection)}</h4>
            </div>
            <p class="text-gray-700 mb-3">${sanitizer.escapeHtml(objection.response)}</p>
            <textarea 
              class="note-textarea w-full mt-2 p-2 border border-gray-300 rounded-md resize-none" 
              rows="2" 
              placeholder="Additional notes or customer-specific context..."
              data-note-id="objection-${index}"
            ></textarea>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Create action buttons
   * @returns {string} HTML string
   */
  createActionButtons() {
    return `
      <div class="flex justify-center gap-3 mt-4">
        <button class="export-notes-btn px-4 py-2 text-white rounded-md font-semibold flex items-center bg-orange-600 hover:bg-orange-700">
          <svg class="w-4 h-4 mr-2">
            <use href="#copy-icon"></use>
          </svg>
          Copy Notes
        </button>
        <button class="clear-all-btn px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold flex items-center">
          <svg class="w-4 h-4 mr-2">
            <use href="#trash-icon"></use>
          </svg>
          Clear All
        </button>
      </div>
    `;
  }

  /**
   * Initialize stage interactions
   * @param {string} stageId - Stage identifier
   */
  initializeStageInteractions(stageId) {
    // Initialize checkboxes
    this.initializeCheckboxes(stageId);
    
    // Initialize notes
    this.initializeNotes(stageId);
    
    // Initialize collapsible sections
    this.initializeCollapsibleSections(stageId);
  }

  /**
   * Initialize checkboxes for a stage
   * @param {string} stageId - Stage identifier
   */
  initializeCheckboxes(stageId) {
    const checkboxes = $$(`#${stageId} input[type="checkbox"]`);
    
    checkboxes.forEach(checkbox => {
      addEventListener(checkbox, 'change', (e) => {
        const checkboxId = e.target.dataset.id;
        const checked = e.target.checked;
        
        // Update visual state
        const label = e.target.closest('label');
        if (label) {
          label.classList.toggle('checked-item', checked);
        }
        
        // Update app state
        appState.toggleCheckbox(checkboxId, checked);
        
        // Update progress bar
        this.updateProgressBar(stageId);
      });
    });
  }

  /**
   * Initialize notes for a stage
   * @param {string} stageId - Stage identifier
   */
  initializeNotes(stageId) {
    const textareas = $$(`#${stageId} .note-textarea`);
    
    textareas.forEach(textarea => {
      addEventListener(textarea, 'input', (e) => {
        const noteId = e.target.dataset.noteId;
        const content = e.target.value;
        
        // Update app state
        appState.updateNote(noteId, content);
      });
    });
  }

  /**
   * Initialize collapsible sections
   * @param {string} stageId - Stage identifier
   */
  initializeCollapsibleSections(stageId) {
    const sections = $$(`#${stageId} .collapsible-section`);
    
    sections.forEach(section => {
      const header = section.querySelector('.collapsible-header');
      if (header) {
        addEventListener(header, 'click', (e) => {
          // Don't toggle if clicking on edit icon
          if (e.target.closest('.edit-icon')) return;
          
          this.toggleCollapsibleSection(section.id);
        });
      }
    });
  }

  /**
   * Toggle collapsible section
   * @param {string} sectionId - Section identifier
   */
  toggleCollapsibleSection(sectionId) {
    const section = $(`#${sectionId}`);
    if (!section) return;
    
    const content = section.querySelector('.collapsible-content');
    const chevron = section.querySelector('.chevron-icon');
    
    if (!content || !chevron) return;
    
    const isHidden = content.classList.contains('hidden');
    
    if (isHidden) {
      content.classList.remove('hidden');
      chevron.style.transform = 'rotate(90deg)';
      section.classList.add('expanded');
    } else {
      content.classList.add('hidden');
      chevron.style.transform = 'rotate(0deg)';
      section.classList.remove('expanded');
    }
    
    // Update app state
    appState.toggleSection(sectionId, !isHidden);
  }

  /**
   * Update progress bar for a stage
   * @param {string} stageId - Stage identifier
   */
  updateProgressBar(stageId) {
    const stage = $(`#${stageId}`);
    if (!stage) return;
    
    const checkboxes = $$(`#${stageId} input[type="checkbox"]`);
    const checkedBoxes = $$(`#${stageId} input[type="checkbox"]:checked`);
    const progressBar = stage.querySelector('.progress-bar');
    
    if (progressBar && checkboxes.length > 0) {
      const percentage = (checkedBoxes.length / checkboxes.length) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  /**
   * Update industry display
   */
  updateIndustryDisplay() {
    const currentIndustry = appState.get('currentIndustry');
    
    // Show/hide industry-specific content
    $$('[data-industry]').forEach(element => {
      const industry = element.dataset.industry;
      element.classList.toggle('hidden', industry !== currentIndustry);
    });
  }

  /**
   * Update collapsed sections
   */
  updateCollapsedSections() {
    const collapsedSections = appState.get('collapsedSections');
    
    collapsedSections.forEach(sectionId => {
      const section = $(`#${sectionId}`);
      if (section) {
        const content = section.querySelector('.collapsible-content');
        const chevron = section.querySelector('.chevron-icon');
        
        if (content) content.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        section.classList.remove('expanded');
      }
    });
  }
}

// Create singleton instance
const stageComponent = new StageComponent();

export default stageComponent;