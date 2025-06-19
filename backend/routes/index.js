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

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      authentication: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'User logout',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password'
      },
      users: {
        'GET /api/users': 'Get all users',
        'POST /api/users': 'Create new user',
        'GET /api/users/:id': 'Get user by ID',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
        'GET /api/users/profile': 'Get current user profile',
        'PUT /api/users/profile': 'Update current user profile',
        'POST /api/users/change-password': 'Change password'
      },
      investments: {
        'GET /api/investments': 'Get all investments',
        'POST /api/investments': 'Create new investment',
        'GET /api/investments/:id': 'Get investment by ID',
        'PUT /api/investments/:id': 'Update investment',
        'DELETE /api/investments/:id': 'Delete investment',
        'POST /api/investments/:id/invest': 'Invest in investment',
        'GET /api/investments/:id/performance': 'Get investment performance',
        'GET /api/investments/analytics': 'Get investment analytics'
      },
      companies: {
        'GET /api/companies': 'Get all companies',
        'POST /api/companies': 'Create new company',
        'GET /api/companies/:id': 'Get company by ID',
        'PUT /api/companies/:id': 'Update company',
        'DELETE /api/companies/:id': 'Delete company'
      },
      companyAssignments: {
        'GET /api/company-assignments': 'Get all company assignments',
        'POST /api/company-assignments': 'Create new assignment',
        'PUT /api/company-assignments/:id': 'Update assignment',
        'DELETE /api/company-assignments/:id': 'Remove assignment',
        'GET /api/company-assignments/user/:userId': 'Get user assignments',
        'GET /api/company-assignments/company/:companyId': 'Get company assignments',
        'GET /api/company-assignments/available-admins': 'Get available admins',
        'GET /api/company-assignments/all-admins': 'Get all admin users'
      },
      adminManagement: {
        'GET /api/admin-management/pending': 'Get pending admin approvals',
        'GET /api/admin-management/approved': 'Get approved admin users',
        'POST /api/admin-management/approve/:userId': 'Approve admin user',
        'POST /api/admin-management/reject/:userId': 'Reject admin user',
        'GET /api/admin-management/status/:userId': 'Get admin approval status'
      },
      assets: {
        'GET /api/assets': 'Get all assets',
        'POST /api/assets': 'Create new asset',
        'GET /api/assets/:id': 'Get asset by ID',
        'PUT /api/assets/:id': 'Update asset',
        'DELETE /api/assets/:id': 'Delete asset'
      },
      analytics: {
        'GET /api/analytics/superadmin': 'Get superadmin analytics',
        'GET /api/analytics/admin/:subCompanyId': 'Get admin analytics',
        'GET /api/analytics/investor/:userId': 'Get investor analytics'
      }
    }
  });
});

export default router;
