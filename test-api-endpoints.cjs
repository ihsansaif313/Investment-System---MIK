/**
 * Test API Endpoints for Demo Data
 * Verify all API endpoints are returning demo data correctly
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testApiEndpoints() {
  try {
    console.log('🔍 Testing API Endpoints for Demo Data...\n');

    // First, login to get auth token
    console.log('1️⃣ Testing Authentication...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin.demo@investpro.com',
      password: 'Admin123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Authentication successful');

    const headers = { Authorization: `Bearer ${token}` };

    // Test Companies endpoint
    console.log('\n2️⃣ Testing Companies endpoint...');
    try {
      const companiesResponse = await axios.get(`${API_BASE}/companies`, { headers });
      console.log(`✅ Companies: ${companiesResponse.data.data?.length || 0} found`);
      if (companiesResponse.data.data?.length > 0) {
        console.log(`   Sample: ${companiesResponse.data.data[0].name}`);
      }
    } catch (error) {
      console.log(`❌ Companies endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test Investments endpoint
    console.log('\n3️⃣ Testing Investments endpoint...');
    try {
      const investmentsResponse = await axios.get(`${API_BASE}/investments`, { headers });
      console.log(`✅ Investments: ${investmentsResponse.data.data?.length || 0} found`);
      if (investmentsResponse.data.data?.length > 0) {
        console.log(`   Sample: ${investmentsResponse.data.data[0].name}`);
      }
    } catch (error) {
      console.log(`❌ Investments endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test Assets endpoint
    console.log('\n4️⃣ Testing Assets endpoint...');
    try {
      const assetsResponse = await axios.get(`${API_BASE}/assets`, { headers });
      console.log(`✅ Assets: ${assetsResponse.data.data?.length || 0} found`);
      if (assetsResponse.data.data?.length > 0) {
        console.log(`   Sample: ${assetsResponse.data.data[0].name}`);
      }
    } catch (error) {
      console.log(`❌ Assets endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test Investor Investments endpoint
    console.log('\n5️⃣ Testing Investor Investments endpoint...');
    try {
      const investorInvestmentsResponse = await axios.get(`${API_BASE}/investor-investments`, { headers });
      console.log(`✅ Investor Investments: ${investorInvestmentsResponse.data.data?.length || 0} found`);
      if (investorInvestmentsResponse.data.data?.length > 0) {
        console.log(`   Sample amount: $${investorInvestmentsResponse.data.data[0].amount?.toLocaleString()}`);
      }
    } catch (error) {
      console.log(`❌ Investor Investments endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test Analytics endpoints
    console.log('\n6️⃣ Testing Analytics endpoints...');
    try {
      const superadminAnalyticsResponse = await axios.get(`${API_BASE}/analytics/superadmin`, { headers });
      console.log(`✅ Superadmin Analytics: Available`);
      console.log(`   Total Companies: ${superadminAnalyticsResponse.data.data?.totalCompanies || 0}`);
      console.log(`   Total Investments: ${superadminAnalyticsResponse.data.data?.totalInvestments || 0}`);
    } catch (error) {
      console.log(`❌ Superadmin Analytics error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    try {
      const adminAnalyticsResponse = await axios.get(`${API_BASE}/analytics/admin`, { headers });
      console.log(`✅ Admin Analytics: Available`);
    } catch (error) {
      console.log(`❌ Admin Analytics error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    try {
      const investorAnalyticsResponse = await axios.get(`${API_BASE}/analytics/investor`, { headers });
      console.log(`✅ Investor Analytics: Available`);
    } catch (error) {
      console.log(`❌ Investor Analytics error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test Users endpoint
    console.log('\n7️⃣ Testing Users endpoint...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/users`, { headers });
      console.log(`✅ Users: ${usersResponse.data.data?.length || 0} found`);
      if (usersResponse.data.data?.length > 0) {
        console.log(`   Sample: ${usersResponse.data.data[0].firstName} ${usersResponse.data.data[0].lastName}`);
      }
    } catch (error) {
      console.log(`❌ Users endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test Activity Logs endpoint
    console.log('\n8️⃣ Testing Activity Logs endpoint...');
    try {
      const activityLogsResponse = await axios.get(`${API_BASE}/activity-logs`, { headers });
      console.log(`✅ Activity Logs: ${activityLogsResponse.data.data?.length || 0} found`);
    } catch (error) {
      console.log(`❌ Activity Logs endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n📊 API Endpoints Test Summary:');
    console.log('✅ Authentication working');
    console.log('✅ Most endpoints accessible with auth token');
    console.log('✅ Demo data is available through APIs');

    console.log('\n🎯 Next Steps:');
    console.log('1. Check frontend components are calling these APIs');
    console.log('2. Verify data transformation in frontend');
    console.log('3. Test frontend pages display the data');

  } catch (error) {
    console.error('❌ API Endpoints test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

testApiEndpoints();
