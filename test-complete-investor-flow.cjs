/**
 * Complete Investor Flow Test
 * Tests the entire investor creation -> first login -> password setup -> regular login flow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCompleteFlow() {
  try {
    console.log('🔄 Testing Complete Investor Flow...\n');

    // Step 1: Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    if (!adminLoginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Create Investor
    console.log('\n2️⃣ Creating Investor...');
    const investorData = {
      email: 'testinvestor@example.com',
      firstName: 'Test',
      lastName: 'Investor',
      phone: '+1234567890',
      cnic: '12345-6789012-3',
      address: '123 Test Street',
      dateOfBirth: '1990-01-01',
      companyId: '507f1f77bcf86cd799439011' // Dummy company ID
    };

    const createInvestorResponse = await axios.post(
      `${API_BASE}/investor-management`,
      investorData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (!createInvestorResponse.data.success) {
      throw new Error(`Investor creation failed: ${createInvestorResponse.data.message}`);
    }

    const tempPassword = createInvestorResponse.data.temporaryPassword;
    console.log('✅ Investor created successfully');
    console.log(`📧 Temporary password: ${tempPassword}`);

    // Step 3: First-time Login
    console.log('\n3️⃣ First-time Login...');
    const firstLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testinvestor@example.com',
      password: tempPassword
    });

    if (!firstLoginResponse.data.success) {
      throw new Error(`First-time login failed: ${firstLoginResponse.data.message}`);
    }

    console.log('✅ First-time login successful');
    console.log(`🔑 Requires password setup: ${firstLoginResponse.data.requiresPasswordSetup}`);
    
    if (!firstLoginResponse.data.requiresPasswordSetup) {
      throw new Error('Expected requiresPasswordSetup to be true');
    }

    const tempToken = firstLoginResponse.data.data.token;
    console.log(`🎫 Temporary token received`);

    // Step 4: Password Setup
    console.log('\n4️⃣ Setting up new password...');
    const newPassword = 'NewPassword123!';
    
    const passwordSetupResponse = await axios.post(
      `${API_BASE}/auth/setup-password`,
      {
        newPassword: newPassword,
        confirmPassword: newPassword
      },
      {
        headers: { Authorization: `Bearer ${tempToken}` }
      }
    );

    if (!passwordSetupResponse.data.success) {
      throw new Error(`Password setup failed: ${passwordSetupResponse.data.message}`);
    }

    console.log('✅ Password setup successful');
    const regularToken = passwordSetupResponse.data.data.token;
    console.log(`🎫 Regular token received`);

    // Step 5: Regular Login with New Password
    console.log('\n5️⃣ Testing regular login with new password...');
    const regularLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testinvestor@example.com',
      password: newPassword
    });

    if (!regularLoginResponse.data.success) {
      console.error('❌ Regular login failed!');
      console.error('Response:', regularLoginResponse.data);
      throw new Error(`Regular login failed: ${regularLoginResponse.data.message}`);
    }

    console.log('✅ Regular login successful');
    console.log(`🔑 Requires password setup: ${regularLoginResponse.data.requiresPasswordSetup || false}`);

    if (regularLoginResponse.data.requiresPasswordSetup) {
      throw new Error('Regular login should not require password setup');
    }

    console.log('\n🎉 Complete flow test PASSED!');
    console.log('✅ Investor creation');
    console.log('✅ First-time login');
    console.log('✅ Password setup');
    console.log('✅ Regular login');

  } catch (error) {
    console.error('\n❌ Flow test FAILED!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

testCompleteFlow();
