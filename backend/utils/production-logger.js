/**
 * Production Logging System
 * Replaces console.log with proper structured logging for production
 */

import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level based on environment
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.WARN 
  : LOG_LEVELS.DEBUG;

// Log file paths
const logFiles = {
  error: path.join(logsDir, 'error.log'),
  combined: path.join(logsDir, 'combined.log'),
  access: path.join(logsDir, 'access.log')
};

// Format log entry
const formatLogEntry = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
    pid: process.pid,
    environment: process.env.NODE_ENV || 'development'
  };
  
  return JSON.stringify(logEntry) + '\n';
};

// Write to log file
const writeToFile = (filePath, content) => {
  try {
    fs.appendFileSync(filePath, content);
  } catch (error) {
    // Fallback to console if file writing fails
    console.error('Failed to write to log file:', error.message);
    console.error('Log content:', content);
  }
};

// Log rotation - keep files under 10MB
const rotateLogIfNeeded = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (stats.size > maxSize) {
      const rotatedPath = `${filePath}.${Date.now()}`;
      fs.renameSync(filePath, rotatedPath);
      
      // Keep only last 5 rotated files
      const dir = path.dirname(filePath);
      const baseName = path.basename(filePath);
      const files = fs.readdirSync(dir)
        .filter(file => file.startsWith(baseName) && file !== baseName)
        .sort()
        .reverse();
      
      if (files.length > 5) {
        files.slice(5).forEach(file => {
          fs.unlinkSync(path.join(dir, file));
        });
      }
    }
  } catch (error) {
    // Ignore rotation errors
  }
};

// Production Logger Class
class ProductionLogger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  error(message, meta = {}) {
    if (LOG_LEVELS.ERROR <= currentLogLevel) {
      const logEntry = formatLogEntry('ERROR', message, meta);
      
      // Always write errors to file
      rotateLogIfNeeded(logFiles.error);
      writeToFile(logFiles.error, logEntry);
      writeToFile(logFiles.combined, logEntry);
      
      // Also log to console in development
      if (!this.isProduction) {
        console.error(`[ERROR] ${message}`, meta);
      }
    }
  }

  warn(message, meta = {}) {
    if (LOG_LEVELS.WARN <= currentLogLevel) {
      const logEntry = formatLogEntry('WARN', message, meta);
      
      rotateLogIfNeeded(logFiles.combined);
      writeToFile(logFiles.combined, logEntry);
      
      if (!this.isProduction) {
        console.warn(`[WARN] ${message}`, meta);
      }
    }
  }

  info(message, meta = {}) {
    if (LOG_LEVELS.INFO <= currentLogLevel) {
      const logEntry = formatLogEntry('INFO', message, meta);
      
      rotateLogIfNeeded(logFiles.combined);
      writeToFile(logFiles.combined, logEntry);
      
      if (!this.isProduction) {
        console.info(`[INFO] ${message}`, meta);
      }
    }
  }

  debug(message, meta = {}) {
    if (LOG_LEVELS.DEBUG <= currentLogLevel) {
      const logEntry = formatLogEntry('DEBUG', message, meta);
      
      rotateLogIfNeeded(logFiles.combined);
      writeToFile(logFiles.combined, logEntry);
      
      if (!this.isProduction) {
        console.debug(`[DEBUG] ${message}`, meta);
      }
    }
  }

  // Log HTTP requests
  logRequest(req, res, responseTime) {
    const logEntry = formatLogEntry('ACCESS', 'HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous'
    });
    
    rotateLogIfNeeded(logFiles.access);
    writeToFile(logFiles.access, logEntry);
  }

  // Log authentication events
  logAuth(event, userId, meta = {}) {
    this.info(`Auth: ${event}`, {
      userId,
      event,
      ...meta
    });
  }

  // Log database operations
  logDatabase(operation, collection, meta = {}) {
    this.debug(`Database: ${operation} on ${collection}`, meta);
  }

  // Log security events
  logSecurity(event, meta = {}) {
    this.warn(`Security: ${event}`, meta);
  }
}

// Create singleton instance
const logger = new ProductionLogger();

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
};

// Replace console methods in production
if (process.env.NODE_ENV === 'production') {
  // Override console methods to use production logger
  console.log = (...args) => logger.info(args.join(' '));
  console.info = (...args) => logger.info(args.join(' '));
  console.warn = (...args) => logger.warn(args.join(' '));
  console.error = (...args) => logger.error(args.join(' '));
  console.debug = (...args) => logger.debug(args.join(' '));
}

export default logger;
