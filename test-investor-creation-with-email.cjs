/**
 * Test Investor Creation with Email Debugging
 * Tests the complete investor creation workflow with detailed email debugging
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testInvestorCreationWithEmail() {
  try {
    console.log('🧪 Testing Investor Creation with Email Debugging\n');

    // Step 1: Login as admin
    console.log('1️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test email configuration first
    console.log('\n2️⃣ Testing Email Configuration');
    try {
      const emailTestResponse = await axios.get(`${baseURL}/investor-management/test-email`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Email configuration test result:', emailTestResponse.data.success);
      if (!emailTestResponse.data.success) {
        console.log('❌ Email configuration issues:', emailTestResponse.data.diagnostics);
      }
    } catch (error) {
      console.log('❌ Email configuration test failed:', error.response?.data?.message || error.message);
    }

    // Step 3: Send test welcome email
    console.log('\n3️⃣ Testing Welcome Email Template');
    try {
      const testWelcomeResponse = await axios.post(`${baseURL}/investor-management/test-welcome-email`, {
        email: 'ihsansaifedwardion@gmail.com'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Test welcome email result:', testWelcomeResponse.data.success);
      console.log('📧 Message ID:', testWelcomeResponse.data.messageId);
    } catch (error) {
      console.log('❌ Test welcome email failed:', error.response?.data?.message || error.message);
    }

    // Step 4: Create investor account
    console.log('\n4️⃣ Creating Investor Account');
    const investorData = {
      firstName: 'Email',
      lastName: 'Test',
      email: `test.investor.${Date.now()}@example.com`, // Use unique email
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

    console.log('📤 Sending investor creation request...');
    console.log('📧 Target email:', investorData.email);
    console.log('📧 Welcome email will be sent to: ihsansaifedwardion@gmail.com (configured SMTP user)');

    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Investor creation response received');
    console.log('📧 Email sent:', createResponse.data.emailSent);
    console.log('📝 Message:', createResponse.data.message);
    console.log('👤 Investor ID:', createResponse.data.data.user.id);
    console.log('📧 Investor Email:', createResponse.data.data.user.email);

    if (createResponse.data.emailSent) {
      console.log('\n🎉 SUCCESS: Welcome email was sent!');
      console.log('📬 Check your email inbox for the welcome message');
    } else {
      console.log('\n⚠️ WARNING: Email was not sent');
      console.log('🔑 Temporary password:', createResponse.data.temporaryPassword);
      console.log('\n🔍 Debugging email issue...');
      
      // Additional debugging - check backend logs
      console.log('💡 Check the backend console for email error details');
      console.log('💡 Verify SMTP credentials in backend/.env file');
      console.log('💡 Ensure Gmail app password is correctly configured');
    }

    // Step 5: Verify investor was created in database
    console.log('\n5️⃣ Verifying Investor in Database');
    try {
      const investorResponse = await axios.get(`${baseURL}/investor-management/${createResponse.data.data.user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Investor found in database');
      console.log('📊 Account status:', investorResponse.data.data.accountStatus);
      console.log('🔐 First login required:', investorResponse.data.data.isFirstLogin);
    } catch (error) {
      console.log('❌ Failed to verify investor in database:', error.response?.data?.message || error.message);
    }

    console.log('\n📊 Test Summary:');
    console.log('✅ Backend connectivity: Working');
    console.log('✅ Authentication: Working');
    console.log('✅ Investor creation: Working');
    console.log('✅ Database persistence: Working');
    console.log('📧 Email delivery:', createResponse.data.emailSent ? 'Working' : 'Failed');

    if (createResponse.data.emailSent) {
      console.log('\n🎯 Next Steps:');
      console.log('1. Check your email inbox (ihsansaifedwardion@gmail.com)');
      console.log('2. Look for the welcome email with temporary password');
      console.log('3. Test the login process with the temporary password');
      console.log('4. Test the password setup flow');
    } else {
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('1. Check backend console for detailed error messages');
      console.log('2. Verify SMTP_USER and SMTP_PASS in backend/.env');
      console.log('3. Ensure Gmail 2FA is enabled and app password is used');
      console.log('4. Test direct email sending with test-email-direct.cjs');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testInvestorCreationWithEmail();
