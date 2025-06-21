import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Session from '../models/Session.js';
import { config } from '../config/environment.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import ActivityLogService from '../services/ActivityLogService.js';

const router = express.Router();

// Enhanced rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes (1 hour)
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // Stricter in production
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 60 * 60 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain endpoints
  skip: (req) => {
    const skipPaths = ['/verify-email'];
    return skipPaths.some(path => req.path.includes(path));
  }
});

// Stricter rate limiting for password-related endpoints
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 3 : 20, // Very strict in production
  message: {
    success: false,
    message: 'Too many password attempts, please try again later.',
    code: 'PASSWORD_RATE_LIMIT_EXCEEDED',
    retryAfter: 60 * 60 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Generate JWT tokens using environment configuration
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId, type: 'access' }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Enhanced login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email address is too long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password is too long')
];

// Login endpoint using real database with enhanced security
router.post('/login', authLimiter, loginValidation, async (req, res) => {
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
    console.log(`[Login] Attempting password verification for ${user.email}`);
    console.log(`[Login] User isFirstLogin: ${user.isFirstLogin}`);
    const isMatch = await user.comparePassword(password);
    console.log(`[Login] Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log(`[Login] Password verification failed for ${user.email}`);
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Debug logging for first-time login check
    console.log(`[DEBUG] User ${user.email} - isFirstLogin: ${user.isFirstLogin}, accountStatus: ${user.accountStatus}`);

    // BYPASS: Skip first-time login password setup for investors
    // Allow investors to login directly with temporary password
    if (user.isFirstLogin) {
      console.log(`[First-Time Login] User ${user.email} - BYPASSING password setup for direct login`);

      // Mark user as no longer first-time login to prevent future redirects
      user.isFirstLogin = false;
      await user.save();

      console.log(`[First-Time Login] User ${user.email} - isFirstLogin set to false, proceeding with normal login`);
    }

    // Generate JWT tokens for regular login
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

    // Get company assignments for admin users
    let companyAssignments = [];
    if (userRole.type === 'admin') {
      try {
        const { CompanyAssignment } = await import('../models/index.js');
        companyAssignments = await CompanyAssignment.find({
          userId: user._id,
          status: 'active'
        }).populate('subCompanyId', 'name industry description logo');

        console.log(`[DEBUG] Found ${companyAssignments.length} company assignments for admin user ${user.email}`);
      } catch (assignmentError) {
        console.error('Failed to fetch company assignments:', assignmentError);
      }
    }

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

    // Prepare user response with company assignments for admins
    const userResponse = {
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
    };

    // Add company assignments for admin users
    if (userRole.type === 'admin' && companyAssignments.length > 0) {
      userResponse.companyAssignments = companyAssignments.map(assignment => ({
        id: assignment._id,
        companyId: assignment.subCompanyId._id,
        companyName: assignment.subCompanyId.name,
        companyIndustry: assignment.subCompanyId.industry,
        companyDescription: assignment.subCompanyId.description,
        companyLogo: assignment.subCompanyId.logo,
        permissions: assignment.permissions,
        assignedDate: assignment.assignedDate,
        status: assignment.status
      }));
    }

    res.json({
      success: true,
      data: {
        user: userResponse,
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

// Enhanced registration validation with security measures
const registrationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email address is too long')
    .escape(), // Prevent XSS

  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .escape(), // Prevent XSS

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .escape(), // Prevent XSS

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('role')
    .isIn(['superadmin', 'admin'])
    .withMessage('Invalid role - investor registration disabled')
];

// Register endpoint using real database with enhanced security
router.post('/register', authLimiter, registrationValidation, async (req, res) => {
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

    // Explicitly prevent investor self-registration
    if (roleType === 'investor') {
      console.log(`[Registration Blocked] Investor self-registration attempt blocked for: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Investor accounts cannot be self-registered. Please contact your company admin to create an investor account.'
      });
    }

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

// First-time password setup endpoint
router.post('/setup-password', passwordLimiter, [
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    console.log(`[Password Setup] Endpoint called - Request received`);
    console.log(`[Password Setup] Request body:`, {
      newPassword: req.body.newPassword ? '[PROVIDED]' : '[MISSING]',
      confirmPassword: req.body.confirmPassword ? '[PROVIDED]' : '[MISSING]'
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[Password Setup] Validation failed:`, errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { newPassword } = req.body;
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    console.log(`[Password Setup] Token extraction - Header present: ${!!authHeader}, Token extracted: ${!!token}`);

    if (!token) {
      console.log(`[Password Setup] No authorization token provided`);
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    // Verify token and get user
    console.log(`[Password Setup] Verifying JWT token...`);
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
      console.log(`[Password Setup] Token verified successfully - User ID: ${decoded.userId}`);
    } catch (jwtError) {
      console.log(`[Password Setup] JWT verification failed:`, jwtError.message);
      throw jwtError;
    }

    const user = await User.findById(decoded.userId);
    console.log(`[Password Setup] User lookup - Found: ${!!user}, Email: ${user?.email}`);

    if (!user) {
      console.log(`[Password Setup] User not found for ID: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is in first-login state
    if (!user.isFirstLogin) {
      return res.status(400).json({
        success: false,
        message: 'Password setup not required for this account'
      });
    }

    // Verify this is a temporary session
    const session = await Session.findOne({
      token,
      userId: user._id,
      isActive: true,
      isTemporary: true
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired password setup session'
      });
    }

    console.log(`[Password Setup] User ${user.email} setting permanent password`);
    console.log(`[Password Setup] Before update - isFirstLogin: ${user.isFirstLogin}`);

    // Update user password and clear first-login flag
    user.password = newPassword; // Will be hashed by pre-save middleware
    user.isFirstLogin = false;
    user.accountStatus = 'active';
    user.emailVerified = true; // Ensure email is verified

    // Explicitly mark all fields as modified to ensure MongoDB saves them
    user.markModified('password');
    user.markModified('isFirstLogin');
    user.markModified('accountStatus');
    user.markModified('emailVerified');

    try {
      await user.save();
      console.log(`[Password Setup] User.save() completed successfully`);
    } catch (saveError) {
      console.error(`[Password Setup] Error saving user:`, saveError);
      throw saveError;
    }

    // Force refresh user from database to ensure changes are persisted
    const updatedUser = await User.findById(user._id);
    console.log(`[Password Setup] After update - isFirstLogin: ${updatedUser.isFirstLogin}`);
    console.log(`[Password Setup] After update - accountStatus: ${updatedUser.accountStatus}`);

    // Verify the new password was saved correctly
    const passwordVerification = await updatedUser.comparePassword(newPassword);
    console.log(`[Password Setup] New password verification: ${passwordVerification}`);

    if (!passwordVerification) {
      console.error(`[Password Setup] ERROR: Password verification failed after save!`);
      throw new Error('Password was not saved correctly');
    }

    if (updatedUser.isFirstLogin !== false) {
      console.error(`[Password Setup] ERROR: isFirstLogin flag was not cleared! Current value: ${updatedUser.isFirstLogin}`);
      throw new Error('isFirstLogin flag was not updated correctly');
    }

    console.log(`[Password Setup] All validations passed - password updated successfully for ${user.email}`);

    // Deactivate ALL existing sessions for this user to ensure clean state
    await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );
    console.log(`[Password Setup] Deactivated all existing sessions for ${user.email}`);

    // Generate new regular session tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Create new regular session
    const expiresInSeconds = parseInt(config.JWT_EXPIRES_IN, 10);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const newSession = new Session({
      token: accessToken,
      refreshToken,
      userId: user._id,
      isActive: true,
      expiresAt
    });
    await newSession.save();

    // Get user role
    const userRole = await Role.findOne({ userId: user._id });

    // Log password setup activity
    try {
      await ActivityLogService.log({
        userId: user._id,
        action: 'password_setup_completed',
        entityType: 'user',
        entityId: user._id.toString(),
        description: `User ${user.firstName} ${user.lastName} completed first-time password setup`,
        metadata: {
          email: user.email,
          setupTime: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Failed to log password setup activity:', logError);
    }

    res.json({
      success: true,
      message: 'Password set successfully. You are now logged in.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: {
            id: userRole?.type || 'investor',
            type: userRole?.type || 'investor',
            permissions: userRole?.permissions || [],
            status: userRole?.status || 'active'
          }
        },
        token: accessToken,
        refreshToken,
        expiresIn: config.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    console.error('Password setup error:', error);
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
