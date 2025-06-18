/**
 * Data Validation & Sanitization Middleware
 * Comprehensive input validation and data sanitization
 */

import { body, param, query, validationResult } from 'express-validator';
import { createValidationError } from '../utils/errors.js';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationError = createValidationError(errors.array());
    return res.status(400).json({
      success: false,
      error: {
        message: validationError.message,
        errors: validationError.errors
      }
    });
  }
  next();
};

/**
 * Sanitize HTML content
 */
export const sanitizeHTML = (value) => {
  if (typeof value !== 'string') return value;
  return DOMPurify.sanitize(value, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
};

/**
 * Sanitize and validate user input
 */
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string values in req.body
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return sanitizeHTML(validator.escape(obj.trim()));
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * User validation rules
 */
export const userValidation = {
  create: [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 100 })
      .withMessage('Email must not exceed 100 characters'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    
    body('dateOfBirth')
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18 || age > 120) {
          throw new Error('Age must be between 18 and 120 years');
        }
        return true;
      }),
    
    body('address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters'),
    
    body('role')
      .isIn(['investor', 'admin', 'superadmin'])
      .withMessage('Role must be investor, admin, or superadmin')
  ],

  update: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ]
};

/**
 * Investment validation rules
 */
export const investmentValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Investment name must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
      .withMessage('Investment name contains invalid characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    
    body('targetAmount')
      .isFloat({ min: 1000, max: 1000000000 })
      .withMessage('Target amount must be between $1,000 and $1,000,000,000'),
    
    body('minInvestment')
      .isFloat({ min: 100, max: 1000000 })
      .withMessage('Minimum investment must be between $100 and $1,000,000'),
    
    body('maxInvestment')
      .optional()
      .isFloat({ min: 1000, max: 1000000000 })
      .withMessage('Maximum investment must be between $1,000 and $1,000,000,000')
      .custom((value, { req }) => {
        if (value && value < req.body.minInvestment) {
          throw new Error('Maximum investment must be greater than minimum investment');
        }
        return true;
      }),
    
    body('expectedROI')
      .optional()
      .isFloat({ min: -100, max: 1000 })
      .withMessage('Expected ROI must be between -100% and 1000%'),
    
    body('riskLevel')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Risk level must be low, medium, or high'),
    
    body('startDate')
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid start date')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }),
    
    body('endDate')
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid end date')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    
    body('subCompanyId')
      .isMongoId()
      .withMessage('Please provide a valid sub-company ID'),
    
    body('assetId')
      .isMongoId()
      .withMessage('Please provide a valid asset ID')
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Investment name must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
      .withMessage('Investment name contains invalid characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    
    body('expectedROI')
      .optional()
      .isFloat({ min: -100, max: 1000 })
      .withMessage('Expected ROI must be between -100% and 1000%'),
    
    body('riskLevel')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Risk level must be low, medium, or high'),
    
    body('status')
      .optional()
      .isIn(['draft', 'active', 'closed', 'cancelled'])
      .withMessage('Status must be draft, active, closed, or cancelled')
  ],

  invest: [
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Investment amount must be a positive number')
      .custom((value) => {
        if (value > 10000000) { // $10M limit
          throw new Error('Investment amount cannot exceed $10,000,000');
        }
        return true;
      })
  ]
};

/**
 * Company validation rules
 */
export const companyValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
      .withMessage('Company name contains invalid characters'),
    
    body('address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters'),
    
    body('contactEmail')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid contact email'),
    
    body('contactPhone')
      .isMobilePhone()
      .withMessage('Please provide a valid contact phone number'),
    
    body('website')
      .optional()
      .isURL()
      .withMessage('Please provide a valid website URL'),
    
    body('establishedDate')
      .isISO8601()
      .toDate()
      .withMessage('Please provide a valid established date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Established date cannot be in the future');
        }
        return true;
      }),
    
    body('registrationNumber')
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Registration number must be between 5 and 50 characters')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Registration number contains invalid characters'),
    
    body('taxId')
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Tax ID must be between 5 and 50 characters')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Tax ID contains invalid characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters')
  ]
};

/**
 * Parameter validation
 */
export const paramValidation = {
  mongoId: param('id').isMongoId().withMessage('Invalid ID format'),
  userId: param('userId').isMongoId().withMessage('Invalid user ID format'),
  investmentId: param('investmentId').isMongoId().withMessage('Invalid investment ID format'),
  companyId: param('companyId').isMongoId().withMessage('Invalid company ID format')
};

/**
 * Query validation
 */
export const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sortBy')
      .optional()
      .isAlpha()
      .withMessage('Sort field must contain only letters'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_@.]+$/)
      .withMessage('Search query contains invalid characters')
  ]
};

export default {
  handleValidationErrors,
  sanitizeHTML,
  sanitizeInput,
  userValidation,
  investmentValidation,
  companyValidation,
  paramValidation,
  queryValidation
};
