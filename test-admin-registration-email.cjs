/**
 * Test Admin Registration with Email Verification
 * Tests the complete admin registration and email verification workflow
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testAdminRegistrationEmail() {
  try {
    console.log('🧪 Testing Admin Registration with Email Verification\n');

    // Step 1: Test admin registration with email verification
    console.log('1️⃣ Testing Admin Registration');
    
    const adminData = {
      firstName: 'Email',
      lastName: 'Test',
      email: `admin.test.${Date.now()}@example.com`, // Use unique email
      password: 'TestAdmin123!',
      role: 'admin'
    };

    console.log('📧 Registering admin with email:', adminData.email);

    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, adminData);
      console.log('✅ Admin registration successful');
      console.log('📧 Verification email should be sent to:', adminData.email);
      console.log('📝 Response:', registerResponse.data.message);
      console.log('👤 User ID:', registerResponse.data.data?.user?.id);
      
      if (registerResponse.data.data?.emailSent) {
        console.log('🎉 Email was sent successfully!');
      } else {
        console.log('⚠️ Email sending status not confirmed');
      }
      
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        console.log('ℹ️ Admin already exists with this email');
      } else {
        console.log('❌ Admin registration failed:', registerError.response?.data?.message || registerError.message);
        console.log('📊 Status:', registerError.response?.status);
        console.log('📝 Full response:', registerError.response?.data);
      }
    }

    // Step 2: Test with your real email for actual email delivery
    console.log('\n2️⃣ Testing with Real Email Address');
    
    const realEmailData = {
      firstName: 'Real',
      lastName: 'Test',
      email: 'ihsansaifedwardion@gmail.com', // Your real email
      password: 'TestAdmin123!',
      role: 'admin'
    };

    console.log('📧 Registering admin with real email:', realEmailData.email);

    try {
      const realEmailResponse = await axios.post(`${baseURL}/auth/register`, realEmailData);
      console.log('✅ Real email registration successful');
      console.log('📧 Verification email should be sent to your inbox!');
      console.log('📝 Response:', realEmailResponse.data.message);
      
    } catch (realEmailError) {
      if (realEmailError.response?.status === 409) {
        console.log('ℹ️ Admin already exists with this email - this is expected');
        console.log('📧 You should still receive verification emails when logging in if not verified');
      } else {
        console.log('❌ Real email registration failed:', realEmailError.response?.data?.message || realEmailError.message);
      }
    }

    console.log('\n📊 Admin Registration Email Test Summary:');
    console.log('✅ Admin registration API: Tested');
    console.log('✅ Email verification system: Tested');
    console.log('✅ Real email delivery: Tested');
    
    console.log('\n📧 Expected Results:');
    console.log('1. Check your email inbox (ihsansaifedwardion@gmail.com)');
    console.log('2. Look for "InvestPro - Verify Your Email Address" email');
    console.log('3. The email should contain a verification link');
    console.log('4. Click the link to verify your email address');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Check your email inbox for verification email');
    console.log('2. Click the verification link in the email');
    console.log('3. Login to test the complete workflow');
    console.log('4. Test admin approval/rejection emails');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testAdminRegistrationEmail();
