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

// Email verification template
const getVerificationEmailTemplate = (firstName, verificationUrl) => {
  return {
    subject: 'InvestPro - Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - InvestPro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification Required</h1>
            <p>Welcome to InvestPro</p>
          </div>

          <div class="content">
            <h2>Hello ${firstName},</h2>

            <p>Thank you for registering with InvestPro! To complete your account setup, please verify your email address by clicking the button below:</p>

            <a href="${verificationUrl}" class="button">Verify Email Address</a>

            <div class="warning">
              <h4>⚠️ Important:</h4>
              <ul>
                <li>This verification link will expire in 24 hours</li>
                <li>You must verify your email before you can access your account</li>
                <li>If you didn't create this account, please ignore this email</li>
              </ul>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationUrl}</p>

            <h3>What's Next?</h3>
            <ol>
              <li>Click the verification link above</li>
              <li>Your email will be confirmed</li>
              <li>Wait for admin approval (if required)</li>
              <li>Start using InvestPro once approved</li>
            </ol>

            <p>If you need help, please contact your administrator.</p>
          </div>

          <div class="footer">
            <p>This email was sent from InvestPro Investment Management Platform</p>
            <p>Please do not reply to this email. For support, contact your administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Email Verification Required - InvestPro

      Hello ${firstName},

      Thank you for registering with InvestPro! To complete your account setup, please verify your email address.

      Verification Link:
      ${verificationUrl}

      IMPORTANT: This verification link will expire in 24 hours.

      What's Next:
      1. Click the verification link above
      2. Your email will be confirmed
      3. Wait for admin approval (if required)
      4. Start using InvestPro once approved

      If you need help, please contact your administrator.

      Best regards,
      InvestPro Team
    `
  };
};

export const sendVerificationEmail = async (email, firstName, token) => {
  try {
    console.log(`[EmailService] Starting verification email send to: ${email}`);

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service not configured - missing SMTP credentials');
    }

    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-email?token=${token}`;

    const emailTemplate = getVerificationEmailTemplate(firstName, verificationUrl);

    const mailOptions = {
      from: `"InvestPro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    console.log(`[EmailService] Sending verification email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Verification email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send verification email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    console.log(`[EmailService] Starting password reset email send to: ${email}`);

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service not configured - missing SMTP credentials');
    }

    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const emailTemplate = getPasswordResetEmailTemplate(firstName, resetToken);

    const mailOptions = {
      from: `"InvestPro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    console.log(`[EmailService] Sending password reset email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send password reset email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// Admin approval email template
const getAdminApprovalEmailTemplate = (firstName) => {
  return {
    subject: 'InvestPro - Admin Account Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Account Approved - InvestPro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Approved!</h1>
            <p>Welcome to the InvestPro Admin Team</p>
          </div>

          <div class="content">
            <h2>Congratulations ${firstName}!</h2>

            <div class="success">
              <h4>✅ Your admin account has been approved!</h4>
              <p>You now have full access to the InvestPro admin dashboard and can start managing the platform.</p>
            </div>

            <p>You can now:</p>
            <ul>
              <li>Access the admin dashboard</li>
              <li>Manage investor accounts</li>
              <li>View analytics and reports</li>
              <li>Configure platform settings</li>
              <li>Monitor system activity</li>
            </ul>

            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">Access Admin Dashboard</a>

            <h3>Getting Started:</h3>
            <ol>
              <li>Log in to your account using your registered email and password</li>
              <li>Explore the admin dashboard features</li>
              <li>Review the admin documentation (if available)</li>
              <li>Start managing investor accounts and platform settings</li>
            </ol>

            <p>If you have any questions or need assistance, please contact the super administrator.</p>
          </div>

          <div class="footer">
            <p>This email was sent from InvestPro Investment Management Platform</p>
            <p>Please do not reply to this email. For support, contact your super administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Admin Account Approved - InvestPro

      Congratulations ${firstName}!

      Your admin account has been approved! You now have full access to the InvestPro admin dashboard.

      You can now:
      - Access the admin dashboard
      - Manage investor accounts
      - View analytics and reports
      - Configure platform settings
      - Monitor system activity

      Getting Started:
      1. Log in to your account using your registered email and password
      2. Explore the admin dashboard features
      3. Review the admin documentation (if available)
      4. Start managing investor accounts and platform settings

      Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login

      If you have any questions, please contact the super administrator.

      Best regards,
      InvestPro Team
    `
  };
};

// Admin rejection email template
const getAdminRejectionEmailTemplate = (firstName, reason) => {
  return {
    subject: 'InvestPro - Admin Account Application Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Account Application Update - InvestPro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admin Account Application Update</h1>
            <p>InvestPro Admin Review</p>
          </div>

          <div class="content">
            <h2>Hello ${firstName},</h2>

            <div class="warning">
              <h4>⚠️ Admin Account Application Status</h4>
              <p>We regret to inform you that your admin account application has not been approved at this time.</p>
            </div>

            ${reason ? `
            <h3>Reason:</h3>
            <p style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">${reason}</p>
            ` : ''}

            <h3>What This Means:</h3>
            <ul>
              <li>Your account registration has been reviewed</li>
              <li>Admin privileges have not been granted</li>
              <li>Your account access has been restricted</li>
            </ul>

            <h3>Next Steps:</h3>
            <ul>
              <li>Review the reason provided (if any)</li>
              <li>Contact the super administrator if you have questions</li>
              <li>You may reapply in the future if circumstances change</li>
            </ul>

            <p>If you believe this decision was made in error or if you have additional information to provide, please contact the super administrator for further review.</p>
          </div>

          <div class="footer">
            <p>This email was sent from InvestPro Investment Management Platform</p>
            <p>Please do not reply to this email. For support, contact your super administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Admin Account Application Update - InvestPro

      Hello ${firstName},

      We regret to inform you that your admin account application has not been approved at this time.

      ${reason ? `Reason: ${reason}` : ''}

      What This Means:
      - Your account registration has been reviewed
      - Admin privileges have not been granted
      - Your account access has been restricted

      Next Steps:
      - Review the reason provided (if any)
      - Contact the super administrator if you have questions
      - You may reapply in the future if circumstances change

      If you believe this decision was made in error, please contact the super administrator.

      Best regards,
      InvestPro Team
    `
  };
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

// Send admin approval email
export const sendAdminApprovalEmail = async (email, firstName) => {
  try {
    console.log(`[EmailService] Starting admin approval email send to: ${email}`);

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service not configured - missing SMTP credentials');
    }

    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const emailTemplate = getAdminApprovalEmailTemplate(firstName);

    const mailOptions = {
      from: `"InvestPro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    console.log(`[EmailService] Sending admin approval email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin approval email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send admin approval email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// Send admin rejection email
export const sendAdminRejectionEmail = async (email, firstName, reason = null) => {
  try {
    console.log(`[EmailService] Starting admin rejection email send to: ${email}`);

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service not configured - missing SMTP credentials');
    }

    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const emailTemplate = getAdminRejectionEmailTemplate(firstName, reason);

    const mailOptions = {
      from: `"InvestPro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    console.log(`[EmailService] Sending admin rejection email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin rejection email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send admin rejection email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
