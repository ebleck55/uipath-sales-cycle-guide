/**
 * AI Tagging Service
 * Provides intelligent tagging and filtering capabilities for all content
 */

export class AITaggingService {
  constructor() {
    this.tagCategories = {
      // Business Context Tags
      business_function: {
        'customer-acquisition': ['onboarding', 'kyc', 'account-opening', 'new-customer'],
        'customer-service': ['support', 'contact-center', 'customer-experience', 'help-desk'],
        'risk-management': ['compliance', 'aml', 'fraud-detection', 'credit-risk'],
        'operations': ['back-office', 'processing', 'settlement', 'reconciliation'],
        'digital-transformation': ['automation', 'ai', 'digitization', 'modernization'],
        'regulatory-compliance': ['reporting', 'audit', 'governance', 'regulatory'],
        'revenue-optimization': ['sales', 'cross-sell', 'pricing', 'revenue'],
        'cost-management': ['efficiency', 'cost-reduction', 'resource-optimization']
      },

      // Technology Context Tags  
      technology_domain: {
        'robotic-process-automation': ['rpa', 'bot', 'automation', 'workflow'],
        'artificial-intelligence': ['ai', 'machine-learning', 'nlp', 'computer-vision'],
        'document-processing': ['ocr', 'document-ai', 'forms', 'extraction'],
        'integration-platform': ['api', 'connectivity', 'system-integration', 'middleware'],
        'analytics-insights': ['reporting', 'dashboards', 'kpi', 'metrics'],
        'security-governance': ['encryption', 'audit-trail', 'access-control', 'compliance']
      },

      // Industry Specifics
      industry_vertical: {
        'retail-banking': ['consumer', 'deposits', 'lending', 'cards'],
        'commercial-banking': ['business', 'corporate', 'trade-finance', 'cash-management'],
        'investment-banking': ['capital-markets', 'trading', 'securities', 'research'],
        'insurance-operations': ['claims', 'underwriting', 'policy', 'actuarial'],
        'wealth-management': ['portfolio', 'advisory', 'private-banking', 'investments']
      },

      // Process Complexity
      process_characteristics: {
        'high-volume': ['bulk-processing', 'batch', 'mass-operations', 'scalable'],
        'exception-handling': ['complex-cases', 'human-in-loop', 'escalation', 'review'],
        'real-time': ['immediate', 'instant', 'live', 'streaming'],
        'cross-system': ['integration', 'multi-platform', 'system-spanning', 'orchestration'],
        'regulatory-sensitive': ['compliant', 'auditable', 'governed', 'controlled'],
        'customer-facing': ['front-office', 'client-interaction', 'experience', 'touchpoint']
      },

      // Business Impact
      value_drivers: {
        'cost-reduction': ['efficiency', 'savings', 'optimization', 'lean'],
        'revenue-growth': ['sales-enablement', 'cross-sell', 'upsell', 'monetization'],
        'risk-mitigation': ['compliance', 'security', 'control', 'protection'],
        'customer-experience': ['satisfaction', 'nps', 'journey', 'engagement'],
        'operational-excellence': ['quality', 'speed', 'accuracy', 'reliability'],
        'innovation-enablement': ['digital', 'transformation', 'modernization', 'agility']
      },

      // Deployment Context
      deployment_patterns: {
        'cloud-native': ['saas', 'scalable', 'elastic', 'managed'],
        'hybrid-deployment': ['on-premise', 'cloud', 'flexible', 'distributed'],
        'enterprise-grade': ['secure', 'governed', 'scalable', 'resilient'],
        'citizen-developer': ['low-code', 'self-service', 'business-user', 'democratic'],
        'center-of-excellence': ['standardized', 'governed', 'best-practice', 'enterprise'],
        'rapid-deployment': ['quick-start', 'accelerated', 'fast-track', 'immediate']
      }
    };

    this.roleBasedTags = {
      'c-suite': {
        priorities: ['strategic-impact', 'board-reporting', 'competitive-advantage', 'transformation'],
        concerns: ['roi', 'risk-management', 'regulatory-compliance', 'digital-innovation'],
        metrics: ['cost-savings', 'revenue-impact', 'customer-satisfaction', 'operational-efficiency']
      },
      'director': {
        priorities: ['operational-excellence', 'team-productivity', 'process-improvement', 'technology-adoption'],
        concerns: ['resource-allocation', 'change-management', 'performance-metrics', 'stakeholder-alignment'],
        metrics: ['process-efficiency', 'quality-metrics', 'throughput', 'error-reduction']
      },
      'manager': {
        priorities: ['day-to-day-operations', 'team-management', 'process-optimization', 'performance-tracking'],
        concerns: ['workload-management', 'staff-training', 'system-reliability', 'process-compliance'],
        metrics: ['productivity', 'accuracy', 'turnaround-time', 'customer-feedback']
      }
    };
  }

  /**
   * Generate AI-suggested tags for any content item
   */
  generateTags(content, contentType = 'general') {
    const suggestedTags = {
      primary: [],
      secondary: [],
      ai_suggested: {
        business_context: [],
        technology_focus: [],
        industry_specific: [],
        process_type: [],
        value_proposition: [],
        deployment_context: []
      },
      semantic_clusters: [],
      related_concepts: [],
      search_keywords: []
    };

    // Extract keywords from text content
    const textContent = this.extractTextContent(content);
    const keywords = this.extractKeywords(textContent);

    // Generate business context tags
    suggestedTags.ai_suggested.business_context = this.matchTagCategories(
      keywords, 
      this.tagCategories.business_function
    );

    // Generate technology focus tags
    suggestedTags.ai_suggested.technology_focus = this.matchTagCategories(
      keywords,
      this.tagCategories.technology_domain
    );

    // Generate industry-specific tags
    suggestedTags.ai_suggested.industry_specific = this.matchTagCategories(
      keywords,
      this.tagCategories.industry_vertical
    );

    // Generate process characteristics
    suggestedTags.ai_suggested.process_type = this.matchTagCategories(
      keywords,
      this.tagCategories.process_characteristics
    );

    // Generate value drivers
    suggestedTags.ai_suggested.value_proposition = this.matchTagCategories(
      keywords,
      this.tagCategories.value_drivers
    );

    // Generate deployment context
    suggestedTags.ai_suggested.deployment_context = this.matchTagCategories(
      keywords,
      this.tagCategories.deployment_patterns
    );

    // Generate semantic clusters (related concept groups)
    suggestedTags.semantic_clusters = this.generateSemanticClusters(keywords);

    // Generate related concepts using AI inference
    suggestedTags.related_concepts = this.inferRelatedConcepts(content, contentType);

    // Generate enhanced search keywords
    suggestedTags.search_keywords = this.generateSearchKeywords(content, suggestedTags);

    return suggestedTags;
  }

  /**
   * Generate role-specific tags based on persona level and function
   */
  generateRoleSpecificTags(persona) {
    const level = persona.level || 'manager';
    const roleConfig = this.roleBasedTags[level] || this.roleBasedTags.manager;

    return {
      role_priorities: roleConfig.priorities,
      role_concerns: roleConfig.concerns,
      success_metrics: roleConfig.metrics,
      communication_style: this.inferCommunicationStyle(level),
      decision_factors: this.inferDecisionFactors(persona)
    };
  }

  /**
   * Create intelligent content filters
   */
  createIntelligentFilters(allContent) {
    const filters = {
      // Dynamic filters based on content analysis
      dynamic: {
        business_impact: this.extractBusinessImpactLevels(allContent),
        implementation_complexity: this.extractComplexityLevels(allContent),
        time_to_value: this.extractTimeToValueRanges(allContent),
        technology_maturity: this.extractTechnologyMaturity(allContent)
      },

      // AI-generated thematic filters
      thematic: {
        automation_journey_stage: ['getting-started', 'scaling-up', 'enterprise-grade', 'innovation-leader'],
        digital_transformation_focus: ['process-digitization', 'customer-experience', 'operational-excellence', 'innovation'],
        risk_tolerance: ['risk-averse', 'balanced-approach', 'innovation-focused', 'early-adopter'],
        organizational_maturity: ['traditional', 'transforming', 'digital-native', 'ai-first']
      },

      // Context-aware filters
      contextual: {
        seasonal_relevance: this.generateSeasonalRelevance(),
        regulatory_cycles: this.generateRegulatoryRelevance(),
        market_conditions: this.generateMarketRelevance(),
        technology_trends: this.generateTrendRelevance()
      },

      // Intelligent combinations
      smart_combinations: this.generateSmartFilterCombinations()
    };

    return filters;
  }

  /**
   * Generate content recommendations based on user behavior and context
   */
  generateRecommendations(userContext, viewingHistory = []) {
    const recommendations = {
      similar_content: [],
      complementary_content: [],
      next_steps: [],
      trending_content: [],
      personalized_suggestions: []
    };

    // Analyze user's current context
    const userInterests = this.inferUserInterests(userContext, viewingHistory);
    const userJourneyStage = this.inferJourneyStage(userContext);
    const userRole = userContext.persona || {};

    // Generate similar content recommendations
    recommendations.similar_content = this.findSimilarContent(userContext, userInterests);

    // Generate complementary content
    recommendations.complementary_content = this.findComplementaryContent(userContext);

    // Generate next steps in user journey
    recommendations.next_steps = this.suggestNextSteps(userJourneyStage, userRole);

    // Generate trending content based on current market/industry focus
    recommendations.trending_content = this.identifyTrendingContent();

    // Generate personalized suggestions
    recommendations.personalized_suggestions = this.createPersonalizedSuggestions(
      userRole, 
      userInterests, 
      viewingHistory
    );

    return recommendations;
  }

  // === Helper Methods ===

  extractTextContent(content) {
    let text = '';
    if (typeof content === 'string') return content;
    
    if (content.world) text += content.world + ' ';
    if (content.cares) text += content.cares + ' ';
    if (content.help) text += content.help + ' ';
    if (content.description) text += content.description + ' ';
    if (content.overview) text += content.overview + ' ';
    if (content.why) text += content.why + ' ';
    
    return text.toLowerCase();
  }

  extractKeywords(text) {
    // Simple keyword extraction (in production, use more sophisticated NLP)
    const words = text.match(/\b\w{3,}\b/g) || [];
    const stopWords = ['the', 'and', 'for', 'are', 'with', 'they', 'this', 'that', 'from', 'have'];
    return words.filter(word => !stopWords.includes(word));
  }

  matchTagCategories(keywords, categories) {
    const matches = [];
    Object.entries(categories).forEach(([category, categoryKeywords]) => {
      const matchCount = keywords.filter(keyword => 
        categoryKeywords.some(ck => keyword.includes(ck) || ck.includes(keyword))
      ).length;
      
      if (matchCount > 0) {
        matches.push({
          category,
          relevance: matchCount,
          keywords: categoryKeywords
        });
      }
    });
    
    return matches.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  generateSemanticClusters(keywords) {
    // Group related keywords into semantic clusters
    const clusters = {
      'automation-ai': keywords.filter(k => /automat|ai|bot|intelligen/.test(k)),
      'process-operations': keywords.filter(k => /process|operation|workflow|procedure/.test(k)),
      'customer-experience': keywords.filter(k => /customer|client|experience|service/.test(k)),
      'risk-compliance': keywords.filter(k => /risk|complian|regulat|audit/.test(k)),
      'financial-banking': keywords.filter(k => /bank|financ|loan|account|payment/.test(k))
    };

    return Object.entries(clusters)
      .filter(([_, words]) => words.length > 0)
      .map(([cluster, words]) => ({ cluster, words, strength: words.length }));
  }

  inferRelatedConcepts(content, contentType) {
    // AI-inferred related concepts based on content analysis
    const concepts = new Set();

    if (contentType === 'persona') {
      if (content.level === 'c-suite') {
        concepts.add('strategic-planning');
        concepts.add('board-reporting');
        concepts.add('competitive-advantage');
      }
      if (content.vertical === 'banking') {
        concepts.add('digital-banking');
        concepts.add('fintech-competition');
        concepts.add('regulatory-technology');
      }
    }

    if (contentType === 'use-case') {
      if (content.complexity === 'high') {
        concepts.add('change-management');
        concepts.add('stakeholder-alignment');
        concepts.add('phased-implementation');
      }
    }

    return Array.from(concepts);
  }

  generateSearchKeywords(content, suggestedTags) {
    const keywords = new Set();

    // Add primary content keywords
    if (content.tags && content.tags.primary) {
      content.tags.primary.forEach(tag => keywords.add(tag));
    }

    // Add AI-suggested category terms
    Object.values(suggestedTags.ai_suggested).forEach(categoryTags => {
      categoryTags.forEach(tagInfo => {
        if (tagInfo.category) keywords.add(tagInfo.category);
        if (tagInfo.keywords) tagInfo.keywords.forEach(kw => keywords.add(kw));
      });
    });

    // Add semantic cluster terms
    suggestedTags.semantic_clusters.forEach(cluster => {
      cluster.words.forEach(word => keywords.add(word));
    });

    return Array.from(keywords).slice(0, 20); // Limit to top 20 keywords
  }

  inferCommunicationStyle(level) {
    const styles = {
      'c-suite': ['strategic', 'high-level', 'roi-focused', 'business-impact'],
      'director': ['tactical', 'process-oriented', 'metrics-driven', 'solution-focused'],
      'manager': ['operational', 'hands-on', 'practical', 'implementation-focused']
    };
    return styles[level] || styles.manager;
  }

  inferDecisionFactors(persona) {
    const factors = ['roi', 'implementation-time', 'resource-requirements'];
    
    if (persona.vertical === 'banking') {
      factors.push('regulatory-compliance', 'security', 'audit-trail');
    }
    
    if (persona.level === 'c-suite') {
      factors.push('strategic-alignment', 'competitive-advantage');
    }
    
    return factors;
  }

  extractBusinessImpactLevels(allContent) {
    return ['transformational', 'significant', 'moderate', 'incremental'];
  }

  extractComplexityLevels(allContent) {
    return ['simple', 'moderate', 'complex', 'enterprise'];
  }

  extractTimeToValueRanges(allContent) {
    return ['immediate', 'weeks', 'months', 'quarters'];
  }

  extractTechnologyMaturity(allContent) {
    return ['proven', 'emerging', 'cutting-edge', 'experimental'];
  }

  generateSeasonalRelevance() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return {
      q1: ['budget-planning', 'new-initiatives', 'compliance-updates'],
      q2: ['mid-year-review', 'performance-optimization', 'summer-preparations'],
      q3: ['back-to-business', 'year-end-planning', 'budget-cycles'],
      q4: ['year-end-push', 'next-year-planning', 'holiday-readiness']
    }[`q${quarter}`];
  }

  generateRegulatoryRelevance() {
    return ['aml-updates', 'gdpr-compliance', 'banking-regulations', 'risk-management'];
  }

  generateMarketRelevance() {
    return ['digital-transformation', 'ai-adoption', 'customer-experience', 'operational-efficiency'];
  }

  generateTrendRelevance() {
    return ['generative-ai', 'automation-cloud', 'citizen-development', 'sustainable-operations'];
  }

  generateSmartFilterCombinations() {
    return [
      {
        name: 'Quick Wins',
        filters: { complexity: 'simple', timeToValue: 'immediate', businessImpact: 'moderate' }
      },
      {
        name: 'Strategic Initiatives',
        filters: { complexity: 'complex', timeToValue: 'quarters', businessImpact: 'transformational' }
      },
      {
        name: 'Regulatory Focus',
        filters: { tags: ['compliance', 'regulatory'], riskTolerance: 'risk-averse' }
      },
      {
        name: 'Innovation Projects',
        filters: { technologyMaturity: 'emerging', organizationalMaturity: 'ai-first' }
      }
    ];
  }

  // Additional helper methods for recommendations...
  inferUserInterests(userContext, viewingHistory) {
    const interests = new Set();
    
    if (userContext.persona) {
      const persona = userContext.persona;
      if (persona.tags && persona.tags.interests) {
        persona.tags.interests.forEach(interest => interests.add(interest));
      }
    }
    
    viewingHistory.forEach(item => {
      if (item.tags && item.tags.primary) {
        item.tags.primary.forEach(tag => interests.add(tag));
      }
    });
    
    return Array.from(interests);
  }

  inferJourneyStage(userContext) {
    // Simple journey stage inference based on context
    if (!userContext.viewingHistory || userContext.viewingHistory.length === 0) {
      return 'exploration';
    }
    if (userContext.viewingHistory.length < 5) {
      return 'evaluation';
    }
    return 'implementation-planning';
  }

  findSimilarContent(userContext, userInterests) {
    // Placeholder - would integrate with actual content database
    return [];
  }

  findComplementaryContent(userContext) {
    // Placeholder - would suggest content that complements current viewing
    return [];
  }

  suggestNextSteps(journeyStage, userRole) {
    const suggestions = {
      exploration: ['assess-readiness', 'identify-use-cases', 'build-business-case'],
      evaluation: ['vendor-comparison', 'pilot-planning', 'stakeholder-alignment'],
      'implementation-planning': ['implementation-roadmap', 'change-management', 'success-metrics']
    };
    
    return suggestions[journeyStage] || suggestions.exploration;
  }

  identifyTrendingContent() {
    // Would integrate with analytics to identify trending content
    return ['generative-ai-use-cases', 'automation-cloud-benefits', 'citizen-developer-enablement'];
  }

  createPersonalizedSuggestions(userRole, userInterests, viewingHistory) {
    const suggestions = [];
    
    // Role-based suggestions
    if (userRole.level === 'c-suite') {
      suggestions.push('roi-calculators', 'executive-briefings', 'competitive-analysis');
    }
    
    // Interest-based suggestions
    userInterests.forEach(interest => {
      if (interest.includes('ai')) {
        suggestions.push('ai-implementation-guide', 'ai-governance-framework');
      }
    });
    
    return suggestions.slice(0, 5);
  }
}

export default new AITaggingService();