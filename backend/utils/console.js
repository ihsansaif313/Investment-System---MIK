/**
 * Production-Safe Console Logging Utility
 * Conditionally logs based on environment
 */

import { config } from '../config/environment.js';

/**
 * Safe console logging that respects environment
 */
export const safeConsole = {
  log: (...args) => {
    if (config.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, but sanitize in production
    if (config.NODE_ENV === 'production') {
      console.error('An error occurred. Check logs for details.');
    } else {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (config.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (config.NODE_ENV !== 'production') {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (config.NODE_ENV === 'development') {
      console.debug(...args);
    }
  }
};

/**
 * Production-safe startup logging
 */
export const logStartup = (port, additionalInfo = {}) => {
  if (config.NODE_ENV === 'production') {
    console.log(`✅ Investment Management System started on port ${port}`);
    console.log(`🌐 Environment: ${config.NODE_ENV}`);
  } else {
    console.log('🚀 Investment Management System Backend');
    console.log('=' .repeat(50));
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌐 API URL: http://localhost:${port}`);
    console.log(`🔗 Health Check: http://localhost:${port}/health`);
    if (additionalInfo.docs) {
      console.log(`📚 API Documentation: http://localhost:${port}`);
    }
    console.log('=' .repeat(50));
  }
};

export default safeConsole;
