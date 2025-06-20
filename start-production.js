#!/usr/bin/env node

/**
 * Production Startup Script
 * Handles production deployment startup with proper checks and initialization
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
};

const checkEnvironment = () => {
  log('🔍 Checking production environment...', 'cyan');
  
  // Check if .env.production exists
  if (!fs.existsSync('.env.production')) {
    log('❌ .env.production file not found!', 'red');
    log('💡 Please create .env.production with production settings', 'yellow');
    process.exit(1);
  }
  
  // Check if backend .env.production exists
  if (!fs.existsSync('backend/.env.production')) {
    log('❌ backend/.env.production file not found!', 'red');
    log('💡 Please create backend/.env.production with production settings', 'yellow');
    process.exit(1);
  }
  
  // Check if dist directory exists (frontend build)
  if (!fs.existsSync('dist')) {
    log('⚠️  Frontend build not found, building now...', 'yellow');
    return false;
  }
  
  log('✅ Environment check passed', 'green');
  return true;
};

const buildFrontend = () => {
  return new Promise((resolve, reject) => {
    log('🏗️  Building frontend for production...', 'cyan');
    
    const build = spawn('npm', ['run', 'build:prod'], {
      stdio: 'inherit',
      shell: true
    });
    
    build.on('close', (code) => {
      if (code === 0) {
        log('✅ Frontend build completed', 'green');
        resolve();
      } else {
        log('❌ Frontend build failed', 'red');
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
};

const startBackend = () => {
  return new Promise((resolve, reject) => {
    log('🚀 Starting backend server in production mode...', 'cyan');
    
    // Copy production env file
    if (fs.existsSync('backend/.env.production')) {
      fs.copyFileSync('backend/.env.production', 'backend/.env');
      log('📋 Production environment loaded', 'green');
    }
    
    const backend = spawn('npm', ['run', 'backend:prod'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });
    
    // Give backend time to start
    setTimeout(() => {
      log('✅ Backend server started', 'green');
      resolve(backend);
    }, 3000);
    
    backend.on('error', (error) => {
      log(`❌ Backend error: ${error.message}`, 'red');
      reject(error);
    });
  });
};

const startFrontend = () => {
  return new Promise((resolve, reject) => {
    log('🌐 Starting frontend server in production mode...', 'cyan');
    
    // Copy production env file
    if (fs.existsSync('.env.production')) {
      fs.copyFileSync('.env.production', '.env');
      log('📋 Frontend production environment loaded', 'green');
    }
    
    const frontend = spawn('npm', ['run', 'preview'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });
    
    setTimeout(() => {
      log('✅ Frontend server started', 'green');
      resolve(frontend);
    }, 2000);
    
    frontend.on('error', (error) => {
      log(`❌ Frontend error: ${error.message}`, 'red');
      reject(error);
    });
  });
};

const healthCheck = async () => {
  log('🏥 Performing health check...', 'cyan');
  
  try {
    // Wait a bit for servers to fully start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check backend health
    const { default: fetch } = await import('node-fetch');
    
    try {
      const backendResponse = await fetch('http://localhost:3001/health');
      if (backendResponse.ok) {
        log('✅ Backend health check passed', 'green');
      } else {
        log('⚠️  Backend health check failed', 'yellow');
      }
    } catch (error) {
      log('❌ Backend not responding', 'red');
    }
    
    // Check frontend
    try {
      const frontendResponse = await fetch('http://localhost:5173');
      if (frontendResponse.ok) {
        log('✅ Frontend health check passed', 'green');
      } else {
        log('⚠️  Frontend health check failed', 'yellow');
      }
    } catch (error) {
      log('❌ Frontend not responding', 'red');
    }
    
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
  }
};

const printStartupInfo = () => {
  log('\n' + '='.repeat(60), 'cyan');
  log('🎉 INVESTMENT MANAGEMENT SYSTEM - PRODUCTION MODE', 'green');
  log('='.repeat(60), 'cyan');
  log('🌐 Frontend: http://localhost:5173', 'blue');
  log('🔧 Backend API: http://localhost:3001', 'blue');
  log('📊 Health Check: http://localhost:3001/health', 'blue');
  log('📝 Logs: backend/logs/', 'blue');
  log('='.repeat(60), 'cyan');
  log('💡 Press Ctrl+C to stop all services', 'yellow');
  log('');
};

const main = async () => {
  try {
    log('🚀 Starting Investment Management System in Production Mode', 'magenta');
    log('='.repeat(60), 'cyan');
    
    // Environment checks
    const envOk = checkEnvironment();
    
    // Build frontend if needed
    if (!envOk) {
      await buildFrontend();
    }
    
    // Start services
    const backendProcess = await startBackend();
    const frontendProcess = await startFrontend();
    
    // Health check
    await healthCheck();
    
    // Print startup info
    printStartupInfo();
    
    // Handle graceful shutdown
    const shutdown = (signal) => {
      log(`\n🛑 Received ${signal}, shutting down gracefully...`, 'yellow');
      
      if (backendProcess) {
        backendProcess.kill();
        log('✅ Backend stopped', 'green');
      }
      
      if (frontendProcess) {
        frontendProcess.kill();
        log('✅ Frontend stopped', 'green');
      }
      
      log('👋 Goodbye!', 'cyan');
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    log(`❌ Startup failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

main();
