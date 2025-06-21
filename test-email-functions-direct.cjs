/**
 * Test Email Functions Directly
 * Tests the email service functions directly without going through the API
 */

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const { sendVerificationEmail, sendAdminApprovalEmail, sendAdminRejectionEmail } = require('./backend/utils/emailService.js');

async function testEmailFunctionsDirect() {
  try {
    console.log('🧪 Testing Email Functions Directly\n');

    // Test 1: Verification Email
    console.log('1️⃣ Testing Verification Email');
    try {
      const verificationResult = await sendVerificationEmail(
        'ihsansaifedwardion@gmail.com',
        'Test User',
        'test-verification-token-123'
      );
      console.log('✅ Verification email sent successfully!');
      console.log('📧 Message ID:', verificationResult.messageId);
    } catch (error) {
      console.log('❌ Verification email failed:', error.message);
    }

    // Test 2: Admin Approval Email
    console.log('\n2️⃣ Testing Admin Approval Email');
    try {
      const approvalResult = await sendAdminApprovalEmail(
        'ihsansaifedwardion@gmail.com',
        'Test Admin'
      );
      console.log('✅ Admin approval email sent successfully!');
      console.log('📧 Message ID:', approvalResult.messageId);
    } catch (error) {
      console.log('❌ Admin approval email failed:', error.message);
    }

    // Test 3: Admin Rejection Email
    console.log('\n3️⃣ Testing Admin Rejection Email');
    try {
      const rejectionResult = await sendAdminRejectionEmail(
        'ihsansaifedwardion@gmail.com',
        'Test Admin',
        'Application does not meet current requirements'
      );
      console.log('✅ Admin rejection email sent successfully!');
      console.log('📧 Message ID:', rejectionResult.messageId);
    } catch (error) {
      console.log('❌ Admin rejection email failed:', error.message);
    }

    console.log('\n🎉 Email Function Testing Complete!');
    console.log('📬 Check your email inbox for:');
    console.log('1. Email verification message');
    console.log('2. Admin approval notification');
    console.log('3. Admin rejection notification');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📝 Error details:', error);
  }
}

testEmailFunctionsDirect();
