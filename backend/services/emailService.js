import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
/* eslint-env node */
import process from 'process';

const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

// Create transporter
let transporter;
try {
  transporter = nodemailer.createTransport(emailConfig);
} catch (error) {
  console.error('Email transporter configuration error:', error);
}

// Verify email configuration
const verifyEmailConfig = async () => {
  if (!transporter) return false;
  
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};

// Initialize email service
verifyEmailConfig();

export const sendVerificationEmail = async (email, firstName, token) => {
  console.log('=== [DEBUG] sendVerificationEmail CALLED ===', { email, firstName, token });
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-email?token=${token}`;
  console.log('📧 [DEV MODE] Verification email would be sent to:', email);
  console.log('🔗 [DEV MODE] Verification URL:', verificationUrl);
  return;
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
  console.log('📧 [DEV MODE] Password reset email would be sent to:', email);
  console.log('🔗 [DEV MODE] Reset token:', token);
  return;
};

// Send welcome email after email verification
export const sendWelcomeEmail = async (email, firstName) => {
  if (!transporter) {
    console.log('📧 Email service not configured - welcome email would be sent to:', email);
    return;
  }

  const mailOptions = {
    from: `"Investment Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Investment Management System!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
          .content { background: #f8fafc; padding: 30px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #64748b; color: white; padding: 20px; text-align: center; font-size: 14px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #eab308; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Investment Management!</h1>
          </div>
          <div class="content">
            <h2>Hello, ${firstName}!</h2>
            <p>Congratulations! Your email has been verified and your account is now active. You can start exploring our comprehensive investment management platform.</p>
            
            <h3>🚀 What you can do now:</h3>
            
            <div class="feature">
              <strong>📊 View Analytics:</strong> Access detailed performance metrics and insights
            </div>
            
            <div class="feature">
              <strong>💼 Manage Investments:</strong> Track and manage your investment portfolio
            </div>
            
            <div class="feature">
              <strong>📈 Generate Reports:</strong> Create comprehensive investment reports
            </div>
            
            <div class="feature">
              <strong>🔒 Secure Account:</strong> Your account is protected with industry-standard security
            </div>
            
            <p>Ready to get started?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">Login to Your Account</a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Investment Management Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Investment Management System. All rights reserved.</p>
            <p>Need help? Contact us at support@investmentmanagement.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
};
