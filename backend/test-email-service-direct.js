/**
 * Direct Email Service Test in Backend
 * Tests the email service directly from the backend environment
 */

import { sendWelcomeEmail } from './utils/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailServiceDirect() {
  console.log('🔍 Testing Email Service Directly in Backend Environment\n');

  // Check environment variables
  console.log('1️⃣ Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ SMTP credentials not configured');
    return;
  }

  // Test welcome email
  console.log('\n2️⃣ Testing Welcome Email Function:');
  try {
    const result = await sendWelcomeEmail(
      'ihsansaifedwardion@gmail.com',
      'Test User',
      'TestPass123!'
    );
    console.log('✅ Welcome email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
  } catch (error) {
    console.log('❌ Welcome email failed:', error.message);
    console.log('📝 Error details:', error);
  }

  console.log('\n🎯 Test Complete!');
}

testEmailServiceDirect();
