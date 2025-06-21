const axios = require('axios');

async function simpleAuthTest() {
  try {
    console.log('Testing authentication...\n');
    
    // Test admin login
    console.log('1. Testing admin login...');
    try {
      const adminResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin.demo@investpro.com',
        password: 'Admin123!'
      });
      
      if (adminResponse.data.success) {
        console.log('✅ Admin login successful');
        console.log(`   Token: ${adminResponse.data.data.token.substring(0, 20)}...`);
        console.log(`   User: ${adminResponse.data.data.user.email}`);
        console.log(`   Role: ${adminResponse.data.data.user.role?.type}`);
      }
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    }
    
    // Test investor login
    console.log('\n2. Testing investor login...');
    try {
      const investorResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'investor1.demo@gmail.com',
        password: 'Investor123!'
      });
      
      if (investorResponse.data.success) {
        console.log('✅ Investor login successful');
        console.log(`   Token: ${investorResponse.data.data.token.substring(0, 20)}...`);
        console.log(`   User: ${investorResponse.data.data.user.email}`);
        console.log(`   Role: ${investorResponse.data.data.user.role?.type}`);
      }
    } catch (error) {
      console.log('❌ Investor login failed:', error.response?.data?.message || error.message);
    }
    
    // Test API endpoint with admin token
    console.log('\n3. Testing API endpoint access...');
    try {
      const adminLogin = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin.demo@investpro.com',
        password: 'Admin123!'
      });
      
      const token = adminLogin.data.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      const companiesResponse = await axios.get('http://localhost:3001/api/companies', { headers });
      
      if (companiesResponse.data.success) {
        console.log('✅ API endpoint access successful');
        console.log(`   Companies found: ${companiesResponse.data.data.length}`);
      }
    } catch (error) {
      console.log('❌ API endpoint access failed:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

simpleAuthTest();
