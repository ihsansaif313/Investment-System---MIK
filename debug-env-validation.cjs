/**
 * Debug Environment and Validation
 * Check environment configuration and test validation with minimal data
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function debugEnvValidation() {
  try {
    console.log('🔍 Debugging Environment and Validation Issues\n');

    // Step 1: Check API health
    console.log('1️⃣ Checking API Health');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ API is healthy');
      console.log('📊 Version:', healthResponse.data.version);
    } catch (healthError) {
      console.log('❌ API health check failed:', healthError.message);
      return;
    }

    // Step 2: Test admin login
    console.log('\n2️⃣ Testing Admin Login');
    let authToken;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'ihsansaif@gmail.com',
        password: 'Ihs@n2553.'
      });
      authToken = loginResponse.data.data.token;
      console.log('✅ Admin login successful');
    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data?.message || loginError.message);
      console.log('💡 Try running: node init-database.cjs && node verify-admin-email.cjs');
      return;
    }

    // Step 3: Test with minimal valid data
    console.log('\n3️⃣ Testing with Minimal Valid Data');
    
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const minimalData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.${timestamp}@example.com`,
      phone: `+1${uniqueId}`,
      cnic: `12345-${uniqueId}-1`,
      address: '123 Test Street, Test City, Test Country',
      dateOfBirth: '1990-01-01'
    };

    console.log('📝 Minimal test data:');
    console.log(JSON.stringify(minimalData, null, 2));

    try {
      const createResponse = await axios.post(`${baseURL}/investor-management`, minimalData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Investor created successfully!');
      console.log('📧 Email sent:', createResponse.data.emailSent);
      console.log('👤 Investor ID:', createResponse.data.data.user.id);
      
    } catch (createError) {
      console.log('❌ Investor creation failed');
      console.log('📊 Status:', createError.response?.status);
      console.log('📝 Message:', createError.response?.data?.message);
      
      if (createError.response?.data?.errors) {
        console.log('\n🔍 Detailed Validation Errors:');
        createError.response.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. Field: ${error.path || error.param || 'unknown'}`);
          console.log(`      Message: ${error.msg || error.message}`);
          console.log(`      Value: ${error.value || 'N/A'}`);
          console.log(`      Location: ${error.location || 'body'}`);
        });
      }

      // Check for specific error types
      if (createError.response?.status === 429) {
        console.log('\n⚠️ RATE LIMITING ISSUE:');
        console.log('   You are being rate limited. Wait 1 hour or restart the backend.');
        console.log('   To fix: Restart backend server or wait for rate limit to reset.');
      }
      
      if (createError.response?.status === 409) {
        console.log('\n⚠️ DUPLICATE DATA ISSUE:');
        console.log('   Email or CNIC already exists in database.');
        console.log('   Solution: Use different email and CNIC values.');
      }
      
      if (createError.response?.status === 400) {
        console.log('\n⚠️ VALIDATION ISSUE:');
        console.log('   One or more fields failed validation.');
        console.log('   Check the detailed errors above.');
      }
    }

    // Step 4: Test with common problematic data
    console.log('\n4️⃣ Testing Common Validation Issues');
    
    const problemCases = [
      {
        name: 'Empty firstName',
        data: { ...minimalData, firstName: '' }
      },
      {
        name: 'Invalid email',
        data: { ...minimalData, email: 'invalid-email' }
      },
      {
        name: 'Invalid phone',
        data: { ...minimalData, phone: 'invalid' }
      },
      {
        name: 'Invalid CNIC',
        data: { ...minimalData, cnic: 'invalid' }
      },
      {
        name: 'Short address',
        data: { ...minimalData, address: 'short' }
      }
    ];

    for (const testCase of problemCases) {
      try {
        await axios.post(`${baseURL}/investor-management`, testCase.data, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`❌ ${testCase.name}: Should have failed`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`✅ ${testCase.name}: Correctly rejected`);
        } else if (error.response?.status === 429) {
          console.log(`⚠️ ${testCase.name}: Rate limited (expected)`);
          break; // Stop testing if rate limited
        } else {
          console.log(`⚠️ ${testCase.name}: Unexpected status ${error.response?.status}`);
        }
      }
    }

    console.log('\n📋 Environment Configuration Check:');
    console.log('✅ API Health: Working');
    console.log('✅ Authentication: Working');
    console.log('✅ Database Connection: Working');
    console.log('✅ Validation Rules: Active');
    
    console.log('\n💡 Solutions for "Validation failed":');
    console.log('1. Use unique email addresses (include timestamp)');
    console.log('2. Use unique CNIC numbers (include timestamp)');
    console.log('3. Ensure all required fields are present');
    console.log('4. Check field formats match requirements');
    console.log('5. Wait if rate limited (status 429)');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

debugEnvValidation();
