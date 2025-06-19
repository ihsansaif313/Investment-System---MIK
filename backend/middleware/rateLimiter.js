/**
 * Rate Limiting Middleware
 * Implements rate limiting to prevent abuse and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';

/**
 * Create rate limiter with custom options
 */
export const rateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000, // Convert minutes to milliseconds
    max: config.RATE_LIMIT_MAX,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW * 60)
      }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json(options.message || defaultOptions.message);
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/api/status';
    },
    keyGenerator: (req) => {
      // Use IP address as the key
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    onLimitReached: (req, res, options) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60
    }
  }
});

/**
 * Registration rate limiter
 */
export const registerRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    error: {
      message: 'Too many registration attempts, please try again later.',
      retryAfter: 60 * 60
    }
  }
});

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    error: {
      message: 'Too many password reset attempts, please try again later.',
      retryAfter: 60 * 60
    }
  }
});

/**
 * API rate limiter for general endpoints
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for local development
  message: {
    success: false,
    error: {
      message: 'Too many API requests, please try again later.',
      retryAfter: 15 * 60
    }
  }
});

/**
 * File upload rate limiter
 */
export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 file uploads per hour
  message: {
    success: false,
    error: {
      message: 'Too many file upload attempts, please try again later.',
      retryAfter: 60 * 60
    }
  }
});

/**
 * Search rate limiter
 */
export const searchRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many search requests, please slow down.',
      retryAfter: 60
    }
  }
});

/**
 * Create user-based rate limiter (requires authentication)
 */
export const userRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each user to 200 requests per windowMs
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip || 'anonymous';
    },
    message: {
      success: false,
      error: {
        message: 'Too many requests from this account, please try again later.',
        retryAfter: 15 * 60
      }
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

/**
 * Dynamic rate limiter based on user role
 */
export const roleBasedRateLimiter = () => {
  return (req, res, next) => {
    let limits;

    if (!req.user) {
      // Anonymous users - strict limits
      limits = {
        windowMs: 15 * 60 * 1000,
        max: 50
      };
    } else {
      // Authenticated users - role-based limits
      switch (req.user.role?.id) {
        case 'superadmin':
          limits = {
            windowMs: 15 * 60 * 1000,
            max: 1000 // Very high limit for superadmin
          };
          break;
        case 'admin':
          limits = {
            windowMs: 15 * 60 * 1000,
            max: 500 // High limit for admin
          };
          break;
        case 'investor':
          limits = {
            windowMs: 15 * 60 * 1000,
            max: 200 // Standard limit for investor
          };
          break;
        default:
          limits = {
            windowMs: 15 * 60 * 1000,
            max: 100 // Default limit
          };
      }
    }

    const limiter = rateLimiter(limits);
    limiter(req, res, next);
  };
};

/**
 * Burst rate limiter for high-frequency operations
 */
export const burstRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many requests in a short time, please slow down.',
      retryAfter: 60
    }
  }
});

export default {
  rateLimiter,
  authRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
  userRateLimiter,
  roleBasedRateLimiter,
  burstRateLimiter
};
