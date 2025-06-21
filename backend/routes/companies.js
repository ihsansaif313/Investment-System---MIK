import express from 'express';
import { OwnerCompany, SubCompany, CompanyAssignment, User, Role } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';
import ActivityLogService from '../services/ActivityLogService.js';
import logger from '../utils/logger.js';
import { cacheMiddleware, optimizeQueries } from '../middleware/performance.js';

const router = express.Router();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateCompanyCreation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Company name is required and must be less than 100 characters'),
  body('industry').trim().isLength({ min: 1, max: 50 }).withMessage('Industry is required'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('contactEmail').optional().isEmail().withMessage('Valid contact email is required'),
  body('establishedDate').optional().isISO8601().withMessage('Valid established date is required'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  body('contactPhone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be less than 20 characters'),
  body('website').optional().isURL().withMessage('Website must be a valid URL')
];

const validateCompanyUpdate = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Company name must be less than 100 characters'),
  body('industry').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Industry must be between 1 and 50 characters'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('contactEmail').optional().isEmail().withMessage('Valid contact email is required'),
  body('establishedDate').optional().custom((value) => {
    if (value && !Date.parse(value)) {
      throw new Error('Valid established date is required');
    }
    return true;
  }),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  body('contactPhone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be less than 20 characters'),
  body('website').optional().custom((value) => {
    if (value && value.trim() !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Website must be a valid URL');
      }
    }
    return true;
  })
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

// Get all companies - Optimized with caching and performance improvements
router.get('/', authenticate, authorize('superadmin'), optimizeQueries, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * Math.min(parseInt(limit), 100); // Limit max results

    // Build optimized query with indexes
    const query = {};
    if (search) {
      // Use text search if available, otherwise regex
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // Use Promise.all for parallel execution
    const [companies, total] = await Promise.all([
      SubCompany.find(query)
        .populate('ownerCompanyId', 'name')
        .populate('adminUserId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Return plain objects for better performance
      SubCompany.countDocuments(query)
    ]);

    // Add cache-busting headers to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

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
    logger.error('Get companies error', { error: error.message, query: req.query });
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

    const { name, industry, category, description, contactEmail, establishedDate, address, contactPhone, website } = req.body;

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

    // Find a default admin user if none provided
    let adminUserId = req.body.adminUserId;
    if (!adminUserId) {
      // Try to find admin role first, then superadmin as fallback
      let adminRole = await Role.findOne({ type: 'admin' });
      if (!adminRole) {
        adminRole = await Role.findOne({ type: 'superadmin' });
      }
      if (adminRole) {
        adminUserId = adminRole.userId;
      }
    }

    const company = new SubCompany({
      ownerCompanyId: ownerCompany._id,
      name,
      industry,
      category: category || 'General',
      description,
      contactEmail: contactEmail || `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      establishedDate: establishedDate ? new Date(establishedDate) : new Date(),
      address,
      contactPhone,
      website,
      status: 'active',
      registrationNumber: `SUB-${Date.now()}`,
      taxId: `SUBTAX-${Date.now()}`,
      adminUserId: adminUserId
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
router.put('/:id', authenticate, authorize('superadmin'), param('id').isMongoId(), validateCompanyUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, category, description, contactEmail, establishedDate, address, contactPhone, website, status } = req.body;

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
        category: category || 'General',
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

// Delete sub-company (alias for main company endpoint)
router.delete('/sub/:id', authenticate, authorize('superadmin'), param('id').isMongoId(), async (req, res) => {
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
        message: 'Sub-company not found'
      });
    }

    // Remove all assignments for this company
    await CompanyAssignment.deleteMany({ subCompanyId: req.params.id });

    // Delete the company
    await SubCompany.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Sub-company deleted successfully'
    });
  } catch (error) {
    console.error('Delete sub-company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sub-company',
      error: error.message
    });
  }
});

// Update sub-company (alias for main company endpoint)
router.put('/sub/:id', authenticate, authorize('superadmin'), param('id').isMongoId(), validateCompanyUpdate, async (req, res) => {
  try {
    console.log('🚨 SUB-COMPANY UPDATE ROUTE HIT!');
    console.log('🔍 Company ID:', req.params.id);
    console.log('🔍 Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Content-Type:', req.get('Content-Type'));
    console.log('🔍 User:', req.user?.id);
    console.log('🔍 Timestamp:', new Date().toISOString());

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, category, description, contactEmail, establishedDate, address, contactPhone, website } = req.body;

    console.log('📋 Individual fields received:');
    console.log('  - name:', name);
    console.log('  - industry:', industry);
    console.log('  - category:', category);
    console.log('  - description:', description);
    console.log('  - contactEmail:', contactEmail);
    console.log('  - establishedDate:', establishedDate);
    console.log('  - address:', address);
    console.log('  - contactPhone:', contactPhone);
    console.log('  - website:', website);

    logger.debug('Company update request', {
      companyId: req.params.id,
      updateData: { name, industry, description, contactEmail, establishedDate, address, contactPhone, website }
    });

    // Check if company exists
    const company = await SubCompany.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Sub-company not found'
      });
    }

    // Check if new name conflicts with other companies (excluding current one)
    if (name && name !== company.name) {
      const existingCompany = await SubCompany.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Sub-company with this name already exists'
        });
      }
    }

    // Update company fields
    const updateData = {};
    if (name) updateData.name = name;
    if (industry) updateData.industry = industry;
    if (category !== undefined) updateData.category = category || 'General';
    if (description !== undefined) updateData.description = description;
    if (contactEmail) updateData.contactEmail = contactEmail;
    if (establishedDate) updateData.establishedDate = new Date(establishedDate);
    if (address !== undefined) updateData.address = address;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (website !== undefined) updateData.website = website;

    logger.debug('Applying company update', { companyId: req.params.id, updateData });

    const updatedCompany = await SubCompany.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerCompanyId', 'name')
     .populate('adminUserId', 'firstName lastName email');

    // Log company update activity
    try {
      await ActivityLogService.logCompanyUpdate(
        req.user.id,
        company._id.toString(),
        company.name,
        updateData,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
    } catch (logError) {
      console.error('Failed to log company update activity:', logError);
    }

    res.json({
      success: true,
      message: 'Sub-company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Update sub-company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sub-company',
      error: error.message
    });
  }
});

// Create new sub-company (alias for main company endpoint)
router.post('/sub', authenticate, authorize('superadmin'), validateCompanyCreation, async (req, res) => {
  try {
    console.log('🚨 SUB-COMPANY CREATION ROUTE HIT!');
    console.log('🔍 Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Content-Type:', req.get('Content-Type'));
    console.log('🔍 User:', req.user?.id);
    console.log('🔍 Timestamp:', new Date().toISOString());

    console.log('📋 Individual fields received:');
    console.log('  - name:', req.body.name);
    console.log('  - industry:', req.body.industry);
    console.log('  - category:', req.body.category);
    console.log('  - description:', req.body.description);
    console.log('  - contactEmail:', req.body.contactEmail);
    console.log('  - establishedDate:', req.body.establishedDate);
    console.log('  - address:', req.body.address);
    console.log('  - contactPhone:', req.body.contactPhone);
    console.log('  - website:', req.body.website);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, category, description, contactEmail, establishedDate, address, contactPhone, website } = req.body;

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

    // Find a default admin user if none provided
    let adminUserId = req.body.adminUserId;
    if (!adminUserId) {
      // Try to find admin role first, then superadmin as fallback
      let adminRole = await Role.findOne({ type: 'admin' });
      if (!adminRole) {
        adminRole = await Role.findOne({ type: 'superadmin' });
      }
      if (adminRole) {
        adminUserId = adminRole.userId;
      }
    }

    console.log('💾 Creating company with data:');
    console.log('  - name:', name);
    console.log('  - industry:', industry);
    console.log('  - category:', category || 'General');
    console.log('  - description:', description);
    console.log('  - contactEmail:', contactEmail || `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`);
    console.log('  - establishedDate:', establishedDate ? new Date(establishedDate) : new Date());
    console.log('  - address:', address);
    console.log('  - contactPhone:', contactPhone);
    console.log('  - website:', website);
    console.log('  - adminUserId:', adminUserId);

    const company = new SubCompany({
      ownerCompanyId: ownerCompany._id,
      name,
      industry,
      category: category || 'General',
      description,
      contactEmail: contactEmail || `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      establishedDate: establishedDate ? new Date(establishedDate) : new Date(),
      address,
      contactPhone,
      website,
      status: 'active',
      registrationNumber: `SUB-${Date.now()}`,
      taxId: `SUBTAX-${Date.now()}`,
      adminUserId: adminUserId
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
