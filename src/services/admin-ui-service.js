/**
 * Admin UI Service
 * Integrates the robust admin interface from src/admin/ into the Timeline Edition
 */

export class AdminUIService {
  constructor() {
    this.panelVisible = false;
    this.adminInterface = null;
  }

  /**
   * Loads and integrates the full admin interface from src/admin/
   */
  async loadFullAdminInterface() {
    try {
      // Load the admin HTML content
      const adminResponse = await fetch('./src/admin/admin.html');
      const adminHtml = await adminResponse.text();
      
      // Extract the body content from admin.html
      const parser = new DOMParser();
      const adminDoc = parser.parseFromString(adminHtml, 'text/html');
      const adminBody = adminDoc.body;
      
      return adminBody.innerHTML;
    } catch (error) {
      console.error('Failed to load admin interface:', error);
      return this.getFallbackAdminInterface();
    }
  }

  /**
   * Creates a comprehensive admin panel with the full admin interface
   */
  async createFullAdminPanel() {
    const adminContent = await this.loadFullAdminInterface();
    
    return `
      <!-- Full Integrated Admin Panel -->
      <div id="integrated-admin-panel" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden">
            
            <!-- Admin Header -->
            <div class="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center text-white">
              <div class="flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <h2 class="text-xl font-bold">Timeline Edition - Content Admin</h2>
                  <p class="text-orange-100 text-sm">Advanced content management & configuration</p>
                </div>
              </div>
              <button id="close-admin-panel" class="text-white hover:text-orange-200 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Full Admin Interface Container -->
            <div id="admin-interface-container" class="h-full overflow-y-auto">
              ${adminContent}
            </div>

          </div>
        </div>
      </div>
    `;
  }

  /**
   * Fallback admin interface if full admin can't be loaded
   */
  getFallbackAdminInterface() {
    return `
      <!-- Admin Status Bar -->
      <div id="admin-status-bar" class="bg-blue-600 text-white px-4 py-2 text-center text-sm hidden">
        <div class="flex justify-center items-center space-x-4">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <use href="#cog-icon"></use>
            </svg>
            Admin Mode Active
          </span>
          <span>|</span>
          <button onclick="window.IntegratedAdmin.showAdminPanel()" class="hover:underline">
            Open Admin Panel
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Creates the main admin panel HTML
   */
  createAdminPanel() {
    return `
      <!-- Integrated Admin Panel -->
      <div id="integrated-admin-panel" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            <!-- Header -->
            <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900">Timeline Edition - Admin Panel</h2>
              <button id="close-admin-panel" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <use href="#close-icon"></use>
                </svg>
              </button>
            </div>

            <!-- Tab Navigation -->
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8 px-6">
                <button class="integrated-admin-tab py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm" data-tab="overview">
                  Overview
                </button>
                <button class="integrated-admin-tab py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" data-tab="analytics">
                  Analytics
                </button>
                <button class="integrated-admin-tab py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" data-tab="ai-config">
                  AI Configuration
                </button>
                <button class="integrated-admin-tab py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm" data-tab="content">
                  Content Management
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              ${this.createOverviewTab()}
              ${this.createAnalyticsTab()}
              ${this.createAIConfigTab()}
              ${this.createContentTab()}
            </div>

          </div>
        </div>
      </div>
    `;
  }

  createOverviewTab() {
    return `
      <!-- Overview Tab -->
      <div id="overview-tab" class="integrated-admin-tab-content">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- System Status -->
          <div class="bg-white border rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3">System Status</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Timeline Edition:</span>
                <span class="text-green-600 font-medium">✓ Active</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Admin Integration:</span>
                <span class="text-green-600 font-medium">✓ Loaded</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Analytics:</span>
                <span id="analytics-status" class="text-yellow-600 font-medium">⚠ Not Configured</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">AI Service:</span>
                <span class="text-yellow-600 font-medium">⚠ Requires API Key</span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white border rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3">Quick Stats</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center p-3 bg-blue-50 rounded">
                <div class="text-2xl font-bold text-blue-600" id="ai-prompts-count">0</div>
                <div class="text-sm text-gray-600">AI Prompts</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded">
                <div class="text-2xl font-bold text-green-600" id="research-count">0</div>
                <div class="text-sm text-gray-600">Research Sessions</div>
              </div>
              <div class="text-center p-3 bg-purple-50 rounded">
                <div class="text-2xl font-bold text-purple-600" id="config-count">0</div>
                <div class="text-sm text-gray-600">Configurations</div>
              </div>
              <div class="text-center p-3 bg-orange-50 rounded">
                <div class="text-2xl font-bold text-orange-600" id="update-count">0</div>
                <div class="text-sm text-gray-600">Updates</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Recent Activity -->
        <div class="mt-6 bg-white border rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">Recent Activity</h3>
          <div id="recent-activity" class="space-y-2">
            <div class="text-gray-500 text-center py-4">No recent activity</div>
          </div>
        </div>
      </div>
    `;
  }

  createAnalyticsTab() {
    return `
      <!-- Analytics Tab -->
      <div id="analytics-tab" class="integrated-admin-tab-content hidden">
        <div class="space-y-6">
          
          <!-- Analytics Controls -->
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Usage Analytics</h3>
            <div class="flex space-x-3">
              <button onclick="window.IntegratedAdmin.exportAnalytics()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Export Data
              </button>
              <button onclick="window.IntegratedAdmin.resetAnalytics()" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                Reset Data
              </button>
            </div>
          </div>

          <!-- Detailed Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">AI Interactions</h4>
              <div class="text-3xl font-bold text-blue-600 mb-1" id="detailed-ai-count">0</div>
              <p class="text-sm text-gray-500">Prompts submitted to AI assistant</p>
            </div>
            <div class="bg-white border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Research Sessions</h4>
              <div class="text-3xl font-bold text-green-600 mb-1" id="detailed-research-count">0</div>
              <p class="text-sm text-gray-500">Company research initiated</p>
            </div>
            <div class="bg-white border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Total Activity</h4>
              <div class="text-3xl font-bold text-purple-600 mb-1" id="detailed-total-count">0</div>
              <p class="text-sm text-gray-500">All tracked interactions</p>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="bg-white border rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">Activity Timeline</h4>
            <div id="activity-timeline" class="space-y-3 max-h-64 overflow-y-auto">
              <div class="text-gray-500 text-center py-8">No activity recorded yet</div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  createAIConfigTab() {
    return `
      <!-- AI Configuration Tab -->
      <div id="ai-config-tab" class="integrated-admin-tab-content hidden">
        <div class="space-y-6">
          
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Claude API Configuration</h3>
            <p class="text-gray-600 mb-4">Configure your Claude API key to enable AI analytics and enhanced features.</p>
            
            <div class="space-y-4">
              <div>
                <label for="integrated-api-key" class="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div class="flex space-x-3">
                  <input
                    type="password"
                    id="integrated-api-key"
                    placeholder="sk-ant-..."
                    class="flex-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    id="toggle-integrated-api-visibility"
                    class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    title="Toggle visibility"
                  >
                    👁️
                  </button>
                </div>
              </div>

              <div class="flex space-x-3">
                <button
                  id="save-integrated-api-key"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Save API Key
                </button>
                <button
                  id="test-integrated-api"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Test Connection
                </button>
              </div>

              <!-- Status Message -->
              <div id="integrated-api-status" class="hidden"></div>
            </div>
          </div>

          <!-- AI Features Status -->
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">AI Features Status</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span class="text-sm">Prompt Quality Analysis</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span class="text-sm">Context Inference</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span class="text-sm">Response Enhancement</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span class="text-sm">Analytics Tracking</span>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-3">
              <span class="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
              Requires API key configuration
            </p>
          </div>

        </div>
      </div>
    `;
  }

  createContentTab() {
    return `
      <!-- Content Management Tab -->
      <div id="content-tab" class="integrated-admin-tab-content hidden">
        <div class="space-y-6">
          
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Timeline Edition Content</h3>
            <p class="text-gray-600 mb-4">Manage and monitor your Timeline Edition content and configurations.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Content Statistics -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3">Content Statistics</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Active Industries:</span>
                    <span class="text-sm font-medium">Banking, Insurance</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Total Personas:</span>
                    <span class="text-sm font-medium">12</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Sales Stages:</span>
                    <span class="text-sm font-medium">5</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Resources:</span>
                    <span class="text-sm font-medium">75+</span>
                  </div>
                </div>
              </div>

              <!-- Feature Status -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3">Feature Status</h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">AI Prompt Bar:</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Company Research:</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Customer Config:</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Timeline Navigation:</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Content Actions -->
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Content Management Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                <div class="text-lg font-medium text-gray-900 mb-1">Export Content</div>
                <div class="text-sm text-gray-600">Download all content data</div>
              </button>
              <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                <div class="text-lg font-medium text-gray-900 mb-1">Validate Structure</div>
                <div class="text-sm text-gray-600">Check content integrity</div>
              </button>
              <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                <div class="text-lg font-medium text-gray-900 mb-1">Backup Data</div>
                <div class="text-sm text-gray-600">Create content backup</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  async injectAdminUI() {
    // Check if admin panel already exists
    if (document.getElementById('integrated-admin-panel')) {
      console.log('Admin panel already exists, skipping injection');
      return;
    }

    console.log('🔧 Loading full admin interface...');
    
    // Load admin CSS if not already loaded
    await this.loadAdminCSS();
    
    // Create and inject the full admin panel
    const adminPanelHTML = await this.createFullAdminPanel();
    document.body.insertAdjacentHTML('beforeend', adminPanelHTML);
    
    console.log('✅ Full admin interface injected successfully');
    
    // Initialize the admin interface after injection
    await this.initializeAdminInterface();
    
    // Bind events after injection
    this.bindAdminPanelEvents();
  }

  /**
   * Load admin CSS styles
   */
  async loadAdminCSS() {
    try {
      // Check if admin CSS is already loaded
      if (document.querySelector('link[href*="admin"]')) {
        return;
      }

      // Extract CSS from admin.html
      const adminResponse = await fetch('./src/admin/admin.html');
      const adminHtml = await adminResponse.text();
      
      const parser = new DOMParser();
      const adminDoc = parser.parseFromString(adminHtml, 'text/html');
      
      // Extract style tags and add them
      const styles = adminDoc.querySelectorAll('style');
      styles.forEach(style => {
        const newStyle = document.createElement('style');
        newStyle.textContent = style.textContent;
        document.head.appendChild(newStyle);
      });
      
      console.log('✅ Admin CSS loaded');
    } catch (error) {
      console.warn('⚠️ Could not load admin CSS:', error);
    }
  }

  /**
   * Load admin dependencies
   */
  async loadAdminDependencies() {
    try {
      // Load ContentAPI if not already available
      if (!window.ContentAPI) {
        const contentAPI = await import('../api/contentAPI.js');
        window.ContentAPI = contentAPI.ContentAPI || contentAPI.default;
      }
      console.log('✅ Admin dependencies loaded');
    } catch (error) {
      console.warn('⚠️ Could not load admin dependencies:', error);
    }
  }

  /**
   * Initialize the full admin interface functionality
   */
  async initializeAdminInterface() {
    try {
      console.log('🔧 Initializing admin interface functionality...');
      
      // Import and initialize the AdminInterface class
      // First load the ContentAPI dependency
      await this.loadAdminDependencies();
      
      const adminModule = await import('../admin/admin.js');
      const AdminInterface = adminModule.AdminInterface || adminModule.default;
      
      // Wait for the admin container to be in DOM
      const adminContainer = document.getElementById('admin-interface-container');
      if (adminContainer) {
        // Initialize the admin interface
        this.adminInterface = new AdminInterface();
        console.log('✅ Admin interface functionality initialized');
      } else {
        console.error('❌ Admin interface container not found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize admin interface:', error);
      // Continue without admin functionality
    }
  }

  bindAdminPanelEvents() {
    // Bind close button
    const closeBtn = document.getElementById('close-admin-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const panel = document.getElementById('integrated-admin-panel');
        if (panel) panel.classList.add('hidden');
      });
    }

    // Bind tab switching
    document.querySelectorAll('.integrated-admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    console.log('✅ Admin panel events bound');
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

    console.log(`✅ Switched to ${tabName} tab`);
  }
}