// AI Integration Module for UiPath Sales Cycle Guide
// Supports Claude (Anthropic)

class AIIntegration {
  constructor() {
    // Configuration with API key from environment or user input
    this.config = {
      selectedProvider: 'claude',
      apiKeys: {
        claude: this.getApiKey()
      },
      models: {
        claude: 'claude-3-haiku-20240307'
      },
      temperature: 0.7,
      maxTokens: 1000
    };
    this.providers = {
      claude: new ClaudeProvider()
    };
    this.currentProvider = this.providers.claude;
  }

  // Get API key from various sources
  getApiKey() {
    // First check if there's a stored key in localStorage
    const stored = localStorage.getItem('claude_api_key');
    if (stored) return stored;
    
    // If no stored key, prompt user for it
    const apiKey = prompt('Please enter your Claude API key:\n\nGet it from: https://console.anthropic.com\n\n(This will be stored locally in your browser)');
    if (apiKey && apiKey.trim()) {
      localStorage.setItem('claude_api_key', apiKey.trim());
      return apiKey.trim();
    }
    
    return null;
  }

  // Load configuration from localStorage
  loadConfig() {
    const saved = localStorage.getItem('aiConfig');
    return saved ? JSON.parse(saved) : {
      selectedProvider: 'claude',
      apiKeys: {},
      models: {
        claude: 'claude-3-haiku-20240307'
      },
      temperature: 0.7,
      maxTokens: 1000
    };
  }

  // Save configuration to localStorage
  saveConfig() {
    localStorage.setItem('aiConfig', JSON.stringify(this.config));
  }

  // Set API key for a provider
  setApiKey(provider, apiKey) {
    this.config.apiKeys[provider] = apiKey;
    if (provider === 'claude') {
      localStorage.setItem('claude_api_key', apiKey);
    }
    this.saveConfig();
  }

  // Reset API key (will prompt for new one next time)
  resetApiKey() {
    localStorage.removeItem('claude_api_key');
    this.config.apiKeys.claude = null;
    console.log('API key cleared. Reload the page to enter a new one.');
  }

  // Switch AI provider
  switchProvider(provider) {
    if (this.providers[provider]) {
      this.config.selectedProvider = provider;
      this.currentProvider = this.providers[provider];
      this.saveConfig();
      return true;
    }
    return false;
  }

  // Main method for generating AI responses
  async generateResponse(prompt, context = {}) {
    const apiKey = this.config.apiKeys[this.config.selectedProvider];
    if (!apiKey) {
      throw new Error(`No API key available. Please refresh the page and enter your Claude API key when prompted.`);
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

  // Generate follow-up questions for a stage
  async generateFollowUpQuestions(stageId, existingQuestions, customerNotes = '') {
    const stage = SALES_CYCLE_DATA.stages.find(s => s.id === stageId);
    if (!stage) throw new Error('Stage not found');

    const prompt = this.buildFollowUpPrompt(stage, existingQuestions, customerNotes);
    const context = {
      type: 'followup_questions',
      stage: stageId,
      industry: SALES_CYCLE_DATA.industry
    };

    const response = await this.generateResponse(prompt, context);
    return this.parseFollowUpQuestions(response);
  }

  // Generate objection responses
  async generateObjectionResponse(objection, context = {}) {
    const prompt = this.buildObjectionPrompt(objection, context);
    const contextData = {
      type: 'objection_handling',
      industry: SALES_CYCLE_DATA.industry,
      ...context
    };

    const response = await this.generateResponse(prompt, contextData);
    return response;
  }

  // Generate contextual insights
  async generateInsights(customerData, stageId) {
    const stage = SALES_CYCLE_DATA.stages.find(s => s.id === stageId);
    const prompt = this.buildInsightsPrompt(customerData, stage);
    const context = {
      type: 'customer_insights',
      stage: stageId,
      industry: SALES_CYCLE_DATA.industry
    };

    const response = await this.generateResponse(prompt, context);
    return response;
  }

  // Build prompts for different use cases
  buildFollowUpPrompt(stage, existingQuestions, customerNotes) {
    return `You are an expert UiPath sales consultant. Generate 3-5 insightful follow-up questions for the ${stage.title} stage.

Current stage context:
${stage.title}

Existing questions in this category:
${Object.entries(existingQuestions).map(([category, questions]) => 
  `${category}:\n${questions.map(q => `- ${q}`).join('\n')}`
).join('\n\n')}

Customer notes/context:
${customerNotes || 'No additional context provided'}

Industry: ${SALES_CYCLE_DATA.industry}

Generate follow-up questions that:
1. Are specific to ${SALES_CYCLE_DATA.industry} industry
2. Build on the existing questions without repeating them
3. Help uncover deeper insights about the customer's situation
4. Are practical and actionable for a sales conversation
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

  buildObjectionPrompt(objection, context) {
    const stageContext = context.stage ? SALES_CYCLE_DATA.stages.find(s => s.id === context.stage) : null;
    
    return `You are an expert UiPath sales consultant. Provide a compelling response to this customer objection.

Objection: "${objection}"

Context:
- Industry: ${SALES_CYCLE_DATA.industry}
- Sales Stage: ${stageContext ? stageContext.title : 'Not specified'}
- Customer Notes: ${context.customerNotes || 'None provided'}

Your response should:
1. Acknowledge the customer's concern
2. Provide specific UiPath value propositions
3. Include relevant ${SALES_CYCLE_DATA.industry} industry examples
4. Be conversational and consultative, not pushy
5. Offer next steps or questions to continue the dialogue

Keep the response concise but comprehensive (2-3 paragraphs maximum).`;
  }

  buildInsightsPrompt(customerData, stage) {
    return `You are an expert UiPath sales consultant. Analyze this customer data and provide strategic insights for the ${stage.title} stage.

Customer Data:
${JSON.stringify(customerData, null, 2)}

Current Stage: ${stage.title}
Industry: ${SALES_CYCLE_DATA.industry}

Provide insights on:
1. Key opportunities based on their current situation
2. Potential risks or challenges to address
3. Recommended next steps for this stage
4. Specific UiPath solutions that align with their needs
5. Stakeholders who should be engaged

Format as clear, actionable bullet points.`;
  }

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

  // Test connection to AI provider
  async testConnection(provider = null) {
    const testProvider = provider || this.config.selectedProvider;
    const apiKey = this.config.apiKeys[testProvider];
    
    if (!apiKey) {
      return { success: false, error: 'No API key configured' };
    }

    try {
      const testPrompt = 'Respond with "Connection successful" if you receive this message.';
      const response = await this.providers[testProvider].generate({
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
}


// Claude (Anthropic) Provider
class ClaudeProvider {
  async generate({ prompt, context, model, temperature, maxTokens, apiKey }) {
    try {
      // Add CORS proxy for browser requests - this is a workaround for CORS issues
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
          // If response is not JSON, use the status text
        }
        throw new Error(`Claude API Error: ${errorMessage}`);
      }

      const data = await response.json();
      return data.content[0].text;
      
    } catch (fetchError) {
      // Provide more helpful error messages
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('network')) {
        throw new Error('Network error: Unable to reach Claude API. This may be due to CORS restrictions or network connectivity issues. Consider setting up a backend proxy server.');
      }
      throw fetchError;
    }
  }
}


// Global AI integration instance
let aiIntegration = null;

// Initialize AI integration
function initializeAI() {
  aiIntegration = new AIIntegration();
  return aiIntegration;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIIntegration, ClaudeProvider };
}