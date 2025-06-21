/**
 * Test Current Password
 * Test login with the password that should be current
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCurrentPassword() {
  try {
    console.log('🔄 Testing Current Password...\n');

    const email = 'ihsansaifedwardion3@gmail.com';
    
    // Try the passwords that might have been set
    const possiblePasswords = [
      'TestPassword123!',
      'NewPassword123!',
      'Password123!',
      'Ihs@n2553.'
    ];

    console.log(`📧 Testing with: ${email}`);
    console.log(`🔑 Trying ${possiblePasswords.length} possible passwords...\n`);

    for (let i = 0; i < possiblePasswords.length; i++) {
      const password = possiblePasswords[i];
      console.log(`${i + 1}. Trying password: "${password}"`);
      
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: email,
          password: password
        });

        console.log('✅ SUCCESS! Login worked with this password');
        console.log('📊 Response:');
        console.log(`   Status: ${loginResponse.status}`);
        console.log(`   Success: ${loginResponse.data.success}`);
        console.log(`   Requires Password Setup: ${loginResponse.data.requiresPasswordSetup || false}`);
        console.log(`   Message: ${loginResponse.data.message}`);
        console.log(`   User: ${loginResponse.data.data?.user?.firstName} ${loginResponse.data.data?.user?.lastName}`);

        if (loginResponse.data.requiresPasswordSetup) {
          console.log('⚠️  Still requires password setup - this should not happen!');
        } else {
          console.log('✅ Regular login - password setup is complete!');
        }

        console.log(`\n🎉 FOUND WORKING PASSWORD: "${password}"`);
        console.log('🎯 You can now login in the frontend with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        
        return;

      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('❌ Invalid password');
        } else {
          console.log(`❌ Error: ${error.message}`);
        }
      }
    }

    console.log('\n❌ None of the passwords worked!');
    console.log('🔍 The password might be something else.');

  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
  }
}

testCurrentPassword();
