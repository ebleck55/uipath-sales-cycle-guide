/**
 * AI Module - Unified AI Integration System
 * Integrates with the module system for proper dependency management
 * Supports Claude (Anthropic) and other AI providers
 */

export class AIModule {
  constructor() {
    this.initialized = false;
    this.config = null;
    this.providers = new Map();
    this.currentProvider = null;
  }

  /**
   * Initialize the AI module
   * @param {Object} config - Configuration object from module manager
   */
  async init(config = {}) {
    if (this.initialized) return;

    try {
      console.log('🤖 Initializing AI Module...');
      
      // Store configuration
      this.config = {
        selectedProvider: config.selectedProvider || 'claude',
        apiKeys: config.apiKeys || {},
        models: config.models || {
          claude: 'claude-3-haiku-20240307'
        },
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 1000,
        ...config
      };

      // Initialize providers
      await this.initializeProviders();
      
      // Set current provider
      this.setCurrentProvider(this.config.selectedProvider);
      
      this.initialized = true;
      console.log('✅ AI Module initialized successfully');
      
    } catch (error) {
      console.error('❌ AI module initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize AI providers
   */
  async initializeProviders() {
    // Initialize Claude provider
    const claudeProvider = new ClaudeProvider();
    this.providers.set('claude', claudeProvider);
    
    console.log('✅ AI providers initialized');
  }

  /**
   * Set the current AI provider
   */
  setCurrentProvider(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`AI provider '${providerName}' not found`);
    }
    
    this.currentProvider = provider;
    this.config.selectedProvider = providerName;
    console.log(`🔄 AI provider switched to: ${providerName}`);
  }

  /**
   * Generate AI response
   */
  async generateResponse(prompt, context = {}) {
    if (!this.initialized) {
      throw new Error('AI Module not initialized');
    }

    if (!this.currentProvider) {
      throw new Error('No AI provider selected');
    }

    const apiKey = this.getApiKey(this.config.selectedProvider);
    if (!apiKey) {
      throw new Error(`No API key available for provider: ${this.config.selectedProvider}`);
    }

    try {
      const response = await this.currentProvider.generate({
        prompt,
        context,
        model: this.config.models[this.config.selectedProvider],
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        apiKey
      });

      return response;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }

  /**
   * Generate follow-up questions for a stage
   */
  async generateFollowUpQuestions(stageData, existingQuestions, customerNotes = '') {
    const prompt = this.buildFollowUpPrompt(stageData, existingQuestions, customerNotes);
    const context = {
      type: 'followup_questions',
      stage: stageData.id,
      industry: stageData.industry || 'general'
    };

    const response = await this.generateResponse(prompt, context);
    return this.parseFollowUpQuestions(response);
  }

  /**
   * Generate objection responses
   */
  async generateObjectionResponse(objection, context = {}) {
    const prompt = this.buildObjectionPrompt(objection, context);
    const contextData = {
      type: 'objection_handling',
      industry: context.industry || 'general',
      ...context
    };

    return await this.generateResponse(prompt, contextData);
  }

  /**
   * Generate contextual insights
   */
  async generateInsights(customerData, stageData) {
    const prompt = this.buildInsightsPrompt(customerData, stageData);
    const context = {
      type: 'customer_insights',
      stage: stageData.id,
      industry: stageData.industry || 'general'
    };

    return await this.generateResponse(prompt, context);
  }

  /**
   * Get API key for provider
   */
  getApiKey(provider = null) {
    const targetProvider = provider || this.config.selectedProvider;
    
    // Check config first
    if (this.config.apiKeys[targetProvider]) {
      return this.config.apiKeys[targetProvider];
    }
    
    // Check localStorage for legacy keys
    if (targetProvider === 'claude') {
      const stored = localStorage.getItem('claude_api_key');
      if (stored) {
        try {
          return atob(stored); // Try to decode base64
        } catch (e) {
          return stored; // Return as-is if not base64
        }
      }
    }
    
    return null;
  }

  /**
   * Set API key for provider
   */
  setApiKey(provider, apiKey) {
    this.config.apiKeys[provider] = apiKey;
    
    // Also store in localStorage for persistence
    if (provider === 'claude') {
      localStorage.setItem('claude_api_key', btoa(apiKey));
    }
    
    console.log(`🔑 API key set for provider: ${provider}`);
  }

  /**
   * Test connection to AI provider
   */
  async testConnection(provider = null) {
    const testProvider = provider || this.config.selectedProvider;
    const targetProvider = this.providers.get(testProvider);
    const apiKey = this.getApiKey(testProvider);
    
    if (!targetProvider) {
      return { success: false, error: 'Provider not found' };
    }
    
    if (!apiKey) {
      return { success: false, error: 'No API key configured' };
    }

    try {
      const testPrompt = 'Respond with "Connection successful" if you receive this message.';
      const response = await targetProvider.generate({
        prompt: testPrompt,
        model: this.config.models[testProvider],
        temperature: 0.1,
        maxTokens: 50,
        apiKey
      });

      return { 
        success: true, 
        response: response,
        provider: testProvider 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        provider: testProvider 
      };
    }
  }

  /**
   * Build follow-up questions prompt
   */
  buildFollowUpPrompt(stageData, existingQuestions, customerNotes) {
    return `You are an expert UiPath sales consultant. Generate 3-5 insightful follow-up questions for the ${stageData.title} stage.

Current stage context:
${stageData.title}
${stageData.description || ''}

Existing questions:
${JSON.stringify(existingQuestions, null, 2)}

Customer notes/context:
${customerNotes || 'No additional context provided'}

Industry: ${stageData.industry || 'general'}

Generate follow-up questions that:
1. Are specific to the ${stageData.industry || 'target'} industry
2. Build on existing questions without repeating them
3. Help uncover deeper insights about the customer's situation
4. Are practical and actionable for sales conversations
5. Focus on UiPath's automation capabilities

Format your response as a JSON array of question objects:
[
  {
    "category": "Category Name",
    "question": "The question text?",
    "purpose": "Why this question helps in the sales process"
  }
]`;
  }

  /**
   * Build objection handling prompt
   */
  buildObjectionPrompt(objection, context) {
    return `You are an expert UiPath sales consultant. Provide a compelling response to this customer objection.

Objection: "${objection}"

Context:
- Industry: ${context.industry || 'general'}
- Sales Stage: ${context.stageName || 'Not specified'}
- Customer Notes: ${context.customerNotes || 'None provided'}

Your response should:
1. Acknowledge the customer's concern
2. Provide specific UiPath value propositions
3. Include relevant industry examples
4. Be conversational and consultative, not pushy
5. Offer next steps or questions to continue the dialogue

Keep the response concise but comprehensive (2-3 paragraphs maximum).`;
  }

  /**
   * Build insights prompt
   */
  buildInsightsPrompt(customerData, stageData) {
    return `You are an expert UiPath sales consultant. Analyze this customer data and provide strategic insights for the ${stageData.title} stage.

Customer Data:
${JSON.stringify(customerData, null, 2)}

Current Stage: ${stageData.title}
Industry: ${stageData.industry || 'general'}

Provide insights on:
1. Key opportunities based on their current situation
2. Potential risks or challenges to address
3. Recommended next steps for this stage
4. Specific UiPath solutions that align with their needs
5. Stakeholders who should be engaged

Format as clear, actionable bullet points.`;
  }

  /**
   * Parse follow-up questions from AI response
   */
  parseFollowUpQuestions(response) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // If JSON parsing fails, extract questions from text
      const questions = [];
      const lines = response.split('\n').filter(line => line.trim());
      
      let currentCategory = '';
      lines.forEach(line => {
        if (line.includes(':') && !line.startsWith('-') && !line.startsWith('•')) {
          currentCategory = line.split(':')[0].trim();
        } else if (line.match(/^[-•]\s+.+\?/)) {
          const questionText = line.replace(/^[-•]\s+/, '').trim();
          questions.push({
            category: currentCategory || 'Follow-up Questions',
            question: questionText,
            purpose: 'Uncover deeper insights'
          });
        }
      });
      
      return questions;
    }
    
    return [];
  }

  /**
   * Destroy method for clean shutdown
   */
  async destroy() {
    console.log('🔄 Shutting down AI Module...');
    
    try {
      this.providers.clear();
      this.currentProvider = null;
      this.initialized = false;
      
      console.log('✅ AI Module shut down successfully');
    } catch (error) {
      console.error('❌ Error during AI module shutdown:', error);
    }
  }
}

/**
 * Claude (Anthropic) Provider
 */
export class ClaudeProvider {
  async generate({ prompt, context, model, temperature, maxTokens, apiKey }) {
    try {
      // Use CORS proxy for browser requests
      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = 'https://api.anthropic.com/v1/messages';
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-haiku-20240307',
          max_tokens: maxTokens || 1000,
          temperature: temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const error = await response.json();
          errorMessage = error.error?.message || errorMessage;
        } catch (e) {
          // Use status text if response is not JSON
        }
        throw new Error(`Claude API Error: ${errorMessage}`);
      }

      const data = await response.json();
      return data.content[0].text;
      
    } catch (fetchError) {
      // Provide helpful error messages
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('network')) {
        throw new Error('Network error: Unable to reach Claude API. This may be due to CORS restrictions or network connectivity issues.');
      }
      throw fetchError;
    }
  }
}

// Export default
export default AIModule;