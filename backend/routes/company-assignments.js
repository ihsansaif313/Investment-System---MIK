import express from 'express';
import { CompanyAssignment, SubCompany, User, Role } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateAssignment = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('subCompanyId').isMongoId().withMessage('Valid company ID is required'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// ============================================================================
// COMPANY ASSIGNMENT OPERATIONS (Super Admin Only)
// ============================================================================

// Get all assignments
router.get('/', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, subCompanyId, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (subCompanyId) query.subCompanyId = subCompanyId;
    if (status) query.status = status;

    const assignments = await CompanyAssignment.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('subCompanyId', 'name industry')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CompanyAssignment.countDocuments(query);

    res.json({
      success: true,
      data: assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// Get assignments for a specific user
router.get('/user/:userId', authenticate, authorize('superadmin', 'admin'), param('userId').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // If admin, they can only view their own assignments
    if (req.user.role.id === 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const assignments = await CompanyAssignment.find({
      userId: req.params.userId,
      status: 'active'
    })
      .populate('subCompanyId', 'name industry description logo')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get user assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user assignments',
      error: error.message
    });
  }
});

// Get assignments for a specific company
router.get('/company/:companyId', authenticate, authorize('superadmin'), param('companyId').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const assignments = await CompanyAssignment.find({
      subCompanyId: req.params.companyId,
      status: 'active'
    })
      .populate('userId', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get company assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company assignments',
      error: error.message
    });
  }
});

// Create new assignment
router.post('/', authenticate, authorize('superadmin'), validateAssignment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, subCompanyId, permissions, notes } = req.body;

    // Verify user exists and is an admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = await Role.findOne({ userId, status: 'active' });
    if (!userRole || userRole.type !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User must be an admin to be assigned to a company'
      });
    }

    // Verify company exists
    const company = await SubCompany.findById(subCompanyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await CompanyAssignment.findOne({
      userId,
      subCompanyId
    });

    if (existingAssignment) {
      if (existingAssignment.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User is already assigned to this company'
        });
      } else {
        // Reactivate existing assignment
        existingAssignment.status = 'active';
        existingAssignment.assignedBy = req.user.id;
        existingAssignment.assignedDate = new Date();
        existingAssignment.permissions = permissions || existingAssignment.permissions;
        existingAssignment.notes = notes || existingAssignment.notes;
        await existingAssignment.save();

        const populatedAssignment = await CompanyAssignment.findById(existingAssignment._id)
          .populate('userId', 'firstName lastName email')
          .populate('subCompanyId', 'name industry')
          .populate('assignedBy', 'firstName lastName email');

        return res.status(201).json({
          success: true,
          message: 'Assignment reactivated successfully',
          data: populatedAssignment
        });
      }
    }

    // Create new assignment
    const assignment = new CompanyAssignment({
      userId,
      subCompanyId,
      assignedBy: req.user.id,
      permissions: permissions || [
        'view_company_data',
        'manage_investments',
        'view_analytics',
        'generate_reports'
      ],
      notes
    });

    await assignment.save();

    const populatedAssignment = await CompanyAssignment.findById(assignment._id)
      .populate('userId', 'firstName lastName email')
      .populate('subCompanyId', 'name industry')
      .populate('assignedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: populatedAssignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
});

// Update assignment
router.put('/:id', authenticate, authorize('superadmin'), param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { permissions, notes, status } = req.body;

    const assignment = await CompanyAssignment.findByIdAndUpdate(
      req.params.id,
      {
        permissions,
        notes,
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('subCompanyId', 'name industry')
      .populate('assignedBy', 'firstName lastName email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
});

// Remove assignment (set status to inactive)
router.delete('/:id', authenticate, authorize('superadmin'), param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const assignment = await CompanyAssignment.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment removed successfully'
    });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove assignment',
      error: error.message
    });
  }
});

// Get available admins (admins without company assignments)
router.get('/available-admins', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    // Get all admin users
    const adminRoles = await Role.find({ type: 'admin', status: 'active' });
    const adminUserIds = adminRoles.map(role => role.userId);

    // Get users who are admins
    const adminUsers = await User.find({
      _id: { $in: adminUserIds },
      isActive: true
    }).select('firstName lastName email');

    // Get users who already have active assignments
    const assignedUserIds = await CompanyAssignment.distinct('userId', { status: 'active' });

    // Filter out users who already have assignments
    const availableAdmins = adminUsers.filter(user =>
      !assignedUserIds.some(assignedId => assignedId.toString() === user._id.toString())
    );

    res.json({
      success: true,
      data: availableAdmins
    });
  } catch (error) {
    console.error('Get available admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available admins',
      error: error.message
    });
  }
});

// Get all admin users (for assignment dropdown)
router.get('/all-admins', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    // Get all admin users
    const adminRoles = await Role.find({ type: 'admin', status: 'active' });
    const adminUserIds = adminRoles.map(role => role.userId);

    const adminUsers = await User.find({
      _id: { $in: adminUserIds },
      isActive: true
    }).select('firstName lastName email');

    // Add assignment status to each admin
    const adminsWithStatus = await Promise.all(
      adminUsers.map(async (user) => {
        const assignments = await CompanyAssignment.find({
          userId: user._id,
          status: 'active'
        }).populate('subCompanyId', 'name');

        return {
          ...user.toObject(),
          assignments: assignments.map(a => ({
            id: a._id,
            companyName: a.subCompanyId.name,
            assignedDate: a.assignedDate
          }))
        };
      })
    );

    res.json({
      success: true,
      data: adminsWithStatus
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error.message
    });
  }
});

export default router;
