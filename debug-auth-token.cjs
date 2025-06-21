/**
 * Debug Authentication Token
 * Tests token extraction and API calls
 */

const axios = require('axios');

console.log('🔍 Debugging Authentication Token...\n');

const API_BASE_URL = 'http://localhost:3001/api';

async function debugAuth() {
  try {
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'superadmin.demo@investpro.com',
      password: 'SuperAdmin123!'
    });
    
    console.log('Login response structure:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log(`\nExtracted token: ${token ? token.substring(0, 50) + '...' : 'NOT FOUND'}`);
    
    if (token) {
      console.log('\n2. Testing API call with token...');
      
      try {
        const apiResponse = await axios.get(`${API_BASE_URL}/investments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('API call successful:');
        console.log(`Status: ${apiResponse.status}`);
        console.log(`Data length: ${apiResponse.data.data?.length || 'N/A'}`);
        
      } catch (apiError) {
        console.log('API call failed:');
        console.log(`Status: ${apiError.response?.status}`);
        console.log(`Message: ${apiError.response?.data?.message || apiError.message}`);
        console.log('Response data:', apiError.response?.data);
      }
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

debugAuth();
