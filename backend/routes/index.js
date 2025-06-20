/**
 * Main API Routes
 * Centralized route configuration
 */

import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import investmentRoutes from './investments.js';
import companyRoutes from './companies.js';
import companyAssignmentRoutes from './company-assignments.js';
import adminManagementRoutes from './admin-management.js';
import assetRoutes from './assets.js';
import analyticsRoutes from './analytics.js';
import activityLogsRoutes from './activity-logs.js';
import { authenticate } from '../middleware/auth.js';
import { requestLogger } from '../utils/logger.js';

const router = express.Router();

// Apply request logging to all routes
router.use(requestLogger);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'Investment Management API',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      features: {
        authentication: true,
        realTimeUpdates: process.env.FEATURE_REAL_TIME_UPDATES === 'true',
        auditLogging: process.env.FEATURE_AUDIT_LOGGING === 'true',
        rateLimiting: process.env.FEATURE_RATE_LIMITING === 'true'
      }
    }
  });
});

// Public routes (no authentication required)
router.use('/auth', authRoutes);

// Protected routes (authentication required)
router.use('/users', authenticate, userRoutes);
router.use('/investments', authenticate, investmentRoutes);
router.use('/companies', authenticate, companyRoutes);
router.use('/company-assignments', authenticate, companyAssignmentRoutes);
router.use('/admin-management', authenticate, adminManagementRoutes);
router.use('/assets', authenticate, assetRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/activity-logs', authenticate, activityLogsRoutes);

// API documentation endpoint - Only available in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/docs', (req, res) => {
    res.json({
      success: true,
      message: 'API Documentation - Development Only',
      note: 'This endpoint is disabled in production for security',
      endpoints: {
        authentication: {
          'POST /api/auth/login': 'User login',
          'POST /api/auth/register': 'User registration',
          'POST /api/auth/refresh': 'Refresh access token',
          'POST /api/auth/logout': 'User logout'
        },
        core: {
          'GET /api/health': 'Health check',
          'GET /api/status': 'API status'
        }
      }
    });
  });
} else {
  // Production: Return 404 for docs endpoint
  router.get('/docs', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API documentation not available in production',
      note: 'Please refer to external documentation'
    });
  });
}

export default router;
