/**
 * Test Verification Email Directly
 * Tests the verification email function directly
 */

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const { sendVerificationEmail } = require('./backend/utils/emailService.js');

async function testVerificationEmailDirect() {
  try {
    console.log('🧪 Testing Verification Email Directly\n');

    console.log('📧 Environment Check:');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'DEFAULT');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'DEFAULT');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('❌ SMTP credentials not configured');
      return;
    }

    console.log('\n📧 Sending verification email...');
    
    const result = await sendVerificationEmail(
      'ihsansaifedwardion@gmail.com',
      'Test User',
      'test-verification-token-123'
    );
    
    console.log('✅ Verification email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
    console.log('\n🎯 Check your email inbox for the verification email!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📝 Error details:', error);
  }
}

testVerificationEmailDirect();
