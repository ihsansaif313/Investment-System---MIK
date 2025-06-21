/**
 * Test Frontend Flow Simulation
 * Simulate the exact frontend flow to identify the issue
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFrontendFlowSimulation() {
  try {
    console.log('🔄 Simulating Frontend Flow...\n');

    const email = 'ihsansaifedwardion3@gmail.com';
    const tempPassword = 'ZYu3C#i1qt@i';
    const newPassword = 'TestPassword123!';

    // Step 1: First-time Login (simulating frontend login)
    console.log('1️⃣ Step 1: First-time Login...');
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

    // Extract data exactly like frontend does
    const tempToken = loginResponse.data.data?.token;
    const tempUser = loginResponse.data.data?.user;

    console.log(`\n🎫 Temporary Token: ${tempToken ? tempToken.substring(0, 30) + '...' : 'MISSING'}`);
    console.log(`👤 Temp User: ${tempUser ? `${tempUser.firstName} ${tempUser.lastName}` : 'MISSING'}`);

    if (!tempToken || !tempUser) {
      throw new Error('Missing first-time login data');
    }

    // Step 2: Wait a moment (simulating user reading the page)
    console.log('\n⏳ Waiting 2 seconds (simulating user interaction)...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Password Setup (simulating frontend password setup)
    console.log('\n2️⃣ Step 2: Password Setup...');
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`🎫 Using Token: ${tempToken.substring(0, 30)}...`);

    try {
      const setupResponse = await axios.post(
        `${API_BASE}/auth/setup-password`,
        {
          newPassword: newPassword,
          confirmPassword: newPassword
        },
        {
          headers: { 
            'Authorization': `Bearer ${tempToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('\n📊 Password Setup Response:');
      console.log(`   Status: ${setupResponse.status}`);
      console.log(`   Success: ${setupResponse.data.success}`);
      console.log(`   Message: ${setupResponse.data.message}`);

      if (!setupResponse.data.success) {
        throw new Error(`Password setup failed: ${setupResponse.data.message}`);
      }

      console.log('✅ Password setup successful!');

      // Extract new auth data
      const userData = setupResponse.data.data?.user;
      const authToken = setupResponse.data.data?.token;
      const refreshToken = setupResponse.data.data?.refreshToken;

      console.log(`\n🎫 New Auth Token: ${authToken ? authToken.substring(0, 30) + '...' : 'MISSING'}`);
      console.log(`🔄 Refresh Token: ${refreshToken ? refreshToken.substring(0, 30) + '...' : 'MISSING'}`);
      console.log(`👤 User Data: ${userData ? `${userData.firstName} ${userData.lastName}` : 'MISSING'}`);

    } catch (setupError) {
      console.error('\n❌ Password Setup Failed!');
      if (setupError.response) {
        console.error(`   Status: ${setupError.response.status}`);
        console.error(`   Data:`, setupError.response.data);
        console.error(`   Headers:`, setupError.response.headers);
      } else {
        console.error(`   Error: ${setupError.message}`);
      }
      throw setupError;
    }

    // Step 4: Wait for database update
    console.log('\n⏳ Waiting 3 seconds for database update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Test Regular Login (simulating user logging in again)
    console.log('\n3️⃣ Step 3: Regular Login Test...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);

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
      console.error('🐛 BUG FOUND: Password setup did not clear the first-login flag');
      throw new Error('Password setup did not clear the first-login flag');
    }

    console.log('\n🎉 Complete frontend flow simulation PASSED!');
    console.log('✅ First-time login worked');
    console.log('✅ Password setup worked');
    console.log('✅ Regular login worked');
    console.log('✅ First-login flag was cleared');

  } catch (error) {
    console.error('\n❌ Frontend flow simulation FAILED!');
    console.error('Error:', error.message);
    
    // Check user status after failure
    console.log('\n🔍 Checking user status after failure...');
    try {
      const { spawn } = require('child_process');
      await new Promise((resolve) => {
        const checkUser = spawn('node', ['check-user-status.cjs', 'ihsansaifedwardion3@gmail.com'], {
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

testFrontendFlowSimulation();
