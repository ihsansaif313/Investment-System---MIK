/**
 * Production Security Middleware
 * Disables development features and enforces production security
 */

// Middleware to disable development features in production
export const disableDevFeatures = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Block access to development-only endpoints
    const devEndpoints = [
      '/debug',
      '/test',
      '/dev',
      '/seed',
      '/migrate',
      '/reset'
    ];
    
    const isDevelopmentEndpoint = devEndpoints.some(endpoint => 
      req.path.includes(endpoint)
    );
    
    if (isDevelopmentEndpoint) {
      return res.status(404).json({
        success: false,
        message: 'Endpoint not available in production',
        code: 'PRODUCTION_SECURITY'
      });
    }
  }
  
  next();
};

// Middleware to add production security headers
export const productionSecurity = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Disable caching for sensitive endpoints
    if (req.path.includes('/api/auth') || req.path.includes('/api/admin')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
  
  next();
};

// Middleware to sanitize error responses in production
export const productionErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Log the full error for debugging
    console.error('Production Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    // Return sanitized error to client
    const statusCode = err.statusCode || err.status || 500;
    
    // Don't expose internal errors in production
    if (statusCode >= 500) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
    
    // Client errors can be shown
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'An error occurred',
      code: err.code || 'CLIENT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
  
  // Development: show full error details
  next(err);
};

// Middleware to validate production environment
export const validateProductionConfig = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const requiredEnvVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'MONGODB_URI',
      'CORS_ORIGIN'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => 
      !process.env[varName] || 
      process.env[varName].includes('CHANGE_THIS') ||
      process.env[varName].includes('GENERATE_SECURE')
    );
    
    if (missingVars.length > 0) {
      console.error('❌ PRODUCTION CONFIGURATION ERROR:');
      console.error('Missing or invalid environment variables:', missingVars);
      console.error('Please update your .env file with secure production values');
      
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        code: 'CONFIGURATION_ERROR'
      });
    }
  }
  
  next();
};

// Middleware to disable debug logging in production
export const productionLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Override console methods to prevent debug output
    const originalConsole = {
      log: console.log,
      debug: console.debug,
      info: console.info
    };
    
    // Only allow warnings and errors in production
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    
    // Restore after request
    res.on('finish', () => {
      Object.assign(console, originalConsole);
    });
  }
  
  next();
};
