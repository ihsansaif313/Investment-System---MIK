/**
 * End-to-End Testing Suite
 * Comprehensive system testing with real user workflows
 */

import axios from 'axios';
import { randomBytes } from 'crypto';

const API_BASE = 'http://192.168.1.8:3001/api';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout
  retries: 3,
  delay: 2000 // 2 seconds between tests
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  details: []
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTest = (name, status, message = '', details = {}) => {
  const result = {
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.details.push(result);
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  } else if (status === 'SKIP') {
    testResults.skipped++;
    console.log(`⏭️  ${name}: ${message}`);
  }
  
  if (Object.keys(details).length > 0) {
    console.log(`   Details:`, details);
  }
};

const generateTestData = () => {
  const timestamp = Date.now();
  const random = randomBytes(4).toString('hex');
  
  return {
    superadmin: {
      email: 'superadmin@example.com',
      password: 'password123'
    },
    admin: {
      email: 'admin@techvest.com',
      password: 'password123'
    },
    investor: {
      email: 'investor@example.com',
      password: 'password123'
    },
    newUser: {
      email: `e2e.test.${timestamp}.${random}@example.com`,
      password: 'SecurePassword123!',
      firstName: `E2E${random}`,
      lastName: `Test${timestamp}`,
      phone: `+1-555-${String(timestamp).slice(-7)}`,
      address: `${random} E2E Test Street, Test City, TC 12345`
    },
    company: {
      name: `E2E Test Company ${timestamp}`,
      industry: 'Technology Testing',
      description: 'End-to-end test company for validation',
      contactEmail: `company.${timestamp}@example.com`,
      establishedDate: '2024-01-01',
      address: '123 Test Company Ave',
      contactPhone: '+1-555-0199',
      website: 'https://test-company.example.com'
    }
  };
};

// Test suite functions
const testSystemHealth = async () => {
  console.log('\n🏥 System Health Tests');
  console.log('-'.repeat(40));
  
  try {
    const healthResponse = await axios.get('http://192.168.1.8:3001/health', {
      timeout: TEST_CONFIG.timeout
    });
    
    if (healthResponse.data.status === 'OK') {
      logTest('System Health Check', 'PASS', 'All systems operational', {
        database: healthResponse.data.database,
        uptime: healthResponse.data.uptime,
        environment: healthResponse.data.environment
      });
    } else {
      logTest('System Health Check', 'FAIL', 'System not healthy', healthResponse.data);
    }
  } catch (error) {
    logTest('System Health Check', 'FAIL', 'Health endpoint not responding', {
      error: error.message
    });
  }
};

const testAuthentication = async (testData) => {
  console.log('\n🔐 Authentication Tests');
  console.log('-'.repeat(40));
  
  const authTests = [
    { name: 'Superadmin Login', user: testData.superadmin },
    { name: 'Admin Login', user: testData.admin },
    { name: 'Investor Login', user: testData.investor }
  ];
  
  const tokens = {};
  
  for (const test of authTests) {
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, test.user, {
        timeout: TEST_CONFIG.timeout
      });
      
      if (loginResponse.data.success && loginResponse.data.data.token) {
        tokens[test.user.email] = loginResponse.data.data.token;
        logTest(test.name, 'PASS', 'Login successful', {
          role: loginResponse.data.data.user.role.type,
          status: loginResponse.data.data.user.role.status
        });
      } else {
        logTest(test.name, 'FAIL', 'Login failed', loginResponse.data);
      }
    } catch (error) {
      logTest(test.name, 'FAIL', 'Login error', {
        error: error.response?.data?.message || error.message
      });
    }
    
    await sleep(1000); // Rate limiting protection
  }
  
  return tokens;
};

const testUserRegistration = async (testData) => {
  console.log('\n👤 User Registration Tests');
  console.log('-'.repeat(40));
  
  try {
    const registrationResponse = await axios.post(`${API_BASE}/auth/register`, testData.newUser, {
      timeout: TEST_CONFIG.timeout
    });
    
    if (registrationResponse.data.success) {
      logTest('New User Registration', 'PASS', 'Registration successful', {
        userId: registrationResponse.data.data?.user?.id,
        email: testData.newUser.email
      });
      
      // Test login with new user
      await sleep(2000);
      
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testData.newUser.email,
        password: testData.newUser.password
      }, { timeout: TEST_CONFIG.timeout });
      
      if (loginResponse.data.success) {
        logTest('New User Login', 'PASS', 'New user can login', {
          role: loginResponse.data.data.user.role.type
        });
        return loginResponse.data.data.token;
      } else {
        logTest('New User Login', 'FAIL', 'New user cannot login', loginResponse.data);
      }
    } else {
      logTest('New User Registration', 'FAIL', 'Registration failed', registrationResponse.data);
    }
  } catch (error) {
    logTest('New User Registration', 'FAIL', 'Registration error', {
      error: error.response?.data?.message || error.message
    });
  }
  
  return null;
};

const testDataOperations = async (tokens) => {
  console.log('\n📊 Data Operations Tests');
  console.log('-'.repeat(40));
  
  const superadminToken = tokens['superadmin@example.com'];
  if (!superadminToken) {
    logTest('Data Operations', 'SKIP', 'No superadmin token available');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${superadminToken}`,
    'Content-Type': 'application/json'
  };
  
  // Test companies endpoint
  try {
    const companiesResponse = await axios.get(`${API_BASE}/companies`, {
      headers,
      timeout: TEST_CONFIG.timeout
    });
    
    if (companiesResponse.data.success) {
      logTest('Companies Data Fetch', 'PASS', 'Companies retrieved successfully', {
        count: companiesResponse.data.data.length,
        cached: companiesResponse.headers['x-cache'] || 'MISS',
        responseTime: companiesResponse.headers['x-response-time'] || 'N/A'
      });
    } else {
      logTest('Companies Data Fetch', 'FAIL', 'Failed to fetch companies', companiesResponse.data);
    }
  } catch (error) {
    logTest('Companies Data Fetch', 'FAIL', 'Companies endpoint error', {
      error: error.response?.data?.message || error.message
    });
  }
  
  // Test investments endpoint
  try {
    const investmentsResponse = await axios.get(`${API_BASE}/investments`, {
      headers,
      timeout: TEST_CONFIG.timeout
    });
    
    if (investmentsResponse.data.success) {
      logTest('Investments Data Fetch', 'PASS', 'Investments retrieved successfully', {
        count: investmentsResponse.data.data.length
      });
    } else {
      logTest('Investments Data Fetch', 'FAIL', 'Failed to fetch investments', investmentsResponse.data);
    }
  } catch (error) {
    logTest('Investments Data Fetch', 'FAIL', 'Investments endpoint error', {
      error: error.response?.data?.message || error.message
    });
  }
  
  // Test users endpoint
  try {
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers,
      timeout: TEST_CONFIG.timeout
    });
    
    if (usersResponse.data.success) {
      logTest('Users Data Fetch', 'PASS', 'Users retrieved successfully', {
        count: usersResponse.data.data.length
      });
    } else {
      logTest('Users Data Fetch', 'FAIL', 'Failed to fetch users', usersResponse.data);
    }
  } catch (error) {
    logTest('Users Data Fetch', 'FAIL', 'Users endpoint error', {
      error: error.response?.data?.message || error.message
    });
  }
};

const testRoleBasedAccess = async (tokens) => {
  console.log('\n🎭 Role-Based Access Control Tests');
  console.log('-'.repeat(40));
  
  // Test admin access with investor token
  const investorToken = tokens['investor@example.com'];
  if (investorToken) {
    try {
      const adminResponse = await axios.get(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${investorToken}` },
        timeout: TEST_CONFIG.timeout
      });
      
      logTest('Investor Admin Access', 'FAIL', 'Investor should not access admin endpoints');
    } catch (error) {
      if (error.response?.status === 403) {
        logTest('Investor Admin Access', 'PASS', 'Investor properly denied admin access');
      } else {
        logTest('Investor Admin Access', 'FAIL', 'Unexpected error', {
          error: error.response?.data?.message || error.message
        });
      }
    }
  }
  
  // Test superadmin access
  const superadminToken = tokens['superadmin@example.com'];
  if (superadminToken) {
    try {
      const superadminResponse = await axios.get(`${API_BASE}/admin-management/pending`, {
        headers: { 'Authorization': `Bearer ${superadminToken}` },
        timeout: TEST_CONFIG.timeout
      });
      
      if (superadminResponse.data.success) {
        logTest('Superadmin Access', 'PASS', 'Superadmin can access all endpoints');
      } else {
        logTest('Superadmin Access', 'FAIL', 'Superadmin access denied', superadminResponse.data);
      }
    } catch (error) {
      logTest('Superadmin Access', 'FAIL', 'Superadmin access error', {
        error: error.response?.data?.message || error.message
      });
    }
  }
};

const testPerformance = async (tokens) => {
  console.log('\n⚡ Performance Tests');
  console.log('-'.repeat(40));
  
  const superadminToken = tokens['superadmin@example.com'];
  if (!superadminToken) {
    logTest('Performance Tests', 'SKIP', 'No superadmin token available');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${superadminToken}`,
    'Content-Type': 'application/json'
  };
  
  // Test response times
  const performanceTests = [
    { name: 'Companies Endpoint', url: `${API_BASE}/companies` },
    { name: 'Users Endpoint', url: `${API_BASE}/users` },
    { name: 'Investments Endpoint', url: `${API_BASE}/investments` }
  ];
  
  for (const test of performanceTests) {
    try {
      const startTime = Date.now();
      const response = await axios.get(test.url, { headers, timeout: TEST_CONFIG.timeout });
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 2000) { // Less than 2 seconds
        logTest(`${test.name} Performance`, 'PASS', `Response time acceptable: ${responseTime}ms`, {
          cached: response.headers['x-cache'] || 'MISS',
          memoryUsage: response.headers['x-memory-usage'] || 'N/A'
        });
      } else {
        logTest(`${test.name} Performance`, 'FAIL', `Response time too slow: ${responseTime}ms`);
      }
    } catch (error) {
      logTest(`${test.name} Performance`, 'FAIL', 'Performance test error', {
        error: error.message
      });
    }
    
    await sleep(500);
  }
};

// Main test runner
const runEndToEndTests = async () => {
  try {
    console.log('🚀 END-TO-END TESTING SUITE');
    console.log('='.repeat(80));
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log(`🌐 API Base: ${API_BASE}`);
    console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
    
    const testData = generateTestData();
    
    // Run test suites
    await testSystemHealth();
    await sleep(TEST_CONFIG.delay);
    
    const tokens = await testAuthentication(testData);
    await sleep(TEST_CONFIG.delay);
    
    const newUserToken = await testUserRegistration(testData);
    await sleep(TEST_CONFIG.delay);
    
    await testDataOperations(tokens);
    await sleep(TEST_CONFIG.delay);
    
    await testRoleBasedAccess(tokens);
    await sleep(TEST_CONFIG.delay);
    
    await testPerformance(tokens);
    
    // Final results
    console.log('\n' + '='.repeat(80));
    console.log('🎯 END-TO-END TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏭️  Skipped: ${testResults.skipped}`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log(`🕐 Completed at: ${new Date().toISOString()}`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! System is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues before production deployment.');
    }
    
    // Detailed results
    console.log('\n📋 Detailed Results:');
    testResults.details.forEach((result, index) => {
      console.log(`${index + 1}. ${result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'} ${result.name}: ${result.message}`);
    });
    
  } catch (error) {
    console.error('❌ End-to-end testing failed:', error.message);
  }
};

runEndToEndTests();
