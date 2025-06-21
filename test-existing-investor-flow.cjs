/**
 * Test Existing Investor Password Setup Flow
 * Test the password setup flow with the existing investor
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testExistingInvestorFlow() {
  try {
    console.log('🔄 Testing Existing Investor Password Setup Flow...\n');

    const email = 'ihsansaifedwardion3@gmail.com';
    const tempPassword = '.'; // The temporary password
    const newPassword = 'NewPassword123!';

    // Step 1: First-time Login
    console.log('1️⃣ Testing first-time login...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Temp Password: ${tempPassword}`);

    const firstLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: email,
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

    // Step 2: Password Setup
    console.log('\n2️⃣ Testing password setup...');
    console.log(`🔑 New Password: ${newPassword}`);

    try {
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

    } catch (setupError) {
      console.error('\n❌ Password setup failed!');
      if (setupError.response) {
        console.error(`   Status: ${setupError.response.status}`);
        console.error(`   Data:`, setupError.response.data);
      } else {
        console.error(`   Error: ${setupError.message}`);
      }
      throw setupError;
    }

    // Step 3: Wait for database update
    console.log('\n⏳ Waiting 3 seconds for database update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4: Check user status in database
    console.log('\n🔍 Checking user status in database...');
    const { spawn } = require('child_process');
    
    await new Promise((resolve, reject) => {
      const checkUser = spawn('node', ['check-user-status.cjs', email], {
        stdio: 'inherit'
      });
      
      checkUser.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`User status check failed with code ${code}`));
        }
      });
    });

    // Step 5: Test Regular Login
    console.log('\n3️⃣ Testing regular login with new password...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);

    try {
      const regularLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: email,
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
        throw new Error('Password setup did not clear the first-login flag');
      }

      console.log('\n🎉 Complete password setup flow PASSED!');
      console.log('✅ First-time login worked');
      console.log('✅ Password setup worked');
      console.log('✅ Regular login worked');
      console.log('✅ First-login flag was cleared');

    } catch (loginError) {
      console.error('\n❌ Regular login failed!');
      if (loginError.response) {
        console.error(`   Status: ${loginError.response.status}`);
        console.error(`   Data:`, loginError.response.data);
      } else {
        console.error(`   Error: ${loginError.message}`);
      }
      throw loginError;
    }

  } catch (error) {
    console.error('\n❌ Password setup flow FAILED!');
    console.error('Error:', error.message);
    
    process.exit(1);
  }
}

testExistingInvestorFlow();
