/**
 * AI Service Module
 * Secure AI integration with Claude API
 */

import apiSecurity from '../security/api-security.js';

class AIService {
  constructor() {
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
    this.defaultModel = 'claude-3-haiku-20240307';
    this.defaultSettings = {
      temperature: 0.7,
      maxTokens: 1000
    };
  }

  /**
   * Initialize AI service
   * @param {string} apiKey - Claude API key
   * @returns {Promise<boolean>} Success status
   */
  async initialize(apiKey) {
    if (!apiSecurity.validateApiKeyFormat(apiKey)) {
      throw new Error('Invalid API key format');
    }

    await apiSecurity.storeApiKey(apiKey);
    return this.testConnection();
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await this.generateResponse(
        'Respond with "Connection successful" if you receive this message.',
        { temperature: 0.1, maxTokens: 50 }
      );
      
      return response.includes('Connection successful');
    } catch (error) {
      console.error('AI connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate AI response
   * @param {string} prompt - Input prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} AI response
   */
  async generateResponse(prompt, options = {}) {
    const settings = { ...this.defaultSettings, ...options };
    
    const requestBody = {
      model: settings.model || this.defaultModel,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    try {
      const response = await apiSecurity.secureApiCall(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
      
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Generate follow-up questions for a stage
   * @param {Object} stage - Sales stage data
   * @param {Object} existingQuestions - Existing questions
   * @param {string} customerNotes - Customer context
   * @returns {Promise<Array>} Generated questions
   */
  async generateFollowUpQuestions(stage, existingQuestions, customerNotes = '') {
    const prompt = this.buildFollowUpPrompt(stage, existingQuestions, customerNotes);
    
    try {
      const response = await this.generateResponse(prompt);
      return this.parseFollowUpQuestions(response);
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
      throw error;
    }
  }

  /**
   * Generate objection response
   * @param {string} objection - Customer objection
   * @param {Object} context - Additional context
   * @returns {Promise<string>} Objection response
   */
  async generateObjectionResponse(objection, context = {}) {
    const prompt = this.buildObjectionPrompt(objection, context);
    
    try {
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Failed to generate objection response:', error);
      throw error;
    }
  }

  /**
   * Generate customer insights
   * @param {Object} customerData - Customer information
   * @param {Object} stage - Current sales stage
   * @returns {Promise<string>} Customer insights
   */
  async generateInsights(customerData, stage) {
    const prompt = this.buildInsightsPrompt(customerData, stage);
    
    try {
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  }

  /**
   * Build follow-up questions prompt
   * @param {Object} stage - Sales stage
   * @param {Object} existingQuestions - Existing questions
   * @param {string} customerNotes - Customer notes
   * @returns {string} Formatted prompt
   */
  buildFollowUpPrompt(stage, existingQuestions, customerNotes) {
    const existingQuestionsText = Object.entries(existingQuestions)
      .map(([category, questions]) => 
        `${category}:\n${questions.map(q => `- ${q}`).join('\n')}`
      )
      .join('\n\n');

    return `You are an expert UiPath sales consultant. Generate 3-5 insightful follow-up questions for the ${stage.title} stage.

Current stage context:
${stage.title}

Existing questions in this category:
${existingQuestionsText}

Customer notes/context:
${customerNotes || 'No additional context provided'}

Industry: UiPath automation solutions

Generate follow-up questions that:
1. Are specific to enterprise automation and RPA
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

  /**
   * Build objection handling prompt
   * @param {string} objection - Customer objection
   * @param {Object} context - Additional context
   * @returns {string} Formatted prompt
   */
  buildObjectionPrompt(objection, context) {
    return `You are an expert UiPath sales consultant. Provide a compelling response to this customer objection.

Objection: "${objection}"

Context:
- Industry: ${context.industry || 'Enterprise software'}
- Sales Stage: ${context.stage?.title || 'Not specified'}
- Customer Notes: ${context.customerNotes || 'None provided'}

Your response should:
1. Acknowledge the customer's concern
2. Provide specific UiPath value propositions
3. Include relevant enterprise automation examples
4. Be conversational and consultative, not pushy
5. Offer next steps or questions to continue the dialogue

Keep the response concise but comprehensive (2-3 paragraphs maximum).`;
  }

  /**
   * Build customer insights prompt
   * @param {Object} customerData - Customer data
   * @param {Object} stage - Sales stage
   * @returns {string} Formatted prompt
   */
  buildInsightsPrompt(customerData, stage) {
    return `You are an expert UiPath sales consultant. Analyze this customer data and provide strategic insights for the ${stage.title} stage.

Customer Data:
${JSON.stringify(customerData, null, 2)}

Current Stage: ${stage.title}
Industry: Enterprise automation solutions

Provide insights on:
1. Key opportunities based on their current situation
2. Potential risks or challenges to address
3. Recommended next steps for this stage
4. Specific UiPath solutions that align with their needs
5. Stakeholders who should be engaged

Format as clear, actionable bullet points.`;
  }

  /**
   * Parse follow-up questions response
   * @param {string} response - AI response
   * @returns {Array} Parsed questions
   */
  parseFollowUpQuestions(response) {
    try {
      // Clean up JSON formatting
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to text parsing:', error);
    }

    // Fallback text parsing
    const questions = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    let currentCategory = 'Generated Questions';
    lines.forEach(line => {
      if (line.includes(':') && !line.startsWith('-') && !line.startsWith('•')) {
        const parts = line.split(':');
        if (parts.length >= 2 && !parts[1].includes('?')) {
          currentCategory = parts[0].trim();
          return;
        }
      }
      
      if (line.match(/^[-•]\s+.+\?/)) {
        const questionText = line.replace(/^[-•]\s+/, '').trim();
        questions.push({
          category: currentCategory,
          question: questionText,
          purpose: 'Uncover deeper insights'
        });
      }
    });
    
    return questions;
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    const securityStatus = apiSecurity.getSecurityStatus();
    
    return {
      initialized: securityStatus.hasApiKey,
      apiKeyExpiry: securityStatus.keyExpiry,
      rateLimitStatus: securityStatus.rateLimitStatus,
      model: this.defaultModel,
      settings: this.defaultSettings
    };
  }

  /**
   * Clear API key and reset service
   */
  reset() {
    apiSecurity.clearStoredApiKey();
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;