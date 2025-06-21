/**
 * Test Frontend Data Display
 * Simple test to verify frontend can access and display demo data
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFrontendDataDisplay() {
  try {
    console.log('🔍 Testing Frontend Data Display...\n');

    // Test authentication
    console.log('1️⃣ Testing Authentication...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin.demo@investpro.com',
      password: 'Admin123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Authentication failed');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful');

    // Test key endpoints that frontend components use
    console.log('\n2️⃣ Testing Key Frontend Endpoints...');

    const tests = [
      {
        name: 'Companies Data',
        endpoint: '/companies',
        check: (data) => data && data.length > 0 && data[0].name
      },
      {
        name: 'Investments Data',
        endpoint: '/investments',
        check: (data) => data && data.length > 0 && data[0].initialAmount
      },
      {
        name: 'Assets Data',
        endpoint: '/assets',
        check: (data) => data && data.length > 0 && data[0].name
      },
      {
        name: 'Investor Investments Data',
        endpoint: '/investor-investments',
        check: (data) => data && data.length > 0 && data[0].amount
      },
      {
        name: 'Analytics Data',
        endpoint: '/analytics/superadmin',
        check: (data) => data && data.totalInvestments > 0
      }
    ];

    let passedTests = 0;
    for (const test of tests) {
      try {
        const response = await axios.get(`${API_BASE}${test.endpoint}`, { headers });
        const data = response.data.data;
        
        if (test.check(data)) {
          console.log(`   ✅ ${test.name}: Working`);
          passedTests++;
        } else {
          console.log(`   ❌ ${test.name}: Data structure issue`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error.response?.status || error.message}`);
      }
    }

    console.log(`\n📊 Frontend Data Test Results: ${passedTests}/${tests.length} passed`);

    // Test specific data that frontend components need
    console.log('\n3️⃣ Testing Specific Frontend Data Requirements...');

    // Test investment data structure
    try {
      const investmentsResponse = await axios.get(`${API_BASE}/investments`, { headers });
      const investments = investmentsResponse.data.data;
      
      if (investments && investments.length > 0) {
        const investment = investments[0];
        console.log('   📊 Investment Data Structure:');
        console.log(`      Name: ${investment.name || 'Missing'}`);
        console.log(`      Initial Amount: $${investment.initialAmount?.toLocaleString() || 'Missing'}`);
        console.log(`      Current Value: $${investment.currentValue?.toLocaleString() || 'Missing'}`);
        console.log(`      ROI: ${investment.actualROI || 'Missing'}%`);
        console.log(`      Company: ${investment.subCompanyId?.name || 'Missing'}`);
        console.log(`      Asset: ${investment.assetId?.name || 'Missing'}`);
      }
    } catch (error) {
      console.log('   ❌ Investment data test failed');
    }

    // Test analytics data structure
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics/superadmin`, { headers });
      const analytics = analyticsResponse.data.data;
      
      if (analytics) {
        console.log('   📈 Analytics Data Structure:');
        console.log(`      Total Companies: ${analytics.totalCompanies || 0}`);
        console.log(`      Total Investments: ${analytics.totalInvestments || 0}`);
        console.log(`      Total Investors: ${analytics.totalInvestors || 0}`);
        console.log(`      Total Value: $${(analytics.totalValue || 0).toLocaleString()}`);
        console.log(`      ROI: ${(analytics.roi || 0).toFixed(2)}%`);
      }
    } catch (error) {
      console.log('   ❌ Analytics data test failed');
    }

    console.log('\n🎯 Frontend Integration Status:');
    if (passedTests === tests.length) {
      console.log('✅ All frontend data endpoints are working');
      console.log('✅ Demo data is properly structured');
      console.log('✅ Frontend components should display real data');
      console.log('✅ Dashboard analytics have meaningful data');
      console.log('✅ System is ready for client demonstration');
    } else {
      console.log('⚠️  Some frontend data endpoints need attention');
    }

    console.log('\n🚀 Demo Instructions:');
    console.log('1. Open: http://localhost:5174');
    console.log('2. Login: admin.demo@investpro.com / Admin123!');
    console.log('3. Check dashboard displays real analytics');
    console.log('4. Navigate to investments page');
    console.log('5. Navigate to companies page');
    console.log('6. Test investor login: investor1.demo@gmail.com / Investor123!');

  } catch (error) {
    console.error('❌ Frontend data display test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

testFrontendDataDisplay();
