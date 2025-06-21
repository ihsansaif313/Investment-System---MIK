/* eslint-env node */
import process from 'process';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import centralized routes
import apiRoutes from './routes/index.js';
import { logStartup, safeConsole } from './utils/console.js';

// Import production security middleware
import {
  disableDevFeatures,
  productionSecurity,
  productionErrorHandler,
  validateProductionConfig
} from './middleware/production.js';

// Import performance middleware
import {
  compressionMiddleware,
  performanceMonitoring,
  optimizeResponse
} from './middleware/performance.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Production configuration validation
app.use(validateProductionConfig);

// Performance middleware
app.use(compressionMiddleware);
// app.use(performanceMonitoring); // Temporarily disabled

// Production security middleware
app.use(productionSecurity);
app.use(disableDevFeatures);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" }
}));

// Additional security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Remove server information
  res.removeHeader('X-Powered-By');

  // Prevent caching of sensitive data
  if (req.path.includes('/api/auth') || req.path.includes('/api/admin') || req.path.includes('/api/investor')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Security headers for API responses
  if (req.path.includes('/api/')) {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Security-Policy', 'strict');
  }

  next();
});

// CORS configuration - Production-ready with domain validation
const corsOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = [
  ...corsOrigins.split(',').map(origin => origin.trim()),
  // Development origins
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://192.168.1.8:5173',
  // Production origins (add your production domains here)
  'https://your-production-domain.com',
  'https://www.your-production-domain.com'
];

// Production CORS validation
const validateCorsOrigin = (origin) => {
  if (!origin) return true; // Allow requests with no origin (mobile apps, curl)

  // In production, be more strict about origin validation
  if (process.env.NODE_ENV === 'production') {
    // Only allow HTTPS in production (except for localhost)
    if (!origin.startsWith('https://') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return false;
    }

    // Block suspicious origins
    const suspiciousPatterns = [
      /\.ngrok\.io$/,
      /\.herokuapp\.com$/,
      /\.repl\.co$/,
      /\.glitch\.me$/
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(origin))) {
      return false;
    }
  }

  return true;
};

app.use(cors({
  origin: function(origin, callback) {
    safeConsole.debug('CORS origin check:', origin);

    // Basic validation
    if (!validateCorsOrigin(origin)) {
      const msg = 'CORS policy violation: Invalid origin protocol or domain';
      safeConsole.error(msg, origin);
      return callback(new Error(msg), false);
    }

    // Allow requests with no origin
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.endsWith('/') ? o.slice(0, -1) : o);

    if (normalizedAllowedOrigins.indexOf(normalizedOrigin) === -1) {
      const msg = 'CORS policy violation: Origin not in allowed list';
      safeConsole.error(msg, { origin, allowed: normalizedAllowedOrigins });
      return callback(new Error(msg), false);
    }

    safeConsole.debug('CORS origin allowed:', normalizedOrigin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: [
    'X-Response-Time',
    'X-Cache',
    'X-Memory-Usage',
    'X-Memory-Delta'
  ],
  maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0 // Cache preflight for 24h in production
}));

// Rate limiting - Stricter in production
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production'
    ? (process.env.RATE_LIMIT_MAX || 50)  // Stricter in production
    : (process.env.RATE_LIMIT_MAX || 100), // More lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW || 15) * 60),
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health'
});

// Apply general rate limiting - DISABLED FOR DEVELOPMENT
// app.use('/api/', limiter);

// Stricter rate limiting for authentication endpoints - DISABLED FOR DEVELOPMENT
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.NODE_ENV === 'production' ? 5 : 100, // Much higher limit for development
//   message: {
//     error: 'Too many authentication attempts, please try again later.',
//     code: 'AUTH_RATE_LIMIT_EXCEEDED'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/auth', authLimiter);

// Body parsing middleware with production limits
const bodyLimit = process.env.NODE_ENV === 'production' ? '5mb' : '10mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Response optimization
// app.use(optimizeResponse); // Temporarily disabled


// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';

    await mongoose.connect(mongoURI);

    safeConsole.info('✅ MongoDB connected successfully');
    safeConsole.info(`📊 Database: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    safeConsole.error('❌ MongoDB connection error:', error.message);
    safeConsole.warn('⚠️  Running in limited mode without database');
    safeConsole.info('💡 To fix this:');
    safeConsole.info('   1. Start MongoDB: run start-mongodb.ps1');
    safeConsole.info('   2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    safeConsole.info('   3. Update MONGODB_URI in backend/.env');
    return false;
  }
};

// Connect to database
let dbConnected = false;
connectDB().then(connected => {
  dbConnected = connected;
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    mode: dbStatus === 'connected' ? 'full' : 'limited',
    message: dbStatus === 'connected' ? 'All systems operational' : 'Running without database - limited functionality'
  });
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Investment Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      investments: '/api/investments',
      analytics: '/api/analytics',
      assets: '/api/assets',
      adminManagement: '/api/admin-management',
      activityLogs: '/api/activity-logs',
      companyAssignments: '/api/company-assignments'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'GET /api/users',
      'GET /api/companies',
      'GET /api/investments',
      'GET /api/analytics',
      'GET /api/assets',
      'GET /api/admin-management/pending',
      'GET /api/activity-logs',
      'GET /api/company-assignments'
    ]
  });
});

// Global error handler - Use production error handler
app.use(productionErrorHandler);

// Fallback error handler
app.use((error, req, res, next) => {
  safeConsole.error('❌ Server Error:', error);

  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Enhanced security monitoring and error handling
process.on('uncaughtException', (error) => {
  console.error('❌ [SECURITY] Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  console.error('Timestamp:', new Date().toISOString());
  console.log('🔄 Server will continue running...');

  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Log to monitoring service
    console.error('[PRODUCTION] Critical error logged for monitoring');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [SECURITY] Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Timestamp:', new Date().toISOString());
  console.log('🔄 Server will continue running...');

  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Log to monitoring service
    console.error('[PRODUCTION] Unhandled rejection logged for monitoring');
  }
});

// Security event logging
const logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, details);

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  safeConsole.info('🔄 SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  safeConsole.info('🔄 SIGINT received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Investment Management System Backend`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

export default app;

