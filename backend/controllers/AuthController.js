/**
 * Authentication Controller
 * Handles user authentication and authorization
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserService from '../services/UserService.js';
import { Session } from '../models/index.js';
import { asyncHandler, successResponse, errorResponse, AuthenticationError } from '../utils/errors.js';
import { validationResult } from 'express-validator';
import { config } from '../config/environment.js';
import { logActivity, securityLogger } from '../utils/logger.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

class AuthController {
  /**
   * Generate JWT tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  /**
   * User login
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    try {
      // Authenticate user
      const user = await UserService.authenticateUser(email, password);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user.id);

      // Create session
      const session = new Session({
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        deviceInfo: {
          userAgent,
          ipAddress,
          deviceType: this.getDeviceType(userAgent),
          browser: this.getBrowser(userAgent),
          os: this.getOS(userAgent)
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });

      await session.save();

      // Log successful login
      await logActivity({
        userId: user.id,
        action: 'USER_LOGIN_SUCCESS',
        entity: 'user',
        entityId: user.id,
        details: { email: user.email },
        ipAddress,
        userAgent
      });

      successResponse(res, {
        user,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      }, 'Login successful');

    } catch (error) {
      // Log failed login attempt
      securityLogger.logFailedLogin(email, ipAddress, userAgent);

      if (error instanceof AuthenticationError) {
        return errorResponse(res, error.message, error.statusCode);
      }
      
      throw error;
    }
  });

  /**
   * User registration
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const user = await UserService.createUser(req.body);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Update user with verification token
    await UserService.updateUser(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.firstName, verificationToken);
      console.log(`Verification email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Continue with registration even if email fails
    }

    successResponse(res, {
      user,
      message: 'Registration successful. Please check your email to verify your account.'
    }, 'User registered successfully', 201);
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
      }

      // Find session
      const session = await Session.findOne({
        refreshToken,
        userId: decoded.userId,
        isActive: true
      });

      if (!session) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Get user
      const user = await UserService.getUserById(decoded.userId);

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user.id);

      // Update session
      session.token = accessToken;
      session.refreshToken = newRefreshToken;
      session.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      session.lastActivity = new Date();
      await session.save();

      successResponse(res, {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      }, 'Token refreshed successfully');

    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Invalid or expired refresh token');
      }
      throw error;
    }
  });

  /**
   * User logout
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Deactivate session
      await Session.updateOne(
        { refreshToken },
        { isActive: false }
      );
    }

    // Log logout
    if (req.user) {
      await logActivity({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        entity: 'user',
        entityId: req.user.id,
        details: { email: req.user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    successResponse(res, null, 'Logout successful');
  });

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { email } = req.body;

    try {
      const user = await UserService.getUserByEmail(email);

      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with reset token
      await UserService.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, user.firstName, resetToken);
        console.log(`Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError.message);
        // Continue with process even if email fails
      }

      // Log password reset request
      await logActivity({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'user',
        entityId: user.id,
        details: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

    } catch (error) {
      // Don't reveal if email exists
      console.log('Password reset error:', error.message);
    }

    // Always return success to prevent email enumeration
    successResponse(res, null, 'If an account with this email exists, a password reset email has been sent.');
  });

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const users = await UserService.getUsers({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (users.users.length === 0) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    const user = users.users[0];

    // Update password and clear reset token
    await UserService.updateUser(user.id, {
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    // Deactivate all sessions for this user
    await Session.updateMany(
      { userId: user.id },
      { isActive: false }
    );

    // Log password reset
    await logActivity({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'user',
      entityId: user.id,
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    successResponse(res, null, 'Password reset successful');
  });

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  verifyEmail = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { token } = req.body;

    // Find user with valid verification token
    const users = await UserService.getUsers({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (users.users.length === 0) {
      return errorResponse(res, 'Invalid or expired verification token', 400);
    }

    const user = users.users[0];

    // Verify email and clear verification token
    await UserService.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    // Log email verification
    await logActivity({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      entity: 'user',
      entityId: user.id,
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    successResponse(res, null, 'Email verified successfully');
  });

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  resendVerification = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { email } = req.body;

    try {
      const user = await UserService.getUserByEmail(email);

      if (user.emailVerified) {
        return errorResponse(res, 'Email is already verified', 400);
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with new verification token
      await UserService.updateUser(user.id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.firstName, verificationToken);
        console.log(`Verification email resent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to resend verification email:', emailError.message);
        // Continue with process even if email fails
      }

    } catch (error) {
      // Don't reveal if email exists
      console.log('Resend verification error:', error.message);
    }

    // Always return success to prevent email enumeration
    successResponse(res, null, 'If an account with this email exists, a verification email has been sent.');
  });

  /**
   * Helper methods for device detection
   */
  getDeviceType(userAgent) {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  getBrowser(userAgent) {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  getOS(userAgent) {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }
}

export default new AuthController();
