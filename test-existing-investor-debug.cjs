/**
 * Test Existing Investor Debug
 * Debug the password setup issue with the existing investor
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testExistingInvestorDebug() {
  try {
    console.log('🔍 Testing Existing Investor Debug...\n');

    const email = 'ihsansaifedwardion3@gmail.com';
    
    // The actual temporary password for MAAZ
    const tempPassword = 'ZYu3C#i1qt@i';
    
    console.log(`📧 Testing with: ${email}`);
    console.log(`🔑 Trying password: ${tempPassword}`);

    // Test login with temporary password
    console.log('\n1️⃣ Testing login with temporary password...');
    
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: email,
        password: tempPassword
      });

      console.log('✅ Login successful!');
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data.requiresPasswordSetup) {
        console.log('\n🔑 Password setup required - this is correct!');
        const tempToken = loginResponse.data.data.token;
        
        // Now test password setup
        console.log('\n2️⃣ Testing password setup...');
        const newPassword = 'TestPassword123!';
        
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
        
        console.log('✅ Password setup response:');
        console.log(JSON.stringify(setupResponse.data, null, 2));
        
        // Test login with new password
        console.log('\n3️⃣ Testing login with new password...');
        const newLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: email,
          password: newPassword
        });
        
        console.log('✅ New login response:');
        console.log(JSON.stringify(newLoginResponse.data, null, 2));
        
      } else {
        console.log('❌ Password setup not required - user may already be set up');
      }
      
    } catch (loginError) {
      console.error('❌ Login failed!');
      if (loginError.response) {
        console.error('Status:', loginError.response.status);
        console.error('Data:', loginError.response.data);
      } else {
        console.error('Error:', loginError.message);
      }
      
      // Try different passwords
      console.log('\n🔄 Trying different passwords...');
      const passwords = ['', 'password', 'temp123', 'investor123'];
      
      for (const pwd of passwords) {
        try {
          console.log(`Trying: "${pwd}"`);
          const testResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: email,
            password: pwd
          });
          console.log(`✅ Success with password: "${pwd}"`);
          console.log('Response:', JSON.stringify(testResponse.data, null, 2));
          break;
        } catch (err) {
          console.log(`❌ Failed with: "${pwd}"`);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
  }
}

testExistingInvestorDebug();
