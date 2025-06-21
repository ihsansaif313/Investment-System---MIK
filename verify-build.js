#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies that the application builds correctly and all demo features work
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Investment Management System - Build Verification\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    console.error(error.message);
    return false;
  }
}

async function verifyBuild() {
  let allChecks = true;

  // 1. Check required files
  log('📋 Checking required files...', 'yellow');
  const requiredFiles = [
    ['package.json', 'Package configuration'],
    ['vite.config.ts', 'Vite configuration'],
    ['vercel.json', 'Vercel configuration'],
    ['.env.production', 'Production environment variables'],
    ['src/main.tsx', 'Main application entry'],
    ['src/services/demoAuth.ts', 'Demo authentication service'],
    ['src/data/demoData.ts', 'Demo data'],
    ['src/components/demo/DemoBanner.tsx', 'Demo banner component'],
    ['src/components/layout/DeveloperCredits.tsx', 'Developer credits component']
  ];

  for (const [file, description] of requiredFiles) {
    if (!checkFile(file, description)) {
      allChecks = false;
    }
  }

  // 2. Check dependencies
  log('\n📦 Checking dependencies...', 'yellow');
  if (!runCommand('npm list --depth=0', 'Dependency check')) {
    allChecks = false;
  }

  // 3. Run build
  log('\n🔨 Building application...', 'yellow');
  if (!runCommand('npm run build', 'Production build')) {
    allChecks = false;
  }

  // 4. Check build output
  log('\n📁 Checking build output...', 'yellow');
  const buildFiles = [
    ['dist/index.html', 'Main HTML file'],
    ['dist/assets', 'Assets directory']
  ];

  for (const [file, description] of buildFiles) {
    if (!checkFile(file, description)) {
      allChecks = false;
    }
  }

  // 5. Check build size
  if (fs.existsSync('dist')) {
    const stats = fs.statSync('dist');
    log(`📊 Build directory created: ${stats.isDirectory() ? 'Yes' : 'No'}`, 'green');
    
    // Check for critical files in dist
    const distFiles = fs.readdirSync('dist');
    log(`📄 Build files: ${distFiles.length} files generated`, 'blue');
  }

  // 6. Verify demo data integrity
  log('\n🎭 Verifying demo data...', 'yellow');
  try {
    const demoDataPath = path.join(__dirname, 'src', 'data', 'demoData.ts');
    const demoData = fs.readFileSync(demoDataPath, 'utf8');
    
    const checks = [
      ['demoUsers', 'Demo users data'],
      ['demoCompanies', 'Demo companies data'],
      ['demoInvestments', 'Demo investments data'],
      ['getDashboardMetrics', 'Dashboard metrics function'],
      ['getInvestorPortfolio', 'Investor portfolio function']
    ];

    for (const [item, description] of checks) {
      if (demoData.includes(item)) {
        log(`✅ ${description}`, 'green');
      } else {
        log(`❌ ${description}`, 'red');
        allChecks = false;
      }
    }
  } catch (error) {
    log(`❌ Demo data verification failed: ${error.message}`, 'red');
    allChecks = false;
  }

  // 7. Verify demo authentication
  log('\n🔐 Verifying demo authentication...', 'yellow');
  try {
    const demoAuthPath = path.join(__dirname, 'src', 'services', 'demoAuth.ts');
    const demoAuth = fs.readFileSync(demoAuthPath, 'utf8');
    
    const demoAccounts = [
      'miksupadmin@gmail.com',
      'mikadmin@gmail.com',
      'mikinvestor@gmail.com'
    ];

    for (const account of demoAccounts) {
      if (demoAuth.includes(account)) {
        log(`✅ Demo account: ${account}`, 'green');
      } else {
        log(`❌ Demo account missing: ${account}`, 'red');
        allChecks = false;
      }
    }
  } catch (error) {
    log(`❌ Demo authentication verification failed: ${error.message}`, 'red');
    allChecks = false;
  }

  // Final result
  log('\n' + '='.repeat(50), 'blue');
  if (allChecks) {
    log('🎉 BUILD VERIFICATION SUCCESSFUL!', 'green');
    log('✅ Application is ready for Vercel deployment', 'green');
    log('🚀 You can now deploy to Vercel with confidence', 'blue');
  } else {
    log('❌ BUILD VERIFICATION FAILED!', 'red');
    log('⚠️  Please fix the issues above before deploying', 'yellow');
  }
  log('='.repeat(50), 'blue');

  return allChecks;
}

// Run verification
verifyBuild()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`💥 Verification script error: ${error.message}`, 'red');
    process.exit(1);
  });
