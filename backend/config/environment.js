/**
 * Environment Configuration
 * Production-ready configuration management with validation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  const required = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('💡 Please check your .env file');
    process.exit(1);
  }
};

/**
 * Get environment variable with default value and type conversion
 */
const getEnvVar = (key, defaultValue = null, type = 'string') => {
  const value = process.env[key] || defaultValue;
  
  if (value === null) {
    return null;
  }
  
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === '1';
    case 'array':
      return value.split(',').map(item => item.trim());
    default:
      return value;
  }
};

// Validate environment on startup
validateEnvironment();

/**
 * Application Configuration
 */
export const config = {
  // Application
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvVar('PORT', 9000, 'number'),
  APP_NAME: getEnvVar('APP_NAME', 'Investment Management System'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  
  // Database
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  DB_USERNAME: getEnvVar('DB_USERNAME'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD'),
  
  // Authentication
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  
  // Security
  BCRYPT_ROUNDS: getEnvVar('BCRYPT_ROUNDS', 12, 'number'),
  RATE_LIMIT_WINDOW: getEnvVar('RATE_LIMIT_WINDOW', 15, 'number'), // minutes
  RATE_LIMIT_MAX: getEnvVar('RATE_LIMIT_MAX', 100, 'number'), // requests per window
  
  // CORS
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5174'),
  CORS_CREDENTIALS: getEnvVar('CORS_CREDENTIALS', true, 'boolean'),
  
  // File Upload
  MAX_FILE_SIZE: getEnvVar('MAX_FILE_SIZE', 10485760, 'number'), // 10MB
  UPLOAD_PATH: getEnvVar('UPLOAD_PATH', './uploads'),
  ALLOWED_FILE_TYPES: getEnvVar('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,pdf,doc,docx', 'array'),
  
  // Email (for notifications)
  SMTP_HOST: getEnvVar('SMTP_HOST'),
  SMTP_PORT: getEnvVar('SMTP_PORT', 587, 'number'),
  SMTP_USER: getEnvVar('SMTP_USER'),
  SMTP_PASS: getEnvVar('SMTP_PASS'),
  SMTP_FROM: getEnvVar('SMTP_FROM', 'noreply@investmentmanagement.com'),
  
  // Redis (for caching and sessions)
  REDIS_URL: getEnvVar('REDIS_URL'),
  REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD'),
  
  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_FILE: getEnvVar('LOG_FILE', './logs/app.log'),
  
  // WebSocket
  WS_PORT: getEnvVar('WS_PORT', 9001, 'number'),
  
  // External APIs
  MARKET_DATA_API_KEY: getEnvVar('MARKET_DATA_API_KEY'),
  MARKET_DATA_API_URL: getEnvVar('MARKET_DATA_API_URL', 'https://api.marketdata.com'),
  
  // Backup
  BACKUP_SCHEDULE: getEnvVar('BACKUP_SCHEDULE', '0 2 * * *'), // Daily at 2 AM
  BACKUP_RETENTION_DAYS: getEnvVar('BACKUP_RETENTION_DAYS', 30, 'number'),
  
  // Monitoring
  HEALTH_CHECK_INTERVAL: getEnvVar('HEALTH_CHECK_INTERVAL', 30000, 'number'), // 30 seconds
  METRICS_ENABLED: getEnvVar('METRICS_ENABLED', true, 'boolean'),
  
  // Feature Flags
  FEATURES: {
    TWO_FACTOR_AUTH: getEnvVar('FEATURE_2FA', false, 'boolean'),
    EMAIL_NOTIFICATIONS: getEnvVar('FEATURE_EMAIL_NOTIFICATIONS', true, 'boolean'),
    REAL_TIME_UPDATES: getEnvVar('FEATURE_REAL_TIME_UPDATES', true, 'boolean'),
    AUDIT_LOGGING: getEnvVar('FEATURE_AUDIT_LOGGING', true, 'boolean'),
    RATE_LIMITING: getEnvVar('FEATURE_RATE_LIMITING', true, 'boolean')
  }
};

/**
 * Database Configuration
 */
export const dbConfig = {
  development: {
    uri: config.MONGODB_URI || 'mongodb://localhost:27017/investment_management_dev',
    options: {
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    }
  },
  test: {
    uri: config.MONGODB_URI || 'mongodb://localhost:27017/investment_management_test',
    options: {
      maxPoolSize: 2,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 15000,
      bufferMaxEntries: 0,
      bufferCommands: false
    }
  },
  production: {
    uri: config.MONGODB_URI,
    options: {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      ssl: true,
      sslValidate: true,
      authSource: 'admin',
      w: 'majority',
      wtimeoutMS: 5000,
      readPreference: 'primary',
      compressors: ['zlib']
    }
  }
};

/**
 * Get current database configuration
 */
export const getCurrentDbConfig = () => {
  return dbConfig[config.NODE_ENV] || dbConfig.development;
};

/**
 * Validate configuration
 */
export const validateConfig = () => {
  const errors = [];
  
  // Validate JWT secrets
  if (config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  if (config.JWT_REFRESH_SECRET.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long');
  }
  
  // Validate database URI
  if (!config.MONGODB_URI.startsWith('mongodb://') && !config.MONGODB_URI.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }
  
  // Validate port
  if (config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }
  
  // Validate CORS origin in production
  if (config.NODE_ENV === 'production' && config.CORS_ORIGIN === 'http://localhost:5174') {
    errors.push('CORS_ORIGIN should be set to production domain in production environment');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration validation errors:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
  
  console.log('✅ Configuration validation passed');
};

/**
 * Print configuration summary (without sensitive data)
 */
export const printConfigSummary = () => {
  console.log('📋 Configuration Summary:');
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Port: ${config.PORT}`);
  console.log(`   Database: ${config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`   CORS Origin: ${config.CORS_ORIGIN}`);
  console.log(`   JWT Expires: ${config.JWT_EXPIRES_IN}`);
  console.log(`   Rate Limiting: ${config.FEATURES.RATE_LIMITING ? 'Enabled' : 'Disabled'}`);
  console.log(`   Real-time Updates: ${config.FEATURES.REAL_TIME_UPDATES ? 'Enabled' : 'Disabled'}`);
  console.log(`   Audit Logging: ${config.FEATURES.AUDIT_LOGGING ? 'Enabled' : 'Disabled'}`);
};

export default config;
