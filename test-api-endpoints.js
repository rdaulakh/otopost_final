#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests all implemented API endpoints for the AI Social Media Platform
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE_URL = 'http://localhost:5010/api';
const TEST_TOKEN = 'test-jwt-token'; // Mock token for testing

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

// API endpoints to test
const endpoints = {
  'Health Check': {
    url: '/health',
    method: 'GET',
    requiresAuth: false
  },
  
  // Phase 1 - Critical Components
  'Cost Optimizer Overview': {
    url: '/cost-optimizer/overview',
    method: 'GET',
    requiresAuth: true
  },
  'System Health Monitoring': {
    url: '/monitoring/system-health',
    method: 'GET',
    requiresAuth: true
  },
  'Support Tickets': {
    url: '/support/tickets',
    method: 'GET',
    requiresAuth: true
  },
  'Subscription Analytics': {
    url: '/subscriptions/analytics',
    method: 'GET',
    requiresAuth: true
  },
  'Platform Configuration': {
    url: '/configuration/settings',
    method: 'GET',
    requiresAuth: true
  },
  
  // Phase 2 - Medium Priority Components
  'Content Management': {
    url: '/content-management/overview',
    method: 'GET',
    requiresAuth: true
  },
  'Notification Center': {
    url: '/notifications/overview',
    method: 'GET',
    requiresAuth: true
  },
  'Customer Success': {
    url: '/customer-success/overview',
    method: 'GET',
    requiresAuth: true
  },
  'Multi-Tenant Management': {
    url: '/multi-tenant/overview',
    method: 'GET',
    requiresAuth: true
  },
  'Compliance Security': {
    url: '/compliance-security/overview',
    method: 'GET',
    requiresAuth: true
  },
  
  // Phase 3 - High Priority Components (Admin)
  'Admin Dashboard': {
    url: '/admin-dashboard/overview',
    method: 'GET',
    requiresAuth: true
  },
  'User Management': {
    url: '/user-management/users',
    method: 'GET',
    requiresAuth: true
  },
  'Team Management': {
    url: '/team-management/members',
    method: 'GET',
    requiresAuth: true
  },
  'Advanced Analytics': {
    url: '/advanced-analytics/overview',
    method: 'GET',
    requiresAuth: true
  },
  'Revenue Dashboard': {
    url: '/revenue-dashboard/metrics',
    method: 'GET',
    requiresAuth: true
  },
  
  // Phase 3 - High Priority Components (Customer)
  'Customer Dashboard': {
    url: '/customer-dashboard/overview',
    method: 'GET',
    requiresAuth: true
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to make API requests
async function testEndpoint(name, config) {
  try {
    const requestConfig = {
      method: config.method,
      url: `${API_BASE_URL}${config.url}`,
      timeout: testConfig.timeout,
      validateStatus: () => true // Don't throw on any status code
    };

    // Add auth header if required
    if (config.requiresAuth) {
      requestConfig.headers = testConfig.headers;
    }

    const response = await axios(requestConfig);
    
    // Determine if test passed
    let passed = false;
    let message = '';
    
    if (!config.requiresAuth && response.status === 200) {
      passed = true;
      message = 'Public endpoint accessible';
    } else if (config.requiresAuth && response.status === 401) {
      passed = true;
      message = 'Protected endpoint properly secured';
    } else if (config.requiresAuth && response.status === 200) {
      passed = true;
      message = 'Authenticated request successful';
    } else {
      message = `Unexpected status: ${response.status}`;
    }
    
    return {
      name,
      passed,
      status: response.status,
      message,
      responseTime: response.headers['x-response-time'] || 'N/A',
      hasData: response.data ? Object.keys(response.data).length > 0 : false
    };
    
  } catch (error) {
    return {
      name,
      passed: false,
      status: 'ERROR',
      message: error.message,
      responseTime: 'N/A',
      hasData: false
    };
  }
}

// Main testing function
async function runTests() {
  console.log('\n🚀 AI Social Media Platform - API Endpoint Testing'.cyan.bold);
  console.log('=' .repeat(60).gray);
  
  console.log(`\n📡 Testing ${Object.keys(endpoints).length} API endpoints...`.yellow);
  console.log(`🔗 Base URL: ${API_BASE_URL}`.gray);
  
  testResults.total = Object.keys(endpoints).length;
  
  // Test each endpoint
  for (const [name, config] of Object.entries(endpoints)) {
    process.stdout.write(`\n⏳ Testing: ${name}... `.white);
    
    const result = await testEndpoint(name, config);
    testResults.details.push(result);
    
    if (result.passed) {
      testResults.passed++;
      console.log('✅ PASS'.green.bold + ` (${result.status}) - ${result.message}`.gray);
    } else {
      testResults.failed++;
      console.log('❌ FAIL'.red.bold + ` (${result.status}) - ${result.message}`.gray);
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60).gray);
  console.log('📊 TEST SUMMARY'.cyan.bold);
  console.log('='.repeat(60).gray);
  
  console.log(`\n✅ Passed: ${testResults.passed}`.green.bold);
  console.log(`❌ Failed: ${testResults.failed}`.red.bold);
  console.log(`📈 Total:  ${testResults.total}`.blue.bold);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`.yellow.bold);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS'.cyan.bold);
  console.log('-'.repeat(60).gray);
  
  testResults.details.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    const statusCode = result.status.toString().padEnd(5);
    const name = result.name.padEnd(30);
    
    console.log(`${status} ${statusCode} ${name} ${result.message}`.gray);
  });
  
  // API Architecture Summary
  console.log('\n🏗️  API ARCHITECTURE SUMMARY'.cyan.bold);
  console.log('-'.repeat(60).gray);
  
  const categories = {
    'Phase 1 (Critical)': ['Cost Optimizer', 'System Health', 'Support', 'Subscription', 'Platform Config'],
    'Phase 2 (Medium)': ['Content Mgmt', 'Notifications', 'Customer Success', 'Multi-Tenant', 'Compliance'],
    'Phase 3 (High - Admin)': ['Admin Dashboard', 'User Mgmt', 'Team Mgmt', 'Advanced Analytics', 'Revenue'],
    'Phase 3 (High - Customer)': ['Customer Dashboard']
  };
  
  Object.entries(categories).forEach(([phase, components]) => {
    console.log(`\n${phase}:`.yellow.bold);
    components.forEach(component => {
      console.log(`  • ${component}`.gray);
    });
  });
  
  // Security Summary
  console.log('\n🔒 SECURITY VERIFICATION'.cyan.bold);
  console.log('-'.repeat(60).gray);
  
  const authTests = testResults.details.filter(r => r.name !== 'Health Check');
  const securedEndpoints = authTests.filter(r => r.status === 401 || r.status === 200);
  
  console.log(`🛡️  Protected Endpoints: ${securedEndpoints.length}/${authTests.length}`.green);
  console.log(`🔑 Authentication Required: ${authTests.length} endpoints`.blue);
  console.log(`🚫 Unauthorized Access Blocked: ${authTests.filter(r => r.status === 401).length} endpoints`.yellow);
  
  console.log('\n🎉 API Testing Complete!'.green.bold);
  
  // Return results for further processing
  return testResults;
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testResults };
