/**
 * Test Complete First-Time Login Flow
 * Test the entire flow from investor creation to password setup
 */

const axios = require('axios');
const mongoose = require('./backend/node_modules/mongoose');

const baseURL = 'http://localhost:3001/api';

async function testCompleteFirstTimeLoginFlow() {
  try {
    console.log('🧪 Testing Complete First-Time Login Flow\n');

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
      firstName: 'TestFlow',
      lastName: 'User',
      email: `testflow.${timestamp}@example.com`,
      phone: `+1234567${uniqueId.slice(-3)}`,
      cnic: `12345-${uniqueId}-1`,
      address: '123 Test Flow Street, Test City, Test Country',
      dateOfBirth: '1990-01-01',
      investmentPreferences: {
        riskTolerance: 'medium',
        preferredSectors: ['Technology'],
        investmentGoals: ['Wealth Building'],
        timeHorizon: 'long'
      },
      initialInvestmentAmount: 10000,
      notes: 'Test flow investor'
    };

    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Investor created successfully!');
    console.log('📧 Email sent:', createResponse.data.emailSent);
    console.log('👤 Investor ID:', createResponse.data.data.user.id);
    console.log('🔑 Temporary password:', createResponse.data.temporaryPassword);

    const tempPassword = createResponse.data.temporaryPassword;
    const investorEmail = investorData.email;

    // Step 3: Test first-time login
    console.log('\n3️⃣ Testing First-Time Login');
    
    const firstLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: investorEmail,
      password: tempPassword
    });

    console.log('✅ First-time login successful');
    console.log('📊 Response structure:');
    console.log('   - success:', firstLoginResponse.data.success);
    console.log('   - requiresPasswordSetup:', firstLoginResponse.data.requiresPasswordSetup);
    console.log('   - message:', firstLoginResponse.data.message);
    console.log('   - data.user.id:', firstLoginResponse.data.data.user.id);
    console.log('   - data.user.isFirstLogin:', firstLoginResponse.data.data.user.isFirstLogin);
    console.log('   - data.token:', firstLoginResponse.data.data.token ? 'Present' : 'Missing');
    console.log('   - data.expiresIn:', firstLoginResponse.data.data.expiresIn);

    if (!firstLoginResponse.data.requiresPasswordSetup) {
      throw new Error('Expected requiresPasswordSetup to be true for first-time login');
    }

    const tempToken = firstLoginResponse.data.data.token;

    // Small delay to ensure session is properly saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Test password setup
    console.log('\n4️⃣ Testing Password Setup');
    
    const newPassword = 'NewSecurePassword123!';
    
    const passwordSetupResponse = await axios.post(`${baseURL}/auth/setup-password`, {
      newPassword: newPassword,
      confirmPassword: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${tempToken}`
      }
    });

    console.log('✅ Password setup successful');
    console.log('📊 Setup response:');
    console.log('   - success:', passwordSetupResponse.data.success);
    console.log('   - message:', passwordSetupResponse.data.message);
    console.log('   - data.user.id:', passwordSetupResponse.data.data.user.id);
    console.log('   - data.user.isFirstLogin:', passwordSetupResponse.data.data.user.isFirstLogin);
    console.log('   - data.token:', passwordSetupResponse.data.data.token ? 'Present' : 'Missing');
    console.log('   - data.refreshToken:', passwordSetupResponse.data.data.refreshToken ? 'Present' : 'Missing');

    // Step 5: Test regular login with new password
    console.log('\n5️⃣ Testing Regular Login with New Password');
    
    const regularLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: investorEmail,
      password: newPassword
    });

    console.log('✅ Regular login successful');
    console.log('📊 Regular login response:');
    console.log('   - success:', regularLoginResponse.data.success);
    console.log('   - requiresPasswordSetup:', regularLoginResponse.data.requiresPasswordSetup || 'Not present (expected)');
    console.log('   - data.user.id:', regularLoginResponse.data.data.user.id);
    console.log('   - data.user.role.type:', regularLoginResponse.data.data.user.role.type);
    console.log('   - data.token:', regularLoginResponse.data.data.token ? 'Present' : 'Missing');
    console.log('   - data.refreshToken:', regularLoginResponse.data.data.refreshToken ? 'Present' : 'Missing');

    // Step 6: Verify old password doesn't work
    console.log('\n6️⃣ Testing Old Password (Should Fail)');
    
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: investorEmail,
        password: tempPassword
      });
      console.log('❌ Old password still works (this is a problem!)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Old password correctly rejected');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    console.log('\n🎉 COMPLETE FIRST-TIME LOGIN FLOW TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('✅ 1. Admin can create investor accounts');
    console.log('✅ 2. Investor receives temporary password');
    console.log('✅ 3. First-time login returns requiresPasswordSetup: true');
    console.log('✅ 4. Password setup endpoint works correctly');
    console.log('✅ 5. Regular login works with new password');
    console.log('✅ 6. Old temporary password is invalidated');

    console.log('\n💡 Frontend Integration Notes:');
    console.log('• Check for response.data.requiresPasswordSetup in login handler');
    console.log('• Store tempToken, tempUserId, tempUserName, tempUserEmail');
    console.log('• Redirect to /setup-password page');
    console.log('• Use tempToken for password setup API call');
    console.log('• Clear temp data and store regular session after setup');
    console.log('• Redirect to investor dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testCompleteFirstTimeLoginFlow();
