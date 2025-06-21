/**
 * Test Password Setup Bug
 * Test the complete password setup flow to identify the bug
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPasswordSetupBug() {
  try {
    console.log('🔄 Testing Password Setup Bug...\n');

    const email = 'ihsansaifedwardion2@gmail.com';
    const tempPassword = 'TempPass123!';
    const newPassword = 'NewPassword123!';

    // Step 1: First-time Login
    console.log('1️⃣ Testing first-time login...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Temp Password: ${tempPassword}`);

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: email,
      password: tempPassword
    });

    console.log('\n📊 Login Response:');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginResponse.data.success}`);
    console.log(`   Requires Password Setup: ${loginResponse.data.requiresPasswordSetup}`);
    console.log(`   Message: ${loginResponse.data.message}`);

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }

    if (!loginResponse.data.requiresPasswordSetup) {
      throw new Error('Expected requiresPasswordSetup to be true');
    }

    const tempToken = loginResponse.data.data.token;
    console.log(`✅ First-time login successful`);
    console.log(`🎫 Temp token: ${tempToken.substring(0, 30)}...`);

    // Step 2: Password Setup
    console.log('\n2️⃣ Testing password setup...');
    console.log(`🔑 New Password: ${newPassword}`);

    try {
      const setupResponse = await axios.post(
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
      console.log(`   Status: ${setupResponse.status}`);
      console.log(`   Success: ${setupResponse.data.success}`);
      console.log(`   Message: ${setupResponse.data.message}`);

      if (!setupResponse.data.success) {
        console.error('❌ Password setup failed!');
        console.error('🐛 BUG FOUND: Password setup endpoint returned failure');
        throw new Error(`Password setup failed: ${setupResponse.data.message}`);
      }

      console.log('✅ Password setup successful');

    } catch (setupError) {
      console.error('\n❌ Password Setup Error!');
      if (setupError.response) {
        console.error(`   Status: ${setupError.response.status}`);
        console.error(`   Data:`, setupError.response.data);
        console.error('🐛 BUG FOUND: Password setup endpoint error');
      } else {
        console.error(`   Error: ${setupError.message}`);
        console.error('🐛 BUG FOUND: Network or other error during password setup');
      }
      throw setupError;
    }

    // Step 3: Wait for database update
    console.log('\n⏳ Waiting 3 seconds for database update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4: Test Regular Login
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
        console.error('🐛 BUG FOUND: New password does not work for login');
        throw new Error(`Regular login failed: ${regularLoginResponse.data.message}`);
      }

      if (regularLoginResponse.data.requiresPasswordSetup) {
        console.error('❌ Still requires password setup after setup completed!');
        console.error('🐛 BUG FOUND: isFirstLogin flag was not cleared');
        throw new Error('Password setup did not clear the first-login flag');
      }

      console.log('✅ Regular login successful');

    } catch (loginError) {
      console.error('\n❌ Regular Login Error!');
      if (loginError.response) {
        console.error(`   Status: ${loginError.response.status}`);
        console.error(`   Data:`, loginError.response.data);
        console.error('🐛 BUG FOUND: New password login failed');
      } else {
        console.error(`   Error: ${loginError.message}`);
      }
      throw loginError;
    }

    console.log('\n🎉 Password setup flow test PASSED!');
    console.log('✅ First-time login worked');
    console.log('✅ Password setup worked');
    console.log('✅ Regular login worked');
    console.log('✅ No bugs found in the backend code');

  } catch (error) {
    console.error('\n❌ Password setup flow test FAILED!');
    console.error('🐛 BUG CONFIRMED:', error.message);
    
    // Check user status after failure
    console.log('\n🔍 Checking user status after failure...');
    try {
      const { spawn } = require('child_process');
      await new Promise((resolve) => {
        const checkUser = spawn('node', ['check-user-status.cjs', email], {
          stdio: 'inherit'
        });
        checkUser.on('close', () => resolve());
      });
    } catch (checkError) {
      console.error('Could not check user status:', checkError.message);
    }
    
    process.exit(1);
  }
}

testPasswordSetupBug();
