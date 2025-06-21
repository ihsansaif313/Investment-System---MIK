/**
 * Test Investor Creation with Crash Debugging
 * Monitors backend health during investor creation
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testInvestorCreationCrashDebug() {
  try {
    console.log('🧪 Testing Investor Creation with Crash Debugging\n');

    // Step 1: Check initial backend health
    console.log('1️⃣ Initial Backend Health Check');
    const initialHealth = await axios.get(`${baseURL}/health`);
    console.log('✅ Backend is healthy initially');

    // Step 2: Login as admin
    console.log('\n2️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 3: Check backend health after login
    console.log('\n3️⃣ Backend Health After Login');
    const healthAfterLogin = await axios.get(`${baseURL}/health`);
    console.log('✅ Backend is healthy after login');

    // Step 4: Create investor account with monitoring
    console.log('\n4️⃣ Creating Investor Account (with monitoring)');
    const investorData = {
      firstName: 'Crash',
      lastName: 'Test',
      email: `crash.test.${Date.now()}@example.com`,
      phone: '+1234567890',
      cnic: `12345-${Date.now().toString().slice(-7)}-3`,
      address: '123 Test Street, Test City',
      dateOfBirth: '1990-01-01',
      investmentPreferences: {
        riskTolerance: 'medium',
        preferredSectors: ['Technology'],
        investmentGoals: ['Wealth Building'],
        timeHorizon: 'long'
      },
      initialInvestmentAmount: 10000,
      notes: 'Crash test investor'
    };

    console.log('📤 Sending investor creation request...');
    console.log('📧 Target email:', investorData.email);

    // Monitor backend health during creation
    const healthCheckInterval = setInterval(async () => {
      try {
        await axios.get(`${baseURL}/health`);
        console.log('💓 Backend heartbeat: OK');
      } catch (error) {
        console.log('💔 Backend heartbeat: FAILED');
        clearInterval(healthCheckInterval);
      }
    }, 1000);

    try {
      const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 30000 // 30 second timeout
      });

      clearInterval(healthCheckInterval);

      console.log('✅ Investor creation response received');
      console.log('📧 Email sent:', createResponse.data.emailSent);
      console.log('📝 Message:', createResponse.data.message);
      console.log('👤 Investor ID:', createResponse.data.data.user.id);

      // Step 5: Check backend health after creation
      console.log('\n5️⃣ Backend Health After Creation');
      const healthAfterCreation = await axios.get(`${baseURL}/health`);
      console.log('✅ Backend is healthy after investor creation');

      console.log('\n🎉 SUCCESS: Investor creation completed without crash!');

    } catch (createError) {
      clearInterval(healthCheckInterval);
      
      console.log('❌ Investor creation failed:', createError.message);
      
      if (createError.code === 'ECONNRESET' || createError.code === 'ECONNREFUSED') {
        console.log('💥 BACKEND CRASHED during investor creation!');
        
        // Try to check if backend is still running
        try {
          await axios.get(`${baseURL}/health`);
          console.log('🔄 Backend is still running - connection issue');
        } catch (healthError) {
          console.log('💀 Backend is completely down');
        }
      } else {
        console.log('📊 Status:', createError.response?.status);
        console.log('📝 Response:', createError.response?.data);
      }
    }

    console.log('\n📊 Test Summary:');
    console.log('✅ Backend connectivity: Working');
    console.log('✅ Authentication: Working');
    console.log('🔍 Crash monitoring: Complete');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testInvestorCreationCrashDebug();
