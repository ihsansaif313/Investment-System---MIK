/**
 * Performance Verification Script
 * Verify system performance under production conditions
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

const API_BASE = 'http://192.168.1.8:3001/api';

// Performance test configuration
const PERF_CONFIG = {
  concurrentUsers: 10,
  requestsPerUser: 20,
  timeout: 30000,
  thresholds: {
    responseTime: 2000, // 2 seconds max
    errorRate: 5, // 5% max error rate
    throughput: 50, // 50 requests per second min
    memoryGrowth: 50 // 50MB max memory growth
  }
};

// Test credentials
const TEST_CREDENTIALS = {
  email: 'superadmin@example.com',
  password: 'password123'
};

// Performance metrics
const metrics = {
  requests: [],
  errors: [],
  responseTimes: [],
  memoryUsage: [],
  startTime: 0,
  endTime: 0
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024) // MB
  };
};

const calculateStats = (values) => {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };
  
  const sorted = values.slice().sort((a, b) => a - b);
  const len = sorted.length;
  
  return {
    min: sorted[0],
    max: sorted[len - 1],
    avg: values.reduce((a, b) => a + b, 0) / len,
    p95: sorted[Math.floor(len * 0.95)],
    p99: sorted[Math.floor(len * 0.99)]
  };
};

// Authentication helper
const authenticate = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS, {
      timeout: PERF_CONFIG.timeout
    });
    
    if (response.data.success) {
      return response.data.data.token;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
};

// Single request performance test
const performRequest = async (token, endpoint, method = 'GET', data = null) => {
  const startTime = performance.now();
  const startMemory = getMemoryUsage();
  
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: PERF_CONFIG.timeout
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    const endTime = performance.now();
    const endMemory = getMemoryUsage();
    
    const result = {
      endpoint,
      method,
      responseTime: endTime - startTime,
      statusCode: response.status,
      success: true,
      cached: response.headers['x-cache'] || 'MISS',
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      timestamp: new Date().toISOString()
    };
    
    metrics.requests.push(result);
    metrics.responseTimes.push(result.responseTime);
    metrics.memoryUsage.push(endMemory);
    
    return result;
    
  } catch (error) {
    const endTime = performance.now();
    
    const result = {
      endpoint,
      method,
      responseTime: endTime - startTime,
      statusCode: error.response?.status || 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    metrics.errors.push(result);
    return result;
  }
};

// Load test simulation
const simulateUser = async (userId, token) => {
  console.log(`👤 User ${userId}: Starting performance test`);
  
  const endpoints = [
    '/companies',
    '/users',
    '/investments',
    '/assets',
    '/analytics/superadmin',
    '/admin-management/pending',
    '/activity-logs',
    '/company-assignments'
  ];
  
  const userResults = [];
  
  for (let i = 0; i < PERF_CONFIG.requestsPerUser; i++) {
    const endpoint = endpoints[i % endpoints.length];
    
    try {
      const result = await performRequest(token, endpoint);
      userResults.push(result);
      
      // Add some randomness to simulate real user behavior
      await sleep(Math.random() * 1000 + 500); // 0.5-1.5 seconds between requests
      
    } catch (error) {
      console.log(`👤 User ${userId}: Error on request ${i + 1}: ${error.message}`);
    }
  }
  
  console.log(`👤 User ${userId}: Completed ${userResults.length} requests`);
  return userResults;
};

// Concurrent load test
const runLoadTest = async (token) => {
  console.log('\n⚡ Running Concurrent Load Test');
  console.log('-'.repeat(50));
  console.log(`👥 Concurrent Users: ${PERF_CONFIG.concurrentUsers}`);
  console.log(`📊 Requests per User: ${PERF_CONFIG.requestsPerUser}`);
  console.log(`📈 Total Requests: ${PERF_CONFIG.concurrentUsers * PERF_CONFIG.requestsPerUser}`);
  
  metrics.startTime = performance.now();
  const startMemory = getMemoryUsage();
  
  // Create concurrent user simulations
  const userPromises = [];
  for (let i = 1; i <= PERF_CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i, token));
  }
  
  // Wait for all users to complete
  const allResults = await Promise.all(userPromises);
  
  metrics.endTime = performance.now();
  const endMemory = getMemoryUsage();
  
  // Calculate performance metrics
  const totalTime = metrics.endTime - metrics.startTime;
  const totalRequests = metrics.requests.length;
  const totalErrors = metrics.errors.length;
  const errorRate = (totalErrors / (totalRequests + totalErrors)) * 100;
  const throughput = (totalRequests / totalTime) * 1000; // requests per second
  const memoryGrowth = endMemory.heapUsed - startMemory.heapUsed;
  
  const responseTimeStats = calculateStats(metrics.responseTimes);
  
  console.log('\n📊 Load Test Results:');
  console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`📈 Total Requests: ${totalRequests}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`📉 Error Rate: ${errorRate.toFixed(2)}%`);
  console.log(`🚀 Throughput: ${throughput.toFixed(2)} req/sec`);
  console.log(`💾 Memory Growth: ${memoryGrowth}MB`);
  
  console.log('\n⏱️  Response Time Statistics:');
  console.log(`   Min: ${responseTimeStats.min.toFixed(2)}ms`);
  console.log(`   Max: ${responseTimeStats.max.toFixed(2)}ms`);
  console.log(`   Avg: ${responseTimeStats.avg.toFixed(2)}ms`);
  console.log(`   95th percentile: ${responseTimeStats.p95.toFixed(2)}ms`);
  console.log(`   99th percentile: ${responseTimeStats.p99.toFixed(2)}ms`);
  
  // Performance evaluation
  console.log('\n🎯 Performance Evaluation:');
  
  const checks = [
    {
      name: 'Average Response Time',
      value: responseTimeStats.avg,
      threshold: PERF_CONFIG.thresholds.responseTime,
      unit: 'ms',
      passed: responseTimeStats.avg < PERF_CONFIG.thresholds.responseTime
    },
    {
      name: 'Error Rate',
      value: errorRate,
      threshold: PERF_CONFIG.thresholds.errorRate,
      unit: '%',
      passed: errorRate < PERF_CONFIG.thresholds.errorRate
    },
    {
      name: 'Throughput',
      value: throughput,
      threshold: PERF_CONFIG.thresholds.throughput,
      unit: 'req/sec',
      passed: throughput > PERF_CONFIG.thresholds.throughput
    },
    {
      name: 'Memory Growth',
      value: memoryGrowth,
      threshold: PERF_CONFIG.thresholds.memoryGrowth,
      unit: 'MB',
      passed: memoryGrowth < PERF_CONFIG.thresholds.memoryGrowth
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    const comparison = check.name === 'Throughput' ? '>' : '<';
    console.log(`   ${status} ${check.name}: ${check.value.toFixed(2)}${check.unit} (${comparison} ${check.threshold}${check.unit})`);
    if (!check.passed) allPassed = false;
  });
  
  return {
    passed: allPassed,
    metrics: {
      totalTime,
      totalRequests,
      totalErrors,
      errorRate,
      throughput,
      memoryGrowth,
      responseTimeStats
    }
  };
};

// Cache performance test
const testCachePerformance = async (token) => {
  console.log('\n🗄️ Cache Performance Test');
  console.log('-'.repeat(50));
  
  const endpoint = '/companies';
  
  // First request (should be MISS)
  console.log('📊 First request (cache MISS expected)...');
  const firstRequest = await performRequest(token, endpoint);
  console.log(`   Response time: ${firstRequest.responseTime.toFixed(2)}ms`);
  console.log(`   Cache status: ${firstRequest.cached}`);
  
  await sleep(1000);
  
  // Second request (should be HIT)
  console.log('📊 Second request (cache HIT expected)...');
  const secondRequest = await performRequest(token, endpoint);
  console.log(`   Response time: ${secondRequest.responseTime.toFixed(2)}ms`);
  console.log(`   Cache status: ${secondRequest.cached}`);
  
  const improvement = ((firstRequest.responseTime - secondRequest.responseTime) / firstRequest.responseTime) * 100;
  
  console.log(`🚀 Cache Performance:`);
  console.log(`   Improvement: ${improvement.toFixed(1)}%`);
  console.log(`   Cache working: ${secondRequest.cached === 'HIT' ? '✅' : '❌'}`);
  
  return {
    cacheWorking: secondRequest.cached === 'HIT',
    improvement
  };
};

// Main performance verification
const runPerformanceVerification = async () => {
  try {
    console.log('⚡ PERFORMANCE VERIFICATION SUITE');
    console.log('='.repeat(80));
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log(`🌐 API Base: ${API_BASE}`);
    
    // Authenticate
    console.log('\n🔐 Authenticating...');
    const token = await authenticate();
    console.log('✅ Authentication successful');
    
    // Run cache performance test
    const cacheResults = await testCachePerformance(token);
    
    // Run load test
    const loadResults = await runLoadTest(token);
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PERFORMANCE VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    if (loadResults.passed && cacheResults.cacheWorking) {
      console.log('🎉 ALL PERFORMANCE TESTS PASSED!');
      console.log('✅ System meets production performance requirements');
    } else {
      console.log('⚠️  PERFORMANCE ISSUES DETECTED!');
      if (!loadResults.passed) {
        console.log('❌ Load test failed - system may not handle production load');
      }
      if (!cacheResults.cacheWorking) {
        console.log('❌ Caching not working - performance may be degraded');
      }
    }
    
    console.log('\n📊 Key Metrics:');
    console.log(`   Throughput: ${loadResults.metrics.throughput.toFixed(2)} req/sec`);
    console.log(`   Avg Response Time: ${loadResults.metrics.responseTimeStats.avg.toFixed(2)}ms`);
    console.log(`   Error Rate: ${loadResults.metrics.errorRate.toFixed(2)}%`);
    console.log(`   Cache Improvement: ${cacheResults.improvement.toFixed(1)}%`);
    console.log(`   Memory Growth: ${loadResults.metrics.memoryGrowth}MB`);
    
    console.log(`\n🕐 Completed at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Performance verification failed:', error.message);
  }
};

runPerformanceVerification();
