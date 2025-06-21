/**
 * Simple login test to debug authentication
 */

const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing simple login...');

    const baseURL = 'http://localhost:3001/api';

    // Test different credentials
    const testCredentials = [
      { email: 'ihsansaif@gmail.com', password: 'Ihs@n2553.' },
      { email: 'arsl@gmail.com', password: 'Ihs@n2553.' }
    ];

    for (const creds of testCredentials) {
      console.log(`\n🔐 Testing login: ${creds.email} / ${creds.password}`);
      
      try {
        const response = await axios.post(`${baseURL}/auth/login`, creds);
        console.log('✅ Login successful!');
        console.log('📊 User data:', {
          id: response.data.data.user.id,
          email: response.data.data.user.email,
          name: `${response.data.data.user.firstName} ${response.data.data.user.lastName}`,
          role: response.data.data.user.role.type,
          status: response.data.data.user.role.status,
          companyAssignments: response.data.data.user.companyAssignments?.length || 0
        });
        break; // Stop on first successful login
      } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testLogin();
