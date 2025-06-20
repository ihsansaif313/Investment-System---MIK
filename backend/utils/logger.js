/**
 * Logging Utilities
 * Production-ready logging with activity tracking
 */

import { ActivityLog } from '../models/index.js';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log Activity to Database
 */
export const logActivity = async (activityData) => {
  try {
    const activity = new ActivityLog({
      userId: activityData.userId,
      action: activityData.action,
      entity: activityData.entity,
      entityId: activityData.entityId,
      details: activityData.details,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent,
      severity: activityData.severity || 'info'
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

/**
 * Application Logger Class
 */
class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    // Set log level based on environment
    const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info');
    this.currentLevel = this.levels[logLevel] || this.levels.info;

    // Log file paths
    this.logFiles = {
      error: path.join(logsDir, 'error.log'),
      combined: path.join(logsDir, 'combined.log'),
      access: path.join(logsDir, 'access.log')
    };
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to console and file
   */
  writeLog(level, message, meta = {}) {
    if (this.levels[level] > this.currentLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output with colors (only in development)
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[37m'  // White
      };

      const resetColor = '\x1b[0m';
      console.log(`${colors[level]}${formattedMessage}${resetColor}`);
    }

    // File logging for production and development
    try {
      // Write to combined log
      fs.appendFileSync(this.logFiles.combined, formattedMessage + '\n');

      // Write errors to separate error log
      if (level === 'error') {
        fs.appendFileSync(this.logFiles.error, formattedMessage + '\n');
      }
    } catch (error) {
      // Fallback to console in case of file logging failure
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Error logging
   */
  error(message, meta = {}) {
    this.writeLog('error', message, { ...meta, severity: 'error' });
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.writeLog('warn', message, { ...meta, severity: 'warning' });
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.writeLog('info', message, { ...meta, severity: 'info' });
  }

  /**
   * Debug logging
   */
  debug(message, meta = {}) {
    this.writeLog('debug', message, { ...meta, severity: 'info' });
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      contentLength: res.get('Content-Length')
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    this.writeLog(level, `${req.method} ${req.originalUrl}`, logData);
  }

  /**
   * Log database operation
   */
  logDatabase(operation, collection, duration, error = null) {
    const logData = {
      operation,
      collection,
      duration: `${duration}ms`,
      ...(error && { error: error.message })
    };

    const level = error ? 'error' : 'debug';
    const message = error 
      ? `Database ${operation} failed on ${collection}`
      : `Database ${operation} on ${collection}`;
    
    this.writeLog(level, message, logData);
  }

  /**
   * Log authentication events
   */
  logAuth(event, userId, details = {}) {
    const logData = {
      event,
      userId,
      ...details
    };

    this.info(`Authentication: ${event}`, logData);
  }

  /**
   * Log security events
   */
  logSecurity(event, details = {}) {
    const logData = {
      event,
      severity: 'warning',
      ...details
    };

    this.warn(`Security: ${event}`, logData);
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric, value, unit = 'ms') {
    const logData = {
      metric,
      value,
      unit
    };

    this.info(`Performance: ${metric}`, logData);
  }
}

// Create singleton logger instance
const logger = new Logger();

/**
 * Express middleware for request logging
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Activity logging middleware
 */
export const activityLogger = (action, entity) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log activity after successful response
      if (res.statusCode < 400 && req.user) {
        logActivity({
          userId: req.user.id,
          action,
          entity,
          entityId: req.params.id || data?.data?.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      
      // Call original json method
      originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Error logging middleware
 */
export const errorLogger = (err, req, res, next) => {
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body
  });

  next(err);
};

/**
 * Database operation logger
 */
export const dbLogger = {
  logQuery: (collection, operation, query, duration) => {
    logger.logDatabase(operation, collection, duration);
  },
  
  logError: (collection, operation, error, duration) => {
    logger.logDatabase(operation, collection, duration, error);
  }
};

/**
 * Security event logger
 */
export const securityLogger = {
  logFailedLogin: (email, ip, userAgent) => {
    logger.logSecurity('Failed Login Attempt', {
      email,
      ip,
      userAgent
    });
  },
  
  logAccountLocked: (email, ip) => {
    logger.logSecurity('Account Locked', {
      email,
      ip
    });
  },
  
  logSuspiciousActivity: (userId, activity, details) => {
    logger.logSecurity('Suspicious Activity', {
      userId,
      activity,
      ...details
    });
  },
  
  logUnauthorizedAccess: (userId, resource, ip) => {
    logger.logSecurity('Unauthorized Access Attempt', {
      userId,
      resource,
      ip
    });
  }
};

/**
 * Performance logger
 */
export const performanceLogger = {
  logResponseTime: (route, time) => {
    logger.logPerformance(`Response Time - ${route}`, time);
  },
  
  logDatabaseQuery: (query, time) => {
    logger.logPerformance(`Database Query - ${query}`, time);
  },
  
  logMemoryUsage: () => {
    const usage = process.memoryUsage();
    logger.logPerformance('Memory Usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`
    });
  }
};

export default logger;
