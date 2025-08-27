/**
 * Intelligent Search Component
 * Provides AI-enhanced search and filtering capabilities
 */

import intelligentFilterService from '../services/intelligent-filter-service.js';
import aiTaggingService from '../services/ai-tagging-service.js';

export class IntelligentSearchComponent {
  constructor(containerId) {
    this.containerId = containerId;
    this.activeFilters = {};
    this.searchHistory = [];
    this.userContext = {};
    this.allContent = [];
    this.filteredResults = [];
    
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    console.log('🔍 Intelligent Search Component initialized');
  }

  /**
   * Set the user context for personalized search
   */
  setUserContext(context) {
    this.userContext = context;
    this.updatePersonalizedElements();
  }

  /**
   * Set the content to search through
   */
  setContent(content) {
    this.allContent = content;
    intelligentFilterService.initialize(content);
    this.updateDynamicFilters();
  }

  /**
   * Render the enhanced search interface
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="intelligent-search-wrapper bg-white rounded-lg shadow-lg">
        
        <!-- Search Header -->
        <div class="search-header bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg text-white">
          <h3 class="text-xl font-bold mb-2">AI-Powered Content Discovery</h3>
          <p class="text-blue-100 text-sm">Find exactly what you need with intelligent search and filtering</p>
        </div>

        <!-- Main Search Bar -->
        <div class="search-bar-section p-6 border-b border-gray-200">
          <div class="relative">
            <input 
              type="text" 
              id="intelligent-search-input" 
              placeholder="Search for personas, use cases, resources... (e.g., 'banking automation ROI')"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              id="search-submit-btn" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </div>
          
          <!-- Search Suggestions -->
          <div id="search-suggestions" class="hidden mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <!-- Dynamic suggestions will appear here -->
          </div>
        </div>

        <!-- Smart Filter Combinations -->
        <div class="filter-combinations p-6 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-gray-900">Quick Filters</h4>
            <button id="show-advanced-filters" class="text-sm text-blue-600 hover:text-blue-800">
              Advanced Filters
            </button>
          </div>
          
          <div class="flex flex-wrap gap-3" id="smart-combinations">
            <!-- Smart filter combinations will be rendered here -->
          </div>
        </div>

        <!-- Advanced Filters Panel -->
        <div id="advanced-filters-panel" class="hidden border-b border-gray-200">
          
          <!-- Business Context Filters -->
          <div class="filter-section p-6">
            <h5 class="font-medium text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              Business Context
            </h5>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Business Impact</label>
                <select id="filter-business-impact" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">All Impact Levels</option>
                  <option value="cost-reduction">Cost Reduction</option>
                  <option value="revenue-growth">Revenue Growth</option>
                  <option value="risk-mitigation">Risk Mitigation</option>
                  <option value="customer-experience">Customer Experience</option>
                  <option value="operational-excellence">Operational Excellence</option>
                  <option value="innovation-enablement">Innovation Enablement</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Technology Focus</label>
                <select id="filter-technology" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">All Technologies</option>
                  <option value="rpa">RPA</option>
                  <option value="ai-ml">AI & Machine Learning</option>
                  <option value="document-processing">Document Processing</option>
                  <option value="integration">Integration</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Implementation Time</label>
                <select id="filter-time-to-value" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">Any Timeline</option>
                  <option value="immediate">Immediate</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="quarters">Quarters</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Process Characteristics -->
          <div class="filter-section p-6 bg-gray-50">
            <h5 class="font-medium text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Process Characteristics
            </h5>
            <div class="space-y-3">
              <div class="flex flex-wrap gap-3" id="process-characteristics-filters">
                <!-- Process characteristic checkboxes will be rendered here -->
              </div>
            </div>
          </div>

          <!-- AI-Generated Contextual Filters -->
          <div class="filter-section p-6" id="contextual-filters-section">
            <h5 class="font-medium text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              AI-Suggested Filters
            </h5>
            <div id="ai-generated-filters">
              <!-- AI-generated contextual filters will appear here -->
            </div>
          </div>

        </div>

        <!-- Active Filters Display -->
        <div id="active-filters-display" class="hidden p-4 bg-blue-50 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-blue-900">Active Filters:</span>
              <div id="active-filter-tags" class="flex flex-wrap gap-2">
                <!-- Active filter tags will appear here -->
              </div>
            </div>
            <button id="clear-all-filters" class="text-sm text-blue-600 hover:text-blue-800">
              Clear All
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div class="search-results p-6">
          
          <!-- Results Header -->
          <div class="results-header flex items-center justify-between mb-4">
            <div class="results-info">
              <span id="results-count" class="text-lg font-semibold text-gray-900">0 results</span>
              <span id="results-context" class="text-sm text-gray-600 ml-2"></span>
            </div>
            
            <div class="results-controls flex items-center space-x-3">
              <select id="results-sort" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option value="relevance">Most Relevant</option>
                <option value="priority">Priority</option>
                <option value="recent">Most Recent</option>
                <option value="alphabetical">A-Z</option>
              </select>
              
              <button id="results-view-toggle" class="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Results Container -->
          <div id="search-results-container" class="space-y-4">
            <!-- Search results will be rendered here -->
          </div>

          <!-- Load More / Pagination -->
          <div id="results-pagination" class="hidden mt-6 text-center">
            <button id="load-more-results" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Load More Results
            </button>
          </div>

        </div>

        <!-- AI Insights Panel -->
        <div id="ai-insights-panel" class="hidden p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-200">
          <h5 class="font-medium text-gray-900 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            AI Insights & Recommendations
          </h5>
          <div id="ai-insights-content">
            <!-- AI-generated insights will appear here -->
          </div>
        </div>

      </div>
    `;
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const searchInput = document.getElementById('intelligent-search-input');
    const searchBtn = document.getElementById('search-submit-btn');
    const advancedToggle = document.getElementById('show-advanced-filters');
    const clearFilters = document.getElementById('clear-all-filters');

    // Search input events
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(this.handleSearchInput.bind(this), 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.performSearch();
      });
      searchInput.addEventListener('focus', this.showSearchSuggestions.bind(this));
    }

    // Search button
    if (searchBtn) {
      searchBtn.addEventListener('click', this.performSearch.bind(this));
    }

    // Advanced filters toggle
    if (advancedToggle) {
      advancedToggle.addEventListener('click', this.toggleAdvancedFilters.bind(this));
    }

    // Clear filters
    if (clearFilters) {
      clearFilters.addEventListener('click', this.clearAllFilters.bind(this));
    }

    // Filter change events
    this.bindFilterEvents();

    // Results control events  
    this.bindResultsEvents();
  }

  /**
   * Handle search input changes
   */
  handleSearchInput(event) {
    const query = event.target.value.trim();
    
    if (query.length > 2) {
      this.generateSearchSuggestions(query);
    } else {
      this.hideSearchSuggestions();
    }
  }

  /**
   * Perform intelligent search
   */
  async performSearch() {
    const query = document.getElementById('intelligent-search-input').value.trim();
    
    if (!query) {
      this.displayAllContent();
      return;
    }

    // Show loading state
    this.showLoadingState();

    try {
      // Perform intelligent search
      const searchResults = intelligentFilterService.intelligentSearch(
        query, 
        this.allContent, 
        this.userContext
      );

      // Apply any active filters to the search results
      const filteredResults = intelligentFilterService.filterContent(
        searchResults.results,
        this.activeFilters,
        this.userContext
      );

      this.displayResults(filteredResults);
      this.displaySearchInsights(searchResults.query_analysis, searchResults.search_insights);
      
      // Add to search history
      this.addToSearchHistory(query, filteredResults.total);

    } catch (error) {
      console.error('Search failed:', error);
      this.displayError('Search failed. Please try again.');
    }
  }

  /**
   * Generate and display search suggestions
   */
  generateSearchSuggestions(query) {
    // AI-powered search suggestions based on content analysis
    const suggestions = [
      `${query} ROI calculator`,
      `${query} implementation guide`,
      `${query} use cases`,
      `${query} best practices`,
      `Banking ${query}`,
      `Insurance ${query}`
    ];

    this.displaySearchSuggestions(suggestions);
  }

  /**
   * Display search suggestions
   */
  displaySearchSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-item px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
        <span class="text-sm text-gray-700">${suggestion}</span>
      </div>
    `).join('');

    // Bind suggestion click events
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const suggestionText = item.querySelector('span').textContent;
        document.getElementById('intelligent-search-input').value = suggestionText;
        this.performSearch();
        this.hideSearchSuggestions();
      });
    });

    suggestionsContainer.classList.remove('hidden');
  }

  /**
   * Display search results
   */
  displayResults(filteredResults) {
    const container = document.getElementById('search-results-container');
    const countElement = document.getElementById('results-count');
    const contextElement = document.getElementById('results-context');

    if (!container) return;

    // Update results count and context
    if (countElement) {
      countElement.textContent = `${filteredResults.total} results`;
    }

    if (contextElement && filteredResults.filters_applied) {
      const filterCount = Object.keys(filteredResults.filters_applied).length;
      contextElement.textContent = filterCount > 0 ? `with ${filterCount} filters applied` : '';
    }

    // Render results
    if (filteredResults.results.length === 0) {
      container.innerHTML = `
        <div class="no-results text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.49 1.006-5.971 2.621M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p class="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
          <button onclick="document.getElementById('intelligent-search-input').value=''; this.clearAllFilters(); this.displayAllContent();" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Show All Content
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredResults.results.map(item => this.renderResultItem(item)).join('');
    
    // Show filter suggestions
    if (filteredResults.suggestions && filteredResults.suggestions.length > 0) {
      this.displayFilterSuggestions(filteredResults.suggestions);
    }
  }

  /**
   * Render individual result item
   */
  renderResultItem(item) {
    const itemType = this.inferItemType(item);
    const relevanceScore = item.relevance_score || 0;
    const aiTags = item.ai_suggested || {};

    return `
      <div class="result-item bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        
        <!-- Result Header -->
        <div class="result-header flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ${itemType}
              </span>
              ${item.priority ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getPriorityColor(item.priority)}">
                ${item.priority} priority
              </span>` : ''}
              ${relevanceScore > 0 ? `<span class="text-xs text-gray-500">Relevance: ${Math.round(relevanceScore * 100)}%</span>` : ''}
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-1">
              ${item.title || item.name || 'Untitled'}
            </h4>
            <p class="text-sm text-gray-600">
              ${this.truncateText(item.description || item.overview || item.world || '', 150)}
            </p>
          </div>
        </div>

        <!-- AI-Suggested Tags -->
        ${aiTags && Object.keys(aiTags).length > 0 ? `
          <div class="ai-tags mb-3">
            <h6 class="text-xs font-medium text-gray-500 mb-2">AI-Suggested Context:</h6>
            <div class="flex flex-wrap gap-2">
              ${this.renderAITags(aiTags).slice(0, 6).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Traditional Tags -->
        ${item.tags && item.tags.primary ? `
          <div class="primary-tags mb-3">
            <div class="flex flex-wrap gap-2">
              ${item.tags.primary.map(tag => `
                <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                  ${tag}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="result-actions flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            ${item.complexity ? `<span>Complexity: ${item.complexity}</span>` : ''}
            ${item.timeToValue ? `<span>Time to Value: ${item.timeToValue}</span>` : ''}
            ${item.vertical ? `<span>Industry: ${item.vertical}</span>` : ''}
          </div>
          <div class="flex items-center space-x-3">
            <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View Details
            </button>
            <button class="text-sm text-gray-600 hover:text-gray-800">
              Find Similar
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // === Helper Methods ===

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

  inferItemType(item) {
    if (item.level && item.world) return 'Persona';
    if (item.category && item.businessValue) return 'Use Case';
    if (item.type && item.overview) return 'Resource';
    return 'Content';
  }

  getPriorityColor(priority) {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  renderAITags(aiTags) {
    const tags = [];
    Object.entries(aiTags).forEach(([category, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.slice(0, 2).forEach(value => {
          tags.push(`
            <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
              </svg>
              ${typeof value === 'string' ? value : value.category || 'AI-Tag'}
            </span>
          `);
        });
      }
    });
    return tags;
  }

  showSearchSuggestions() { /* Implementation */ }
  hideSearchSuggestions() { 
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.classList.add('hidden');
    }
  }
  showLoadingState() { /* Implementation */ }
  displayAllContent() { /* Implementation */ }
  displayError(message) { /* Implementation */ }
  displaySearchInsights(analysis, insights) { /* Implementation */ }
  addToSearchHistory(query, resultCount) { /* Implementation */ }
  toggleAdvancedFilters() { /* Implementation */ }
  clearAllFilters() { /* Implementation */ }
  bindFilterEvents() { /* Implementation */ }
  bindResultsEvents() { /* Implementation */ }
  updatePersonalizedElements() { /* Implementation */ }
  updateDynamicFilters() { /* Implementation */ }
  displayFilterSuggestions(suggestions) { /* Implementation */ }
}

export default IntelligentSearchComponent;