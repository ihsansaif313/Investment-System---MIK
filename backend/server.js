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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174'
];

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

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
