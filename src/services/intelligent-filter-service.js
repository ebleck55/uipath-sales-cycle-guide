/**
 * Intelligent Filter Service
 * Provides AI-powered filtering and discovery capabilities
 */

import aiTaggingService from './ai-tagging-service.js';

export class IntelligentFilterService {
  constructor() {
    this.activeFilters = new Map();
    this.filterHistory = [];
    this.userPreferences = {};
    this.searchIndex = new Map();
    this.semanticIndex = new Map();
    
    this.filterDefinitions = {
      // Traditional filters enhanced with AI
      basic: {
        vertical: { type: 'select', options: ['banking', 'insurance', 'all'] },
        level: { type: 'select', options: ['c-suite', 'director', 'manager', 'all'] },
        complexity: { type: 'select', options: ['simple', 'moderate', 'complex', 'all'] },
        priority: { type: 'select', options: ['high', 'medium', 'low', 'all'] }
      },

      // AI-enhanced semantic filters
      semantic: {
        business_impact: { 
          type: 'multi-select',
          options: ['cost-reduction', 'revenue-growth', 'risk-mitigation', 'customer-experience', 'operational-excellence', 'innovation-enablement'],
          ai_enhanced: true,
          description: 'Find content by business value drivers'
        },
        technology_focus: {
          type: 'multi-select', 
          options: ['rpa', 'ai-ml', 'document-processing', 'integration', 'analytics', 'security'],
          ai_enhanced: true,
          description: 'Filter by technology capabilities'
        },
        process_characteristics: {
          type: 'multi-select',
          options: ['high-volume', 'exception-handling', 'real-time', 'cross-system', 'regulatory-sensitive', 'customer-facing'],
          ai_enhanced: true,
          description: 'Match your process requirements'
        },
        automation_maturity: {
          type: 'range',
          min: 1, max: 5,
          labels: ['Getting Started', 'Basic Automation', 'Scaling Up', 'Advanced', 'AI-First'],
          ai_enhanced: true,
          description: 'Content for your automation journey stage'
        }
      },

      // Contextual AI filters
      contextual: {
        time_to_value: {
          type: 'select',
          options: ['immediate', 'weeks', 'months', 'quarters'],
          ai_context: 'timeline_pressure',
          description: 'Based on your implementation timeline needs'
        },
        implementation_effort: {
          type: 'range',
          min: 1, max: 5,
          labels: ['Minimal', 'Light', 'Moderate', 'Significant', 'Transformational'],
          ai_context: 'resource_availability',
          description: 'Matches your available resources and capacity'
        },
        regulatory_sensitivity: {
          type: 'select',
          options: ['low', 'medium', 'high', 'critical'],
          ai_context: 'risk_tolerance',
          description: 'Compliance and risk considerations'
        }
      },

      // Dynamic AI-generated filters
      intelligent: {
        similar_to_current: {
          type: 'dynamic',
          generator: 'findSimilarContent',
          description: 'Content similar to what you\'re viewing'
        },
        trending_now: {
          type: 'dynamic', 
          generator: 'getTrendingContent',
          description: 'Popular content for your role and industry'
        },
        recommended_next: {
          type: 'dynamic',
          generator: 'getRecommendedNext',
          description: 'Suggested next steps in your journey'
        },
        personalized: {
          type: 'dynamic',
          generator: 'getPersonalizedSuggestions', 
          description: 'Tailored to your specific context and history'
        }
      }
    };
  }

  /**
   * Initialize the filter service with content
   */
  async initialize(allContent) {
    console.log('🔍 Initializing Intelligent Filter Service...');
    
    // Build search and semantic indexes
    await this.buildSearchIndex(allContent);
    await this.buildSemanticIndex(allContent);
    
    // Generate dynamic filter options based on content
    await this.generateDynamicFilters(allContent);
    
    console.log('✅ Intelligent Filter Service initialized');
  }

  /**
   * Apply intelligent filtering to content
   */
  filterContent(content, filters, userContext = {}) {
    let filteredContent = [...content];
    
    // Apply basic filters first
    filteredContent = this.applyBasicFilters(filteredContent, filters.basic || {});
    
    // Apply semantic filters with AI enhancement
    if (filters.semantic) {
      filteredContent = this.applySemanticFilters(filteredContent, filters.semantic, userContext);
    }
    
    // Apply contextual filters
    if (filters.contextual) {
      filteredContent = this.applyContextualFilters(filteredContent, filters.contextual, userContext);
    }
    
    // Apply intelligent filters
    if (filters.intelligent) {
      filteredContent = this.applyIntelligentFilters(filteredContent, filters.intelligent, userContext);
    }
    
    // Rank results using AI scoring
    filteredContent = this.rankResults(filteredContent, filters, userContext);
    
    // Store filter usage for learning
    this.recordFilterUsage(filters, userContext);
    
    return {
      results: filteredContent,
      total: filteredContent.length,
      filters_applied: this.getAppliedFiltersInfo(filters),
      suggestions: this.generateFilterSuggestions(filteredContent, userContext),
      related_searches: this.generateRelatedSearches(filters)
    };
  }

  /**
   * Perform intelligent search with AI-enhanced matching
   */
  intelligentSearch(query, content, userContext = {}) {
    const searchResults = {
      exact_matches: [],
      semantic_matches: [],
      related_content: [],
      suggested_queries: []
    };

    // Tokenize and analyze query
    const queryAnalysis = this.analyzeSearchQuery(query);
    
    // Find exact keyword matches
    searchResults.exact_matches = this.findExactMatches(content, queryAnalysis.keywords);
    
    // Find semantic matches using AI tagging
    searchResults.semantic_matches = this.findSemanticMatches(content, queryAnalysis, userContext);
    
    // Find related content based on context
    searchResults.related_content = this.findRelatedContent(content, queryAnalysis, userContext);
    
    // Generate search suggestions
    searchResults.suggested_queries = this.generateSearchSuggestions(queryAnalysis, userContext);
    
    // Combine and rank all results
    const allResults = [
      ...searchResults.exact_matches,
      ...searchResults.semantic_matches,
      ...searchResults.related_content
    ];
    
    const rankedResults = this.rankSearchResults(allResults, queryAnalysis, userContext);
    
    return {
      results: rankedResults,
      breakdown: searchResults,
      query_analysis: queryAnalysis,
      search_insights: this.generateSearchInsights(rankedResults, queryAnalysis)
    };
  }

  /**
   * Generate smart filter combinations
   */
  generateSmartCombinations(userContext) {
    const combinations = [];
    
    // Role-based combinations
    if (userContext.persona) {
      const persona = userContext.persona;
      
      if (persona.level === 'c-suite') {
        combinations.push({
          name: 'Executive Briefings',
          description: 'High-level strategic content for C-suite leaders',
          filters: {
            basic: { level: 'c-suite' },
            semantic: { business_impact: ['revenue-growth', 'operational-excellence'] },
            contextual: { time_to_value: 'immediate' }
          }
        });
      }
      
      if (persona.vertical === 'banking') {
        combinations.push({
          name: 'Banking Automation',
          description: 'Banking-specific automation opportunities',
          filters: {
            basic: { vertical: 'banking' },
            semantic: { technology_focus: ['rpa', 'ai-ml'] },
            contextual: { regulatory_sensitivity: ['medium', 'high'] }
          }
        });
      }
    }
    
    // Journey stage combinations
    combinations.push({
      name: 'Quick Wins',
      description: 'Low-effort, high-impact opportunities',
      filters: {
        semantic: { business_impact: ['cost-reduction', 'operational-excellence'] },
        contextual: { time_to_value: 'weeks', implementation_effort: [1, 2] }
      }
    });
    
    combinations.push({
      name: 'Strategic Initiatives', 
      description: 'Transformational automation projects',
      filters: {
        semantic: { business_impact: ['innovation-enablement', 'revenue-growth'] },
        contextual: { time_to_value: 'quarters', implementation_effort: [4, 5] }
      }
    });
    
    return combinations;
  }

  /**
   * Get advanced analytics for filtering behavior
   */
  getFilterAnalytics() {
    return {
      popular_filters: this.getPopularFilters(),
      effective_combinations: this.getEffectiveCombinations(),
      user_patterns: this.getUserPatterns(),
      content_gaps: this.identifyContentGaps(),
      optimization_suggestions: this.getOptimizationSuggestions()
    };
  }

  // === Helper Methods ===

  async buildSearchIndex(content) {
    this.searchIndex.clear();
    
    content.forEach((item, index) => {
      // Index by multiple text fields
      const searchableText = [
        item.title || item.name || '',
        item.description || item.overview || '',
        item.world || item.cares || item.help || '',
        JSON.stringify(item.tags || {})
      ].join(' ').toLowerCase();
      
      // Create keyword index
      const keywords = searchableText.match(/\b\w{3,}\b/g) || [];
      keywords.forEach(keyword => {
        if (!this.searchIndex.has(keyword)) {
          this.searchIndex.set(keyword, []);
        }
        this.searchIndex.get(keyword).push({ item, index, relevance: 1 });
      });
    });
  }

  async buildSemanticIndex(content) {
    this.semanticIndex.clear();
    
    for (const [index, item] of content.entries()) {
      // Generate AI tags for semantic indexing
      const aiTags = aiTaggingService.generateTags(item, this.inferContentType(item));
      
      // Index by semantic concepts
      Object.entries(aiTags.ai_suggested).forEach(([category, tags]) => {
        tags.forEach(tagInfo => {
          const concept = tagInfo.category || tagInfo;
          if (!this.semanticIndex.has(concept)) {
            this.semanticIndex.set(concept, []);
          }
          this.semanticIndex.get(concept).push({ 
            item, 
            index, 
            relevance: tagInfo.relevance || 1,
            category 
          });
        });
      });
    }
  }

  applyBasicFilters(content, basicFilters) {
    return content.filter(item => {
      return Object.entries(basicFilters).every(([key, value]) => {
        if (value === 'all' || !value) return true;
        return item[key] === value || (Array.isArray(item[key]) && item[key].includes(value));
      });
    });
  }

  applySemanticFilters(content, semanticFilters, userContext) {
    return content.filter(item => {
      return Object.entries(semanticFilters).every(([filterType, values]) => {
        if (!values || values.length === 0) return true;
        
        // Generate AI tags for this item if not cached
        const aiTags = aiTaggingService.generateTags(item);
        const relevantTags = aiTags.ai_suggested[filterType] || [];
        
        // Check if any selected values match the AI-generated tags
        return values.some(value => 
          relevantTags.some(tag => 
            tag.category === value || (tag.keywords && tag.keywords.includes(value))
          )
        );
      });
    });
  }

  applyContextualFilters(content, contextualFilters, userContext) {
    return content.filter(item => {
      return Object.entries(contextualFilters).every(([filterType, value]) => {
        if (!value) return true;
        
        switch (filterType) {
          case 'time_to_value':
            return this.matchTimeToValue(item, value);
          case 'implementation_effort':
            return this.matchImplementationEffort(item, value);
          case 'regulatory_sensitivity':
            return this.matchRegulatorySensitivity(item, value, userContext);
          default:
            return true;
        }
      });
    });
  }

  applyIntelligentFilters(content, intelligentFilters, userContext) {
    let filteredContent = [...content];
    
    Object.entries(intelligentFilters).forEach(([filterType, params]) => {
      switch (filterType) {
        case 'similar_to_current':
          filteredContent = this.findSimilarContent(filteredContent, params, userContext);
          break;
        case 'trending_now':
          filteredContent = this.applyTrendingFilter(filteredContent, userContext);
          break;
        case 'recommended_next':
          filteredContent = this.applyRecommendationFilter(filteredContent, userContext);
          break;
        case 'personalized':
          filteredContent = this.applyPersonalizationFilter(filteredContent, userContext);
          break;
      }
    });
    
    return filteredContent;
  }

  rankResults(content, filters, userContext) {
    return content.map(item => ({
      ...item,
      relevance_score: this.calculateRelevanceScore(item, filters, userContext)
    })).sort((a, b) => b.relevance_score - a.relevance_score);
  }

  calculateRelevanceScore(item, filters, userContext) {
    let score = 0;
    
    // Base relevance from priority
    if (item.priority === 'high') score += 3;
    else if (item.priority === 'medium') score += 2;
    else if (item.priority === 'low') score += 1;
    
    // Role match bonus
    if (userContext.persona && item.level === userContext.persona.level) {
      score += 2;
    }
    
    // Industry match bonus
    if (userContext.persona && item.vertical === userContext.persona.vertical) {
      score += 2;
    }
    
    // AI tag relevance
    const aiTags = aiTaggingService.generateTags(item);
    if (aiTags.semantic_clusters && aiTags.semantic_clusters.length > 0) {
      score += aiTags.semantic_clusters.reduce((sum, cluster) => sum + cluster.strength, 0);
    }
    
    return score;
  }

  analyzeSearchQuery(query) {
    const analysis = {
      original: query,
      keywords: [],
      intent: 'general',
      entities: [],
      semantic_concepts: []
    };
    
    // Extract keywords
    analysis.keywords = query.toLowerCase().match(/\b\w{2,}\b/g) || [];
    
    // Infer search intent
    if (/how to|guide|step|implement/.test(query.toLowerCase())) {
      analysis.intent = 'implementation';
    } else if (/roi|cost|benefit|value/.test(query.toLowerCase())) {
      analysis.intent = 'business_case';
    } else if (/compare|vs|difference|alternative/.test(query.toLowerCase())) {
      analysis.intent = 'comparison';
    }
    
    // Extract entities (simplified)
    analysis.entities = analysis.keywords.filter(keyword => 
      ['banking', 'insurance', 'rpa', 'ai', 'automation'].includes(keyword)
    );
    
    return analysis;
  }

  findExactMatches(content, keywords) {
    const matches = [];
    
    content.forEach(item => {
      const itemText = JSON.stringify(item).toLowerCase();
      const matchCount = keywords.filter(keyword => itemText.includes(keyword)).length;
      
      if (matchCount > 0) {
        matches.push({
          ...item,
          match_score: matchCount / keywords.length,
          match_type: 'exact'
        });
      }
    });
    
    return matches.sort((a, b) => b.match_score - a.match_score);
  }

  findSemanticMatches(content, queryAnalysis, userContext) {
    const matches = [];
    
    content.forEach(item => {
      const aiTags = aiTaggingService.generateTags(item);
      let semanticScore = 0;
      
      // Match against semantic clusters
      aiTags.semantic_clusters.forEach(cluster => {
        const clusterMatches = queryAnalysis.keywords.filter(keyword =>
          cluster.words.some(word => word.includes(keyword) || keyword.includes(word))
        );
        semanticScore += clusterMatches.length * cluster.strength;
      });
      
      if (semanticScore > 0) {
        matches.push({
          ...item,
          match_score: semanticScore,
          match_type: 'semantic'
        });
      }
    });
    
    return matches.sort((a, b) => b.match_score - a.match_score).slice(0, 20);
  }

  // Additional helper methods...
  inferContentType(item) {
    if (item.level && item.world) return 'persona';
    if (item.category && item.businessValue) return 'use-case';
    if (item.type && item.overview) return 'resource';
    return 'general';
  }

  matchTimeToValue(item, targetValue) {
    const timeMapping = {
      'immediate': ['immediate', 'instant'],
      'weeks': ['weeks', '1-4 weeks', 'fast'],
      'months': ['months', '1-6 months', 'medium'],
      'quarters': ['quarters', '6+ months', 'long-term']
    };
    
    const itemTime = item.timeToValue || item.time_to_value || 'months';
    return timeMapping[targetValue]?.includes(itemTime.toLowerCase()) || false;
  }

  matchImplementationEffort(item, targetEffort) {
    const complexityMapping = {
      1: ['simple', 'low', 'easy'],
      2: ['low', 'simple'],
      3: ['medium', 'moderate'],
      4: ['high', 'complex'],
      5: ['very high', 'enterprise', 'complex']
    };
    
    const itemComplexity = item.complexity || 'medium';
    return complexityMapping[targetEffort]?.includes(itemComplexity.toLowerCase()) || false;
  }

  matchRegulatorySensitivity(item, targetSensitivity, userContext) {
    // Use AI tags to determine regulatory sensitivity
    const aiTags = aiTaggingService.generateTags(item);
    const hasRegulatoryTags = aiTags.ai_suggested.business_context?.some(tag =>
      tag.category?.includes('regulatory') || tag.category?.includes('compliance')
    );
    
    const sensitivityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const itemLevel = hasRegulatoryTags ? 3 : 1;
    const targetLevel = sensitivityLevels[targetSensitivity] || 2;
    
    return itemLevel >= targetLevel;
  }

  // Placeholder implementations for complex methods
  findSimilarContent(content, params, userContext) { return content; }
  applyTrendingFilter(content, userContext) { return content; }
  applyRecommendationFilter(content, userContext) { return content; }
  applyPersonalizationFilter(content, userContext) { return content; }
  
  getAppliedFiltersInfo(filters) { return {}; }
  generateFilterSuggestions(content, userContext) { return []; }
  generateRelatedSearches(filters) { return []; }
  generateSearchSuggestions(queryAnalysis, userContext) { return []; }
  generateSearchInsights(results, queryAnalysis) { return {}; }
  
  recordFilterUsage(filters, userContext) { /* Analytics tracking */ }
  getPopularFilters() { return []; }
  getEffectiveCombinations() { return []; }
  getUserPatterns() { return {}; }
  identifyContentGaps() { return []; }
  getOptimizationSuggestions() { return []; }
  
  findRelatedContent(content, queryAnalysis, userContext) { return []; }
  rankSearchResults(results, queryAnalysis, userContext) { return results; }
  generateDynamicFilters(content) { return Promise.resolve(); }
}

export default new IntelligentFilterService();