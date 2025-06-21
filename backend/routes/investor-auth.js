/**
 * Public Investor Authentication Routes
 * Password setup, forgot password, and reset password endpoints
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, Role } from '../models/index.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import ActivityLogService from '../services/ActivityLogService.js';

const router = express.Router();

// Rate limiting for password-related endpoints (more restrictive)
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password attempts per hour
  message: {
    success: false,
    message: 'Too many password attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// First-time login password setup (Public endpoint)
router.post('/setup-password', passwordLimiter, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validation
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, current password, and new password are required'
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      });
    }

    console.log(`[Password Setup] Attempt for: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user is an investor with first login status
    const role = await Role.findOne({ userId: user._id, type: 'investor' });
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not an investor account'
      });
    }

    if (!user.isFirstLogin) {
      return res.status(400).json({
        success: false,
        message: 'Password has already been set up'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password and account status
    user.password = newPassword; // Will be hashed by pre-save middleware
    user.isFirstLogin = false;
    user.accountStatus = 'active';
    user.lastLogin = new Date();

    await user.save();

    console.log(`[Password Setup] Completed for: ${email}`);

    // Create audit log
    try {
      await ActivityLogService.log({
        userId: user._id.toString(),
        action: 'password_setup_completed',
        entityType: 'user',
        entityId: user._id.toString(),
        description: `Investor completed first-time password setup`,
        metadata: {
          email: user.email,
          accountActivated: true
        }
      });
    } catch (logError) {
      console.error('Failed to create audit log:', logError);
    }

    res.json({
      success: true,
      message: 'Password setup completed successfully. You can now use your new password to log in.'
    });

  } catch (error) {
    console.error('Password setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup password'
    });
  }
});

// Forgot password - Request reset (Public endpoint)
router.post('/forgot-password', passwordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log(`[Password Reset Request] For: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Verify user is an investor
    const role = await Role.findOne({ userId: user._id, type: 'investor' });
    if (!role) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.firstName, resetToken);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue with success response even if email fails
    }

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// Reset password with token (Public endpoint)
router.post('/reset-password', passwordLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      });
    }

    console.log(`[Password Reset] Attempt with token: ${token.substring(0, 8)}...`);

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Verify user is an investor
    const role = await Role.findOne({ userId: user._id, type: 'investor' });
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update password and clear reset token
    user.password = newPassword; // Will be hashed by pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.accountStatus = 'active';
    user.lastLogin = new Date();

    await user.save();

    console.log(`[Password Reset] Completed for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

export default router;
