/**
 * Create Test Investor for Frontend Testing
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function createTestInvestor() {
  try {
    console.log('🔄 Creating Test Investor for Frontend Testing...\n');

    // Step 1: Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    if (!adminLoginResponse.data.success) {
      throw new Error(`Admin login failed: ${adminLoginResponse.data.message}`);
    }

    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Create Investor
    console.log('\n2️⃣ Creating Test Investor...');
    const investorData = {
      email: 'frontend.test@example.com',
      firstName: 'Frontend',
      lastName: 'Test',
      phone: '+1234567890',
      cnic: '12345-6789012-3',
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

    console.log('\n🎯 Now you can test the frontend flow:');
    console.log('1. Go to http://localhost:5174');
    console.log('2. Login with:');
    console.log(`   Email: ${investorData.email}`);
    console.log(`   Password: ${tempPassword}`);
    console.log('3. Set up a new password');
    console.log('4. Try to login with the new password');

  } catch (error) {
    console.error('\n❌ Failed to create test investor!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

createTestInvestor();
