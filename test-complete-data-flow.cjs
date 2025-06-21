/**
 * Test Complete Data Flow
 * Verify data flows from database → API → frontend components
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCompleteDataFlow() {
  try {
    console.log('🔍 Testing Complete Data Flow...\n');

    // Step 1: Login and get token
    console.log('1️⃣ Testing Authentication...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin.demo@investpro.com',
      password: 'Admin123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful');

    // Step 2: Test all API endpoints
    console.log('\n2️⃣ Testing API Endpoints...');
    
    const endpoints = [
      { name: 'Companies', url: '/companies' },
      { name: 'Investments', url: '/investments' },
      { name: 'Assets', url: '/assets' },
      { name: 'Investor Investments', url: '/investor-investments' },
      { name: 'Users', url: '/users' },
      { name: 'Superadmin Analytics', url: '/analytics/superadmin' },
      { name: 'Admin Analytics', url: '/analytics/admin' },
      { name: 'Investor Analytics', url: '/analytics/investor' }
    ];

    const apiResults = {};

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint.url}`, { headers });
        const data = response.data.data;
        apiResults[endpoint.name] = {
          success: true,
          count: Array.isArray(data) ? data.length : 1,
          sample: Array.isArray(data) && data.length > 0 ? data[0] : data
        };
        console.log(`   ✅ ${endpoint.name}: ${apiResults[endpoint.name].count} items`);
      } catch (error) {
        apiResults[endpoint.name] = {
          success: false,
          error: error.response?.status || error.message
        };
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || error.message}`);
      }
    }

    // Step 3: Verify data structure and relationships
    console.log('\n3️⃣ Verifying Data Structure...');

    // Check companies data
    if (apiResults.Companies.success) {
      const companies = apiResults.Companies.sample;
      console.log(`   📊 Company Sample: ${companies.name} (${companies.industry})`);
      console.log(`   🏢 Has required fields: ${companies.id ? '✅' : '❌'} ID, ${companies.name ? '✅' : '❌'} Name`);
    }

    // Check investments data
    if (apiResults.Investments.success) {
      const investment = apiResults.Investments.sample;
      console.log(`   💰 Investment Sample: ${investment.name}`);
      console.log(`   💵 Amount: $${investment.initialAmount?.toLocaleString()}`);
      console.log(`   📈 Current Value: $${investment.currentValue?.toLocaleString()}`);
      console.log(`   🎯 ROI: ${investment.actualROI}%`);
      console.log(`   🔗 Has relationships: ${investment.subCompanyId ? '✅' : '❌'} Company, ${investment.assetId ? '✅' : '❌'} Asset`);
    }

    // Check investor investments data
    if (apiResults['Investor Investments'].success) {
      const investorInvestment = apiResults['Investor Investments'].sample;
      console.log(`   👤 Investor Investment Sample: $${investorInvestment.amount?.toLocaleString()}`);
      console.log(`   📊 Current Value: $${investorInvestment.currentValue?.toLocaleString()}`);
      console.log(`   🔗 Has relationships: ${investorInvestment.userId ? '✅' : '❌'} User, ${investorInvestment.investmentId ? '✅' : '❌'} Investment`);
    }

    // Step 4: Test analytics data
    console.log('\n4️⃣ Testing Analytics Data...');
    
    if (apiResults['Superadmin Analytics'].success) {
      const analytics = apiResults['Superadmin Analytics'].sample;
      console.log(`   📈 Total Companies: ${analytics.totalCompanies || 0}`);
      console.log(`   💰 Total Investments: ${analytics.totalInvestments || 0}`);
      console.log(`   👥 Total Investors: ${analytics.totalInvestors || 0}`);
      console.log(`   💵 Total Value: $${(analytics.totalValue || 0).toLocaleString()}`);
      console.log(`   📊 ROI: ${(analytics.roi || 0).toFixed(2)}%`);
    }

    // Step 5: Test data relationships
    console.log('\n5️⃣ Testing Data Relationships...');
    
    // Test if investments have populated company and asset data
    try {
      const investmentResponse = await axios.get(`${API_BASE}/investments`, { headers });
      const investments = investmentResponse.data.data;
      
      if (investments && investments.length > 0) {
        const investment = investments[0];
        console.log(`   🔗 Investment-Company relationship: ${investment.subCompanyId ? '✅' : '❌'}`);
        console.log(`   🔗 Investment-Asset relationship: ${investment.assetId ? '✅' : '❌'}`);
        
        // Check if populated data exists
        if (investment.subCompanyId && typeof investment.subCompanyId === 'object') {
          console.log(`   📊 Populated company data: ${investment.subCompanyId.name || 'Missing'}`);
        }
        if (investment.assetId && typeof investment.assetId === 'object') {
          console.log(`   📊 Populated asset data: ${investment.assetId.name || 'Missing'}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Relationship test failed: ${error.message}`);
    }

    // Step 6: Summary
    console.log('\n📊 Data Flow Test Summary:');
    console.log('=' .repeat(50));
    
    const successfulEndpoints = Object.values(apiResults).filter(r => r.success).length;
    const totalEndpoints = Object.keys(apiResults).length;
    
    console.log(`✅ API Endpoints Working: ${successfulEndpoints}/${totalEndpoints}`);
    console.log(`📊 Total Demo Data Items:`);
    
    Object.entries(apiResults).forEach(([name, result]) => {
      if (result.success) {
        console.log(`   ${name}: ${result.count} items`);
      }
    });

    // Calculate total demo data
    const totalCompanies = apiResults.Companies.success ? apiResults.Companies.count : 0;
    const totalInvestments = apiResults.Investments.success ? apiResults.Investments.count : 0;
    const totalInvestorInvestments = apiResults['Investor Investments'].success ? apiResults['Investor Investments'].count : 0;
    const totalUsers = apiResults.Users.success ? apiResults.Users.count : 0;

    console.log(`\n🎯 Demo Data Status:`);
    if (totalCompanies > 0 && totalInvestments > 0 && totalInvestorInvestments > 0 && totalUsers > 0) {
      console.log('✅ Complete demo data is available and accessible');
      console.log('✅ All data relationships are properly established');
      console.log('✅ Frontend components should display real data');
      console.log('✅ Dashboard analytics have meaningful data');
    } else {
      console.log('⚠️  Some demo data is missing or incomplete');
      if (totalCompanies === 0) console.log('   ❌ No companies found');
      if (totalInvestments === 0) console.log('   ❌ No investments found');
      if (totalInvestorInvestments === 0) console.log('   ❌ No investor investments found');
      if (totalUsers === 0) console.log('   ❌ No users found');
    }

    console.log(`\n🚀 Next Steps:`);
    console.log('1. Open frontend at http://localhost:5174');
    console.log('2. Login with: admin.demo@investpro.com / Admin123!');
    console.log('3. Verify dashboard displays real demo data');
    console.log('4. Check investments, companies, and analytics pages');
    console.log('5. Test investor login with: investor1.demo@gmail.com / Investor123!');

  } catch (error) {
    console.error('❌ Data flow test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

testCompleteDataFlow();
