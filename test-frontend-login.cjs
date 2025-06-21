/**
 * Test Frontend Login and Dashboard Data
 * Verify frontend is displaying demo data correctly
 */

const puppeteer = require('puppeteer');

async function testFrontendLogin() {
  let browser;
  try {
    console.log('🔍 Testing Frontend Login and Dashboard Data...\n');

    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to frontend
    console.log('1️⃣ Navigating to frontend...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Check if login page loads
    console.log('2️⃣ Checking login page...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Login page loaded');

    // Login with demo admin credentials
    console.log('3️⃣ Logging in with demo admin...');
    await page.type('input[type="email"]', 'admin.demo@investpro.com');
    await page.type('input[type="password"]', 'Admin123!');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    console.log('4️⃣ Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    
    // Check if we're on dashboard
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('dashboard')) {
      console.log('✅ Successfully logged in and redirected to dashboard');
      
      // Check for dashboard elements
      console.log('5️⃣ Checking dashboard elements...');
      
      // Check for metric cards
      const metricCards = await page.$$('.metric-card, [class*="metric"], [class*="card"]');
      console.log(`Found ${metricCards.length} metric cards`);
      
      // Check for charts
      const charts = await page.$$('[class*="chart"], svg, canvas');
      console.log(`Found ${charts.length} chart elements`);
      
      // Check for data tables
      const tables = await page.$$('table, [class*="table"], [class*="data"]');
      console.log(`Found ${tables.length} table elements`);
      
      // Check for loading states
      const loadingElements = await page.$$('[class*="loading"], [class*="spinner"]');
      console.log(`Found ${loadingElements.length} loading elements`);
      
      // Wait a bit for data to load
      console.log('6️⃣ Waiting for data to load...');
      await page.waitForTimeout(5000);
      
      // Check for actual data content
      const textContent = await page.evaluate(() => document.body.textContent);
      
      // Look for demo company names
      const hasCompanyData = textContent.includes('TechNova') || 
                            textContent.includes('GreenEnergy') || 
                            textContent.includes('HealthTech');
      
      // Look for investment data
      const hasInvestmentData = textContent.includes('$') && 
                               (textContent.includes('Investment') || textContent.includes('ROI'));
      
      // Look for user data
      const hasUserData = textContent.includes('Emily') || 
                         textContent.includes('David') || 
                         textContent.includes('Investor');
      
      console.log('\n📊 Dashboard Data Check:');
      console.log(`   Company Data: ${hasCompanyData ? '✅' : '❌'}`);
      console.log(`   Investment Data: ${hasInvestmentData ? '✅' : '❌'}`);
      console.log(`   User Data: ${hasUserData ? '✅' : '❌'}`);
      
      // Take screenshot
      await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved as dashboard-screenshot.png');
      
      if (hasCompanyData && hasInvestmentData) {
        console.log('\n🎉 Dashboard is displaying demo data correctly!');
      } else {
        console.log('\n⚠️  Dashboard may not be displaying all demo data');
      }
      
    } else {
      console.log('❌ Login failed or not redirected to dashboard');
      console.log('Current page content preview:');
      const content = await page.content();
      console.log(content.substring(0, 500) + '...');
    }

  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('💡 This might indicate:');
      console.log('   - Frontend server is not running');
      console.log('   - Backend API is not responding');
      console.log('   - Network connectivity issues');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testFrontendLogin();
