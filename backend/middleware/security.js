/**
 * Security Middleware
 * Comprehensive security measures for production deployment
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import { config } from '../config/environment.js';
import { securityLogger } from '../utils/logger.js';

/**
 * Configure CORS
 */
export const configureCORS = () => {
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = Array.isArray(config.CORS_ORIGIN) 
        ? config.CORS_ORIGIN 
        : [config.CORS_ORIGIN];

      if (allowedOrigins.includes(origin) || config.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        securityLogger.logSuspiciousActivity(null, 'CORS_VIOLATION', {
          origin,
          allowedOrigins
        });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: config.CORS_CREDENTIALS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  };

  return cors(corsOptions);
};

/**
 * Configure Helmet for security headers
 */
export const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'wss:', 'ws:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'same-origin' }
  });
};

/**
 * Rate limiting configuration
 */
export const configureRateLimit = () => {
  return rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000,
    max: config.RATE_LIMIT_MAX,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: config.RATE_LIMIT_WINDOW * 60
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      securityLogger.logSuspiciousActivity(req.user?.id, 'RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });

      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: config.RATE_LIMIT_WINDOW * 60
        }
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/api/status';
    }
  });
};

/**
 * Slow down repeated requests
 */
export const configureSlowDown = () => {
  return slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per windowMs without delay
    delayMs: 500, // add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // max delay of 20 seconds
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    onLimitReached: (req, res, options) => {
      securityLogger.logSuspiciousActivity(req.user?.id, 'SLOW_DOWN_TRIGGERED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
    }
  });
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = () => {
  return [
    // Prevent NoSQL injection attacks
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        securityLogger.logSuspiciousActivity(req.user?.id, 'NOSQL_INJECTION_ATTEMPT', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          sanitizedKey: key,
          path: req.path
        });
      }
    }),

    // Prevent XSS attacks
    xss(),

    // Prevent HTTP Parameter Pollution
    hpp({
      whitelist: ['sort', 'fields', 'page', 'limit', 'filter']
    })
  ];
};

/**
 * Request size limiting
 */
export const limitRequestSize = () => {
  return (req, res, next) => {
    const maxSize = config.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default
    
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
      securityLogger.logSuspiciousActivity(req.user?.id, 'REQUEST_SIZE_EXCEEDED', {
        ip: req.ip,
        contentLength: req.headers['content-length'],
        maxSize,
        path: req.path
      });

      return res.status(413).json({
        success: false,
        error: {
          message: 'Request entity too large',
          maxSize: `${maxSize / 1024 / 1024}MB`
        }
      });
    }

    next();
  };
};

/**
 * IP whitelist/blacklist middleware
 */
export const ipFilter = (whitelist = [], blacklist = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check blacklist first
    if (blacklist.length > 0 && blacklist.includes(clientIP)) {
      securityLogger.logSuspiciousActivity(null, 'BLACKLISTED_IP_ACCESS', {
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        path: req.path
      });

      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Check whitelist if configured
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      securityLogger.logSuspiciousActivity(null, 'NON_WHITELISTED_IP_ACCESS', {
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        path: req.path
      });

      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    next();
  };
};

/**
 * Request validation middleware
 */
export const validateRequest = () => {
  return (req, res, next) => {
    // Check for suspicious patterns in URL
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /<script/i,  // XSS attempts
      /union.*select/i,  // SQL injection
      /javascript:/i,  // JavaScript injection
      /vbscript:/i,  // VBScript injection
      /onload=/i,  // Event handler injection
      /onerror=/i  // Event handler injection
    ];

    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent') || '';

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent)) {
        securityLogger.logSuspiciousActivity(req.user?.id, 'SUSPICIOUS_REQUEST_PATTERN', {
          ip: req.ip,
          userAgent,
          url,
          pattern: pattern.toString()
        });

        return res.status(400).json({
          success: false,
          error: { message: 'Invalid request' }
        });
      }
    }

    // Check for excessively long headers
    const maxHeaderLength = 8192; // 8KB
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && value.length > maxHeaderLength) {
        securityLogger.logSuspiciousActivity(req.user?.id, 'EXCESSIVE_HEADER_LENGTH', {
          ip: req.ip,
          header: key,
          length: value.length
        });

        return res.status(400).json({
          success: false,
          error: { message: 'Request header too large' }
        });
      }
    }

    next();
  };
};

/**
 * Compression middleware
 */
export const configureCompression = () => {
  return compression({
    level: 6, // Compression level (1-9)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress if the request includes a 'x-no-compression' header
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Use compression filter function
      return compression.filter(req, res);
    }
  });
};

/**
 * Security headers middleware
 */
export const securityHeaders = () => {
  return (req, res, next) => {
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    // Add custom security headers
    res.setHeader('X-API-Version', config.APP_VERSION || '1.0.0');
    res.setHeader('X-Request-ID', req.id || 'unknown');
    
    // Cache control for API responses
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  };
};

/**
 * Request ID middleware
 */
export const requestId = () => {
  return (req, res, next) => {
    req.id = req.get('X-Request-ID') || 
             `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.id);
    next();
  };
};

/**
 * Apply all security middleware
 */
export const applySecurity = (app) => {
  // Request ID (should be first)
  app.use(requestId());

  // Compression
  app.use(configureCompression());

  // Security headers
  app.use(configureHelmet());
  app.use(securityHeaders());

  // CORS
  app.use(configureCORS());

  // Rate limiting and slow down
  if (config.FEATURES.RATE_LIMITING) {
    app.use(configureRateLimit());
    app.use(configureSlowDown());
  }

  // Request validation
  app.use(validateRequest());

  // Request size limiting
  app.use(limitRequestSize());

  // Input sanitization
  app.use(...sanitizeInput());

  console.log('✅ Security middleware applied');
};

export default {
  configureCORS,
  configureHelmet,
  configureRateLimit,
  configureSlowDown,
  sanitizeInput,
  limitRequestSize,
  ipFilter,
  validateRequest,
  configureCompression,
  securityHeaders,
  requestId,
  applySecurity
};
