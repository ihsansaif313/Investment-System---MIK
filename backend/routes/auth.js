import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { config } from '../config/environment.js';
import { sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();

// Generate JWT token using environment configuration
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

// Login endpoint using real database
router.post('/login', [
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

    // Generate JWT token
    const token = generateToken(user._id);

    // Add login history
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent') || 'Unknown';
    await user.addLoginHistory(ipAddress, userAgent, true);

    console.log('[DEBUG] User object before login response:', JSON.stringify(user));
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || { id: 'investor', type: 'investor', permissions: [] }
        },
        token,
        refreshToken: '', // Add real refresh token if implemented
        expiresIn: 3600   // Or your actual expiry time in seconds
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

// Register endpoint using real database
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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

    console.log(`[Registration Attempt] Email: ${email} | Timestamp: ${new Date().toISOString()}`);

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

    // Create new user instance
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: {
        id: roleType,
        type: roleType,
        permissions: [],
        status: 'active',
        createdAt: new Date()
      }
    });

    // Generate email verification token
    const token = await newUser.generateEmailVerificationToken();

    // Save user with token
    await newUser.save();

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
          role: newUser.role
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

export default router;
