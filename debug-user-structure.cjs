/**
 * Debug script to check user structure and authorization
 */

const axios = require('axios');

const debugUserStructure = async () => {
  try {
    console.log('🔍 Debugging User Structure and Authorization...\n');

    const baseURL = 'http://localhost:3001/api';

    // Step 1: Login and get token
    console.log('1️⃣ Getting fresh authentication token...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 50)}...`);

    // Step 2: Check user structure
    console.log('\n2️⃣ Checking user structure...');
    const debugResponse = await axios.get(`${baseURL}/investor-management/debug-user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Debug endpoint accessible');
    console.log('User structure:');
    console.log(JSON.stringify(debugResponse.data, null, 2));

    // Step 3: Test investor creation with detailed error info
    console.log('\n3️⃣ Testing investor creation...');
    try {
      const investorData = {
        firstName: 'Debug',
        lastName: 'Test',
        email: `debug.test.${Date.now()}@example.com`,
        phone: '+1234567890',
        cnic: `99999-${Date.now().toString().slice(-7)}-9`,
        address: 'Debug Test Address',
        dateOfBirth: '1990-01-01'
      };

      const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Investor creation successful!');
      console.log('Created investor:', createResponse.data.data);

    } catch (createError) {
      console.log('❌ Investor creation failed');
      console.log('Status:', createError.response?.status);
      console.log('Error:', createError.response?.data);
      
      if (createError.response?.status === 403) {
        console.log('\n🔍 Authorization issue detected:');
        console.log('User role type:', debugResponse.data.roleType);
        console.log('User role id:', debugResponse.data.roleId);
        console.log('Expected: admin or superadmin');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
};

debugUserStructure();
