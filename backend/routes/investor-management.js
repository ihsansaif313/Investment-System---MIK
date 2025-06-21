/**
 * Investor Management Routes
 * Admin-controlled investor account creation and management
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, Role, CompanyAssignment } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail, testEmailConfiguration, checkEmailHealth } from '../utils/emailService.js';
import ActivityLogService from '../services/ActivityLogService.js';

const router = express.Router();

// Rate limiting for investor management endpoints
const investorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many investor management requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

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

// Enhanced validation middleware for investor creation
const validateInvestorCreation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email address is too long'),

  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('cnic')
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/)
    .withMessage('CNIC must be in format: 12345-1234567-1'),

  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),

  body('dateOfBirth')
    .isISO8601()
    .withMessage('Valid date of birth is required')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        throw new Error('Age must be between 18 and 100 years');
      }
      return true;
    }),

  body('initialInvestmentAmount')
    .optional()
    .isNumeric()
    .withMessage('Initial investment amount must be a number')
    .custom((value) => {
      if (value && (value < 1000 || value > 10000000)) {
        throw new Error('Initial investment amount must be between $1,000 and $10,000,000');
      }
      return true;
    }),

  body('investmentPreferences.riskTolerance')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Risk tolerance must be low, medium, or high'),

  body('investmentPreferences.preferredSectors')
    .optional()
    .isArray()
    .withMessage('Preferred sectors must be an array'),

  body('investmentPreferences.investmentGoals')
    .optional()
    .isArray()
    .withMessage('Investment goals must be an array'),

  body('investmentPreferences.timeHorizon')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Time horizon must be short, medium, or long'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Generate secure temporary password
const generateTemporaryPassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
  let password = '';
  
  // Ensure at least one character from each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '@#$%&*'[Math.floor(Math.random() * 6)]; // Special character
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Create investor account (Admin only)
router.post('/', investorLimiter, authenticate, authorize('admin', 'superadmin'), validateInvestorCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Enhanced error logging for debugging
      console.log('[VALIDATION ERROR] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[VALIDATION ERROR] Validation errors:', JSON.stringify(errors.array(), null, 2));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        receivedData: req.body // Include received data for debugging
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      cnic,
      address,
      dateOfBirth,
      investmentPreferences,
      initialInvestmentAmount,
      notes
    } = req.body;

    console.log(`[Investor Creation] Admin ${req.user.email} creating investor: ${email}`);

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Check if CNIC already exists
    const existingCnic = await User.findOne({ cnic });
    if (existingCnic) {
      return res.status(409).json({
        success: false,
        message: 'CNIC already registered'
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    console.log(`[Investor Creation] Generated temporary password for: ${email}`);

    // Create new investor user
    const newUser = new User({
      email,
      password: temporaryPassword, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      phone,
      cnic,
      address,
      dateOfBirth: new Date(dateOfBirth),
      investmentPreferences: investmentPreferences || {
        riskTolerance: 'medium',
        preferredSectors: [],
        investmentGoals: [],
        timeHorizon: 'medium'
      },
      initialInvestmentAmount: initialInvestmentAmount || null,
      accountStatus: 'pending_setup',
      isFirstLogin: true,
      createdBy: req.user.id,
      emailVerified: true // Admin-created accounts are pre-verified
    });

    await newUser.save();

    // Create investor role
    const newRole = new Role({
      userId: newUser._id,
      type: 'investor',
      status: 'active'
    });
    await newRole.save();

    // Send welcome email with temporary password
    let emailSent = false;
    try {
      console.log(`[Email] Attempting to send welcome email to: ${newUser.email}`);
      await sendWelcomeEmail(newUser.email, newUser.firstName, temporaryPassword);
      console.log(`[Email] Welcome email sent successfully to: ${newUser.email}`);
      emailSent = true;
    } catch (emailError) {
      console.error('[Email] Failed to send welcome email:', emailError.message);
      console.error('[Email] Full error:', emailError);
      // Continue with creation even if email fails
      emailSent = false;
    }

    // Log the creation activity
    console.log(`[Investor Created] ID: ${newUser._id} | Email: ${newUser.email} | Created by: ${req.user.email}`);

    // Create audit log
    try {
      await ActivityLogService.log({
        userId: req.user.id,
        action: 'investor_created',
        entityType: 'user',
        entityId: newUser._id.toString(),
        description: `Created investor account for ${newUser.firstName} ${newUser.lastName} (${newUser.email})`,
        metadata: {
          investorId: newUser._id.toString(),
          investorEmail: newUser.email,
          createdBy: req.user.email,
          companyId: req.body.companyId
        }
      });
    } catch (logError) {
      console.error('Failed to create audit log:', logError);
      // Continue with response even if logging fails
    }

    const responseMessage = emailSent
      ? 'Investor account created successfully. Welcome email sent with login instructions.'
      : 'Investor account created successfully. Note: Welcome email could not be sent - please provide login credentials manually.';

    res.status(201).json({
      success: true,
      message: responseMessage,
      emailSent: emailSent,
      temporaryPassword: process.env.NODE_ENV === 'development' ? temporaryPassword : (emailSent ? undefined : temporaryPassword), // Include password in development or if email failed
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          cnic: newUser.cnic,
          address: newUser.address,
          dateOfBirth: newUser.dateOfBirth,
          accountStatus: newUser.accountStatus,
          isFirstLogin: newUser.isFirstLogin,
          created_at: newUser.createdAt,
          role: {
            id: newRole._id,
            type: newRole.type,
            status: newRole.status
          }
        }
      }
    });

  } catch (error) {
    console.error('[InvestorCreation] Critical error:', error);
    console.error('[InvestorCreation] Stack trace:', error.stack);

    // Ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create investor account',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// Debug endpoint (Development only) - Must be before parameterized routes
if (process.env.NODE_ENV === 'development') {
  router.get('/debug-user', authenticate, async (req, res) => {
    res.json({
      success: true,
      user: req.user,
      userRole: req.user.role,
      roleType: req.user.role?.type,
      roleId: req.user.role?.id
    });
  });

  // Debug validation endpoint
  router.post('/debug-validation', authenticate, authorize('admin', 'superadmin'), validateInvestorCreation, async (req, res) => {
    try {
      const errors = validationResult(req);

      console.log('[DEBUG VALIDATION] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[DEBUG VALIDATION] Validation errors:', JSON.stringify(errors.array(), null, 2));

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          receivedData: req.body,
          debug: true
        });
      }

      // If validation passes, return success without creating
      res.json({
        success: true,
        message: 'Validation passed - data is valid',
        receivedData: req.body,
        debug: true
      });

    } catch (error) {
      console.error('[DEBUG VALIDATION] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Debug validation failed',
        error: error.message,
        debug: true
      });
    }
  });
}

// Get all investors for a company (Admin only)
router.get('/company/:companyId', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { companyId } = req.params;

    // Verify admin has access to this company
    const assignment = await CompanyAssignment.findOne({
      userId: req.user.id,
      subCompanyId: companyId,
      status: 'active'
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this company'
      });
    }

    // Get all investor roles
    const investorRoles = await Role.find({ type: 'investor' }).populate('userId');
    
    const investors = investorRoles
      .filter(role => role.userId) // Ensure user exists
      .map(role => ({
        id: role.userId._id,
        email: role.userId.email,
        firstName: role.userId.firstName,
        lastName: role.userId.lastName,
        phone: role.userId.phone,
        cnic: role.userId.cnic,
        address: role.userId.address,
        dateOfBirth: role.userId.dateOfBirth,
        accountStatus: role.userId.accountStatus,
        isFirstLogin: role.userId.isFirstLogin,
        investmentPreferences: role.userId.investmentPreferences,
        initialInvestmentAmount: role.userId.initialInvestmentAmount,
        createdBy: role.userId.createdBy,
        created_at: role.userId.createdAt,
        role: {
          id: role._id,
          type: role.type,
          status: role.status
        }
      }));

    res.json({
      success: true,
      data: investors
    });

  } catch (error) {
    console.error('Get investors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investors'
    });
  }
});

// Get investor by ID (Admin only)
router.get('/:id', authenticate, authorize('admin', 'superadmin'), param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investor ID'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Investor not found'
      });
    }

    const role = await Role.findOne({ userId: user._id, type: 'investor' });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Investor role not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        cnic: user.cnic,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        accountStatus: user.accountStatus,
        isFirstLogin: user.isFirstLogin,
        investmentPreferences: user.investmentPreferences,
        initialInvestmentAmount: user.initialInvestmentAmount,
        createdBy: user.createdBy,
        created_at: user.createdAt,
        role: {
          id: role._id,
          type: role.type,
          status: role.status
        }
      }
    });

  } catch (error) {
    console.error('Get investor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investor'
    });
  }
});

// Note: Password-related endpoints (setup-password, forgot-password, reset-password)
// have been moved to /investor-auth routes as public endpoints

// Test email configuration (Development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/test-email', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
      console.log('[EmailTest] Starting email configuration test...');

      // Import diagnostics
      const { runEmailDiagnostics } = await import('../utils/emailDiagnostics.js');

      // Run comprehensive diagnostics
      const diagnosticsResult = await runEmailDiagnostics(req.query.email);

      res.json({
        success: diagnosticsResult.tests.configuration.isValid &&
                diagnosticsResult.tests.connection?.success,
        message: 'Email diagnostics completed',
        diagnostics: diagnosticsResult
      });
    } catch (error) {
      console.error('[EmailTest] Email test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Email configuration test failed',
        error: error.message
      });
    }
  });

  // Send test welcome email (Development only)
  router.post('/test-welcome-email', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
      }

      console.log(`[EmailTest] Sending test welcome email to: ${email}`);

      const { testWelcomeEmail } = await import('../utils/emailDiagnostics.js');
      const result = await testWelcomeEmail(email);

      res.json(result);
    } catch (error) {
      console.error('[EmailTest] Test welcome email failed:', error);
      res.status(500).json({
        success: false,
        message: 'Test welcome email failed',
        error: error.message
      });
    }
  });

  // Email health check endpoint (Development only)
  router.get('/email-health', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
      console.log('[EmailHealth] Checking email service health...');

      const healthResult = await checkEmailHealth();

      res.json({
        success: healthResult.healthy,
        message: healthResult.message,
        timestamp: healthResult.timestamp,
        config: healthResult.config,
        error: healthResult.error
      });
    } catch (error) {
      console.error('[EmailHealth] Health check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Email health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}

export default router;
