import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Session from '../models/Session.js';
import { config } from '../config/environment.js';
import { sendVerificationEmail } from '../services/emailService.js';
import ActivityLogService from '../services/ActivityLogService.js';

const router = express.Router();

// Rate limiting for authentication endpoints (development-friendly settings)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes (1 hour)
  max: 50, // Limit each IP to 50 requests per windowMs (generous for development)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT tokens using environment configuration
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId, type: 'access' }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Login endpoint using real database
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    console.log(`[Login Attempt] Email: ${email} | Timestamp: ${new Date().toISOString()}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('=== [DEBUG] About to call sendVerificationEmail for', user.email);
      // Generate a new verification token if missing or expired
      if (!user.emailVerificationToken || !user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
        const newToken = await user.generateEmailVerificationToken();
        await user.save();
        await sendVerificationEmail(user.email, user.firstName, newToken);
      } else {
        await sendVerificationEmail(user.email, user.firstName, user.emailVerificationToken);
      }
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new verification email has been sent. Please check your inbox.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Create session for the tokens
    const expiresInSeconds = parseInt(config.JWT_EXPIRES_IN, 10);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const session = new Session({
      token: accessToken,
      refreshToken,
      userId: user._id,
      isActive: true,
      expiresAt
    });
    await session.save();

    // Add login history
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent') || 'Unknown';
    await user.addLoginHistory(ipAddress, userAgent, true);

    // Get user role from separate Role document (primary method)
    // Include pending status for admin approval workflow
    let userRole = await Role.findOne({
      userId: user._id,
      status: { $in: ['active', 'pending'] }
    });

    // If no separate role document, check for embedded role in user (legacy support)
    if (!userRole && user.role) {
      userRole = {
        type: user.role.type || user.role.id,
        permissions: user.role.permissions || [],
        status: 'active' // Embedded roles are considered active
      };
      console.log('[DEBUG] Using embedded role for legacy user:', user.email, 'Role:', userRole.type);
    }

    // Default to investor if no role found (should not happen for properly registered users)
    if (!userRole) {
      userRole = { type: 'investor', permissions: [], status: 'active' };
      console.log('[DEBUG] No role found, defaulting to investor for user:', user.email);
    }

    console.log('[DEBUG] User object before login response:', JSON.stringify(user));
    console.log('[DEBUG] Final user role for login response:', JSON.stringify(userRole));

    // Log user login activity
    try {
      await ActivityLogService.logUserLogin(user._id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        loginTime: new Date()
      });
    } catch (logError) {
      console.error('Failed to log user login activity:', logError);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: {
            id: userRole.type,
            type: userRole.type,
            permissions: userRole.permissions || [],
            status: userRole.status || 'active'
          }
        },
        token: accessToken,
        refreshToken,
        expiresIn: config.JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find session with this refresh token
    const session = await Session.findOne({
      refreshToken,
      userId: decoded.userId,
      isActive: true
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get user and role
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = await Role.findOne({ userId: user._id });
    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'User role not found'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update session with new tokens
    session.token = accessToken;
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + parseInt(config.JWT_EXPIRES_IN, 10) * 1000);
    session.lastActivity = new Date();
    await session.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: {
            id: userRole.type,
            type: userRole.type,
            permissions: userRole.permissions || [],
            status: userRole.status || 'active'
          }
        },
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint using real database
router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role').isIn(['superadmin', 'admin', 'investor']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role: roleType } = req.body;

    console.log(`[Registration Attempt] Email: ${email} | Role: ${roleType} | Timestamp: ${new Date().toISOString()}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Resend verification email
        let token = existingUser.emailVerificationToken;
        if (!token || !existingUser.emailVerificationExpires || existingUser.emailVerificationExpires < Date.now()) {
          token = await existingUser.generateEmailVerificationToken();
          await existingUser.save();
        }
        await sendVerificationEmail(existingUser.email, existingUser.firstName, token);
        return res.status(409).json({
          success: false,
          message: 'Email already registered but not verified. A new verification email has been sent. Please check your inbox.'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create new user instance (without role in user document)
    const newUser = new User({
      email,
      password,
      firstName,
      lastName
    });

    // Generate email verification token
    const token = await newUser.generateEmailVerificationToken();

    // Save user with token
    await newUser.save();

    // Create separate Role document
    const newRole = new Role({
      userId: newUser._id,
      type: roleType
    });
    await newRole.save();

    // Send verification email
    try {
      await sendVerificationEmail(newUser.email, newUser.firstName, token);
      console.log(`Verification email sent to: ${newUser.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
      // In production, you might want to handle this differently
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          created_at: newUser.createdAt,
          updated_at: newUser.updatedAt,
          role: {
            id: newRole.type,
            type: newRole.type,
            permissions: newRole.permissions
          }
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    console.log('=== [DEBUG] /verify-email called with token:', token);
    if (!token) {
      console.log('=== [DEBUG] No token provided');
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    // Find user by token and check expiration
    let user = await User.findOne({
      emailVerificationToken: token
    });
    console.log('=== [DEBUG] User found:', user ? user.email : null);
    if (!user) {
      // Try to find a user who is already verified with this token (for better UX)
      user = await User.findOne({ emailVerificationToken: token });
      if (user && user.emailVerified) {
        console.log('=== [DEBUG] User already verified:', user.email);
        return res.status(200).json({
          success: true,
          message: 'Email is already verified. You can log in.'
        });
      }
      console.log('=== [DEBUG] Invalid or expired verification token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    // Check if token is expired
    if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
      console.log('=== [DEBUG] Verification token expired for:', user.email);
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please log in to receive a new verification email.'
      });
    }
    // Verify email and clear token fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    console.log('=== [DEBUG] Email verified and user saved:', user.email);
    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (token) {
      // Deactivate the session
      await Session.findOneAndUpdate(
        { token },
        { isActive: false },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Production Note: Debug and migration endpoints removed for security

export default router;
