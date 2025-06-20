/**
 * Security Audit Script
 * Final security check for production deployment
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://192.168.1.8:3001/api';

// Security audit results
const auditResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
  details: []
};

// Utility functions
const logAudit = (category, test, status, message, details = {}) => {
  const result = {
    category,
    test,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  auditResults.details.push(result);
  auditResults.total++;
  
  if (status === 'PASS') {
    auditResults.passed++;
    console.log(`✅ [${category}] ${test}: ${message}`);
  } else if (status === 'FAIL') {
    auditResults.failed++;
    console.log(`❌ [${category}] ${test}: ${message}`);
  } else if (status === 'WARN') {
    auditResults.warnings++;
    console.log(`⚠️  [${category}] ${test}: ${message}`);
  }
  
  if (Object.keys(details).length > 0) {
    console.log(`   Details:`, details);
  }
};

// Environment security checks
const auditEnvironmentSecurity = () => {
  console.log('\n🔐 Environment Security Audit');
  console.log('-'.repeat(50));
  
  // Check for production environment
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    logAudit('Environment', 'NODE_ENV', 'PASS', 'Running in production mode');
  } else {
    logAudit('Environment', 'NODE_ENV', 'WARN', `Running in ${nodeEnv || 'development'} mode`, {
      recommendation: 'Set NODE_ENV=production for production deployment'
    });
  }
  
  // Check for secure secrets
  const requiredSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
  requiredSecrets.forEach(secret => {
    const value = process.env[secret];
    if (!value) {
      logAudit('Environment', secret, 'FAIL', 'Secret not set');
    } else if (value.length < 32) {
      logAudit('Environment', secret, 'FAIL', 'Secret too short (< 32 characters)');
    } else if (['secret', 'password', 'changeme', 'default'].some(weak => value.toLowerCase().includes(weak))) {
      logAudit('Environment', secret, 'FAIL', 'Weak or default secret detected');
    } else {
      logAudit('Environment', secret, 'PASS', 'Secret properly configured');
    }
  });
  
  // Check CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    logAudit('Environment', 'CORS_ORIGIN', 'WARN', 'CORS origin not explicitly set');
  } else if (corsOrigin === '*') {
    logAudit('Environment', 'CORS_ORIGIN', 'FAIL', 'CORS allows all origins (security risk)');
  } else {
    logAudit('Environment', 'CORS_ORIGIN', 'PASS', 'CORS properly configured');
  }
  
  // Check database URI security
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logAudit('Environment', 'MONGODB_URI', 'FAIL', 'Database URI not set');
  } else if (mongoUri.includes('localhost') && nodeEnv === 'production') {
    logAudit('Environment', 'MONGODB_URI', 'WARN', 'Using localhost database in production');
  } else if (!mongoUri.includes('ssl=true') && !mongoUri.includes('localhost')) {
    logAudit('Environment', 'MONGODB_URI', 'WARN', 'Database connection may not use SSL');
  } else {
    logAudit('Environment', 'MONGODB_URI', 'PASS', 'Database URI properly configured');
  }
};

// File system security checks
const auditFileSystemSecurity = () => {
  console.log('\n📁 File System Security Audit');
  console.log('-'.repeat(50));
  
  // Check for sensitive files
  const sensitiveFiles = [
    '.env',
    '.env.production',
    'backend/.env',
    'backend/.env.production'
  ];
  
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const stats = fs.statSync(file);
        const mode = (stats.mode & parseInt('777', 8)).toString(8);
        
        if (mode === '600' || mode === '644') {
          logAudit('FileSystem', `${file} permissions`, 'PASS', `Secure permissions (${mode})`);
        } else {
          logAudit('FileSystem', `${file} permissions`, 'WARN', `Permissions may be too open (${mode})`);
        }
      } catch (error) {
        logAudit('FileSystem', `${file} permissions`, 'WARN', 'Cannot check file permissions');
      }
    } else {
      logAudit('FileSystem', `${file} existence`, 'WARN', 'Environment file not found');
    }
  });
  
  // Check for backup files
  const backupPatterns = ['.bak', '.backup', '.old', '.tmp', '~'];
  let backupFilesFound = 0;
  
  const checkDirectory = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (backupPatterns.some(pattern => file.endsWith(pattern))) {
          backupFilesFound++;
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  };
  
  checkDirectory('.');
  checkDirectory('backend');
  
  if (backupFilesFound === 0) {
    logAudit('FileSystem', 'Backup files', 'PASS', 'No backup files found');
  } else {
    logAudit('FileSystem', 'Backup files', 'WARN', `${backupFilesFound} backup files found`, {
      recommendation: 'Remove backup files before production deployment'
    });
  }
};

// API security tests
const auditAPISecurity = async () => {
  console.log('\n🌐 API Security Audit');
  console.log('-'.repeat(50));
  
  try {
    // Test unauthenticated access
    try {
      const response = await axios.get(`${API_BASE}/users`, { timeout: 10000 });
      logAudit('API', 'Unauthenticated access', 'FAIL', 'Protected endpoint accessible without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        logAudit('API', 'Unauthenticated access', 'PASS', 'Protected endpoints properly secured');
      } else {
        logAudit('API', 'Unauthenticated access', 'WARN', 'Unexpected response to unauthenticated request');
      }
    }
    
    // Test invalid token
    try {
      const response = await axios.get(`${API_BASE}/users`, {
        headers: { 'Authorization': 'Bearer invalid_token' },
        timeout: 10000
      });
      logAudit('API', 'Invalid token', 'FAIL', 'Invalid token accepted');
    } catch (error) {
      if (error.response?.status === 401) {
        logAudit('API', 'Invalid token', 'PASS', 'Invalid tokens properly rejected');
      } else {
        logAudit('API', 'Invalid token', 'WARN', 'Unexpected response to invalid token');
      }
    }
    
    // Test SQL injection attempts
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --"
    ];
    
    let sqlInjectionBlocked = 0;
    
    for (const payload of sqlInjectionPayloads) {
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: payload,
          password: 'test'
        }, { timeout: 5000 });
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 401) {
          sqlInjectionBlocked++;
        }
      }
    }
    
    if (sqlInjectionBlocked === sqlInjectionPayloads.length) {
      logAudit('API', 'SQL Injection', 'PASS', 'SQL injection attempts properly blocked');
    } else {
      logAudit('API', 'SQL Injection', 'FAIL', `${sqlInjectionPayloads.length - sqlInjectionBlocked} SQL injection attempts not blocked`);
    }
    
    // Test XSS attempts
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">'
    ];
    
    let xssBlocked = 0;
    
    for (const payload of xssPayloads) {
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: 'test@example.com',
          password: 'password',
          firstName: payload,
          lastName: 'Test'
        }, { timeout: 5000 });
      } catch (error) {
        if (error.response?.status === 400) {
          xssBlocked++;
        }
      }
    }
    
    if (xssBlocked >= xssPayloads.length * 0.8) { // Allow some flexibility
      logAudit('API', 'XSS Protection', 'PASS', 'XSS attempts properly handled');
    } else {
      logAudit('API', 'XSS Protection', 'WARN', 'Some XSS payloads may not be properly sanitized');
    }
    
  } catch (error) {
    logAudit('API', 'Security tests', 'WARN', 'Could not complete all API security tests', {
      error: error.message
    });
  }
};

// Rate limiting tests
const auditRateLimiting = async () => {
  console.log('\n🚦 Rate Limiting Audit');
  console.log('-'.repeat(50));
  
  try {
    // Test rate limiting on auth endpoint
    const requests = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.post(`${API_BASE}/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }, { timeout: 5000 }).catch(error => error.response)
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r?.status === 429).length;
    const totalTime = Date.now() - startTime;
    
    if (rateLimited > 0) {
      logAudit('RateLimit', 'Auth endpoint', 'PASS', `Rate limiting active (${rateLimited}/10 requests blocked)`);
    } else {
      logAudit('RateLimit', 'Auth endpoint', 'WARN', 'No rate limiting detected on auth endpoint');
    }
    
    logAudit('RateLimit', 'Response time', totalTime < 5000 ? 'PASS' : 'WARN', 
      `Bulk requests completed in ${totalTime}ms`);
    
  } catch (error) {
    logAudit('RateLimit', 'Rate limiting test', 'WARN', 'Could not test rate limiting', {
      error: error.message
    });
  }
};

// Security headers check
const auditSecurityHeaders = async () => {
  console.log('\n🛡️ Security Headers Audit');
  console.log('-'.repeat(50));
  
  try {
    const response = await axios.get('http://192.168.1.8:3001/health', { timeout: 10000 });
    const headers = response.headers;
    
    const securityHeaders = [
      { name: 'x-content-type-options', expected: 'nosniff' },
      { name: 'x-frame-options', expected: 'DENY' },
      { name: 'x-xss-protection', expected: '1; mode=block' },
      { name: 'referrer-policy', expected: 'strict-origin-when-cross-origin' }
    ];
    
    securityHeaders.forEach(header => {
      const value = headers[header.name];
      if (value && value.includes(header.expected)) {
        logAudit('Headers', header.name, 'PASS', `Properly set: ${value}`);
      } else {
        logAudit('Headers', header.name, 'WARN', `Missing or incorrect: ${value || 'not set'}`);
      }
    });
    
    // Check for server information disclosure
    if (headers['x-powered-by']) {
      logAudit('Headers', 'x-powered-by', 'WARN', 'Server information disclosed', {
        value: headers['x-powered-by']
      });
    } else {
      logAudit('Headers', 'x-powered-by', 'PASS', 'Server information properly hidden');
    }
    
  } catch (error) {
    logAudit('Headers', 'Security headers test', 'WARN', 'Could not test security headers', {
      error: error.message
    });
  }
};

// Main security audit
const runSecurityAudit = async () => {
  try {
    console.log('🔒 SECURITY AUDIT SUITE');
    console.log('='.repeat(80));
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log(`🌐 API Base: ${API_BASE}`);
    
    // Run all security audits
    auditEnvironmentSecurity();
    auditFileSystemSecurity();
    await auditAPISecurity();
    await auditRateLimiting();
    await auditSecurityHeaders();
    
    // Final security assessment
    console.log('\n' + '='.repeat(80));
    console.log('🎯 SECURITY AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Total Checks: ${auditResults.total}`);
    console.log(`✅ Passed: ${auditResults.passed}`);
    console.log(`❌ Failed: ${auditResults.failed}`);
    console.log(`⚠️  Warnings: ${auditResults.warnings}`);
    
    const securityScore = ((auditResults.passed / auditResults.total) * 100).toFixed(1);
    console.log(`🔒 Security Score: ${securityScore}%`);
    
    // Security recommendations
    console.log('\n🛡️ Security Assessment:');
    
    if (auditResults.failed === 0 && auditResults.warnings <= 2) {
      console.log('🎉 EXCELLENT SECURITY POSTURE');
      console.log('✅ System is ready for production deployment');
    } else if (auditResults.failed <= 2 && auditResults.warnings <= 5) {
      console.log('✅ GOOD SECURITY POSTURE');
      console.log('⚠️  Address warnings before production deployment');
    } else if (auditResults.failed <= 5) {
      console.log('⚠️  MODERATE SECURITY CONCERNS');
      console.log('🔧 Fix critical issues before production deployment');
    } else {
      console.log('❌ SIGNIFICANT SECURITY ISSUES');
      console.log('🚨 DO NOT DEPLOY TO PRODUCTION until issues are resolved');
    }
    
    // Critical issues summary
    const criticalIssues = auditResults.details.filter(r => r.status === 'FAIL');
    if (criticalIssues.length > 0) {
      console.log('\n🚨 Critical Security Issues:');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.category}] ${issue.test}: ${issue.message}`);
      });
    }
    
    // Warnings summary
    const warnings = auditResults.details.filter(r => r.status === 'WARN');
    if (warnings.length > 0) {
      console.log('\n⚠️  Security Warnings:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.category}] ${warning.test}: ${warning.message}`);
      });
    }
    
    console.log(`\n🕐 Completed at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Security audit failed:', error.message);
  }
};

runSecurityAudit();
