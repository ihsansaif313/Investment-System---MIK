/**
 * Direct Email Service Testing
 * Tests email functionality directly without API calls
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: './backend/.env' });

async function testEmailDirect() {
  console.log('🔍 Direct Email Service Testing\n');

  // Step 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Email credentials not configured properly');
    return;
  }

  // Step 2: Create transporter
  console.log('\n2️⃣ Creating email transporter...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });

  // Step 3: Verify connection
  console.log('\n3️⃣ Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (error) {
    console.log('❌ SMTP connection failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Error command:', error.command);
    return;
  }

  // Step 4: Send test email
  console.log('\n4️⃣ Sending test email...');
  const mailOptions = {
    from: `"InvestPro Test" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Send to yourself for testing
    subject: 'InvestPro Email Service Test - ' + new Date().toISOString(),
    html: `
      <h2>🎉 Email Service Test Successful!</h2>
      <p>This email confirms that the InvestPro email service is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Configuration:</strong></p>
      <ul>
        <li>Host: ${process.env.SMTP_HOST}</li>
        <li>Port: ${process.env.SMTP_PORT}</li>
        <li>User: ${process.env.SMTP_USER}</li>
        <li>Frontend URL: ${process.env.FRONTEND_URL}</li>
      </ul>
      <p>If you received this email, the email service is configured correctly!</p>
    `,
    text: `
      Email Service Test Successful!
      
      This email confirms that the InvestPro email service is working correctly.
      Timestamp: ${new Date().toISOString()}
      
      Configuration:
      - Host: ${process.env.SMTP_HOST}
      - Port: ${process.env.SMTP_PORT}
      - User: ${process.env.SMTP_USER}
      - Frontend URL: ${process.env.FRONTEND_URL}
      
      If you received this email, the email service is configured correctly!
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    console.log('\n📬 Check your email inbox:', process.env.SMTP_USER);
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', error);
  }

  // Step 5: Test welcome email template
  console.log('\n5️⃣ Testing welcome email template...');
  const welcomeMailOptions = {
    from: `"InvestPro" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: 'Welcome to InvestPro - Your Account Has Been Created',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to InvestPro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to InvestPro</h1>
            <p>Your investor account has been created</p>
          </div>
          
          <div class="content">
            <h2>Hello Test User,</h2>
            
            <p>Your investor account has been successfully created by your company administrator.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> Your registered email address</p>
              <p><strong>Temporary Password:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">TestPass123!</code></p>
            </div>
            
            <div class="warning">
              <h4>⚠️ Important Security Notice:</h4>
              <ul>
                <li>This is a temporary password that must be changed on your first login</li>
                <li>Please keep this password secure and do not share it with anyone</li>
                <li>You will be required to set a new password when you first log in</li>
              </ul>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">Login to Your Account</a>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Click the login button above or visit our platform</li>
              <li>Enter your email and the temporary password provided</li>
              <li>Create a new secure password when prompted</li>
              <li>Complete your profile setup</li>
              <li>Start exploring your investment opportunities</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const welcomeResult = await transporter.sendMail(welcomeMailOptions);
    console.log('✅ Welcome email template test successful!');
    console.log('Message ID:', welcomeResult.messageId);
  } catch (error) {
    console.log('❌ Welcome email template test failed:', error.message);
  }

  console.log('\n🎯 Email Service Test Complete!');
  console.log('📬 Check your email inbox for test messages');
}

testEmailDirect();
