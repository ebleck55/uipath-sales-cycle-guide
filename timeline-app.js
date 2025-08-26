/**
 * Timeline Navigation UiPath Sales Cycle Guide
 * Modern timeline-based navigation with stage progression
 */

// ==================== SECURITY MODULE ====================
class HTMLSanitizer {
  constructor() {
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li']
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    return this.escapeHtml(html);
  }

  // New method for rendering safe HTML content
  renderSafeHTML(content) {
    if (typeof content !== 'string') return '';
    
    // Allow specific safe HTML tags and escape the rest
    return content
      .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>')
      .replace(/<strong>(.*?)<\/strong>/gi, '<strong>$1</strong>')
      .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>')
      .replace(/<em>(.*?)<\/em>/gi, '<em>$1</em>')
      .replace(/&lt;br&gt;/gi, '<br>')
      .replace(/<br>/gi, '<br>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
}

const sanitizer = new HTMLSanitizer();

// ==================== STATE MANAGEMENT ====================
class AppState {
  constructor() {
    this.state = {
      currentIndustry: 'banking',
      currentStage: 0,
      adminMode: false,
      checkboxes: new Map(),
      notes: new Map()
    };
    this.listeners = new Map();
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notifyListeners(key, value, oldValue);
  }

  notifyListeners(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  }

  toggleCheckbox(checkboxId, checked) {
    const checkboxes = new Map(this.state.checkboxes);
    if (checked) {
      checkboxes.set(checkboxId, true);
    } else {
      checkboxes.delete(checkboxId);
    }
    this.set('checkboxes', checkboxes);
  }

  updateNote(noteId, content) {
    const notes = new Map(this.state.notes);
    if (content && content.trim()) {
      notes.set(noteId, content);
    } else {
      notes.delete(noteId);
    }
    this.set('notes', notes);
  }

  clearFormState() {
    this.set('checkboxes', new Map());
    this.set('notes', new Map());
  }
}

const appState = new AppState();

// ==================== DOM UTILITIES ====================
function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

// ==================== AI CHATBOT ====================
class AIChatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.knowledgeBase = null;
    this.initializeKnowledgeBase();
    this.initializeEventListeners();
  }

  initializeKnowledgeBase() {
    // Build searchable knowledge base from SALES_CYCLE_DATA
    this.knowledgeBase = {
      personas: {},
      questions: {},
      objections: {},
      outcomes: {},
      resources: {},
      stages: []
    };

    // Index all personas
    Object.keys(SALES_CYCLE_DATA.personas).forEach(industry => {
      this.knowledgeBase.personas[industry] = SALES_CYCLE_DATA.personas[industry].map(persona => ({
        title: persona.title,
        world: persona.world,
        cares: persona.cares,
        help: persona.help,
        industry: industry
      }));
    });

    // Index all stages and their content
    SALES_CYCLE_DATA.stages.forEach((stage, stageIndex) => {
      this.knowledgeBase.stages.push({
        title: stage.title,
        index: stageIndex,
        outcomes: stage.outcomes || [],
        questions: stage.questions || {},
        objections: stage.objections || [],
        resources: stage.resources || {}
      });

      // Index questions
      Object.entries(stage.questions || {}).forEach(([category, questions]) => {
        this.knowledgeBase.questions[category] = questions.map(q => ({
          question: q,
          category: category,
          stage: stage.title,
          stageIndex: stageIndex
        }));
      });

      // Index objections
      (stage.objections || []).forEach(objection => {
        if (!this.knowledgeBase.objections[stage.title]) {
          this.knowledgeBase.objections[stage.title] = [];
        }
        this.knowledgeBase.objections[stage.title].push({
          question: objection.q,
          answer: objection.a,
          stage: stage.title,
          stageIndex: stageIndex
        });
      });

      // Index outcomes
      (stage.outcomes || []).forEach(outcome => {
        if (!this.knowledgeBase.outcomes[stage.title]) {
          this.knowledgeBase.outcomes[stage.title] = [];
        }
        this.knowledgeBase.outcomes[stage.title].push({
          outcome: outcome,
          stage: stage.title,
          stageIndex: stageIndex
        });
      });
    });
  }

  initializeEventListeners() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const clearChat = document.getElementById('clear-chat');

    chatToggle?.addEventListener('click', () => this.toggleChat());
    chatClose?.addEventListener('click', () => this.closeChat());
    chatSend?.addEventListener('click', () => this.sendMessage());
    clearChat?.addEventListener('click', () => this.clearChat());

    // Handle input events
    chatInput?.addEventListener('input', (e) => {
      const charCount = e.target.value.length;
      document.getElementById('char-count').textContent = charCount;
      chatSend.disabled = charCount === 0;
    });

    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !chatSend.disabled) {
        this.sendMessage();
      }
    });

    // Handle quick actions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-action-btn')) {
        const action = e.target.closest('.quick-action-btn').dataset.action;
        this.handleQuickAction(action);
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('chat-window');
    const quickActions = document.getElementById('quick-actions');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-icon');

    if (this.isOpen) {
      chatWindow.classList.remove('hidden');
      quickActions.classList.add('hidden');
      chatIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.getElementById('chat-input')?.focus();
    } else {
      chatWindow.classList.add('hidden');
      quickActions.classList.remove('hidden');
      chatIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }
  }

  closeChat() {
    this.isOpen = false;
    this.toggleChat();
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Clear input
    input.value = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('chat-send').disabled = true;

    // Add user message
    this.addMessage(message, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Process the message
      const response = await this.processMessage(message);
      
      // Hide typing indicator
      this.hideTypingIndicator();

      // Add bot response
      this.addMessage(response.text, 'bot', response.actions);
    } catch (error) {
      console.error('Chat error:', error);
      this.hideTypingIndicator();
      this.addMessage('I apologize, but I encountered an error. Please try asking your question again.', 'bot');
    }
  }

  addMessage(text, sender, actions = null) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
      messageDiv.className = 'flex justify-end';
      messageDiv.innerHTML = `
        <div class="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
          <p class="text-sm">${this.escapeHtml(text)}</p>
        </div>
      `;
    } else {
      messageDiv.className = 'flex items-start space-x-3';
      messageDiv.innerHTML = `
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
          <p class="text-sm text-gray-800">${text}</p>
          ${actions ? this.renderActions(actions) : ''}
        </div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in conversation history
    this.conversationHistory.push({ text, sender, timestamp: new Date() });
  }

  renderActions(actions) {
    return `
      <div class="mt-3 space-y-2">
        ${actions.map(action => `
          <button onclick="window.chatbot.handleAction('${action.type}', '${action.data}')" class="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  async processMessage(message) {
    // First, search local knowledge base
    const localResults = this.searchKnowledgeBase(message);
    
    if (localResults.length > 0) {
      return this.formatLocalResponse(localResults, message);
    }

    // If no local results, try AI response (if API key available)
    if (this.hasAICredentials()) {
      return await this.generateAIResponse(message);
    }

    // Fallback to general guidance
    return this.generateFallbackResponse(message);
  }

  searchKnowledgeBase(query) {
    const results = [];
    const queryLower = query.toLowerCase();

    // Search personas
    Object.values(this.knowledgeBase.personas).flat().forEach(persona => {
      if (this.matchesQuery(persona.title + ' ' + persona.world + ' ' + persona.cares, queryLower)) {
        results.push({ type: 'persona', data: persona, relevance: this.calculateRelevance(persona, queryLower) });
      }
    });

    // Search questions
    Object.values(this.knowledgeBase.questions).flat().forEach(q => {
      if (this.matchesQuery(q.question + ' ' + q.category, queryLower)) {
        results.push({ type: 'question', data: q, relevance: this.calculateRelevance(q, queryLower) });
      }
    });

    // Search objections
    Object.values(this.knowledgeBase.objections).flat().forEach(obj => {
      if (this.matchesQuery(obj.question + ' ' + obj.answer, queryLower)) {
        results.push({ type: 'objection', data: obj, relevance: this.calculateRelevance(obj, queryLower) });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  matchesQuery(text, query) {
    const words = query.split(' ');
    const textLower = text.toLowerCase();
    return words.some(word => word.length > 2 && textLower.includes(word));
  }

  calculateRelevance(item, query) {
    const text = JSON.stringify(item).toLowerCase();
    const words = query.split(' ');
    let score = 0;
    words.forEach(word => {
      if (word.length > 2 && text.includes(word)) {
        score += word.length;
      }
    });
    return score;
  }

  formatLocalResponse(results, originalQuery) {
    const primaryResult = results[0];
    let response = '';
    let actions = [];

    switch (primaryResult.type) {
      case 'persona':
        const persona = primaryResult.data;
        response = `I found information about the **${persona.title}** persona in ${persona.industry}:\n\n**Their World:** ${persona.world}\n\n**What They Care About:** ${persona.cares}`;
        actions = [
          { type: 'navigate', data: `personas-${persona.industry}`, label: '📋 View All Personas' },
          { type: 'search', data: `${persona.title} objections`, label: '❓ Common Objections' }
        ];
        break;
        
      case 'question':
        const question = primaryResult.data;
        response = `Here's a key discovery question from the **${question.stage}** stage:\n\n"${question.question}"\n\n**Category:** ${question.category}`;
        actions = [
          { type: 'navigate', data: `stage-${question.stageIndex}`, label: '📊 View Full Stage' },
          { type: 'search', data: `${question.category} questions`, label: '❓ More Questions' }
        ];
        break;
        
      case 'objection':
        const objection = primaryResult.data;
        response = `Here's how to handle this objection from **${objection.stage}**:\n\n**Objection:** "${objection.question}"\n\n**Suggested Response:** ${objection.answer}`;
        actions = [
          { type: 'navigate', data: `stage-${objection.stageIndex}`, label: '📊 View Full Stage' },
          { type: 'search', data: 'objection handling', label: '❓ More Objections' }
        ];
        break;
    }

    if (results.length > 1) {
      response += `\n\n*I found ${results.length} related items. Would you like me to show more?*`;
      actions.push({ type: 'search', data: originalQuery, label: '🔍 Show More Results' });
    }

    return { text: response, actions };
  }

  generateFallbackResponse(message) {
    const keywords = message.toLowerCase();
    
    if (keywords.includes('persona') || keywords.includes('decision maker')) {
      return {
        text: "I can help you find information about decision makers and personas! Try asking about specific roles like 'COO', 'CIO', or 'Compliance Officer'.",
        actions: [
          { type: 'quickAction', data: 'search-personas', label: '👥 Browse All Personas' }
        ]
      };
    }
    
    if (keywords.includes('objection') || keywords.includes('handle')) {
      return {
        text: "I can help you handle objections! Each sales stage has common objections with suggested responses.",
        actions: [
          { type: 'quickAction', data: 'search-objections', label: '❓ View Common Objections' }
        ]
      };
    }
    
    if (keywords.includes('question') || keywords.includes('discovery')) {
      return {
        text: "I can help you find the right discovery questions! Each stage has categorized questions to guide your conversations.",
        actions: [
          { type: 'quickAction', data: 'search-questions', label: '❓ View Discovery Questions' }
        ]
      };
    }

    return {
      text: "I can help you with information about:\n• **Personas** - Decision makers and their motivations\n• **Objections** - Common objections and responses\n• **Discovery Questions** - Questions for each sales stage\n• **Use Cases** - Industry-specific examples\n\nWhat would you like to explore?",
      actions: [
        { type: 'quickAction', data: 'search-personas', label: '👥 Personas' },
        { type: 'quickAction', data: 'search-objections', label: '❓ Objections' },
        { type: 'quickAction', data: 'search-questions', label: '💬 Questions' }
      ]
    };
  }

  hasAICredentials() {
    return sessionStorage.getItem('claude_api_key') !== null;
  }

  async generateAIResponse(message) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    
    const prompt = `You are a UiPath sales expert assistant. The user is asking: "${message}". 

    Based on this UiPath Sales Cycle Guide content, provide helpful guidance. Focus on:
    - Sales processes and methodologies
    - Handling objections
    - Discovery questions
    - Persona insights
    - Use cases and value propositions

    Keep your response conversational, helpful, and focused on sales guidance. If the question is outside sales topics, politely redirect to sales-related assistance.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error('AI request failed');

      const data = await response.json();
      return {
        text: data.content[0]?.text || 'I apologize, but I could not generate a response.',
        actions: []
      };
    } catch (error) {
      console.error('AI response error:', error);
      return this.generateFallbackResponse(message);
    }
  }

  handleAction(type, data) {
    switch (type) {
      case 'navigate':
        // Navigate to specific section
        if (data.startsWith('stage-')) {
          const stageIndex = parseInt(data.split('-')[1]);
          appState.set('currentStage', stageIndex);
          this.addMessage(`Navigated to ${SALES_CYCLE_DATA.stages[stageIndex]?.title || 'stage'}`, 'bot');
        }
        break;
      case 'search':
        this.addMessage(data, 'user');
        this.sendMessage();
        break;
      case 'quickAction':
        this.handleQuickAction(data);
        break;
    }
  }

  handleQuickAction(action) {
    this.openChat();
    
    switch (action) {
      case 'search-personas':
        this.addMessage('Tell me about the personas', 'user');
        break;
      case 'search-objections':
        this.addMessage('How do I handle common objections?', 'user');
        break;
      case 'search-questions':
        this.addMessage('What are good discovery questions?', 'user');
        break;
    }
    
    // Trigger search
    setTimeout(() => this.sendMessage(), 100);
  }

  openChat() {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  showTypingIndicator() {
    document.getElementById('typing-indicator')?.classList.remove('hidden');
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    document.getElementById('typing-indicator')?.classList.add('hidden');
  }

  clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
          <p class="text-sm text-gray-800">Hi! I'm your UiPath Sales Assistant. I can help you find content, answer questions about sales processes, personas, objections, and more. What would you like to know?</p>
        </div>
      </div>
    `;
    this.conversationHistory = [];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ==================== EDIT SYSTEM ====================
class ContentEditor {
  constructor() {
    this.quillEditor = null;
    this.currentEditData = null;
  }

  initializeQuill() {
    if (this.quillEditor) return;
    
    this.quillEditor = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Enter your content here...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });
  }

  openEditor(type, data, element) {
    this.currentEditData = { type, data, element };
    
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const editorContainer = document.getElementById('editor-container');
    const textarea = document.getElementById('modal-textarea');
    
    // Set title based on content type
    const titles = {
      'persona-field': 'Edit Persona Field',
      'outcome': 'Edit Outcome',
      'question': 'Edit Discovery Question',
      'objection-question': 'Edit Objection',
      'objection-answer': 'Edit Objection Response',
      'resource': 'Edit Resource',
      'resource-overview': 'Edit Resource Overview',
      'resource-why': 'Edit Resource Why',
      'use-case': 'Edit Use Case',
      'initial-persona': 'Edit Initial Persona',
      'uipath-team': 'Edit UiPath Team Member',
      'use-case-category': 'Edit Use Case Category',
      'use-case-item': 'Edit Use Case Item',
      // New entry types
      'new-outcome': 'Add New Outcome',
      'new-question': 'Add New Discovery Question',
      'new-objection': 'Add New Objection',
      'new-resource': 'Add New Resource',
      'new-use-case': 'Add New Use Case',
      'new-persona': 'Add New Persona',
      'new-initial-persona': 'Add New Initial Persona',
      'new-uipath-team': 'Add New UiPath Team Member',
      'new-use-case-category': 'Add New Use Case Category',
      'new-use-case-item': 'Add New Use Case Item'
    };
    modalTitle.textContent = titles[type] || 'Edit Content';
    
    // Initialize Quill if not already done
    this.initializeQuill();
    
    // Show editor and hide textarea
    editorContainer.classList.remove('hidden');
    textarea.classList.add('hidden');
    
    // Set content in editor
    const currentContent = this.getCurrentContent(type, data, element);
    this.quillEditor.root.innerHTML = currentContent;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus editor
    setTimeout(() => this.quillEditor.focus(), 100);
  }

  getCurrentContent(type, data, element) {
    switch (type) {
      case 'persona-field':
        return data.content || '';
      case 'outcome':
      case 'question':
        return data.text || '';
      case 'objection-question':
        return data.question || '';
      case 'objection-answer':
        return data.answer || '';
      case 'resource':
        return data.name || '';
      case 'resource-overview':
        return data.overview || '';
      case 'resource-why':
        return data.why || '';
      case 'use-case':
        return data.name || '';
      case 'initial-persona':
      case 'uipath-team':
        return data.text || '';
      case 'use-case-category':
        return data.category || '';
      case 'use-case-item':
        return data.name || '';
      // New entry types start with empty content
      case 'new-outcome':
      case 'new-question':
      case 'new-objection':
      case 'new-resource':
      case 'new-use-case':
      case 'new-persona':
      case 'new-initial-persona':
      case 'new-uipath-team':
      case 'new-use-case-category':
      case 'new-use-case-item':
        return '';
      default:
        return element?.textContent || '';
    }
  }

  saveContent() {
    if (!this.currentEditData || !this.quillEditor) return;
    
    const content = this.quillEditor.root.innerHTML;
    const { type, data, element } = this.currentEditData;
    
    // Update the data structure
    this.updateData(type, data, content);
    
    // Update the UI element
    this.updateUIElement(type, element, content);
    
    // Save to localStorage for persistence
    this.saveToStorage();
    
    // Close modal
    this.closeEditor();
    
    // Show success notification
    this.showNotification('Content updated successfully!', 'success');
  }

  updateData(type, data, content) {
    const textContent = this.htmlToText(content);
    
    switch (type) {
      case 'persona-field':
        if (data.field === 'title') data.persona.title = textContent;
        else if (data.field === 'world') data.persona.world = content;
        else if (data.field === 'cares') data.persona.cares = content;
        else if (data.field === 'help') data.persona.help = content;
        break;
      case 'outcome':
        data.outcome = textContent;
        break;
      case 'question':
        data.question = content;
        break;
      case 'objection-question':
        data.objection.q = textContent;
        break;
      case 'objection-answer':
        data.objection.a = content;
        break;
      case 'resource':
        data.resource.name = textContent;
        break;
      case 'resource-overview':
        data.resource.overview = content;
        break;
      case 'resource-why':
        data.resource.why = content;
        break;
      case 'use-case':
        data.useCase.name = textContent;
        break;
      case 'initial-persona':
        data.list[data.index] = content;
        break;
      case 'uipath-team':
        data.list[data.index] = content;
        break;
      case 'use-case-category':
        data.categoryData.category = textContent;
        break;
      case 'use-case-item':
        data.useCaseData.name = textContent;
        break;
      
      // Handle new entries
      case 'new-outcome':
        SALES_CYCLE_DATA.stages[data.stageIndex].outcomes.push(textContent);
        break;
      case 'new-question':
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].questions[data.category]) {
          SALES_CYCLE_DATA.stages[data.stageIndex].questions[data.category] = [];
        }
        SALES_CYCLE_DATA.stages[data.stageIndex].questions[data.category].push(content);
        break;
      case 'new-objection':
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].objections) {
          SALES_CYCLE_DATA.stages[data.stageIndex].objections = [];
        }
        SALES_CYCLE_DATA.stages[data.stageIndex].objections.push({
          q: textContent,
          a: 'Add your suggested response here...'
        });
        break;
      case 'new-resource':
        const currentIndustry = appState.get('currentIndustry');
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].resources) {
          SALES_CYCLE_DATA.stages[data.stageIndex].resources = {};
        }
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].resources[currentIndustry]) {
          SALES_CYCLE_DATA.stages[data.stageIndex].resources[currentIndustry] = [];
        }
        SALES_CYCLE_DATA.stages[data.stageIndex].resources[currentIndustry].push({
          name: textContent,
          link: '#',
          overview: 'Add overview here...',
          why: 'Add why this is useful here...'
        });
        break;
      case 'new-persona':
        const industry = appState.get('currentIndustry');
        SALES_CYCLE_DATA.personas[industry].push({
          title: textContent,
          world: 'Describe their world here...',
          cares: 'Describe what they care about here...',
          help: 'Describe how UiPath helps here...'
        });
        break;
      case 'new-initial-persona':
        SALES_CYCLE_DATA.stages[data.stageIndex].initialPersonas.push(content);
        break;
      case 'new-uipath-team':
        SALES_CYCLE_DATA.stages[data.stageIndex].uipathTeam.push(content);
        break;
      case 'new-use-case-category':
        // For static data, we would need to modify the useCasesData structure
        // This is a placeholder for the functionality
        console.log('Adding new use case category:', textContent);
        break;
      case 'new-use-case-item':
        // For static data, we would need to modify the specific category's cases array
        console.log('Adding new use case item:', textContent);
        break;
    }
  }

  updateUIElement(type, element, content) {
    // For new entries, trigger re-rendering of the entire section
    if (type.startsWith('new-')) {
      this.triggerSectionRerender(type);
      return;
    }
    
    // For existing entries, update the element directly
    if (type === 'persona-field' && ['title'].includes(this.currentEditData.data.field)) {
      element.innerHTML = this.htmlToText(content);
    } else if (element) {
      element.innerHTML = content;
    }
  }

  triggerSectionRerender(type) {
    // Get the main app instance
    const app = window.appInstance || this.app;
    if (!app) return;

    switch (type) {
      case 'new-outcome':
      case 'new-question':
      case 'new-objection':
      case 'new-resource':
      case 'new-initial-persona':
      case 'new-uipath-team':
        // Re-render the current stage
        const currentStage = appState.get('currentStage');
        app.renderStageContent(currentStage);
        break;
      case 'new-persona':
        // Re-render personas section
        app.renderPersonas();
        break;
      case 'new-use-case':
      case 'new-use-case-category':
      case 'new-use-case-item':
        // Re-render use cases section
        app.renderUseCases();
        break;
    }
  }

  htmlToText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  saveToStorage() {
    try {
      localStorage.setItem('sales_cycle_data_edits', JSON.stringify(SALES_CYCLE_DATA));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  closeEditor() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    this.currentEditData = null;
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }
}

// ==================== MAIN APPLICATION ====================
class TimelineUiPathApp {
  constructor() {
    this.initialized = false;
    this.contentEditor = new ContentEditor();
    this.chatbot = null;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing Timeline UiPath Sales Guide...');
      
      // Initialize UI
      this.initializeUI();
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      // Load and render data
      this.loadData();
      
      this.initialized = true;
      console.log('Application initialized successfully');
      
      // Hide loading indicator
      const loading = $('#app-loading');
      if (loading) {
        loading.style.display = 'none';
      }
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh and try again.');
    }
  }

  initializeUI() {
    // Subscribe to state changes
    appState.subscribe('currentStage', (stageIndex) => {
      this.renderStageContent(stageIndex);
      this.updateTimelineUI(stageIndex);
    });

    appState.subscribe('currentIndustry', (industry) => {
      this.updateIndustryUI(industry);
      this.loadData();
    });

    appState.subscribe('adminMode', (enabled) => {
      document.body.classList.toggle('admin-mode', enabled);
      this.updateAdminUI(enabled);
    });
  }

  initializeEventListeners() {
    // Global click handler
    document.addEventListener('click', (e) => {
      // Handle timeline dot clicks
      if (e.target.closest('.timeline-dot')) {
        e.preventDefault();
        const dot = e.target.closest('.timeline-dot');
        const stageIndex = parseInt(dot.dataset.stage);
        if (!isNaN(stageIndex)) {
          appState.set('currentStage', stageIndex);
        }
      }
      
      // Handle export notes
      if (e.target.closest('.export-notes-btn')) {
        e.preventDefault();
        this.handleExportNotes();
      }
      
      // Handle clear all
      if (e.target.closest('.clear-all-btn')) {
        e.preventDefault();
        this.handleClearAll();
      }
      
      // Handle admin mode toggle
      if (e.target.closest('#admin-mode-btn')) {
        e.preventDefault();
        this.toggleAdminMode();
      }

      // Handle edit button clicks
      if (e.target.closest('.edit-btn')) {
        e.preventDefault();
        this.handleEditClick(e.target.closest('.edit-btn'));
      }

      // Handle modal save/cancel
      if (e.target.closest('#modal-save')) {
        e.preventDefault();
        this.contentEditor.saveContent();
      }
      if (e.target.closest('#modal-cancel') || e.target.closest('.modal-close')) {
        e.preventDefault();
        this.contentEditor.closeEditor();
      }
      
      // Handle industry switcher
      if (e.target.closest('.industry-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.industry-btn');
        const industry = btn.dataset.industry;
        if (industry) {
          appState.set('currentIndustry', industry);
        }
      }
      
      // Handle mobile menu
      if (e.target.closest('#mobile-menu-btn')) {
        e.preventDefault();
        const menu = $('#mobile-menu');
        if (menu) {
          menu.classList.toggle('hidden');
        }
      }

      // Handle collapsible sections
      if (e.target.closest('.collapsible-header')) {
        e.preventDefault();
        const header = e.target.closest('.collapsible-header');
        const section = header.parentElement;
        const content = section.querySelector('.collapsible-content');
        const chevron = header.querySelector('.chevron-icon');
        
        if (content && chevron) {
          const isHidden = content.classList.contains('hidden');
          content.classList.toggle('hidden');
          chevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
          
          // Update the hint text
          const hintText = header.querySelector('span');
          if (hintText) {
            // Removed hint text functionality
          }
        }
      }
      
      // Handle AI response buttons
      if (e.target.closest('.ai-question-response-btn')) {
        e.preventDefault();
        this.handleAIResponse(e.target.closest('.ai-question-response-btn'));
      }
      
      // Handle AI objection response buttons
      if (e.target.closest('.ai-objection-response-btn')) {
        e.preventDefault();
        this.handleAIObjectionResponse(e.target.closest('.ai-objection-response-btn'));
      }

      // Handle navigation arrows
      if (e.target.closest('.nav-prev')) {
        e.preventDefault();
        this.navigateToPreviousStage();
      }
      
      if (e.target.closest('.nav-next')) {
        e.preventDefault();
        this.navigateToNextStage();
      }
    });
    
    // Handle checkbox changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const checkboxId = e.target.dataset.id;
        if (checkboxId) {
          appState.toggleCheckbox(checkboxId, e.target.checked);
          e.target.closest('label')?.classList.toggle('checked-item', e.target.checked);
        }
      }
    });
    
    // Handle textarea input
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('note-textarea')) {
        const noteId = e.target.dataset.noteId;
        if (noteId) {
          appState.updateNote(noteId, e.target.value);
        }
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateToPreviousStage();
      } else if (e.key === 'ArrowRight') {
        this.navigateToNextStage();
      }
    });
  }

  loadData() {
    if (typeof SALES_CYCLE_DATA === 'undefined') {
      console.error('Sales cycle data not loaded, waiting...');
      setTimeout(() => {
        if (typeof SALES_CYCLE_DATA === 'undefined') {
          console.error('Sales cycle data still not loaded');
          this.showError('Failed to load sales data. Please refresh the page.');
          return;
        }
        this.loadData();
      }, 500);
      return;
    }
    
    console.log('Loading data with', SALES_CYCLE_DATA.stages?.length, 'stages');
    
    // Initialize AI chatbot after data is loaded
    if (!this.chatbot) {
      try {
        this.chatbot = new AIChatbot();
        window.chatbot = this.chatbot; // Make globally accessible for action buttons
        console.log('AI Chatbot initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AI Chatbot:', error);
        // Continue without chatbot if initialization fails
      }
    }

    // Make app instance globally accessible for content editor
    window.appInstance = this;
    
    // Render personas
    this.renderPersonas();
    this.renderUseCases();
    
    // Render timeline
    this.renderTimeline();
    
    // Render initial stage content
    this.renderStageContent(appState.get('currentStage') || 0);
    
    // Set default expanded states
    this.setDefaultExpandedStates();
  }

  renderTimeline() {
    const container = $('#timeline-container');
    if (!container || !SALES_CYCLE_DATA.stages) return;
    
    const stages = SALES_CYCLE_DATA.stages;
    const currentStage = appState.get('currentStage') || 0;
    
    const timelineHTML = `
      <div class="relative">
        <!-- Progress Line -->
        <div class="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
        <div class="absolute top-8 left-0 h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500" 
             style="width: ${((currentStage + 1) / stages.length) * 100}%"></div>
        
        <!-- Timeline Dots -->
        <div class="relative flex justify-between items-start">
          ${stages.map((stage, index) => {
            const isActive = index === currentStage;
            
            return `
              <div class="timeline-dot flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105"
                   data-stage="${index}">
                <div class="relative">
                  <div class="w-16 h-16 rounded-full ${isActive ? 'bg-orange-500' : 'bg-gray-300'} flex items-center justify-center text-white font-bold text-lg mb-3 
                              transition-all duration-300 group-hover:shadow-lg ${isActive ? 'ring-4 ring-orange-200 scale-110' : ''} hover:bg-orange-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  ${isActive ? '<div class="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25"></div>' : ''}
                </div>
                <div class="text-center">
                  <div class="font-semibold text-sm ${isActive ? 'text-orange-600' : 'text-gray-600'} mb-1 max-w-20 leading-tight">${sanitizer.escapeHtml(stage.title)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = timelineHTML;
  }

  renderPersonas() {
    const container = $('#personas-container');
    if (!container || !SALES_CYCLE_DATA.personas) return;
    
    const currentIndustry = appState.get('currentIndustry');
    const personas = SALES_CYCLE_DATA.personas[currentIndustry] || [];
    
    const personasHTML = personas.map((persona, index) => `
      <div class="persona-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div class="collapsible-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-section="persona-card">
          <div class="flex justify-between items-center">
            <div class="flex items-center flex-1">
              <svg class="chevron-icon w-4 h-4 mr-2 text-blue-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-lg font-semibold text-blue-700" data-editable>
                ${sanitizer.renderSafeHTML(persona.title)}
              </h3>
              <button class="edit-btn hidden ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                      data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="title">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-4 pb-4">
          <div class="space-y-2 pt-2 border-t border-gray-100">
            <div class="relative">
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-700 mb-1">Their World:</h4>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                        data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="world">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed" data-editable>${sanitizer.renderSafeHTML(persona.world || '')}</p>
            </div>
            <div class="relative">
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-700 mb-1">What They Care About:</h4>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                        data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="cares">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed" data-editable>${sanitizer.renderSafeHTML(persona.cares || '')}</p>
            </div>
            <div class="relative">
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-700 mb-1">How UiPath Helps:</h4>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                        data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="help">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed" data-editable>${sanitizer.renderSafeHTML(persona.help || '')}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Add "Add New Persona" button
    const addNewPersonaButton = `
      <div class="edit-btn hidden mt-4">
        <button class="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors" 
                data-edit-type="new-persona" data-edit-id="${currentIndustry}">
          <div class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Persona
          </div>
        </button>
      </div>
    `;
    
    container.innerHTML = (personasHTML || '<p class="text-gray-500 col-span-full text-center">No personas available for this industry.</p>') + addNewPersonaButton;
  }

  renderUseCases() {
    const container = document.getElementById('use-cases-container');
    if (!container) return;
    
    const currentIndustry = appState.get('currentIndustry');
    
    const useCasesData = {
      banking: [
        { category: 'Consumer Banking', color: 'blue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', cases: [
          { name: 'Consumer Banking Operations', page: 10 },
          { name: 'Credit Risk Assessment', page: 15 },
          { name: 'Commercial Lending', page: 20 },
          { name: 'Trade Finance Automation', page: 25 }
        ]},
        { category: 'Capital Markets', color: 'indigo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', cases: [
          { name: 'Capital Markets Processing', page: 30 },
          { name: 'Wealth Management', page: 35 },
          { name: 'Payments Processing', page: 40 },
          { name: 'Treasury Operations', page: 45 }
        ]}
      ],
      insurance: [
        { category: 'Core Insurance', color: 'green', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', cases: [
          { name: 'Claims Processing', page: 50 },
          { name: 'Policy Administration', page: 52 },
          { name: 'Underwriting Automation', page: 54 },
          { name: 'Customer Onboarding', page: 56 }
        ]},
        { category: 'Operations', color: 'teal', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cases: [
          { name: 'Regulatory Reporting', page: 58 },
          { name: 'Fraud Detection', page: 60 },
          { name: 'Risk Assessment', page: 62 },
          { name: 'Compliance Monitoring', page: 64 }
        ]}
      ]
    };

    // Common horizontal functions for both industries
    const horizontalFunctions = [
      { category: 'IT Operations', color: 'purple', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cases: [
        { name: 'ServiceNow Integration', page: 66 },
        { name: 'System Monitoring', page: 68 },
        { name: 'Data Migration', page: 70 },
        { name: 'Infrastructure Automation', page: 72 }
      ]},
      { category: 'Finance & Operations', color: 'orange', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', cases: [
        { name: 'Invoice Processing', page: 74 },
        { name: 'Financial Reconciliation', page: 76 },
        { name: 'Expense Management', page: 78 },
        { name: 'Procurement Automation', page: 80 }
      ]}
    ];

    const industryUseCases = useCasesData[currentIndustry] || [];
    const allUseCases = [...industryUseCases, ...horizontalFunctions];

    const getColorClasses = (color) => {
      const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-900', link: 'text-blue-700', linkHover: 'hover:text-blue-900' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', link: 'text-indigo-700', linkHover: 'hover:text-indigo-900' },
        green: { bg: 'bg-green-50', text: 'text-green-900', link: 'text-green-700', linkHover: 'hover:text-green-900' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-900', link: 'text-teal-700', linkHover: 'hover:text-teal-900' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-900', link: 'text-purple-700', linkHover: 'hover:text-purple-900' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-900', link: 'text-orange-700', linkHover: 'hover:text-orange-900' }
      };
      return colorMap[color] || colorMap.blue;
    };

    const useCasesHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        ${allUseCases.map((category, categoryIndex) => {
          const colors = getColorClasses(category.color);
          return `
          <div class="${colors.bg} rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold ${colors.text} flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${category.icon}"/>
                </svg>
                <span data-editable>${sanitizer.renderSafeHTML(category.category)}</span>
              </h3>
              <button class="edit-btn hidden p-1 text-gray-400 hover:text-${category.color}-600 transition-colors" 
                      data-edit-type="use-case-category" data-edit-id="${categoryIndex}" data-industry="${currentIndustry}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                </svg>
              </button>
            </div>
            <ul class="space-y-2">
              ${category.cases.map((useCase, useCaseIndex) => `
                <li class="flex items-center justify-between group">
                  <button class="use-case-link text-sm ${colors.link} ${colors.linkHover} text-left transition-colors flex-1" data-page="${useCase.page}" data-name="${sanitizer.escapeHtml(useCase.name)}">
                    <span data-editable>• ${sanitizer.renderSafeHTML(useCase.name)}</span>
                  </button>
                  <button class="edit-btn hidden p-1 text-gray-400 hover:text-${category.color}-600 transition-colors ml-2" 
                          data-edit-type="use-case-item" data-edit-id="${categoryIndex}-${useCaseIndex}" data-industry="${currentIndustry}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                    </svg>
                  </button>
                </li>
              `).join('')}
              <!-- Add New Use Case Button -->
              <li class="edit-btn hidden mt-3">
                <button class="w-full p-2 border-2 border-dashed border-${category.color}-300 rounded-lg text-${category.color}-600 hover:border-${category.color}-400 hover:bg-${category.color}-50 transition-colors" 
                        data-edit-type="new-use-case-item" data-edit-id="${categoryIndex}" data-industry="${currentIndustry}">
                  <div class="flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Use Case
                  </div>
                </button>
              </li>
            </ul>
          </div>
        `;
        }).join('')}
      </div>
      <!-- Add New Category Button -->
      <div class="edit-btn hidden mt-6">
        <button class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors" 
                data-edit-type="new-use-case-category" data-edit-id="${currentIndustry}">
          <div class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Category
          </div>
        </button>
      </div>
    `;

    container.innerHTML = useCasesHTML;
  }

  setDefaultExpandedStates() {
    // Default expand personas and use cases sections
    setTimeout(() => {
      const personasSection = document.querySelector('#personas-section .collapsible-content');
      const personasChevron = document.querySelector('#personas-section .chevron-icon');
      
      if (personasSection && personasChevron) {
        personasSection.classList.remove('hidden');
        personasChevron.style.transform = 'rotate(90deg)';
      }
      
      const useCasesSection = document.querySelector('#use-cases-section .collapsible-content');
      const useCasesChevron = document.querySelector('#use-cases-section .chevron-icon');
      
      if (useCasesSection && useCasesChevron) {
        useCasesSection.classList.remove('hidden');
        useCasesChevron.style.transform = 'rotate(90deg)';
      }
    }, 100);
  }

  renderStageContent(stageIndex) {
    const container = $('#stage-content');
    if (!container || !SALES_CYCLE_DATA.stages) return;
    
    const stage = SALES_CYCLE_DATA.stages[stageIndex];
    if (!stage) return;
    
    const currentIndustry = appState.get('currentIndustry');
    
    const contentHTML = `
      <!-- Stage Header -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">
            ${sanitizer.escapeHtml(stage.title)}
          </h2>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <!-- Outcomes -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-orange-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Verifiable Outcomes
          </h3>
          <div class="space-y-3">
            ${(stage.outcomes || []).map((outcome, i) => `
              <div class="flex items-start justify-between group">
                <label class="flex items-start cursor-pointer group flex-1">
                  <input type="checkbox" class="mt-1 mr-3 h-5 w-5 text-orange-600 rounded focus:ring-orange-500" 
                         data-id="stage-${stageIndex}-outcome-${i}">
                  <span class="text-gray-700 group-hover:text-gray-900" data-editable>${sanitizer.renderSafeHTML(outcome)}</span>
                </label>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-orange-600 transition-colors ml-2" 
                        data-edit-type="outcome" data-edit-id="${stageIndex}-${i}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
            `).join('')}
            <!-- Add New Outcome Button -->
            <button class="edit-btn hidden w-full mt-4 p-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors" 
                    data-edit-type="new-outcome" data-edit-id="${stageIndex}">
              <div class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Outcome
              </div>
            </button>
          </div>
        </div>

        <!-- Initial Personas -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-blue-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Personas
          </h3>
          <ul class="space-y-2">
            ${(stage.initialPersonas || []).map((persona, i) => `
              <li class="flex items-start justify-between group">
                <div class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span class="text-gray-700" data-editable>${sanitizer.renderSafeHTML(persona)}</span>
                </div>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors ml-2" 
                        data-edit-type="initial-persona" data-edit-id="${stageIndex}-${i}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </li>
            `).join('')}
            <!-- Add New Initial Persona Button -->
            <li>
              <button class="edit-btn hidden w-full mt-3 p-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors" 
                      data-edit-type="new-initial-persona" data-edit-id="${stageIndex}">
                <div class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Persona
                </div>
              </button>
            </li>
          </ul>
        </div>

        <!-- UiPath Team -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-orange-500 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20a3 3 0 01-3-3v-2a3 3 0 01-3-3V9a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3v2a3 3 0 01-3 3z"></path>
            </svg>
            UiPath Team
          </h3>
          <ul class="space-y-2">
            ${(stage.uipathTeam || []).map((member, i) => `
              <li class="flex items-start justify-between group">
                <div class="flex items-start flex-1">
                  <span class="text-gray-700" data-editable>${sanitizer.renderSafeHTML(member)}</span>
                </div>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-orange-500 transition-colors ml-2" 
                        data-edit-type="uipath-team" data-edit-id="${stageIndex}-${i}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </li>
            `).join('')}
            <!-- Add New UiPath Team Member Button -->
            <li>
              <button class="edit-btn hidden w-full mt-3 p-2 border-2 border-dashed border-orange-300 rounded-lg text-orange-500 hover:border-orange-400 hover:bg-orange-50 transition-colors" 
                      data-edit-type="new-uipath-team" data-edit-id="${stageIndex}">
                <div class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Team Member
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Key Resources -->
      <div class="bg-white rounded-lg shadow-lg mb-6">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="key-resources">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-green-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-green-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Key Resources
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid lg:grid-cols-3 gap-6">
            ${(stage.resources?.[currentIndustry] || []).map((resource, i) => `
              <div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                  <h4 class="font-semibold text-gray-800 flex items-center">
                    <a href="${sanitizer.escapeHtml(resource.link)}" 
                       class="text-blue-600 hover:underline hover:text-blue-800 transition-colors" 
                       target="_blank" rel="noopener noreferrer" data-editable>
                      ${sanitizer.renderSafeHTML(resource.name)}
                    </a>
                  </h4>
                  <button class="edit-btn hidden p-1 text-gray-400 hover:text-green-600 transition-colors" 
                          data-edit-type="resource" data-edit-id="${stageIndex}-${i}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                    </svg>
                  </button>
                </div>
                
                <div class="space-y-3">
                  <div>
                    <div class="flex items-start justify-between">
                      <h5 class="text-sm font-medium text-green-700 mb-1">Overview:</h5>
                      <button class="edit-btn hidden p-1 text-gray-400 hover:text-green-600 transition-colors" 
                              data-edit-type="resource-overview" data-edit-id="${stageIndex}-${i}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                        </svg>
                      </button>
                    </div>
                    <p class="text-sm text-gray-600 leading-relaxed" data-editable>
                      ${sanitizer.renderSafeHTML(resource.overview || 'No overview provided.')}
                    </p>
                  </div>
                  
                  <div>
                    <div class="flex items-start justify-between">
                      <h5 class="text-sm font-medium text-green-700 mb-1">Why it matters:</h5>
                      <button class="edit-btn hidden p-1 text-gray-400 hover:text-green-600 transition-colors" 
                              data-edit-type="resource-why" data-edit-id="${stageIndex}-${i}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                        </svg>
                      </button>
                    </div>
                    <p class="text-sm text-gray-600 leading-relaxed" data-editable>
                      ${sanitizer.renderSafeHTML(resource.why || 'Reason not specified.')}
                    </p>
                  </div>
                </div>
              </div>
            `).join('')}
            
            <!-- Add New Resource Button -->
            <div class="edit-btn hidden">
              <div class="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-100 transition-colors cursor-pointer">
                <button class="w-full h-full flex items-center justify-center text-green-600" 
                        data-edit-type="new-resource" data-edit-id="${stageIndex}">
                  <div class="text-center">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="text-sm font-medium">Add New Resource</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Discovery Questions -->
      <div class="bg-white rounded-lg shadow-lg mb-6 discovery-questions-section">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="discovery-questions">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-purple-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-purple-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Key Discovery Questions
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid md:grid-cols-2 gap-4">
            ${Object.entries(stage.questions || {}).map(([category, questions]) => `
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-3 text-left">${sanitizer.renderSafeHTML(category)}</h4>
                <div class="space-y-3">
                  ${questions.map((q, i) => {
                    const noteId = `stage-${stageIndex}-q-${category.replace(/\s+/g, '-')}-${i}`;
                    return `
                      <details class="bg-white rounded border border-gray-200 question-details">
                        <summary class="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700 text-sm flex items-center justify-between">
                          <span class="text-left flex-1" data-editable>${sanitizer.renderSafeHTML(q)}</span>
                          <button class="edit-btn hidden p-1 text-gray-400 hover:text-purple-600 transition-colors ml-2" 
                                  data-edit-type="question" data-edit-id="${stageIndex}-${category}-${i}">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                            </svg>
                          </button>
                        </summary>
                        <div class="p-3 pt-0 space-y-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Your Notes & Customer Response:</label>
                            <textarea class="note-textarea w-full p-2 border border-gray-300 rounded text-sm resize-none" 
                                     rows="3" 
                                     placeholder="Capture customer responses and your notes here..."
                                     data-note-id="${noteId}"></textarea>
                          </div>
                          <div class="flex justify-end">
                            <button class="ai-question-response-btn px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition-colors flex items-center"
                                    data-question="${encodeURIComponent(q)}" data-note-id="${noteId}">
                              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                              </svg>
                              AI Response
                            </button>
                          </div>
                        </div>
                      </details>
                    `;
                  }).join('')}
                  <!-- Add New Question Button -->
                  <button class="edit-btn hidden w-full mt-3 p-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors" 
                          data-edit-type="new-question" data-edit-id="${stageIndex}" data-category="${category}">
                    <div class="flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New Question
                    </div>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Common Objections -->
      <div class="bg-white rounded-lg shadow-lg mb-6 objections-section">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="objections">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-red-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-red-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Common Objections
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid md:grid-cols-2 gap-4">
            ${(stage.objections || []).map((objection, i) => {
              const objectionId = `stage-${stageIndex}-obj-${i}`;
              return `
                <div class="bg-gray-50 p-4 rounded-lg">
                  <details class="bg-white rounded border border-gray-200 objection-details">
                    <summary class="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700 text-sm flex items-center justify-between">
                      <span class="text-left flex-1" data-editable>${sanitizer.renderSafeHTML(objection.q)}</span>
                      <button class="edit-btn hidden p-1 text-gray-400 hover:text-red-600 transition-colors ml-2" 
                              data-edit-type="objection-question" data-edit-id="${stageIndex}-${i}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                        </svg>
                      </button>
                    </summary>
                    <div class="p-3 pt-0 space-y-3">
                      <div class="bg-green-50 p-3 rounded-lg border border-green-100 relative">
                        <div class="flex items-start justify-between">
                          <h5 class="text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Suggested Response:
                          </h5>
                          <button class="edit-btn hidden p-1 text-gray-400 hover:text-green-600 transition-colors" 
                                  data-edit-type="objection-answer" data-edit-id="${stageIndex}-${i}">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                            </svg>
                          </button>
                        </div>
                        <p class="text-sm text-gray-700" data-editable>${sanitizer.renderSafeHTML(objection.a)}</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Your Custom Response & Notes:</label>
                        <textarea class="note-textarea w-full p-2 border border-gray-300 rounded text-sm resize-none" 
                                 rows="3" 
                                 placeholder="Add your own response strategy and notes for this objection..."
                                 data-note-id="${objectionId}"></textarea>
                      </div>
                      <div class="flex justify-end">
                        <button class="ai-objection-response-btn px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition-colors flex items-center"
                                data-objection="${encodeURIComponent(objection.q)}" 
                                data-context="${encodeURIComponent(objection.a)}"
                                data-note-id="${objectionId}">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                          </svg>
                          AI Response
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              `;
            }).join('')}
            <!-- Add New Objection Button -->
            <div class="edit-btn hidden col-span-2 mt-4">
              <button class="w-full p-4 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors" 
                      data-edit-type="new-objection" data-edit-id="${stageIndex}">
                <div class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Objection
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center">
        <button class="nav-prev px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors
                       ${stageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
          ← Previous Stage
        </button>
        
        <div class="flex gap-3">
          <button class="export-notes-btn px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy Notes
          </button>
          <button class="clear-all-btn px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
            Clear All
          </button>
        </div>
        
        <button class="nav-next px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors
                       ${stageIndex === SALES_CYCLE_DATA.stages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">
          Next Stage →
        </button>
      </div>
    `;
    
    container.innerHTML = contentHTML;
    
    // Restore checkbox states
    this.restoreFormState(stageIndex);
  }

  restoreFormState(stageIndex) {
    // Restore checkboxes
    appState.state.checkboxes.forEach((checked, checkboxId) => {
      if (checkboxId.startsWith(`stage-${stageIndex}-`)) {
        const checkbox = $(`[data-id="${checkboxId}"]`);
        if (checkbox) {
          checkbox.checked = checked;
          checkbox.closest('label')?.classList.toggle('checked-item', checked);
        }
      }
    });
    
    // Restore notes
    appState.state.notes.forEach((content, noteId) => {
      if (noteId.startsWith(`stage-${stageIndex}-`)) {
        const textarea = $(`[data-note-id="${noteId}"]`);
        if (textarea) {
          textarea.value = content;
        }
      }
    });
  }

  updateTimelineUI(stageIndex) {
    // Re-render timeline to show updated active state
    this.renderTimeline();
  }

  navigateToPreviousStage() {
    const currentStage = appState.get('currentStage') || 0;
    if (currentStage > 0) {
      appState.set('currentStage', currentStage - 1);
    }
  }

  navigateToNextStage() {
    const currentStage = appState.get('currentStage') || 0;
    if (SALES_CYCLE_DATA.stages && currentStage < SALES_CYCLE_DATA.stages.length - 1) {
      appState.set('currentStage', currentStage + 1);
    }
  }

  toggleAdminMode() {
    const currentMode = appState.get('adminMode');
    appState.set('adminMode', !currentMode);
  }

  updateAdminUI(enabled) {
    const adminBtn = $('#admin-mode-btn');
    const adminStatus = $('#admin-status');
    
    if (adminBtn) {
      adminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
      adminBtn.classList.toggle('bg-orange-600', enabled);
      adminBtn.classList.toggle('text-white', enabled);
    }
    
    if (adminStatus) {
      adminStatus.classList.toggle('hidden', !enabled);
    }

    // Show/hide all edit buttons
    $$('.edit-btn').forEach(btn => {
      btn.classList.toggle('hidden', !enabled);
    });
  }

  handleEditClick(button) {
    const editType = button.dataset.editType;
    const editId = button.dataset.editId;
    const editField = button.dataset.editField;
    
    // Find the content element and data
    const contentElement = button.parentElement.querySelector('[data-editable]') || 
                          button.previousElementSibling ||
                          button.nextElementSibling;
    
    if (!contentElement) {
      console.error('Could not find content element for editing');
      return;
    }

    // Prepare edit data based on type
    let editData = {};
    
    switch (editType) {
      case 'persona-field':
        editData = this.getPersonaEditData(editId, editField);
        break;
      case 'outcome':
        editData = this.getOutcomeEditData(editId);
        break;
      case 'question':
        editData = this.getQuestionEditData(editId);
        break;
      case 'objection-question':
      case 'objection-answer':
        editData = this.getObjectionEditData(editId, editType);
        break;
      case 'resource':
        editData = this.getResourceEditData(editId);
        break;
      case 'initial-persona':
        editData = this.getInitialPersonaEditData(editId);
        break;
      case 'uipath-team':
        editData = this.getUipathTeamEditData(editId);
        break;
      case 'use-case-category':
        editData = this.getUseCaseCategoryEditData(editId);
        break;
      case 'use-case-item':
        editData = this.getUseCaseItemEditData(editId);
        break;
    }

    // Open editor
    this.contentEditor.openEditor(editType, editData, contentElement);
  }

  getPersonaEditData(personaIndex, field) {
    const currentIndustry = appState.get('currentIndustry');
    const persona = SALES_CYCLE_DATA.personas[currentIndustry][personaIndex];
    return {
      persona,
      field,
      content: persona[field]
    };
  }

  getOutcomeEditData(outcomeId) {
    const [stageIndex, outcomeIndex] = outcomeId.split('-').map(Number);
    const outcome = SALES_CYCLE_DATA.stages[stageIndex].outcomes[outcomeIndex];
    return {
      outcome,
      text: outcome
    };
  }

  getQuestionEditData(questionId) {
    const [stageIndex, category, questionIndex] = questionId.split('-');
    const question = SALES_CYCLE_DATA.stages[stageIndex].questions[category][questionIndex];
    return {
      question,
      text: question
    };
  }

  getObjectionEditData(objectionId, type) {
    const [stageIndex, objectionIndex] = objectionId.split('-').map(Number);
    const objection = SALES_CYCLE_DATA.stages[stageIndex].objections[objectionIndex];
    return {
      objection,
      question: objection.q,
      answer: objection.a
    };
  }

  getResourceEditData(resourceId) {
    const [stageIndex, resourceIndex] = resourceId.split('-').map(Number);
    const currentIndustry = appState.get('currentIndustry');
    const resource = SALES_CYCLE_DATA.stages[stageIndex].resources[currentIndustry][resourceIndex];
    return {
      resource,
      name: resource.name
    };
  }

  getInitialPersonaEditData(personaId) {
    const [stageIndex, personaIndex] = personaId.split('-').map(Number);
    const persona = SALES_CYCLE_DATA.stages[stageIndex].initialPersonas[personaIndex];
    return {
      list: SALES_CYCLE_DATA.stages[stageIndex].initialPersonas,
      index: personaIndex,
      text: persona
    };
  }

  getUipathTeamEditData(memberId) {
    const [stageIndex, memberIndex] = memberId.split('-').map(Number);
    const member = SALES_CYCLE_DATA.stages[stageIndex].uipathTeam[memberIndex];
    return {
      list: SALES_CYCLE_DATA.stages[stageIndex].uipathTeam,
      index: memberIndex,
      text: member
    };
  }

  getUseCaseCategoryEditData(editId) {
    // For static data editing - this is a simplified version
    // In a full implementation, this would reference actual stored data
    return {
      categoryData: { category: 'Category Name' },
      category: 'Category Name'
    };
  }

  getUseCaseItemEditData(editId) {
    // For static data editing - this is a simplified version
    // In a full implementation, this would reference actual stored data
    return {
      useCaseData: { name: 'Use Case Name' },
      name: 'Use Case Name'
    };
  }

  updateIndustryUI(industry) {
    $$('.industry-btn').forEach(btn => {
      const isActive = btn.dataset.industry === industry;
      btn.classList.toggle('bg-orange-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('bg-white', !isActive);
      btn.classList.toggle('text-gray-700', !isActive);
    });
    
    this.renderPersonas();
    this.renderUseCases();
  }

  async handleExportNotes() {
    try {
      const notes = this.collectAllNotes();
      
      if (!notes.trim()) {
        this.showNotification('No notes to export', 'warning');
        return;
      }
      
      const success = await copyToClipboard(notes);
      
      if (success) {
        this.showNotification('Notes copied to clipboard!', 'success');
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to copy notes. Please try selecting and copying manually.');
    }
  }

  collectAllNotes() {
    const notes = [];
    const notesMap = appState.get('notes');
    
    SALES_CYCLE_DATA.stages.forEach((stage, index) => {
      const stageNotes = [];
      
      notesMap.forEach((value, key) => {
        if (key.startsWith(`stage-${index}-`) && value.trim()) {
          stageNotes.push(`- ${value.trim()}`);
        }
      });
      
      if (stageNotes.length > 0) {
        notes.push(`\n=== Stage ${index + 1}: ${stage.title} ===\n${stageNotes.join('\n')}`);
      }
    });
    
    return notes.join('\n\n').trim();
  }

  handleClearAll() {
    if (confirm('Are you sure you want to clear all checkboxes and notes? This cannot be undone.')) {
      appState.clearFormState();
      
      $$('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('label')?.classList.remove('checked-item');
      });
      
      $$('.note-textarea').forEach(textarea => {
        textarea.value = '';
      });
      
      this.showNotification('All data cleared', 'success');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 animate-slideIn ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>' :
            type === 'warning' ? '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>' :
            type === 'error' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>' :
            '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  async handleAIResponse(button) {
    const question = decodeURIComponent(button.dataset.question);
    const noteId = button.dataset.noteId;
    const textarea = $(`[data-note-id="${noteId}"]`);
    
    if (!question || !textarea) {
      this.showError('Unable to process AI response request');
      return;
    }

    // Check if AI integration is available
    if (!this.isAIAvailable()) {
      this.showAISetupModal();
      return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;

    try {
      const context = this.buildAIContext(question);
      const response = await this.generateAIResponse(question, context);
      
      // Append response to existing notes or create new
      const existingNotes = textarea.value.trim();
      const newContent = existingNotes 
        ? `${existingNotes}\n\n--- AI Response ---\n${response}`
        : `--- AI Response ---\n${response}`;
      
      textarea.value = newContent;
      
      // Update state
      appState.updateNote(noteId, newContent);
      
      this.showNotification('AI response generated successfully!', 'success');
    } catch (error) {
      console.error('AI response generation failed:', error);
      this.showError('Failed to generate AI response. Please check your API key and try again.');
    } finally {
      // Reset button
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  isAIAvailable() {
    // Check for stored API key (simplified version)
    const apiKey = sessionStorage.getItem('claude_api_key');
    return apiKey && apiKey.length > 0;
  }

  buildAIContext(question) {
    const currentIndustry = appState.get('currentIndustry');
    const currentStage = appState.get('currentStage') || 0;
    const stageName = SALES_CYCLE_DATA.stages[currentStage]?.title || 'Unknown Stage';
    
    return {
      industry: currentIndustry,
      stage: stageName,
      question: question
    };
  }

  async generateAIResponse(question, context) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const prompt = `You are a UiPath sales expert helping with ${context.industry} industry prospects in the ${context.stage} stage.

Question: "${question}"

Please provide a helpful response that:
1. Suggests what to listen for in the customer's answer
2. Provides follow-up questions to ask
3. Identifies potential objections or concerns
4. Suggests how UiPath's solutions address this area

Keep your response concise and actionable (2-3 paragraphs maximum).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }

  showAISetupModal() {
    // Create a simple modal for API key setup
    const modalHTML = `
      <div id="ai-setup-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">AI Response Setup</h3>
          <p class="text-sm text-gray-600 mb-4">
            To use AI-powered responses, please enter your Claude API key. Your key is stored securely in your browser session.
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Claude API Key</label>
              <input type="password" id="ai-api-key" placeholder="sk-ant-api03-..." 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <p class="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://console.anthropic.com" target="_blank" class="text-blue-600 hover:underline">console.anthropic.com</a>
              </p>
            </div>
            <div class="flex justify-end space-x-3">
              <button id="ai-setup-cancel" class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button id="ai-setup-save" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = $('#ai-setup-modal');
    const cancelBtn = $('#ai-setup-cancel');
    const saveBtn = $('#ai-setup-save');
    const apiKeyInput = $('#ai-api-key');
    
    const closeModal = () => {
      modal?.remove();
    };
    
    cancelBtn?.addEventListener('click', closeModal);
    
    saveBtn?.addEventListener('click', () => {
      const apiKey = apiKeyInput?.value.trim();
      if (apiKey) {
        sessionStorage.setItem('claude_api_key', apiKey);
        this.showNotification('API key saved! You can now use AI responses.', 'success');
        closeModal();
      } else {
        this.showError('Please enter a valid API key');
      }
    });
    
    // Close on outside click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  async handleAIObjectionResponse(button) {
    const objection = decodeURIComponent(button.dataset.objection);
    const context = decodeURIComponent(button.dataset.context);
    const noteId = button.dataset.noteId;
    const textarea = document.querySelector(`[data-note-id="${noteId}"]`);
    
    if (!objection || !textarea) {
      this.showError('Unable to process AI objection response request');
      return;
    }

    // Check if AI integration is available
    if (!this.isAIAvailable()) {
      this.showAISetupModal();
      return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;

    try {
      const response = await this.generateAIObjectionResponse(objection, context);
      
      // Append response to existing notes or create new
      const existingNotes = textarea.value.trim();
      const newContent = existingNotes 
        ? `${existingNotes}\n\n--- AI Enhanced Response ---\n${response}`
        : `--- AI Enhanced Response ---\n${response}`;
      
      textarea.value = newContent;
      
      // Update state
      appState.updateNote(noteId, newContent);
      
      this.showNotification('AI objection response generated successfully!', 'success');
    } catch (error) {
      console.error('AI objection response generation failed:', error);
      this.showError('Failed to generate AI response. Please check your API key and try again.');
    } finally {
      // Reset button
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  async generateAIObjectionResponse(objection, suggestedResponse) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const currentStage = this.stages[appState.getState().currentStage];
    const stageContext = this.buildAIContext('objection handling');

    const prompt = `You are a UiPath sales expert helping handle objections in the ${stageContext.stage} stage for ${stageContext.industry} industry prospects.

Objection: "${objection}"
Suggested Response: "${suggestedResponse}"

Please provide an enhanced response strategy that:
1. Acknowledges the customer's concern with empathy
2. Builds on or improves the suggested response
3. Provides specific UiPath value propositions that address this objection
4. Includes follow-up questions to continue the conversation
5. Suggests concrete next steps or proof points

Keep your response practical and conversation-ready (2-3 paragraphs maximum).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }
}

// Initialize application
const timelineApp = new TimelineUiPathApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.TimelineApp = timelineApp;
  window.appState = appState;
}

// ==================== USE CASE PDF FUNCTIONALITY ====================
class UseCasePDFHandler {
  constructor() {
    this.pdfFileName = 'FINS - MAESTRO - Use Case Deck- Aug 2025.pdf';
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener('click', (e) => {
      const useCaseButton = e.target.closest('.use-case-link');
      if (useCaseButton) {
        e.preventDefault();
        this.handleUseCaseClick(useCaseButton);
      }
    });
  }

  async handleUseCaseClick(button) {
    const pageNumber = button.dataset.page;
    const useCaseName = button.dataset.name || button.textContent.trim().replace('• ', '');
    
    if (!pageNumber) {
      this.showNotification('Page number not found for this use case', 'error');
      return;
    }

    try {
      // Show loading state
      button.style.opacity = '0.6';
      button.disabled = true;
      
      // Navigate to the PDF viewer page
      this.openPDFViewer(pageNumber, useCaseName);
      
    } catch (error) {
      console.error('Error opening PDF viewer:', error);
      this.showNotification(`Unable to open PDF viewer`, 'error');
    } finally {
      // Reset button state  
      button.style.opacity = '1';
      button.disabled = false;
    }
  }

  openPDFViewer(pageNumber, useCaseName) {
    // Create an inline modal for PDF viewing
    this.createPDFViewerModal(pageNumber, useCaseName);
    this.showNotification(`Opening ${useCaseName} (Page ${pageNumber})`, 'success');
  }

  createPDFViewerModal(pageNumber, useCaseName) {
    // Remove existing modal if any
    const existingModal = document.getElementById('pdf-viewer-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'pdf-viewer-modal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    
    const pdfPath = '/Users/eric.bouchard/Downloads/FINS - MAESTRO - Use Case Deck- Aug 2025.pdf';
    
    modal.innerHTML = `
      <div class="relative top-4 mx-auto p-4 border w-full max-w-6xl shadow-lg rounded-md bg-white" style="height: 90vh;">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-medium text-gray-900">${this.escapeHtml(useCaseName)}</h3>
            <p class="text-sm text-gray-600">Document page ${pageNumber}</p>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="this.openDirectPDF()" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Open in System Viewer
            </button>
            <button onclick="document.getElementById('pdf-viewer-modal').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="h-full pb-16">
          <div id="pdf-frame-container" class="h-full">
            <div class="bg-gray-100 rounded-lg p-8 h-full flex items-center justify-center">
              <div class="text-center max-w-md">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div class="flex items-center mb-4">
                    <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h4 class="text-lg font-medium text-blue-900">${this.escapeHtml(useCaseName)}</h4>
                  </div>
                  <div class="text-sm text-blue-800 space-y-3">
                    <p><strong>Document:</strong> ${this.pdfFileName}</p>
                    <p><strong>Page Reference:</strong> ${pageNumber}</p>
                    <div class="bg-blue-100 border border-blue-300 rounded p-3 mt-4">
                      <p class="text-blue-900 font-medium mb-2">📄 Use Case Details:</p>
                      <p class="text-blue-800">Please refer to <strong>page ${pageNumber}</strong> in your UiPath use case document for detailed information about this use case.</p>
                    </div>
                  </div>
                  <div class="mt-6 space-y-3">
                    <button onclick="window.useCasePDFHandler.openPDFInstructions('${pageNumber}', '${this.escapeHtml(useCaseName)}')" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                      📖 View PDF Instructions
                    </button>
                    <button onclick="window.useCasePDFHandler.contactSupport('${this.escapeHtml(useCaseName)}', '${pageNumber}')" class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                      💬 Request Use Case Details
                    </button>
                    <p class="text-xs text-blue-600 text-center">
                      Need help accessing the PDF or want more details about this use case?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event handlers
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Store reference for cleanup
    window.currentPDFModal = modal;

    document.body.appendChild(modal);
  }

  openPDFInstructions(pageNumber, useCaseName) {
    // Close current modal
    if (window.currentPDFModal) {
      window.currentPDFModal.remove();
    }
    
    // Create instructions modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
      <div class="relative top-4 mx-auto p-4 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">📖 How to Access ${this.escapeHtml(useCaseName)}</h3>
          <button onclick="this.remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-semibold text-blue-900 mb-3">📄 Document Information</h4>
            <ul class="space-y-2 text-sm text-blue-800">
              <li><strong>Document:</strong> ${this.pdfFileName}</li>
              <li><strong>Page Number:</strong> ${pageNumber}</li>
              <li><strong>Use Case:</strong> ${this.escapeHtml(useCaseName)}</li>
            </ul>
          </div>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-semibold text-green-900 mb-3">💡 How to Access the PDF</h4>
            <ol class="space-y-2 text-sm text-green-800 list-decimal list-inside">
              <li>Request the <strong>${this.pdfFileName}</strong> from your UiPath sales representative</li>
              <li>Download and save the PDF to your computer</li>
              <li>Open the PDF and navigate to <strong>page ${pageNumber}</strong></li>
              <li>Find the detailed information about <strong>${this.escapeHtml(useCaseName)}</strong></li>
            </ol>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="font-semibold text-yellow-900 mb-3">📞 Need Help?</h4>
            <p class="text-sm text-yellow-800">
              Contact your UiPath sales team or use the "Request Use Case Details" button to get more information about this specific use case.
            </p>
          </div>
        </div>
      </div>
    `;
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }
  
  contactSupport(useCaseName, pageNumber) {
    // Close current modal  
    if (window.currentPDFModal) {
      window.currentPDFModal.remove();
    }
    
    const subject = encodeURIComponent(`Use Case Request: ${useCaseName}`);
    const body = encodeURIComponent(`Hi,

I would like more information about the following use case:

Use Case: ${useCaseName}
Document: ${this.pdfFileName} 
Page Reference: ${pageNumber}

Could you please provide:
1. Detailed information about this use case
2. Access to the complete use case document
3. Implementation examples or customer success stories

Thank you!`);
    
    // Try to open default email client
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    try {
      window.location.href = mailtoUrl;
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Use Case Request: ${useCaseName}\nDocument: ${this.pdfFileName}\nPage: ${pageNumber}`).then(() => {
        this.showNotification('Request details copied to clipboard!', 'success');
      }).catch(() => {
        this.showNotification('Please contact your UiPath sales representative for more details about this use case.', 'info');
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    // Reuse the existing notification system
    if (window.appInstance && window.appInstance.notificationManager) {
      window.appInstance.notificationManager.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize PDF handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.useCasePDFHandler = new UseCasePDFHandler();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
  @keyframes ping {
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .use-case-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .use-case-link:hover {
    transform: translateX(2px);
  }
`;
document.head.appendChild(style);

// ==================== LLM PROMPT BAR ====================
class LLMPromptBar {
  constructor() {
    this.isCollapsed = false;
    this.promptHistory = this.loadPromptHistory();
    this.currentContext = 'general';
    this.initializeEventListeners();
    this.updateContextualPrompts();
  }

  initializeEventListeners() {
    const promptInput = document.getElementById('llm-prompt-input');
    const sendBtn = document.getElementById('llm-send-btn');
    const toggleBtn = document.getElementById('llm-toggle-btn');
    const quickBtns = document.querySelectorAll('.llm-quick-btn');

    // Send button click
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.handlePromptSubmit();
      });
    }

    // Enter key in input
    if (promptInput) {
      promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handlePromptSubmit();
        }
      });
    }

    // Toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.togglePromptBar();
      });
    }

    // Quick action buttons
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        if (promptInput) {
          promptInput.value = prompt;
          this.handlePromptSubmit();
        }
      });
    });
  }

  handlePromptSubmit() {
    const promptInput = document.getElementById('llm-prompt-input');
    const prompt = promptInput?.value.trim();

    if (!prompt) {
      this.showNotification('Please enter a question or prompt', 'warning');
      return;
    }

    // Track prompt usage for analytics
    this.trackPromptUsage(prompt);

    // Check if the existing AI chatbot is available
    if (window.chatbot && typeof window.chatbot.handleUserMessage === 'function') {
      // Clear the input
      if (promptInput) {
        promptInput.value = '';
      }
      
      // Show the chatbot and send the message
      const chatModal = document.getElementById('ai-chat-modal');
      
      if (chatModal) {
        // Open the chatbot modal
        chatModal.classList.remove('hidden');
        
        // Send the message to the chatbot
        setTimeout(() => {
          window.chatbot.handleUserMessage(prompt);
        }, 300);
        
        this.showNotification('Question sent to AI assistant!', 'success');
      } else {
        this.showNotification('AI chatbot is not available. Please try again later.', 'error');
      }
    } else {
      this.showNotification('AI assistant is not available. Please check your settings.', 'error');
    }
  }

  togglePromptBar() {
    const promptBar = document.getElementById('llm-prompt-bar');
    const toggleBtn = document.getElementById('llm-toggle-btn');
    const chevron = toggleBtn?.querySelector('svg');

    if (promptBar) {
      this.isCollapsed = !this.isCollapsed;
      
      if (this.isCollapsed) {
        // Collapse the bar
        promptBar.style.height = '0';
        promptBar.style.overflow = 'hidden';
        promptBar.style.paddingTop = '0';
        promptBar.style.paddingBottom = '0';
        if (chevron) {
          chevron.style.transform = 'rotate(180deg)';
        }
      } else {
        // Expand the bar
        promptBar.style.height = '';
        promptBar.style.overflow = '';
        promptBar.style.paddingTop = '';
        promptBar.style.paddingBottom = '';
        if (chevron) {
          chevron.style.transform = 'rotate(0deg)';
        }
      }
    }
  }

  showNotification(message, type = 'info') {
    // Reuse the existing notification system if available
    if (window.appInstance && window.appInstance.notificationManager) {
      window.appInstance.notificationManager.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`${type.toUpperCase()}: ${message}`);
      alert(message);
    }
  }

  // ==================== ANALYTICS & TRACKING ====================
  trackPromptUsage(prompt) {
    const timestamp = new Date().toISOString();
    const context = this.getCurrentContext();
    
    const usage = {
      prompt: prompt,
      timestamp: timestamp,
      context: context,
      length: prompt.length,
      category: this.categorizePrompt(prompt)
    };
    
    // Store in localStorage for analytics
    this.promptHistory.push(usage);
    
    // Keep only last 100 prompts
    if (this.promptHistory.length > 100) {
      this.promptHistory = this.promptHistory.slice(-100);
    }
    
    localStorage.setItem('llm_prompt_history', JSON.stringify(this.promptHistory));
    
    // Update contextual suggestions based on usage
    this.updateQuickActions();
  }

  loadPromptHistory() {
    try {
      const history = localStorage.getItem('llm_prompt_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load prompt history:', error);
      return [];
    }
  }

  categorizePrompt(prompt) {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('objection') || lower.includes('handle') || lower.includes('overcome')) {
      return 'objections';
    } else if (lower.includes('persona') || lower.includes('decision maker') || lower.includes('stakeholder')) {
      return 'personas';
    } else if (lower.includes('discovery') || lower.includes('question') || lower.includes('ask')) {
      return 'discovery';
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('budget')) {
      return 'pricing';
    } else if (lower.includes('compete') || lower.includes('competitor') || lower.includes('vs')) {
      return 'competitive';
    } else if (lower.includes('demo') || lower.includes('show') || lower.includes('present')) {
      return 'demonstration';
    } else {
      return 'general';
    }
  }

  getCurrentContext() {
    // Determine current context based on page state
    const currentStage = window.appState?.get('currentStage') || 0;
    const currentIndustry = window.appState?.get('currentIndustry') || 'banking';
    
    return {
      stage: currentStage,
      industry: currentIndustry,
      section: this.getVisibleSection()
    };
  }

  getVisibleSection() {
    // Detect which section is currently expanded/visible
    const expandedSections = document.querySelectorAll('.collapsible-content:not(.hidden)');
    if (expandedSections.length > 0) {
      const section = expandedSections[0].closest('[class*="section"]');
      if (section) {
        if (section.classList.contains('discovery-questions-section')) return 'discovery';
        if (section.classList.contains('objections-section')) return 'objections';
      }
    }
    return 'timeline';
  }

  updateContextualPrompts() {
    // Update quick action buttons based on current context
    setTimeout(() => {
      const context = this.getCurrentContext();
      const quickBtns = document.querySelectorAll('.llm-quick-btn');
      
      // Get contextual prompts
      const contextualPrompts = this.getContextualPrompts(context);
      
      // Update button text and prompts
      quickBtns.forEach((btn, index) => {
        if (contextualPrompts[index]) {
          btn.textContent = contextualPrompts[index].label;
          btn.dataset.prompt = contextualPrompts[index].prompt;
        }
      });
    }, 500);
  }

  getContextualPrompts(context) {
    const stageNames = ['Discovery', 'Technical Evaluation', 'Business Case', 'Negotiation', 'Close'];
    const currentStageName = stageNames[context.stage] || 'Discovery';
    
    const prompts = {
      discovery: [
        { label: '🔍 Discovery', prompt: `What are the best discovery questions for the ${currentStageName} stage?` },
        { label: '👥 Personas', prompt: `Who are the key personas I should engage during ${currentStageName}?` },
        { label: '⚠️ Risks', prompt: `What risks should I watch for in the ${currentStageName} stage?` }
      ],
      objections: [
        { label: '💬 Handle', prompt: 'How do I handle the most common objections in this stage?' },
        { label: '🎯 Reframe', prompt: 'How can I reframe this objection as an opportunity?' },
        { label: '📊 Evidence', prompt: 'What evidence or proof points help overcome objections?' }
      ],
      timeline: [
        { label: '🚀 Strategy', prompt: `What's the best strategy for the ${currentStageName} stage?` },
        { label: '✅ Success', prompt: `What are the key success factors for ${currentStageName}?` },
        { label: '⏰ Timeline', prompt: `How long should the ${currentStageName} stage typically take?` }
      ]
    };
    
    return prompts[context.section] || prompts.timeline;
  }

  updateQuickActions() {
    // Analyze prompt history and update quick actions with popular queries
    if (this.promptHistory.length < 5) return;
    
    const categories = {};
    this.promptHistory.slice(-20).forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    // Update context based on popular categories
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
      
    console.log('Popular prompt categories:', topCategories);
  }

  // ==================== POPULAR PROMPTS ====================
  getPopularPrompts() {
    return [
      "How do I handle pricing objections effectively?",
      "What questions should I ask to qualify this opportunity?",
      "How do I position UiPath against competitors?",
      "What ROI metrics should I focus on?",
      "How do I identify the real decision maker?",
      "What are the best demo scenarios for this industry?",
      "How do I create urgency in the sales process?",
      "What evidence do I need to build a business case?"
    ];
  }
}

// ==================== DYNAMIC DISCOVERY QUESTIONS ====================
class DynamicDiscoveryManager {
  constructor() {
    this.selectedLOB = '';
    this.selectedProjectTypes = new Set();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // LOB selector handlers
    const lobSelector = document.getElementById('lob-selector');
    const mobileLobSelector = document.getElementById('mobile-lob-selector');
    
    if (lobSelector) {
      lobSelector.addEventListener('change', (e) => {
        this.selectedLOB = e.target.value;
        if (mobileLobSelector) mobileLobSelector.value = e.target.value;
        this.updateDiscoveryQuestions();
      });
    }

    if (mobileLobSelector) {
      mobileLobSelector.addEventListener('change', (e) => {
        this.selectedLOB = e.target.value;
        if (lobSelector) lobSelector.value = e.target.value;
        this.updateDiscoveryQuestions();
      });
    }

    // Project type button handlers
    document.addEventListener('click', (e) => {
      if (e.target.matches('.project-type-btn')) {
        this.handleProjectTypeToggle(e.target);
      }
    });
  }

  handleProjectTypeToggle(button) {
    const type = button.dataset.type;
    const isSelected = button.classList.contains('bg-orange-600');

    // Toggle selection
    if (isSelected) {
      this.selectedProjectTypes.delete(type);
      button.classList.remove('bg-orange-600', 'text-white');
      button.classList.add('text-gray-700');
    } else {
      this.selectedProjectTypes.add(type);
      button.classList.add('bg-orange-600', 'text-white');
      button.classList.remove('text-gray-700');
    }

    // Sync desktop and mobile versions
    const allButtons = document.querySelectorAll(`[data-type="${type}"]`);
    allButtons.forEach(btn => {
      if (isSelected) {
        btn.classList.remove('bg-orange-600', 'text-white');
        btn.classList.add('text-gray-700');
      } else {
        btn.classList.add('bg-orange-600', 'text-white');
        btn.classList.remove('text-gray-700');
      }
    });

    this.updateDiscoveryQuestions();
  }

  updateDiscoveryQuestions() {
    // Get current stage data
    const currentStage = window.appState?.get('currentStage') || 0;
    const stageData = SALES_CYCLE_DATA?.stages?.[currentStage];
    
    if (!stageData) return;

    // Generate dynamic questions based on selections
    const dynamicQuestions = this.generateContextualQuestions();
    
    // Store original questions if not already stored
    if (!stageData.originalQuestions) {
      stageData.originalQuestions = JSON.parse(JSON.stringify(stageData.questions));
    }

    // Replace or enhance questions
    if (this.selectedLOB || this.selectedProjectTypes.size > 0) {
      stageData.questions = { ...stageData.originalQuestions, ...dynamicQuestions };
    } else {
      stageData.questions = stageData.originalQuestions;
    }

    // Re-render the stage content to show updated questions
    if (window.appInstance) {
      window.appInstance.renderStageContent(currentStage);
    }
  }

  generateContextualQuestions() {
    const questions = {};

    // LOB-specific questions
    if (this.selectedLOB) {
      questions[this.getLOBQuestionCategory()] = this.getLOBSpecificQuestions();
    }

    // Project type-specific questions
    if (this.selectedProjectTypes.size > 0) {
      questions['Technology & Implementation'] = this.getProjectTypeQuestions();
    }

    // Combined LOB + Project Type questions
    if (this.selectedLOB && this.selectedProjectTypes.size > 0) {
      questions['Specialized Use Cases'] = this.getCombinedQuestions();
    }

    return questions;
  }

  getLOBQuestionCategory() {
    const lobCategories = {
      'finance': 'Finance & Accounting Focus',
      'hr': 'Human Resources Focus', 
      'it': 'IT Operations Focus',
      'operations': 'Business Operations Focus',
      'customer-service': 'Customer Experience Focus',
      'procurement': 'Procurement & Supply Chain Focus',
      'legal': 'Legal & Compliance Focus',
      'compliance': 'Risk & Compliance Focus'
    };
    return lobCategories[this.selectedLOB] || 'Department-Specific Questions';
  }

  getLOBSpecificQuestions() {
    const lobQuestions = {
      'finance': [
        'What financial processes consume the most manual effort each month?',
        'How do you currently handle month-end closing and reconciliation?',
        'What regulatory reporting requirements create bottlenecks?',
        'Where do you see the most errors in financial data processing?',
        'How much time does your team spend on invoice processing and AP/AR?'
      ],
      'hr': [
        'What HR processes require the most manual data entry?',
        'How do you currently handle employee onboarding and offboarding?',
        'What compliance reporting do you need to maintain for HR?',
        'Where do you see delays in your recruitment and hiring process?',
        'How much time is spent on benefits administration and payroll?'
      ],
      'it': [
        'What IT service requests consume the most support time?',
        'How do you currently handle system monitoring and incident response?',
        'What manual processes exist in your infrastructure management?',
        'Where do you see bottlenecks in user provisioning and access management?',
        'How much time is spent on routine maintenance and patching?'
      ],
      'operations': [
        'What operational processes have the highest error rates?',
        'How do you currently handle order processing and fulfillment?',
        'What manual quality control processes could be improved?',
        'Where do you see delays in your supply chain operations?',
        'How much time is spent on data collection and reporting?'
      ],
      'customer-service': [
        'What customer inquiries require the most manual research?',
        'How do you currently handle case routing and escalation?',
        'What processes slow down your first-call resolution rates?',
        'Where do you see opportunities to improve customer response times?',
        'How much time is spent on manual ticket updates and documentation?'
      ],
      'procurement': [
        'What procurement processes involve the most manual approvals?',
        'How do you currently handle vendor onboarding and management?',
        'What spend analysis and reporting is done manually?',
        'Where do you see delays in your requisition-to-pay process?',
        'How much time is spent on contract management and compliance?'
      ],
      'legal': [
        'What legal document processes require extensive manual review?',
        'How do you currently handle contract management and tracking?',
        'What compliance monitoring is done manually?',
        'Where do you see bottlenecks in legal request processing?',
        'How much time is spent on regulatory filing and reporting?'
      ],
      'compliance': [
        'What compliance processes require the most manual oversight?',
        'How do you currently handle risk assessment and monitoring?',
        'What regulatory reporting involves manual data collection?',
        'Where do you see gaps in your compliance monitoring?',
        'How much time is spent on audit preparation and documentation?'
      ]
    };
    return lobQuestions[this.selectedLOB] || [];
  }

  getProjectTypeQuestions() {
    const questions = [];
    
    this.selectedProjectTypes.forEach(type => {
      const typeQuestions = {
        'rpa': [
          'What repetitive, rule-based tasks take up the most time?',
          'Which processes have clear decision trees and minimal exceptions?',
          'What systems need to integrate without APIs?'
        ],
        'idp': [
          'What types of documents do you process in high volumes?',
          'How much time is spent manually extracting data from documents?',
          'What document-based processes have quality control issues?'
        ],
        'agentic': [
          'What processes require complex decision-making and reasoning?',
          'Where do you need autonomous systems to handle exceptions?',
          'What workflows would benefit from self-learning capabilities?'
        ],
        'maestro': [
          'What end-to-end processes span multiple departments and systems?',
          'Where do you need orchestration of both human and digital workers?',
          'What complex workflows require dynamic routing and escalation?'
        ]
      };
      questions.push(...(typeQuestions[type] || []));
    });

    return questions;
  }

  getCombinedQuestions() {
    const questions = [];
    const selectedTypes = Array.from(this.selectedProjectTypes);
    
    // Generate combined questions based on LOB + Project Type combinations
    selectedTypes.forEach(type => {
      const combinedKey = `${this.selectedLOB}-${type}`;
      const combinedQuestions = this.getCombinedQuestionsByKey(combinedKey);
      questions.push(...combinedQuestions);
    });

    return questions;
  }

  getCombinedQuestionsByKey(key) {
    const combinedQuestions = {
      'finance-rpa': [
        'How do you currently handle invoice processing from receipt to payment?',
        'What financial reconciliation processes could benefit from automation?'
      ],
      'finance-idp': [
        'What types of financial documents require manual data extraction?',
        'How do you process expense reports and receipts currently?'
      ],
      'hr-rpa': [
        'What employee onboarding steps are repetitive across all hires?',
        'How do you handle benefits enrollment and changes?'
      ],
      'hr-idp': [
        'What HR documents require manual review and data entry?',
        'How do you process resumes and job applications currently?'
      ],
      'it-agentic': [
        'What IT incidents require intelligent analysis and routing?',
        'Where could autonomous monitoring and response add value?'
      ],
      'operations-maestro': [
        'What end-to-end operational processes span multiple systems?',
        'How do you coordinate between different operational teams?'
      ]
    };
    
    return combinedQuestions[key] || [];
  }

  getSelectionSummary() {
    const summary = {
      lob: this.selectedLOB,
      projectTypes: Array.from(this.selectedProjectTypes),
      hasSelections: this.selectedLOB || this.selectedProjectTypes.size > 0
    };
    
    return summary;
  }
}

// Initialize managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    try {
      window.llmPromptBar = new LLMPromptBar();
      window.dynamicDiscoveryManager = new DynamicDiscoveryManager();
      console.log('LLM Prompt Bar and Dynamic Discovery Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize managers:', error);
    }
  }, 1000); // Delay to ensure other components are loaded
});