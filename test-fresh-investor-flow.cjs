/**
 * Test Fresh Investor Password Setup Flow
 * Create a new investor and test the complete flow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFreshInvestorFlow() {
  try {
    console.log('🔄 Testing Fresh Investor Password Setup Flow...\n');

    // Step 1: Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    if (!adminLoginResponse.data.success) {
      throw new Error(`Admin login failed: ${adminLoginResponse.data.message}`);
    }

    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Create Investor
    console.log('\n2️⃣ Creating Fresh Investor...');
    const timestamp = Date.now();
    const investorData = {
      email: `testinvestor${timestamp}@example.com`,
      firstName: 'Test',
      lastName: 'Investor',
      phone: '+1234567890',
      cnic: `12345-6789${timestamp.toString().slice(-3)}-3`,
      address: '123 Test Street',
      dateOfBirth: '1990-01-01',
      companyId: '507f1f77bcf86cd799439011' // Dummy company ID
    };

    console.log(`📧 Creating investor: ${investorData.email}`);

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
    console.log(`🔑 Temporary password: ${tempPassword}`);

    // Step 3: First-time Login
    console.log('\n3️⃣ Testing first-time login...');
    console.log(`📧 Email: ${investorData.email}`);
    console.log(`🔑 Temp Password: ${tempPassword}`);

    const firstLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: investorData.email,
      password: tempPassword
    });

    console.log('\n📊 First Login Response:');
    console.log(`   Status: ${firstLoginResponse.status}`);
    console.log(`   Success: ${firstLoginResponse.data.success}`);
    console.log(`   Requires Password Setup: ${firstLoginResponse.data.requiresPasswordSetup}`);
    console.log(`   Message: ${firstLoginResponse.data.message}`);

    if (!firstLoginResponse.data.success) {
      throw new Error(`First-time login failed: ${firstLoginResponse.data.message}`);
    }

    if (!firstLoginResponse.data.requiresPasswordSetup) {
      throw new Error('Expected requiresPasswordSetup to be true');
    }

    const tempToken = firstLoginResponse.data.data.token;
    console.log(`✅ First-time login successful`);
    console.log(`🎫 Temporary token: ${tempToken.substring(0, 30)}...`);

    // Step 4: Password Setup
    console.log('\n4️⃣ Testing password setup...');
    const newPassword = 'NewPassword123!';
    console.log(`🔑 New Password: ${newPassword}`);

    const passwordSetupResponse = await axios.post(
      `${API_BASE}/auth/setup-password`,
      {
        newPassword: newPassword,
        confirmPassword: newPassword
      },
      {
        headers: { 
          Authorization: `Bearer ${tempToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n📊 Password Setup Response:');
    console.log(`   Status: ${passwordSetupResponse.status}`);
    console.log(`   Success: ${passwordSetupResponse.data.success}`);
    console.log(`   Message: ${passwordSetupResponse.data.message}`);

    if (!passwordSetupResponse.data.success) {
      throw new Error(`Password setup failed: ${passwordSetupResponse.data.message}`);
    }

    console.log('✅ Password setup successful');

    // Step 5: Wait for database update
    console.log('\n⏳ Waiting 3 seconds for database update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 6: Test Regular Login
    console.log('\n5️⃣ Testing regular login with new password...');
    console.log(`📧 Email: ${investorData.email}`);
    console.log(`🔑 New Password: ${newPassword}`);

    const regularLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: investorData.email,
      password: newPassword
    });

    console.log('\n📊 Regular Login Response:');
    console.log(`   Status: ${regularLoginResponse.status}`);
    console.log(`   Success: ${regularLoginResponse.data.success}`);
    console.log(`   Requires Password Setup: ${regularLoginResponse.data.requiresPasswordSetup || false}`);
    console.log(`   Message: ${regularLoginResponse.data.message}`);

    if (!regularLoginResponse.data.success) {
      console.error('❌ Regular login failed!');
      throw new Error(`Regular login failed: ${regularLoginResponse.data.message}`);
    }

    if (regularLoginResponse.data.requiresPasswordSetup) {
      console.error('❌ Still requires password setup after setup completed!');
      console.error('🐛 BUG FOUND: Password setup did not clear the first-login flag');
      throw new Error('Password setup did not clear the first-login flag');
    }

    console.log('\n🎉 Complete password setup flow PASSED!');
    console.log('✅ Investor creation worked');
    console.log('✅ First-time login worked');
    console.log('✅ Password setup worked');
    console.log('✅ Regular login worked');
    console.log('✅ First-login flag was cleared');

  } catch (error) {
    console.error('\n❌ Password setup flow FAILED!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

testFreshInvestorFlow();
