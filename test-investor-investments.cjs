/**
 * Test Investor Investments Endpoint
 * Debug the 500 error
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testInvestorInvestments() {
  try {
    console.log('🔍 Testing Investor Investments Endpoint...\n');

    // Login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin.demo@investpro.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test investor investments endpoint
    console.log('Testing /api/investor-investments...');
    try {
      const response = await axios.get(`${API_BASE}/investor-investments`, { headers });
      console.log('✅ Success!');
      console.log(`   Found: ${response.data.data?.length || 0} investor investments`);
      if (response.data.data?.length > 0) {
        console.log(`   Sample: $${response.data.data[0].amount?.toLocaleString()}`);
      }
    } catch (error) {
      console.log('❌ Error details:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
      console.log(`   Error: ${error.response?.data?.error}`);
      
      if (error.response?.data?.error) {
        console.log('\n🔍 Full error details:');
        console.log(error.response.data.error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInvestorInvestments();
