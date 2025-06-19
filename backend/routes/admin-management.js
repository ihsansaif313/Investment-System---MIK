import express from 'express';
import { User, Role } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// ============================================================================
// ADMIN APPROVAL MANAGEMENT (Super Admin Only)
// ============================================================================

// Get all pending admin users
router.get('/pending', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    // Find all pending admin roles
    const pendingRoles = await Role.find({ 
      type: 'admin', 
      status: 'pending' 
    }).populate('userId', 'firstName lastName email createdAt');

    const pendingAdmins = pendingRoles.map(role => ({
      id: role.userId._id,
      firstName: role.userId.firstName,
      lastName: role.userId.lastName,
      email: role.userId.email,
      registrationDate: role.userId.createdAt,
      roleId: role._id,
      status: role.status
    }));

    res.json({
      success: true,
      data: pendingAdmins
    });
  } catch (error) {
    console.error('Get pending admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending admins',
      error: error.message
    });
  }
});

// Get all approved admin users (for assignment dropdown)
router.get('/approved', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    // Find all active admin roles
    const activeRoles = await Role.find({ 
      type: 'admin', 
      status: 'active' 
    }).populate('userId', 'firstName lastName email');

    const approvedAdmins = activeRoles.map(role => ({
      id: role.userId._id,
      firstName: role.userId.firstName,
      lastName: role.userId.lastName,
      email: role.userId.email,
      roleId: role._id,
      status: role.status
    }));

    res.json({
      success: true,
      data: approvedAdmins
    });
  } catch (error) {
    console.error('Get approved admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved admins',
      error: error.message
    });
  }
});

// Approve admin user
router.post('/approve/:userId', 
  authenticate, 
  authorize('superadmin'), 
  param('userId').isMongoId(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userId } = req.params;

      // Find the user's admin role
      const adminRole = await Role.findOne({ 
        userId, 
        type: 'admin' 
      }).populate('userId', 'firstName lastName email');

      if (!adminRole) {
        return res.status(404).json({
          success: false,
          message: 'Admin role not found'
        });
      }

      if (adminRole.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Admin is already approved'
        });
      }

      // Update role status to active
      adminRole.status = 'active';
      await adminRole.save();

      res.json({
        success: true,
        message: 'Admin approved successfully',
        data: {
          id: adminRole.userId._id,
          firstName: adminRole.userId.firstName,
          lastName: adminRole.userId.lastName,
          email: adminRole.userId.email,
          status: adminRole.status
        }
      });
    } catch (error) {
      console.error('Approve admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve admin',
        error: error.message
      });
    }
  }
);

// Reject admin user
router.post('/reject/:userId', 
  authenticate, 
  authorize('superadmin'), 
  param('userId').isMongoId(),
  body('reason').optional().trim().isLength({ max: 500 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const { reason } = req.body;

      // Find the user's admin role
      const adminRole = await Role.findOne({ 
        userId, 
        type: 'admin' 
      }).populate('userId', 'firstName lastName email');

      if (!adminRole) {
        return res.status(404).json({
          success: false,
          message: 'Admin role not found'
        });
      }

      if (adminRole.status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: 'Admin is already rejected'
        });
      }

      // Update role status to inactive and add rejection reason
      adminRole.status = 'inactive';
      if (reason) {
        adminRole.notes = reason;
      }
      await adminRole.save();

      // Also deactivate the user account
      await User.findByIdAndUpdate(userId, { isActive: false });

      res.json({
        success: true,
        message: 'Admin rejected successfully',
        data: {
          id: adminRole.userId._id,
          firstName: adminRole.userId.firstName,
          lastName: adminRole.userId.lastName,
          email: adminRole.userId.email,
          status: adminRole.status,
          reason
        }
      });
    } catch (error) {
      console.error('Reject admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject admin',
        error: error.message
      });
    }
  }
);

// Get admin status for a specific user
router.get('/status/:userId', 
  authenticate, 
  param('userId').isMongoId(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userId } = req.params;

      // Users can only check their own status unless they're superadmin
      if (req.user.role.id !== 'superadmin' && req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const adminRole = await Role.findOne({ 
        userId, 
        type: 'admin' 
      });

      if (!adminRole) {
        return res.status(404).json({
          success: false,
          message: 'Admin role not found'
        });
      }

      res.json({
        success: true,
        data: {
          status: adminRole.status,
          notes: adminRole.notes || null
        }
      });
    } catch (error) {
      console.error('Get admin status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get admin status',
        error: error.message
      });
    }
  }
);

export default router;
