/**
 * Production Authentication Configuration
 * Enhanced security settings for production deployment
 */

import crypto from 'crypto';

// Production JWT Configuration
export const productionJwtConfig = {
  // Token expiration times (shorter in production)
  accessTokenExpiry: process.env.NODE_ENV === 'production' ? '15m' : '1h',
  refreshTokenExpiry: process.env.NODE_ENV === 'production' ? '7d' : '30d',
  
  // Token issuer and audience for additional validation
  issuer: process.env.JWT_ISSUER || 'investment-management-system',
  audience: process.env.JWT_AUDIENCE || 'investment-management-api',
  
  // Algorithm for signing (use RS256 in production for better security)
  algorithm: process.env.NODE_ENV === 'production' ? 'HS256' : 'HS256',
  
  // Additional claims validation
  validateClaims: true,
  clockTolerance: 30, // 30 seconds tolerance for clock skew
};

// Session Configuration
export const productionSessionConfig = {
  // Session timeout (shorter in production)
  timeout: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 min vs 1 hour
  
  // Maximum concurrent sessions per user
  maxConcurrentSessions: process.env.NODE_ENV === 'production' ? 3 : 10,
  
  // Session cleanup interval
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  
  // Secure session settings
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
};

// Password Policy for Production
export const productionPasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  maxPasswordAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  passwordHistoryCount: 5 // Remember last 5 passwords
};

// Account Security Settings
export const productionAccountSecurity = {
  // Account lockout after failed attempts
  maxFailedAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  
  // Progressive delays for failed attempts
  progressiveDelay: true,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  
  // Email verification requirements
  requireEmailVerification: true,
  emailVerificationExpiry: 24 * 60 * 60 * 1000, // 24 hours
  
  // Two-factor authentication (future enhancement)
  enable2FA: false,
  require2FAForAdmins: false
};

// IP and Device Tracking
export const productionDeviceSecurity = {
  // Track login devices and locations
  trackDevices: true,
  maxDevicesPerUser: 5,
  
  // Suspicious activity detection
  detectSuspiciousActivity: true,
  maxLoginAttemptsPerIP: 20,
  ipLockoutDuration: 60 * 60 * 1000, // 1 hour
  
  // Geolocation validation
  enableGeolocationCheck: false, // Disabled for now
  allowedCountries: [], // Empty means all countries allowed
  
  // Device fingerprinting
  enableDeviceFingerprinting: true
};

// Token Blacklist Configuration
export const productionTokenBlacklist = {
  // Enable token blacklisting for logout/revocation
  enabled: true,
  
  // Cleanup expired blacklisted tokens
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  
  // Redis configuration for distributed blacklist (future enhancement)
  useRedis: false,
  redisUrl: process.env.REDIS_URL || null
};

// Security Headers Configuration
export const productionSecurityHeaders = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameOptions: 'DENY',
  
  // X-Content-Type-Options
  contentTypeOptions: 'nosniff',
  
  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin'
};

// Audit and Logging Configuration
export const productionAuditConfig = {
  // Log all authentication events
  logAllAuthEvents: true,
  
  // Log failed attempts with details
  logFailedAttempts: true,
  
  // Log successful logins
  logSuccessfulLogins: true,
  
  // Log token operations
  logTokenOperations: true,
  
  // Log permission checks
  logPermissionChecks: false, // Too verbose for production
  
  // Retention period for auth logs
  logRetentionDays: 90
};

// Rate Limiting Configuration
export const productionRateLimiting = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    skipSuccessfulRequests: true
  },
  
  // Password reset endpoints
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    skipSuccessfulRequests: false
  },
  
  // Registration endpoints
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per hour per IP
    skipSuccessfulRequests: false
  }
};

// Validation Functions
export const validateProductionAuth = () => {
  const errors = [];
  
  // Check required environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Check JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters long');
  }
  
  // Check for default/weak secrets
  const weakSecrets = ['secret', 'password', 'changeme', 'default'];
  if (process.env.JWT_SECRET && weakSecrets.some(weak => 
    process.env.JWT_SECRET.toLowerCase().includes(weak))) {
    errors.push('JWT_SECRET appears to be weak or default');
  }
  
  return errors;
};

// Generate secure random secrets
export const generateSecureSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Production auth middleware factory
export const createProductionAuthMiddleware = (config = {}) => {
  return {
    ...productionJwtConfig,
    ...productionSessionConfig,
    ...productionAccountSecurity,
    ...config
  };
};

export default {
  jwt: productionJwtConfig,
  session: productionSessionConfig,
  password: productionPasswordPolicy,
  account: productionAccountSecurity,
  device: productionDeviceSecurity,
  tokenBlacklist: productionTokenBlacklist,
  security: productionSecurityHeaders,
  audit: productionAuditConfig,
  rateLimiting: productionRateLimiting,
  validate: validateProductionAuth,
  generateSecret: generateSecureSecret,
  createMiddleware: createProductionAuthMiddleware
};
