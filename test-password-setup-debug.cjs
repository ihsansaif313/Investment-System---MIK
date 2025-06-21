/**
 * Test Password Setup Debug
 * Simple test to debug the password setup endpoint
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testPasswordSetupDebug() {
  try {
    console.log('🧪 Testing Password Setup Debug\n');

    // Step 1: Admin login
    console.log('1️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Create investor
    console.log('\n2️⃣ Creating Investor');
    
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const investorData = {
      firstName: 'PasswordDebug',
      lastName: 'User',
      email: `passworddebug.${timestamp}@example.com`,
      phone: `+1234567${uniqueId.slice(-3)}`,
      cnic: `12345-${uniqueId}-1`,
      address: '123 Password Debug Street, Test City, Test Country',
      dateOfBirth: '1990-01-01',
      initialInvestmentAmount: 10000,
      notes: 'Password setup debug investor'
    };

    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Investor created successfully!');
    const tempPassword = createResponse.data.temporaryPassword;
    const investorEmail = investorData.email;
    console.log('🔑 Temporary password:', tempPassword);

    // Step 3: First-time login
    console.log('\n3️⃣ First-Time Login');
    
    const firstLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: investorEmail,
      password: tempPassword
    });

    console.log('✅ First-time login successful');
    const tempToken = firstLoginResponse.data.data.token;
    console.log('🎫 Temporary token received');

    // Step 4: Test password setup with minimal data
    console.log('\n4️⃣ Testing Password Setup');
    
    const newPassword = 'NewPassword123!';
    
    try {
      const passwordSetupResponse = await axios.post(`${baseURL}/auth/setup-password`, {
        newPassword: newPassword,
        confirmPassword: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Password setup successful!');
      console.log('📊 Response:', passwordSetupResponse.data);

    } catch (setupError) {
      console.log('❌ Password setup failed');
      console.log('📊 Status:', setupError.response?.status);
      console.log('📝 Response:', setupError.response?.data);
      
      // Additional debugging
      console.log('\n🔍 Debug Information:');
      console.log('Request URL:', `${baseURL}/auth/setup-password`);
      console.log('Request Headers:', {
        'Authorization': `Bearer ${tempToken.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });
      console.log('Request Body:', {
        newPassword: newPassword,
        confirmPassword: newPassword
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testPasswordSetupDebug();
