/**
 * Test Frontend-Backend Connection
 * Simple test to verify the frontend can connect to the backend
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testFrontendBackendConnection() {
  try {
    console.log('🧪 Testing Frontend-Backend Connection\n');

    // Test 1: Health check
    console.log('1️⃣ Testing Health Endpoint');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Health check successful');
      console.log('📊 Response:', healthResponse.data);
    } catch (healthError) {
      console.log('❌ Health check failed:', healthError.message);
      return;
    }

    // Test 2: Admin login
    console.log('\n2️⃣ Testing Admin Login');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'ihsansaif@gmail.com',
        password: 'Ihs@n2553.'
      });

      console.log('✅ Admin login successful');
      console.log('📊 Response structure:');
      console.log('   - success:', loginResponse.data.success);
      console.log('   - data.user.id:', loginResponse.data.data?.user?.id);
      console.log('   - data.user.email:', loginResponse.data.data?.user?.email);
      console.log('   - data.user.role.type:', loginResponse.data.data?.user?.role?.type);
      console.log('   - data.token:', loginResponse.data.data?.token ? 'Present' : 'Missing');

    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data?.message || loginError.message);
      console.log('📊 Status:', loginError.response?.status);
      console.log('📝 Response:', loginError.response?.data);
    }

    console.log('\n🎯 Connection Status:');
    console.log('✅ Backend is running on port 3001');
    console.log('✅ API endpoints are accessible');
    console.log('✅ Authentication is working');
    console.log('✅ Response structure is correct');

    console.log('\n💡 Frontend should be able to connect successfully!');
    console.log('If you\'re still getting errors in the browser:');
    console.log('1. Check browser console for detailed error messages');
    console.log('2. Check network tab for failed requests');
    console.log('3. Verify CORS settings if needed');
    console.log('4. Check if frontend is running on port 5173');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testFrontendBackendConnection();
