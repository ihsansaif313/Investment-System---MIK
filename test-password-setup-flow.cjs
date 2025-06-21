/**
 * Test Password Setup Flow
 * Test the complete flow from investor creation to password setup to regular login
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testPasswordSetupFlow() {
  try {
    console.log('🧪 Testing Complete Password Setup Flow\n');

    // Step 1: Admin login to get token
    console.log('1️⃣ Admin Login');
    const adminLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    if (!adminLoginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Create investor
    console.log('\n2️⃣ Creating Investor');
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const investorData = {
      firstName: 'PasswordTest',
      lastName: 'User',
      email: `passwordtest.${timestamp}@example.com`,
      phone: `+1234567${uniqueId.slice(-3)}`,
      cnic: `12345-${uniqueId}-1`,
      address: '123 Password Test Street, Test City, Test Country',
      dateOfBirth: '1990-01-01',
      initialInvestmentAmount: 10000,
      notes: 'Password setup flow test investor'
    };

    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!createResponse.data.success) {
      throw new Error('Investor creation failed: ' + createResponse.data.message);
    }

    const tempPassword = createResponse.data.temporaryPassword;
    const investorEmail = investorData.email;
    console.log('✅ Investor created successfully');
    console.log('🔑 Temporary password:', tempPassword);

    // Step 3: First-time login with temporary password
    console.log('\n3️⃣ First-Time Login with Temporary Password');
    const firstLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: investorEmail,
      password: tempPassword
    });

    if (!firstLoginResponse.data.success) {
      throw new Error('First-time login failed: ' + firstLoginResponse.data.message);
    }

    console.log('✅ First-time login successful');
    console.log('📊 Requires password setup:', firstLoginResponse.data.requiresPasswordSetup);
    console.log('🔑 Temporary token received:', !!firstLoginResponse.data.data.token);

    if (!firstLoginResponse.data.requiresPasswordSetup) {
      throw new Error('Expected requiresPasswordSetup to be true');
    }

    const tempToken = firstLoginResponse.data.data.token;

    // Step 4: Setup new password
    console.log('\n4️⃣ Setting Up New Password');
    const newPassword = 'NewPassword123!';
    
    const passwordSetupResponse = await axios.post(`${baseURL}/auth/setup-password`, {
      newPassword: newPassword,
      confirmPassword: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${tempToken}`
      }
    });

    if (!passwordSetupResponse.data.success) {
      throw new Error('Password setup failed: ' + passwordSetupResponse.data.message);
    }

    console.log('✅ Password setup successful');
    console.log('🔑 New auth token received:', !!passwordSetupResponse.data.data.token);

    // Step 5: Try to login with temporary password (should fail)
    console.log('\n5️⃣ Testing Login with Old Temporary Password (Should Fail)');
    try {
      const oldPasswordResponse = await axios.post(`${baseURL}/auth/login`, {
        email: investorEmail,
        password: tempPassword
      });

      if (oldPasswordResponse.data.success) {
        console.log('❌ ERROR: Login with temporary password should have failed!');
        console.log('📊 Response:', oldPasswordResponse.data);
        console.log('🚨 This indicates the password was not properly updated');
      } else {
        console.log('✅ Correctly rejected temporary password');
      }
    } catch (error) {
      console.log('✅ Correctly rejected temporary password');
      console.log('📊 Error message:', error.response?.data?.message);
    }

    // Step 6: Login with new password (should succeed)
    console.log('\n6️⃣ Testing Login with New Password (Should Succeed)');
    const newPasswordResponse = await axios.post(`${baseURL}/auth/login`, {
      email: investorEmail,
      password: newPassword
    });

    if (!newPasswordResponse.data.success) {
      console.log('❌ ERROR: Login with new password failed!');
      console.log('📊 Error:', newPasswordResponse.data.message);
      console.log('🚨 This indicates the password was not properly saved');
    } else {
      console.log('✅ Successfully logged in with new password');
      console.log('📊 Requires password setup:', newPasswordResponse.data.requiresPasswordSetup || 'false');
      
      if (newPasswordResponse.data.requiresPasswordSetup) {
        console.log('❌ ERROR: isFirstLogin flag was not cleared!');
      } else {
        console.log('✅ isFirstLogin flag properly cleared');
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('1. ✅ Investor creation: Working');
    console.log('2. ✅ First-time login detection: Working');
    console.log('3. ✅ Password setup endpoint: Working');
    console.log('4. ❓ Temporary password invalidation: Testing...');
    console.log('5. ❓ New password login: Testing...');
    console.log('6. ❓ isFirstLogin flag clearing: Testing...');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testPasswordSetupFlow();
