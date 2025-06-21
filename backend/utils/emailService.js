/**
 * Email Service for Investor Management
 * Handles welcome emails, password resets, and other investor communications
 */

import nodemailer from 'nodemailer';

// Get email configuration dynamically
const getEmailConfig = () => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
};

// Create transporter with enhanced configuration
const createTransporter = () => {
  try {
    console.log('[EmailService] Creating email transporter...');

    const emailConfig = getEmailConfig();
    console.log('[EmailService] SMTP Config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user ? 'configured' : 'missing',
      pass: emailConfig.auth.pass ? 'configured' : 'missing'
    });

    // Validate required credentials
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.error('[EmailService] Missing SMTP credentials');
      return null;
    }

    const transporter = nodemailer.createTransport({
      ...emailConfig,
      debug: process.env.NODE_ENV === 'development', // Enable debug in development
      logger: process.env.NODE_ENV === 'development' // Enable logging in development
    });

    console.log('[EmailService] Transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('[EmailService] Failed to create email transporter:', error);
    return null;
  }
};

// Welcome email template
const getWelcomeEmailTemplate = (firstName, temporaryPassword) => {
  return {
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
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to InvestPro</h1>
            <p>Your investor account has been created</p>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName},</h2>
            
            <p>Your investor account has been successfully created by your company administrator. You can now access the InvestPro platform to manage your investments and track your portfolio.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> Your registered email address</p>
              <p><strong>Temporary Password:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
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
            
            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance, please contact your company administrator or our support team.</p>
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
      Welcome to InvestPro, ${firstName}!
      
      Your investor account has been successfully created by your company administrator.
      
      Login Credentials:
      Email: Your registered email address
      Temporary Password: ${temporaryPassword}
      
      IMPORTANT: This is a temporary password that must be changed on your first login.
      
      Next Steps:
      1. Visit ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login
      2. Enter your email and the temporary password
      3. Create a new secure password when prompted
      4. Complete your profile setup
      5. Start exploring your investment opportunities
      
      If you need help, please contact your company administrator.
      
      Best regards,
      InvestPro Team
    `
  };
};

// Password reset email template
const getPasswordResetEmailTemplate = (firstName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'InvestPro - Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - InvestPro</title>
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
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName},</h2>
            
            <p>We received a request to reset your password for your InvestPro account. If you made this request, click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Your Password</a>
            
            <div class="warning">
              <h4>⚠️ Security Information:</h4>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
            
            <p>If you didn't request a password reset, please contact your administrator immediately.</p>
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
      Password Reset Request - InvestPro
      
      Hello ${firstName},
      
      We received a request to reset your password for your InvestPro account.
      
      To reset your password, visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this reset, please ignore this email.
      
      If you need help, please contact your administrator.
      
      Best regards,
      InvestPro Team
    `
  };
};

// Send welcome email
export const sendWelcomeEmail = async (email, firstName, temporaryPassword) => {
  try {
    console.log(`[EmailService] Starting welcome email send to: ${email}`);

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service not configured - missing SMTP credentials');
    }

    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    console.log(`[EmailService] Transporter created, generating email template`);
    const emailTemplate = getWelcomeEmailTemplate(firstName, temporaryPassword);

    const mailOptions = {
      from: `"InvestPro" <${process.env.SMTP_USER || 'noreply@investpro.com'}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    console.log(`[EmailService] Sending email to: ${email}`);
    const result = await sendEmailWithRetry(mailOptions);
    console.log(`[EmailService] Welcome email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send welcome email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const emailTemplate = getPasswordResetEmailTemplate(firstName, resetToken);
    
    const mailOptions = {
      from: `"InvestPro" <${process.env.SMTP_USER || 'noreply@investpro.com'}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`Failed to send password reset email to ${email}:`, error);
    throw error;
  }
};

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

// Send verification email
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
    const result = await sendEmailWithRetry(mailOptions);
    console.log(`[EmailService] Verification email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send verification email to ${email}:`, error.message);
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
    const result = await sendEmailWithRetry(mailOptions);
    console.log(`[EmailService] Admin approval email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send admin approval email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
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
    const result = await sendEmailWithRetry(mailOptions);
    console.log(`[EmailService] Admin rejection email sent successfully to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Failed to send admin rejection email to ${email}:`, error.message);
    console.error(`[EmailService] Error details:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// Production-ready email queue and retry mechanism
const emailQueue = [];
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Email delivery with retry mechanism
const sendEmailWithRetry = async (mailOptions, retryCount = 0) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully on attempt ${retryCount + 1}:`, result.messageId);
    return result;

  } catch (error) {
    console.error(`[EmailService] Email send attempt ${retryCount + 1} failed:`, error.message);

    if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
      console.log(`[EmailService] Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendEmailWithRetry(mailOptions, retryCount + 1);
    } else {
      console.error(`[EmailService] All ${MAX_RETRY_ATTEMPTS} attempts failed for email to:`, mailOptions.to);
      throw error;
    }
  }
};

// Email health check
export const checkEmailHealth = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return {
        healthy: false,
        message: 'Email transporter not available',
        timestamp: new Date().toISOString()
      };
    }

    await transporter.verify();
    return {
      healthy: true,
      message: 'Email service is operational',
      timestamp: new Date().toISOString(),
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        user: process.env.SMTP_USER ? 'configured' : 'missing'
      }
    };

  } catch (error) {
    console.error('[EmailService] Health check failed:', error);
    return {
      healthy: false,
      message: error.message,
      timestamp: new Date().toISOString(),
      error: error.code || 'UNKNOWN_ERROR'
    };
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, message: 'Email transporter not available' };
    }

    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };

  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { success: false, message: error.message };
  }
};
