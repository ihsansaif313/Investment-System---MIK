/**
 * Test Login Response Structure
 * Test the exact structure of login responses to debug frontend issues
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testLoginResponseStructure() {
  let adminLoginResponse;

  try {
    console.log('🧪 Testing Login Response Structure\n');

    // Test 1: Admin login (regular login)
    console.log('1️⃣ Testing Admin Login (Regular)');
    try {
      adminLoginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'ihsansaif@gmail.com',
        password: 'Ihs@n2553.'
      });

      console.log('✅ Admin login successful');
      console.log('📊 Response structure:');
      console.log('   - success:', adminLoginResponse.data.success);
      console.log('   - requiresPasswordSetup:', adminLoginResponse.data.requiresPasswordSetup || 'Not present (expected for regular login)');
      console.log('   - data.user.id:', adminLoginResponse.data.data?.user?.id);
      console.log('   - data.user.email:', adminLoginResponse.data.data?.user?.email);
      console.log('   - data.user.role.type:', adminLoginResponse.data.data?.user?.role?.type);
      console.log('   - data.user.role.status:', adminLoginResponse.data.data?.user?.role?.status);
      console.log('   - data.token:', adminLoginResponse.data.data?.token ? 'Present' : 'Missing');
      console.log('   - data.refreshToken:', adminLoginResponse.data.data?.refreshToken ? 'Present' : 'Missing');

      console.log('\n📋 Full Response Structure:');
      console.log(JSON.stringify(adminLoginResponse.data, null, 2));

    } catch (adminError) {
      console.log('❌ Admin login failed:', adminError.response?.data?.message || adminError.message);
      return;
    }

    // Test 2: Create and test investor login (first-time login)
    console.log('\n2️⃣ Testing Investor Login (First-Time)');
    
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const investorData = {
      firstName: 'LoginTest',
      lastName: 'User',
      email: `logintest.${timestamp}@example.com`,
      phone: `+1234567${uniqueId.slice(-3)}`,
      cnic: `12345-${uniqueId}-1`,
      address: '123 Login Test Street, Test City, Test Country',
      dateOfBirth: '1990-01-01',
      initialInvestmentAmount: 10000,
      notes: 'Login response structure test investor'
    };

    // Get admin token first
    const adminToken = adminLoginResponse.data.data.token;

    // Create investor
    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Investor created successfully');
    const tempPassword = createResponse.data.temporaryPassword;
    const investorEmail = investorData.email;
    console.log('🔑 Temporary password:', tempPassword);

    // Test investor first-time login
    try {
      const investorLoginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: investorEmail,
        password: tempPassword
      });

      console.log('✅ Investor first-time login successful');
      console.log('📊 Response structure:');
      console.log('   - success:', investorLoginResponse.data.success);
      console.log('   - requiresPasswordSetup:', investorLoginResponse.data.requiresPasswordSetup);
      console.log('   - message:', investorLoginResponse.data.message);
      console.log('   - data.user.id:', investorLoginResponse.data.data?.user?.id);
      console.log('   - data.user.email:', investorLoginResponse.data.data?.user?.email);
      console.log('   - data.user.firstName:', investorLoginResponse.data.data?.user?.firstName);
      console.log('   - data.user.lastName:', investorLoginResponse.data.data?.user?.lastName);
      console.log('   - data.user.isFirstLogin:', investorLoginResponse.data.data?.user?.isFirstLogin);
      console.log('   - data.user.role:', investorLoginResponse.data.data?.user?.role ? 'Present' : 'Missing');
      console.log('   - data.token:', investorLoginResponse.data.data?.token ? 'Present' : 'Missing');
      console.log('   - data.expiresIn:', investorLoginResponse.data.data?.expiresIn);

      console.log('\n📋 Full First-Time Login Response:');
      console.log(JSON.stringify(investorLoginResponse.data, null, 2));

    } catch (investorError) {
      console.log('❌ Investor login failed:', investorError.response?.data?.message || investorError.message);
      console.log('📊 Status:', investorError.response?.status);
      console.log('📝 Response:', investorError.response?.data);
    }

    console.log('\n🎯 Frontend Integration Notes:');
    console.log('1. Always check loginResponse.success first');
    console.log('2. Check loginResponse.requiresPasswordSetup for first-time login');
    console.log('3. Use optional chaining (?.) when accessing nested properties');
    console.log('4. Validate that required fields exist before using them');
    console.log('5. Handle both regular and first-time login response structures');

    console.log('\n💡 Recommended Frontend Code Pattern:');
    console.log('```javascript');
    console.log('if (!loginResponse || !loginResponse.success) {');
    console.log('  throw new Error("Login failed");');
    console.log('}');
    console.log('');
    console.log('if (loginResponse.requiresPasswordSetup) {');
    console.log('  const tempToken = loginResponse.data?.token;');
    console.log('  const tempUser = loginResponse.data?.user;');
    console.log('  if (!tempToken || !tempUser) {');
    console.log('    throw new Error("Invalid first-time login response");');
    console.log('  }');
    console.log('  // Handle first-time login...');
    console.log('} else {');
    console.log('  const userData = loginResponse.data?.user;');
    console.log('  const authToken = loginResponse.data?.token;');
    console.log('  if (!userData || !authToken) {');
    console.log('    throw new Error("Invalid login response");');
    console.log('  }');
    console.log('  // Handle regular login...');
    console.log('}');
    console.log('```');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testLoginResponseStructure();
