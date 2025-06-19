import express from 'express';
import { OwnerCompany, SubCompany, CompanyAssignment, User, Role } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';
import ActivityLogService from '../services/ActivityLogService.js';

const router = express.Router();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateCompanyCreation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Company name is required and must be less than 100 characters'),
  body('industry').trim().isLength({ min: 1, max: 50 }).withMessage('Industry is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('establishedDate').isISO8601().withMessage('Valid established date is required'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  body('contactPhone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be less than 20 characters'),
  body('website').optional().isURL().withMessage('Website must be a valid URL')
];

const validateAssignment = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('subCompanyId').isMongoId().withMessage('Valid company ID is required'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// ============================================================================
// COMPANY CRUD OPERATIONS (Super Admin Only)
// ============================================================================

// Get all companies
router.get('/', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const companies = await SubCompany.find(query)
      .populate('ownerCompanyId', 'name')
      .populate('adminUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubCompany.countDocuments(query);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Get company by ID
router.get('/:id', authenticate, authorize('superadmin', 'admin'), param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const company = await SubCompany.findById(req.params.id)
      .populate('ownerCompanyId')
      .populate('adminUserId', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // If admin, check if they have access to this company
    if (req.user.role.id === 'admin') {
      const assignment = await CompanyAssignment.findOne({
        userId: req.user.id,
        subCompanyId: req.params.id,
        status: 'active'
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this company'
        });
      }
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    });
  }
});

// Create new company
router.post('/', authenticate, authorize('superadmin'), validateCompanyCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, description, contactEmail, establishedDate, address, contactPhone, website } = req.body;

    // Check if company name already exists
    const existingCompany = await SubCompany.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    // Create default owner company if it doesn't exist
    let ownerCompany = await OwnerCompany.findOne({ name: 'Default Owner Company' });
    if (!ownerCompany) {
      ownerCompany = new OwnerCompany({
        name: 'Default Owner Company',
        address: address || 'Default Address',
        contactEmail: contactEmail,
        contactPhone: contactPhone || '',
        establishedDate: new Date(),
        registrationNumber: `REG-${Date.now()}`,
        taxId: `TAX-${Date.now()}`
      });
      await ownerCompany.save();
    }

    const company = new SubCompany({
      ownerCompanyId: ownerCompany._id,
      name,
      industry,
      description,
      contactEmail,
      establishedDate: new Date(establishedDate),
      address,
      contactPhone,
      website,
      status: 'active',
      registrationNumber: `SUB-${Date.now()}`,
      taxId: `SUBTAX-${Date.now()}`
    });

    await company.save();

    const populatedCompany = await SubCompany.findById(company._id)
      .populate('ownerCompanyId', 'name')
      .populate('adminUserId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: populatedCompany
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message
    });
  }
});

// Update company
router.put('/:id', authenticate, authorize('superadmin'), param('id').isMongoId(), validateCompanyCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, description, contactEmail, establishedDate, address, contactPhone, website, status } = req.body;

    // Check if another company with the same name exists
    const existingCompany = await SubCompany.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    const company = await SubCompany.findByIdAndUpdate(
      req.params.id,
      {
        name,
        industry,
        description,
        contactEmail,
        establishedDate: new Date(establishedDate),
        address,
        contactPhone,
        website,
        status
      },
      { new: true, runValidators: true }
    ).populate('ownerCompanyId', 'name').populate('adminUserId', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
});

// Delete company
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

    const company = await SubCompany.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Remove all assignments for this company
    await CompanyAssignment.deleteMany({ subCompanyId: req.params.id });

    // Delete the company
    await SubCompany.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
});

// ============================================================================
// SUB-COMPANY SPECIFIC ENDPOINTS (Legacy support)
// ============================================================================

// Get all sub-companies (alias for main companies endpoint)
router.get('/sub', authenticate, authorize('superadmin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const companies = await SubCompany.find(query)
      .populate('ownerCompanyId', 'name')
      .populate('adminUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubCompany.countDocuments(query);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sub-companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-companies',
      error: error.message
    });
  }
});

// Get sub-company by ID (alias for main company endpoint)
router.get('/sub/:id', authenticate, authorize('superadmin', 'admin'), param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const company = await SubCompany.findById(req.params.id)
      .populate('ownerCompanyId')
      .populate('adminUserId', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Sub-company not found'
      });
    }

    // If admin, check if they have access to this company
    if (req.user.role.id === 'admin') {
      const assignment = await CompanyAssignment.findOne({
        userId: req.user.id,
        subCompanyId: req.params.id,
        status: 'active'
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this sub-company'
        });
      }
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get sub-company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-company',
      error: error.message
    });
  }
});

// Create new sub-company (alias for main company endpoint)
router.post('/sub', authenticate, authorize('superadmin'), validateCompanyCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, description, contactEmail, establishedDate, address, contactPhone, website } = req.body;

    // Check if company name already exists
    const existingCompany = await SubCompany.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Sub-company with this name already exists'
      });
    }

    // Create default owner company if it doesn't exist
    let ownerCompany = await OwnerCompany.findOne({ name: 'Default Owner Company' });
    if (!ownerCompany) {
      ownerCompany = new OwnerCompany({
        name: 'Default Owner Company',
        address: address || 'Default Address',
        contactEmail: contactEmail,
        contactPhone: contactPhone || '',
        establishedDate: new Date(),
        registrationNumber: `REG-${Date.now()}`,
        taxId: `TAX-${Date.now()}`
      });
      await ownerCompany.save();
    }

    const company = new SubCompany({
      ownerCompanyId: ownerCompany._id,
      name,
      industry,
      description,
      contactEmail,
      establishedDate: new Date(establishedDate),
      address,
      contactPhone,
      website,
      status: 'active',
      registrationNumber: `SUB-${Date.now()}`,
      taxId: `SUBTAX-${Date.now()}`
    });

    await company.save();

    const populatedCompany = await SubCompany.findById(company._id)
      .populate('ownerCompanyId', 'name')
      .populate('adminUserId', 'firstName lastName email');

    // Log company creation activity
    try {
      await ActivityLogService.logCompanyCreation(
        req.user.id,
        company._id.toString(),
        company.name,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          industry: company.industry,
          contactEmail: company.contactEmail
        }
      );
    } catch (logError) {
      console.error('Failed to log company creation activity:', logError);
    }

    res.status(201).json({
      success: true,
      message: 'Sub-company created successfully',
      data: populatedCompany
    });
  } catch (error) {
    console.error('Create sub-company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sub-company',
      error: error.message
    });
  }
});

export default router;
