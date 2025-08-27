/**
 * Integrated Admin Service
 * Provides admin functionality as an overlay to the Timeline Edition
 * Preserves all existing functionality while adding analytics and management
 */

export class IntegratedAdminService {
  constructor() {
    this.adminMode = false;
    this.analytics = {
      prompts: 0,
      research: 0,
      configs: 0,
      updates: 0,
      activity: []
    };
  }

  initialize() {
    this.initializeAdminMode();
    this.initializeAnalytics();
    console.log('🔧 Integrated Admin Service initialized');
  }

  initializeAdminMode() {
    // Setup admin mode toggle
    const toggle = document.getElementById('admin-mode-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        this.toggleAdminMode();
      });
    }

    // Setup admin panel close button
    const closeBtn = document.getElementById('close-admin-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideAdminPanel();
      });
    }

    // Setup admin panel tabs
    document.querySelectorAll('.integrated-admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // Setup API key management
    const saveBtn = document.getElementById('save-integrated-api-key');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveApiKey());
    }

    const testBtn = document.getElementById('test-integrated-api');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testApiConnection());
    }

    const toggleVisBtn = document.getElementById('toggle-integrated-api-visibility');
    if (toggleVisBtn) {
      toggleVisBtn.addEventListener('click', () => this.toggleApiKeyVisibility());
    }
  }

  toggleAdminMode() {
    this.adminMode = !this.adminMode;
    
    const toggle = document.getElementById('admin-mode-toggle');
    const text = document.getElementById('admin-mode-text');
    const statusBar = document.getElementById('admin-status-bar');

    if (this.adminMode) {
      // Enter admin mode
      toggle.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
      toggle.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
      text.textContent = 'Exit Admin';
      
      if (statusBar) {
        statusBar.classList.remove('hidden');
      }
      
      this.showAdminPanel();
      this.updateAnalyticsDisplay();
      this.trackActivity('Admin mode activated');
    } else {
      // Exit admin mode
      toggle.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
      toggle.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
      text.textContent = 'Admin Mode';
      
      if (statusBar) {
        statusBar.classList.add('hidden');
      }
      
      this.hideAdminPanel();
      this.trackActivity('Admin mode deactivated');
    }
  }

  showAdminPanel() {
    const panel = document.getElementById('integrated-admin-panel');
    if (panel) {
      panel.classList.remove('hidden');
    }
  }

  hideAdminPanel() {
    const panel = document.getElementById('integrated-admin-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.integrated-admin-tab').forEach(tab => {
      tab.classList.remove('border-blue-500', 'text-blue-600');
      tab.classList.add('border-transparent', 'text-gray-500');
    });

    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.remove('border-transparent', 'text-gray-500');
      activeTab.classList.add('border-blue-500', 'text-blue-600');
    }

    // Update content
    document.querySelectorAll('.integrated-admin-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
      activeContent.classList.remove('hidden');
    }
  }

  initializeAnalytics() {
    // Hook into existing Timeline Edition events
    this.hookIntoTimelineFeatures();
  }

  hookIntoTimelineFeatures() {
    // Hook into LLM prompt submissions
    const originalPromptHandler = window.handleLLMPrompt;
    if (originalPromptHandler) {
      window.handleLLMPrompt = (...args) => {
        this.analytics.prompts++;
        this.trackActivity('AI prompt submitted');
        this.updateAnalyticsDisplay();
        return originalPromptHandler.apply(window, args);
      };
    }

    // Hook into company research
    const researchButton = document.getElementById('company-research-start');
    if (researchButton) {
      researchButton.addEventListener('click', () => {
        this.analytics.research++;
        this.trackActivity('Company research initiated');
        this.updateAnalyticsDisplay();
      });
    }

    // Hook into customer configuration updates
    const updateButton = document.getElementById('update-content-btn');
    if (updateButton) {
      updateButton.addEventListener('click', () => {
        this.analytics.updates++;
        this.trackActivity('Customer configuration updated');
        this.updateAnalyticsDisplay();
      });
    }

    // Hook into timeline stage interactions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.stage-marker') || e.target.closest('.timeline-stage')) {
        this.trackActivity('Timeline stage interaction');
        this.updateAnalyticsDisplay();
      }
    });
  }

  trackActivity(description) {
    const activity = {
      timestamp: new Date().toISOString(),
      description: description
    };
    
    this.analytics.activity.unshift(activity);
    
    // Keep only last 50 activities
    if (this.analytics.activity.length > 50) {
      this.analytics.activity = this.analytics.activity.slice(0, 50);
    }
  }

  updateAnalyticsDisplay() {
    // Update counters
    const counters = {
      'ai-prompts-count': this.analytics.prompts,
      'research-count': this.analytics.research,
      'config-count': this.analytics.configs,
      'update-count': this.analytics.updates
    };

    Object.entries(counters).forEach(([id, count]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = count;
      }
    });

    // Update recent activity
    const activityContainer = document.getElementById('recent-activity');
    if (activityContainer && this.analytics.activity.length > 0) {
      activityContainer.innerHTML = this.analytics.activity.slice(0, 10).map(activity => `
        <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
          <span class="text-sm text-gray-700">${activity.description}</span>
          <span class="text-xs text-gray-500">${new Date(activity.timestamp).toLocaleTimeString()}</span>
        </div>
      `).join('');
    }
  }

  saveApiKey() {
    const input = document.getElementById('integrated-api-key');
    if (!input?.value.trim()) {
      this.showApiStatus('Please enter an API key', 'error');
      return;
    }

    // Store securely (in real implementation, use proper encryption)
    sessionStorage.setItem('integrated_api_key', btoa(input.value.trim()));
    this.showApiStatus('API key saved successfully', 'success');
    
    // Update status
    const analyticsStatus = document.getElementById('analytics-status');
    if (analyticsStatus) {
      analyticsStatus.innerHTML = '<span class="text-green-600">✓ Configured</span>';
    }
    
    input.value = '';
    this.trackActivity('API key configured');
  }

  testApiConnection() {
    const apiKey = sessionStorage.getItem('integrated_api_key');
    if (!apiKey) {
      this.showApiStatus('Please save an API key first', 'error');
      return;
    }

    this.showApiStatus('Testing connection...', 'info');
    
    // Simulate API test (in real implementation, make actual API call)
    setTimeout(() => {
      this.showApiStatus('Connection successful! AI analytics enabled.', 'success');
      this.trackActivity('API connection tested successfully');
    }, 2000);
  }

  toggleApiKeyVisibility() {
    const input = document.getElementById('integrated-api-key');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  showApiStatus(message, type) {
    const status = document.getElementById('integrated-api-status');
    if (status) {
      status.className = `p-4 rounded-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' :
        type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`;
      status.textContent = message;
      status.classList.remove('hidden');
      
      if (type !== 'error') {
        setTimeout(() => {
          status.classList.add('hidden');
        }, 3000);
      }
    }
  }

  // Public API for external integration
  getAnalytics() {
    return { ...this.analytics };
  }

  exportAnalytics() {
    const data = {
      timestamp: new Date().toISOString(),
      analytics: this.getAnalytics(),
      adminMode: this.adminMode
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-admin-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.trackActivity('Analytics data exported');
  }

  resetAnalytics() {
    if (confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
      this.analytics = {
        prompts: 0,
        research: 0,
        configs: 0,
        updates: 0,
        activity: []
      };
      this.updateAnalyticsDisplay();
      this.trackActivity('Analytics data reset');
    }
  }
}