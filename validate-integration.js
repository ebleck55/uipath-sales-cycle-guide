/**
 * Integration Validation Script
 * Run this in the browser console after loading the hardened app
 * to validate that all features are properly integrated
 */

function validateIntegration() {
  console.log('🔍 Starting UiPath Sales Guide Integration Validation...\n');
  
  const results = [];
  
  // Test 1: Check global objects
  console.log('1. Testing Global Objects...');
  const globalObjects = [
    'HardenedApp',
    'appState', 
    'apiSecurity',
    'aiService',
    'analyticsService',
    'siteAnalytics'
  ];
  
  globalObjects.forEach(obj => {
    const exists = window[obj] !== undefined;
    results.push({
      test: `Global ${obj}`,
      status: exists ? 'PASS' : 'FAIL',
      details: exists ? 'Available' : 'Not found in window object'
    });
    
    if (exists) {
      console.log(`  ✅ ${obj}: Available`);
    } else {
      console.error(`  ❌ ${obj}: Not found`);
    }
  });
  
  // Test 2: Check analytics service
  console.log('\n2. Testing Analytics Service...');
  try {
    if (window.analyticsService) {
      // Test event tracking
      analyticsService.trackEvent('validation_test', { 
        timestamp: new Date().toISOString(),
        test: true 
      });
      
      const events = analyticsService.getEvents('all');
      const hasTestEvent = events.some(e => e.type === 'validation_test');
      
      results.push({
        test: 'Analytics Event Tracking',
        status: hasTestEvent ? 'PASS' : 'FAIL',
        details: hasTestEvent ? 'Successfully tracked test event' : 'Failed to track event'
      });
      
      console.log(`  ✅ Event tracking: ${hasTestEvent ? 'Working' : 'Failed'}`);
      console.log(`  📊 Total stored events: ${events.length}`);
      
      // Test global interface
      const hasGlobalInterface = window.siteAnalytics && typeof window.siteAnalytics.trackEvent === 'function';
      results.push({
        test: 'Analytics Global Interface',
        status: hasGlobalInterface ? 'PASS' : 'FAIL',
        details: hasGlobalInterface ? 'Global siteAnalytics interface available' : 'Global interface missing'
      });
      
      console.log(`  ✅ Global interface: ${hasGlobalInterface ? 'Available' : 'Missing'}`);
    }
  } catch (error) {
    results.push({
      test: 'Analytics Service',
      status: 'ERROR',
      details: error.message
    });
    console.error(`  ❌ Analytics Service Error: ${error.message}`);
  }
  
  // Test 3: Check AI service
  console.log('\n3. Testing AI Service...');
  try {
    if (window.aiService) {
      const hasApiKey = !!window.apiSecurity.getStoredApiKey();
      results.push({
        test: 'AI Service Configuration',
        status: hasApiKey ? 'PASS' : 'WARN',
        details: hasApiKey ? 'API key configured' : 'No API key configured (expected for testing)'
      });
      
      console.log(`  ${hasApiKey ? '✅' : '⚠️'} API Key: ${hasApiKey ? 'Configured' : 'Not configured'}`);
      
      // Test prompt tracking integration
      const hasPromptTracking = typeof aiService.trackPromptUsage === 'function';
      results.push({
        test: 'AI Prompt Tracking',
        status: hasPromptTracking ? 'PASS' : 'FAIL',
        details: hasPromptTracking ? 'Prompt tracking method available' : 'Prompt tracking not found'
      });
      
      console.log(`  ✅ Prompt tracking: ${hasPromptTracking ? 'Available' : 'Missing'}`);
    }
  } catch (error) {
    results.push({
      test: 'AI Service',
      status: 'ERROR', 
      details: error.message
    });
    console.error(`  ❌ AI Service Error: ${error.message}`);
  }
  
  // Test 4: Check DOM elements
  console.log('\n4. Testing Admin UI Elements...');
  const adminElements = [
    { selector: '#admin-mode-btn', name: 'Admin Mode Button' },
    { selector: '#admin-panel', name: 'Admin Panel' },
    { selector: '#admin-status', name: 'Admin Status Bar' },
    { selector: '#analytics-tab', name: 'Analytics Tab' },
    { selector: '#ai-settings-tab', name: 'AI Settings Tab' }
  ];
  
  adminElements.forEach(element => {
    const exists = document.querySelector(element.selector) !== null;
    results.push({
      test: `UI Element: ${element.name}`,
      status: exists ? 'PASS' : 'FAIL',
      details: exists ? 'Element found in DOM' : 'Element missing from DOM'
    });
    
    console.log(`  ${exists ? '✅' : '❌'} ${element.name}: ${exists ? 'Found' : 'Missing'}`);
  });
  
  // Test 5: Check app state
  console.log('\n5. Testing App State Management...');
  try {
    if (window.appState) {
      // Test state setting
      const originalValue = appState.get('testValue');
      appState.set('testValue', 'validation_test');
      const newValue = appState.get('testValue');
      
      const stateWorking = newValue === 'validation_test';
      results.push({
        test: 'App State Management',
        status: stateWorking ? 'PASS' : 'FAIL',
        details: stateWorking ? 'State get/set working' : 'State management failed'
      });
      
      console.log(`  ✅ State management: ${stateWorking ? 'Working' : 'Failed'}`);
      
      // Restore original value
      if (originalValue !== undefined) {
        appState.set('testValue', originalValue);
      }
    }
  } catch (error) {
    results.push({
      test: 'App State Management',
      status: 'ERROR',
      details: error.message
    });
    console.error(`  ❌ State Management Error: ${error.message}`);
  }
  
  // Test 6: Check security features
  console.log('\n6. Testing Security Features...');
  try {
    if (window.apiSecurity) {
      const hasEncryption = typeof apiSecurity.storeApiKey === 'function';
      const hasRateLimit = typeof apiSecurity.isRateLimited === 'function';
      
      results.push({
        test: 'Security API Storage',
        status: hasEncryption ? 'PASS' : 'FAIL',
        details: hasEncryption ? 'API key storage available' : 'API key storage missing'
      });
      
      results.push({
        test: 'Security Rate Limiting',
        status: hasRateLimit ? 'PASS' : 'FAIL',
        details: hasRateLimit ? 'Rate limiting available' : 'Rate limiting missing'
      });
      
      console.log(`  ✅ API Storage: ${hasEncryption ? 'Available' : 'Missing'}`);
      console.log(`  ✅ Rate Limiting: ${hasRateLimit ? 'Available' : 'Missing'}`);
    }
  } catch (error) {
    results.push({
      test: 'Security Features',
      status: 'ERROR',
      details: error.message
    });
    console.error(`  ❌ Security Features Error: ${error.message}`);
  }
  
  // Summary
  console.log('\n📋 VALIDATION SUMMARY\n');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⚠️  WARNINGS: ${warnings}`);
  console.log(`💥 ERRORS: ${errors}`);
  console.log(`📊 TOTAL: ${results.length}`);
  
  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : 
                 result.status === 'WARN' ? '⚠️' : 
                 result.status === 'ERROR' ? '💥' : '❌';
    console.log(`${index + 1}. ${icon} ${result.test}: ${result.details}`);
  });
  
  const overallStatus = failed === 0 && errors === 0 ? 'SUCCESS' : 'ISSUES_FOUND';
  console.log(`\n🎯 OVERALL STATUS: ${overallStatus}`);
  
  if (overallStatus === 'SUCCESS') {
    console.log('🎉 Integration validation completed successfully!');
    console.log('💡 Ready for production testing with real API key.');
  } else {
    console.log('🔧 Please address the issues above before proceeding.');
  }
  
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.validateIntegration = validateIntegration;
  console.log('💡 Validation script loaded. Run validateIntegration() to test.');
}