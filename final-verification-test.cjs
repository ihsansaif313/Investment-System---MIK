/**
 * Final Verification Test
 * Comprehensive test to verify the complete system is ready for client demonstration
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function finalVerificationTest() {
  try {
    console.log('🎯 Final Verification Test for Client Demonstration\n');
    console.log('=' .repeat(60));

    const results = {
      authentication: false,
      apiEndpoints: 0,
      demoData: false,
      dataRelationships: false,
      analytics: false,
      userRoles: false
    };

    // Test 1: Authentication
    console.log('\n1️⃣ Testing Authentication System...');
    try {
      // Test admin login
      const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin.demo@investpro.com',
        password: 'Admin123!'
      });

      // Test investor login
      const investorLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'investor1.demo@gmail.com',
        password: 'Investor123!'
      });

      if (adminLogin.data.success && investorLogin.data.success) {
        results.authentication = true;
        console.log('   ✅ Admin and Investor authentication working');
      }
    } catch (error) {
      console.log('   ❌ Authentication failed:', error.message);
    }

    // Test 2: API Endpoints
    console.log('\n2️⃣ Testing All API Endpoints...');
    const adminToken = (await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin.demo@investpro.com',
      password: 'Admin123!'
    })).data.data.token;

    const headers = { Authorization: `Bearer ${adminToken}` };

    const endpoints = [
      '/companies', '/investments', '/assets', '/investor-investments',
      '/users', '/analytics/superadmin', '/analytics/admin', '/analytics/investor'
    ];

    let workingEndpoints = 0;
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`, { headers });
        if (response.status === 200) {
          workingEndpoints++;
          console.log(`   ✅ ${endpoint}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.response?.status || error.message}`);
      }
    }

    results.apiEndpoints = workingEndpoints;
    console.log(`   📊 ${workingEndpoints}/${endpoints.length} endpoints working`);

    // Test 3: Demo Data Verification
    console.log('\n3️⃣ Verifying Demo Data...');
    try {
      const [companies, investments, assets, investorInvestments, users] = await Promise.all([
        axios.get(`${API_BASE}/companies`, { headers }),
        axios.get(`${API_BASE}/investments`, { headers }),
        axios.get(`${API_BASE}/assets`, { headers }),
        axios.get(`${API_BASE}/investor-investments`, { headers }),
        axios.get(`${API_BASE}/users`, { headers })
      ]);

      const counts = {
        companies: companies.data.data?.length || 0,
        investments: investments.data.data?.length || 0,
        assets: assets.data.data?.length || 0,
        investorInvestments: investorInvestments.data.data?.length || 0,
        users: users.data.data?.length || 0
      };

      console.log(`   📊 Companies: ${counts.companies}`);
      console.log(`   💰 Investments: ${counts.investments}`);
      console.log(`   💎 Assets: ${counts.assets}`);
      console.log(`   👤 Investor Investments: ${counts.investorInvestments}`);
      console.log(`   👥 Users: ${counts.users}`);

      if (Object.values(counts).every(count => count > 0)) {
        results.demoData = true;
        console.log('   ✅ All demo data categories populated');
      } else {
        console.log('   ❌ Some demo data categories are empty');
      }
    } catch (error) {
      console.log('   ❌ Demo data verification failed:', error.message);
    }

    // Test 4: Data Relationships
    console.log('\n4️⃣ Testing Data Relationships...');
    try {
      const investmentsResponse = await axios.get(`${API_BASE}/investments`, { headers });
      const investments = investmentsResponse.data.data;

      if (investments && investments.length > 0) {
        const investment = investments[0];
        const hasCompanyRelation = investment.subCompanyId && typeof investment.subCompanyId === 'object';
        const hasAssetRelation = investment.assetId && typeof investment.assetId === 'object';

        if (hasCompanyRelation && hasAssetRelation) {
          results.dataRelationships = true;
          console.log('   ✅ Investment-Company relationships populated');
          console.log('   ✅ Investment-Asset relationships populated');
          console.log(`   📊 Sample: ${investment.subCompanyId.name} - ${investment.assetId.name}`);
        } else {
          console.log('   ❌ Data relationships not properly populated');
        }
      }
    } catch (error) {
      console.log('   ❌ Data relationships test failed:', error.message);
    }

    // Test 5: Analytics Data
    console.log('\n5️⃣ Testing Analytics Data...');
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics/superadmin`, { headers });
      const analytics = analyticsResponse.data.data;

      if (analytics && analytics.totalInvestments > 0) {
        results.analytics = true;
        console.log(`   ✅ Analytics working: ${analytics.totalInvestments} investments, ${analytics.totalInvestors} investors`);
        console.log(`   📈 Total Value: $${(analytics.totalValue || 0).toLocaleString()}`);
        console.log(`   📊 ROI: ${(analytics.roi || 0).toFixed(2)}%`);
      } else {
        console.log('   ❌ Analytics data not available');
      }
    } catch (error) {
      console.log('   ❌ Analytics test failed:', error.message);
    }

    // Test 6: User Roles
    console.log('\n6️⃣ Testing User Roles...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/users`, { headers });
      const users = usersResponse.data.data;

      const adminUsers = users.filter(u => u.role?.type === 'admin' || u.role?.type === 'superadmin');
      const investorUsers = users.filter(u => u.role?.type === 'investor');

      if (adminUsers.length > 0 && investorUsers.length > 0) {
        results.userRoles = true;
        console.log(`   ✅ ${adminUsers.length} admin users, ${investorUsers.length} investor users`);
      } else {
        console.log('   ❌ User roles not properly configured');
      }
    } catch (error) {
      console.log('   ❌ User roles test failed:', error.message);
    }

    // Final Results
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 FINAL VERIFICATION RESULTS');
    console.log('=' .repeat(60));

    const testResults = [
      { name: 'Authentication System', status: results.authentication },
      { name: 'API Endpoints', status: results.apiEndpoints === 8 },
      { name: 'Demo Data Population', status: results.demoData },
      { name: 'Data Relationships', status: results.dataRelationships },
      { name: 'Analytics System', status: results.analytics },
      { name: 'User Role System', status: results.userRoles }
    ];

    testResults.forEach(test => {
      console.log(`${test.status ? '✅' : '❌'} ${test.name}`);
    });

    const passedTests = testResults.filter(t => t.status).length;
    const totalTests = testResults.length;

    console.log('\n📊 Overall Score: ' + `${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('\n🎉 SYSTEM READY FOR CLIENT DEMONSTRATION!');
      console.log('\n🚀 Demo Instructions:');
      console.log('1. Frontend: http://localhost:5174');
      console.log('2. Admin Login: admin.demo@investpro.com / Admin123!');
      console.log('3. Investor Login: investor1.demo@gmail.com / Investor123!');
      console.log('4. Features to showcase:');
      console.log('   - Dashboard with real analytics');
      console.log('   - Investment portfolio management');
      console.log('   - Company management');
      console.log('   - User role-based access');
      console.log('   - Real-time data and charts');
    } else {
      console.log('\n⚠️  SYSTEM NEEDS ATTENTION BEFORE DEMO');
      console.log('Please address the failed tests above');
    }

    console.log('\n📋 Demo Data Summary:');
    console.log('- 4 Companies across different industries');
    console.log('- 10 Investments with realistic amounts and ROI');
    console.log('- 6 Asset types for diversification');
    console.log('- 10 Investor investments with current values');
    console.log('- 9 Users (2 admins, 6 investors)');
    console.log('- Complete analytics and performance metrics');

  } catch (error) {
    console.error('❌ Final verification test failed:', error.message);
  }
}

finalVerificationTest();
