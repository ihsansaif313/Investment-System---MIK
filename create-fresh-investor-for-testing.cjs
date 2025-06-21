/**
 * Create Fresh Investor for Testing
 * Create a new investor to test the password setup bug
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function createFreshInvestor() {
  try {
    console.log('🔄 Creating Fresh Investor for Testing...\n');

    // Step 1: Admin Login (using the correct admin)
    console.log('1️⃣ Admin Login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'saifsoftytech@gmail.com',
      password: 'Ihs@n2553.'
    });

    if (!adminLoginResponse.data.success) {
      throw new Error(`Admin login failed: ${adminLoginResponse.data.message}`);
    }

    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Create Investor
    console.log('\n2️⃣ Creating Fresh Investor...');
    const timestamp = Date.now();
    const investorData = {
      email: `bugtest${timestamp}@example.com`,
      firstName: 'Bug',
      lastName: 'Test',
      phone: '+1234567890',
      cnic: `12345-6789${timestamp.toString().slice(-3)}-3`,
      address: '123 Test Street',
      dateOfBirth: '1990-01-01',
      companyId: '507f1f77bcf86cd799439011' // Dummy company ID
    };

    console.log(`📧 Creating investor: ${investorData.email}`);

    const createInvestorResponse = await axios.post(
      `${API_BASE}/investor-management`,
      investorData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (!createInvestorResponse.data.success) {
      throw new Error(`Investor creation failed: ${createInvestorResponse.data.message}`);
    }

    const tempPassword = createInvestorResponse.data.temporaryPassword;
    console.log('✅ Investor created successfully');
    console.log(`📧 Email: ${investorData.email}`);
    console.log(`🔑 Temporary password: ${tempPassword}`);

    console.log('\n🎯 Now test the password setup bug:');
    console.log('1. Go to http://localhost:5174');
    console.log('2. Login with:');
    console.log(`   Email: ${investorData.email}`);
    console.log(`   Password: ${tempPassword}`);
    console.log('3. Try to set up a new password');
    console.log('4. Check if it works or gives an error');

    // Also test the API flow to see if it works
    console.log('\n🧪 Testing API flow...');
    
    // First-time login
    const firstLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: investorData.email,
      password: tempPassword
    });

    if (firstLoginResponse.data.requiresPasswordSetup) {
      console.log('✅ First-time login works, requires password setup');
      
      const tempToken = firstLoginResponse.data.data.token;
      console.log(`🎫 Temp token: ${tempToken.substring(0, 30)}...`);
      
      // Try password setup
      const newPassword = 'BugTest123!';
      console.log(`🔑 Setting new password: ${newPassword}`);
      
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
      
      if (setupResponse.data.success) {
        console.log('✅ API password setup works');
        
        // Test new login
        const newLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: investorData.email,
          password: newPassword
        });
        
        if (newLoginResponse.data.success && !newLoginResponse.data.requiresPasswordSetup) {
          console.log('✅ New password login works - API flow is working correctly');
          console.log('🐛 The bug must be in the frontend, not the backend');
        } else {
          console.log('❌ New password login failed - backend bug confirmed');
        }
      } else {
        console.log('❌ API password setup failed - backend bug confirmed');
        console.log('Error:', setupResponse.data.message);
      }
    } else {
      console.log('❌ First-time login not working correctly');
    }

  } catch (error) {
    console.error('\n❌ Failed to create test investor!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

createFreshInvestor();
