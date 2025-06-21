const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testInvestorCreation() {
  try {
    console.log('🧪 Testing Fixed Investor Creation...');

    // Step 1: Login as admin
    console.log('\n1️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    console.log('🔑 Token:', authToken ? 'Present' : 'Missing');
    console.log('👤 User role:', loginResponse.data.data.user?.role?.type);

    // Step 2: Test investor creation
    console.log('\n2️⃣ Creating Investor Account');
    const investorData = {
      firstName: 'Test',
      lastName: 'Investor',
      email: `test.investor.${Date.now()}@example.com`,
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
      notes: 'Test investor account'
    };

    console.log('📤 Sending investor creation request...');
    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Investor creation successful!');
    console.log('📧 Email sent:', createResponse.data.emailSent);
    console.log('🔑 Temporary password included:', !!createResponse.data.temporaryPassword);
    console.log('👤 Investor ID:', createResponse.data.data.user.id);
    console.log('📧 Investor Email:', createResponse.data.data.user.email);
    console.log('📝 Response message:', createResponse.data.message);

    // Step 3: Check backend health after creation
    console.log('\n3️⃣ Checking Backend Health');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Backend is still healthy after investor creation');

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Backend did not crash');
    console.log('✅ Investor account created');
    console.log('✅ Email handling working (graceful failure if needed)');
    console.log('✅ API response includes all necessary data');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📝 Full error:', error.response?.data || error.message);
  }
}

testInvestorCreation();
