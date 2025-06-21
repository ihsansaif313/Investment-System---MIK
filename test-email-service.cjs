/**
 * Email Service Comprehensive Testing Script
 * Tests all aspects of the email service functionality
 */

const { execSync } = require('child_process');
const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testEmailService() {
  try {
    console.log('🔍 Email Service Comprehensive Testing\n');

    // Test 1: Check if backend is running
    console.log('1️⃣ Checking backend status...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend is not running. Please start the backend server.');
      return;
    }

    // Test 2: Login as admin to get token
    console.log('\n2️⃣ Admin authentication...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });
    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Test 3: Test email configuration endpoint
    console.log('\n3️⃣ Testing email configuration...');
    try {
      const emailTestResponse = await axios.get(`${baseURL}/investor-management/test-email`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Email configuration test:', emailTestResponse.data.message);
    } catch (error) {
      console.log('❌ Email configuration test failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Create investor account to test welcome email
    console.log('\n4️⃣ Testing investor creation with email...');
    const investorData = {
      firstName: 'Email',
      lastName: 'Test',
      email: 'ihsansaifedwardion@gmail.com', // Use your actual email for testing
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
      notes: 'Email service test investor'
    };

    try {
      const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('✅ Investor creation successful');
      console.log('📧 Email sent:', createResponse.data.emailSent);
      console.log('📝 Message:', createResponse.data.message);
      
      if (createResponse.data.emailSent) {
        console.log('🎉 Welcome email was sent successfully!');
        console.log('📬 Check your email inbox for the welcome message');
      } else {
        console.log('⚠️ Email was not sent. Temporary password:', createResponse.data.temporaryPassword);
      }

    } catch (error) {
      console.log('❌ Investor creation failed:', error.response?.data?.message || error.message);
      console.log('📊 Status:', error.response?.status);
      console.log('📝 Full error:', error.response?.data);
    }

    // Test 5: Test forgot password email
    console.log('\n5️⃣ Testing forgot password email...');
    try {
      const forgotPasswordResponse = await axios.post(`${baseURL}/investor-auth/forgot-password`, {
        email: 'ihsansaifedwardion@gmail.com' // Use your actual email
      });
      console.log('✅ Forgot password request successful');
      console.log('📝 Message:', forgotPasswordResponse.data.message);
      console.log('📬 Check your email for password reset instructions');
    } catch (error) {
      console.log('❌ Forgot password test failed:', error.response?.data?.message || error.message);
    }

    console.log('\n📊 Email Service Test Summary:');
    console.log('✅ Backend connectivity: Working');
    console.log('✅ Authentication: Working');
    console.log('📧 Email delivery: Check your inbox');
    console.log('\n💡 Next steps:');
    console.log('1. Check your email inbox (ihsansaifedwardion@gmail.com)');
    console.log('2. Look for welcome email and password reset email');
    console.log('3. Verify email formatting and content');
    console.log('4. Test email links and functionality');

  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

// Run the test
testEmailService();
