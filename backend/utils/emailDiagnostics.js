/**
 * Email Service Diagnostics and Testing Utility
 * Comprehensive email service testing and validation
 */

import nodemailer from 'nodemailer';
import { sendWelcomeEmail, sendPasswordResetEmail } from './emailService.js';

// Email configuration validation
export const validateEmailConfig = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
    frontendUrl: process.env.FRONTEND_URL
  };

  const issues = [];

  if (!config.host) issues.push('SMTP_HOST is not configured');
  if (!config.port) issues.push('SMTP_PORT is not configured');
  if (!config.user) issues.push('SMTP_USER is not configured');
  if (!config.pass) issues.push('SMTP_PASS is not configured');
  if (!config.frontendUrl) issues.push('FRONTEND_URL is not configured');

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (config.user && !emailRegex.test(config.user)) {
    issues.push('SMTP_USER is not a valid email address');
  }

  // Validate port
  if (config.port && (isNaN(config.port) || config.port < 1 || config.port > 65535)) {
    issues.push('SMTP_PORT is not a valid port number');
  }

  return {
    config,
    isValid: issues.length === 0,
    issues
  };
};

// Test SMTP connection
export const testSMTPConnection = async () => {
  try {
    console.log('[EmailDiagnostics] Testing SMTP connection...');
    
    const validation = validateEmailConfig();
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Email configuration is invalid',
        issues: validation.issues
      };
    }

    const transporter = nodemailer.createTransporter({
      host: validation.config.host,
      port: parseInt(validation.config.port),
      secure: false, // true for 465, false for other ports
      auth: {
        user: validation.config.user,
        pass: validation.config.pass
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    console.log('[EmailDiagnostics] Verifying SMTP connection...');
    await transporter.verify();
    
    console.log('[EmailDiagnostics] SMTP connection successful!');
    return {
      success: true,
      message: 'SMTP connection verified successfully',
      config: {
        host: validation.config.host,
        port: validation.config.port,
        user: validation.config.user,
        secure: false
      }
    };

  } catch (error) {
    console.error('[EmailDiagnostics] SMTP connection failed:', error);
    return {
      success: false,
      message: 'SMTP connection failed',
      error: error.message,
      code: error.code,
      command: error.command
    };
  }
};

// Send test email
export const sendTestEmail = async (testEmail = null) => {
  try {
    const validation = validateEmailConfig();
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Email configuration is invalid',
        issues: validation.issues
      };
    }

    const recipientEmail = testEmail || validation.config.user;
    console.log(`[EmailDiagnostics] Sending test email to: ${recipientEmail}`);

    const transporter = nodemailer.createTransporter({
      host: validation.config.host,
      port: parseInt(validation.config.port),
      secure: false,
      auth: {
        user: validation.config.user,
        pass: validation.config.pass
      }
    });

    const mailOptions = {
      from: `"InvestPro Test" <${validation.config.user}>`,
      to: recipientEmail,
      subject: 'InvestPro Email Service Test',
      html: `
        <h2>Email Service Test</h2>
        <p>This is a test email from the InvestPro email service.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${validation.config.host}</li>
          <li>Port: ${validation.config.port}</li>
          <li>User: ${validation.config.user}</li>
        </ul>
        <p>If you received this email, the email service is working correctly!</p>
      `,
      text: `
        Email Service Test
        
        This is a test email from the InvestPro email service.
        Timestamp: ${new Date().toISOString()}
        
        Configuration:
        - Host: ${validation.config.host}
        - Port: ${validation.config.port}
        - User: ${validation.config.user}
        
        If you received this email, the email service is working correctly!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailDiagnostics] Test email sent successfully:`, result.messageId);

    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      recipient: recipientEmail
    };

  } catch (error) {
    console.error('[EmailDiagnostics] Test email failed:', error);
    return {
      success: false,
      message: 'Test email failed',
      error: error.message,
      code: error.code
    };
  }
};

// Test welcome email template
export const testWelcomeEmail = async (testEmail = null) => {
  try {
    const validation = validateEmailConfig();
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Email configuration is invalid',
        issues: validation.issues
      };
    }

    const recipientEmail = testEmail || validation.config.user;
    const testPassword = 'TestPass123!';
    
    console.log(`[EmailDiagnostics] Testing welcome email to: ${recipientEmail}`);
    
    const result = await sendWelcomeEmail(recipientEmail, 'Test User', testPassword);
    
    return {
      success: true,
      message: 'Welcome email test successful',
      messageId: result.messageId,
      recipient: recipientEmail,
      temporaryPassword: testPassword
    };

  } catch (error) {
    console.error('[EmailDiagnostics] Welcome email test failed:', error);
    return {
      success: false,
      message: 'Welcome email test failed',
      error: error.message
    };
  }
};

// Comprehensive email diagnostics
export const runEmailDiagnostics = async (testEmail = null) => {
  console.log('\n🔍 Running Comprehensive Email Diagnostics...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: Configuration validation
  console.log('1️⃣ Validating email configuration...');
  results.tests.configuration = validateEmailConfig();
  console.log(results.tests.configuration.isValid ? '✅ Configuration valid' : '❌ Configuration invalid');
  if (!results.tests.configuration.isValid) {
    console.log('Issues:', results.tests.configuration.issues);
  }

  // Test 2: SMTP connection
  console.log('\n2️⃣ Testing SMTP connection...');
  results.tests.connection = await testSMTPConnection();
  console.log(results.tests.connection.success ? '✅ SMTP connection successful' : '❌ SMTP connection failed');
  if (!results.tests.connection.success) {
    console.log('Error:', results.tests.connection.message);
  }

  // Test 3: Basic email sending
  if (results.tests.connection.success) {
    console.log('\n3️⃣ Testing basic email sending...');
    results.tests.basicEmail = await sendTestEmail(testEmail);
    console.log(results.tests.basicEmail.success ? '✅ Basic email test successful' : '❌ Basic email test failed');
  }

  // Test 4: Welcome email template
  if (results.tests.connection.success) {
    console.log('\n4️⃣ Testing welcome email template...');
    results.tests.welcomeEmail = await testWelcomeEmail(testEmail);
    console.log(results.tests.welcomeEmail.success ? '✅ Welcome email test successful' : '❌ Welcome email test failed');
  }

  // Summary
  console.log('\n📊 Email Diagnostics Summary:');
  console.log('Configuration:', results.tests.configuration.isValid ? '✅ Valid' : '❌ Invalid');
  console.log('SMTP Connection:', results.tests.connection?.success ? '✅ Working' : '❌ Failed');
  console.log('Basic Email:', results.tests.basicEmail?.success ? '✅ Working' : '❌ Failed');
  console.log('Welcome Email:', results.tests.welcomeEmail?.success ? '✅ Working' : '❌ Failed');

  const allTestsPassed = results.tests.configuration.isValid && 
                        results.tests.connection?.success && 
                        results.tests.basicEmail?.success && 
                        results.tests.welcomeEmail?.success;

  console.log('\n🎯 Overall Status:', allTestsPassed ? '✅ All tests passed' : '❌ Some tests failed');

  return results;
};

export default {
  validateEmailConfig,
  testSMTPConnection,
  sendTestEmail,
  testWelcomeEmail,
  runEmailDiagnostics
};
