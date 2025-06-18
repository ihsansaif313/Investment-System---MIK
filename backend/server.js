/* eslint-env node */
import process from 'process';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import investmentRoutes from './routes/investments.js';
import analyticsRoutes from './routes/analytics.js';
import assetRoutes from './routes/assets.js';
import { logStartup, safeConsole } from './utils/console.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

import { URL } from 'url';

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174'
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    safeConsole.debug('CORS origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash if present
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    // Normalize allowed origins similarly
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.endsWith('/') ? o.slice(0, -1) : o);

    if (normalizedAllowedOrigins.indexOf(normalizedOrigin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      safeConsole.error(msg, origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';

    await mongoose.connect(mongoURI);

    safeConsole.info('✅ MongoDB connected successfully');
    safeConsole.info(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    safeConsole.error('❌ MongoDB connection error:', error.message);

    // Do not fallback to mock data, exit process on DB connection failure
    safeConsole.error('💥 MongoDB connection failed. Exiting...');
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assets', assetRoutes);

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
      assets: '/api/assets'
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
      'GET /api/assets'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  safeConsole.error('❌ Server Error:', error);

  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

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
  logStartup(PORT, { docs: true });
});

export default app;
