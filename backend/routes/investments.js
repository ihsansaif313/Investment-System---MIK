// Enhanced Investments routes for admin management
import express from 'express';
import { Investment, DailyPerformance, SubCompany, Asset, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

// Validation middleware for investment creation
const createInvestmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Investment name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('investmentType')
    .isIn(['Stocks', 'Bonds', 'Real Estate', 'Cryptocurrency', 'Commodities', 'Mutual Funds', 'ETF', 'Private Equity', 'Venture Capital', 'Other'])
    .withMessage('Invalid investment type'),
  body('initialAmount')
    .isFloat({ min: 0 })
    .withMessage('Initial amount must be a positive number'),
  body('expectedROI')
    .isFloat({ min: -100, max: 10000 })
    .withMessage('Expected ROI must be between -100% and 10000%'),
  body('riskLevel')
    .isIn(['Low', 'Medium', 'High', 'Very High'])
    .withMessage('Invalid risk level'),
  body('subCompanyId')
    .isMongoId()
    .withMessage('Invalid company ID'),
  body('investmentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid investment date'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date')
];

// Validation middleware for daily performance updates
const dailyPerformanceValidation = [
  body('marketValue')
    .isFloat({ min: 0 })
    .withMessage('Market value must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('marketConditions')
    .optional()
    .isIn(['Bullish', 'Bearish', 'Neutral', 'Volatile', 'Stable'])
    .withMessage('Invalid market conditions'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

// Get all investments with role-based filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, riskLevel, investmentType, featured } = req.query;
    const skip = (page - 1) * Math.min(parseInt(limit), 100);
    const userRole = req.user.role?.type || req.user.role?.id;

    // Build query based on user role
    const query = { isActive: true };

    // Role-based access control
    if (userRole === 'admin') {
      // Admins can only see investments they created or from their assigned companies
      const userCompanyAssignments = await mongoose.model('CompanyAssignment').find({
        userId: req.user.id,
        status: 'active'
      }).select('subCompanyId');

      const assignedCompanyIds = userCompanyAssignments.map(assignment => assignment.subCompanyId);

      query.$or = [
        { createdBy: req.user.id },
        { subCompanyId: { $in: assignedCompanyIds } }
      ];
    } else if (userRole === 'investor') {
      // Investors can only see public investments they have invested in
      const userInvestments = await mongoose.model('InvestorInvestment').find({
        userId: req.user.id
      }).select('investmentId');

      const investmentIds = userInvestments.map(inv => inv.investmentId);
      query._id = { $in: investmentIds };
      query.isPublic = true;
    }
    // Superadmins can see all investments (no additional filters)

    // Apply search filters
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      });
    }
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (investmentType) query.investmentType = investmentType;
    if (featured !== undefined) query.featured = featured === 'true';

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .populate('subCompanyId', 'name industry logo')
        .populate('assetId', 'name type category')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Investment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: investments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
});

// Create new investment (Admin and Superadmin only)
router.post('/', authenticate, authorize(['admin', 'superadmin']), createInvestmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      investmentType,
      category,
      initialAmount,
      expectedROI,
      riskLevel,
      subCompanyId,
      assetId,
      investmentDate,
      startDate,
      endDate,
      notes,
      tags,
      minInvestment,
      maxInvestment
    } = req.body;

    // Verify company exists and user has access
    const company = await SubCompany.findById(subCompanyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // For admin users, verify they have access to this company
    if (req.user.role?.type === 'admin') {
      const hasAccess = await mongoose.model('CompanyAssignment').findOne({
        userId: req.user.id,
        subCompanyId: subCompanyId,
        status: 'active'
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to create investments for this company'
        });
      }
    }

    // Create investment
    const investment = new Investment({
      name,
      description,
      investmentType,
      category,
      initialAmount,
      currentValue: initialAmount, // Start with initial amount
      expectedROI,
      riskLevel,
      subCompanyId,
      assetId,
      investmentDate: investmentDate || new Date(),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
      tags: tags || [],
      minInvestment: minInvestment || 0,
      maxInvestment,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id,
      latestPerformance: {
        date: new Date(),
        marketValue: initialAmount,
        dailyChange: 0,
        dailyChangePercent: 0
      }
    });

    await investment.save();

    // Create initial daily performance record
    const initialPerformance = new DailyPerformance({
      investmentId: investment._id,
      date: new Date(),
      marketValue: initialAmount,
      dailyChange: 0,
      dailyChangePercent: 0,
      notes: 'Initial investment created',
      marketConditions: 'Neutral',
      updatedBy: req.user.id,
      dataSource: 'Manual'
    });

    await initialPerformance.save();

    // Populate the response
    await investment.populate([
      { path: 'subCompanyId', select: 'name industry logo' },
      { path: 'assetId', select: 'name type category' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment
    });

  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment',
      error: error.message
    });
  }
});

// Get investment by ID with performance data
router.get('/:id', authenticate, param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userRole = req.user.role?.type || req.user.role?.id;
    const investmentId = req.params.id;

    // Build query with role-based access control
    const query = { _id: investmentId, isActive: true };

    if (userRole === 'admin') {
      // Admins can only see investments they created or from their assigned companies
      const userCompanyAssignments = await mongoose.model('CompanyAssignment').find({
        userId: req.user.id,
        status: 'active'
      }).select('subCompanyId');

      const assignedCompanyIds = userCompanyAssignments.map(assignment => assignment.subCompanyId);

      query.$or = [
        { createdBy: req.user.id },
        { subCompanyId: { $in: assignedCompanyIds } }
      ];
    } else if (userRole === 'investor') {
      // Investors can only see investments they have invested in
      const userInvestment = await mongoose.model('InvestorInvestment').findOne({
        userId: req.user.id,
        investmentId: investmentId
      });

      if (!userInvestment) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this investment'
        });
      }
      query.isPublic = true;
    }

    const investment = await Investment.findOne(query)
      .populate('subCompanyId', 'name industry logo description')
      .populate('assetId', 'name type category description')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Get recent performance data (last 30 days)
    const performanceHistory = await investment.getPerformanceHistory(30);

    // Get performance summary
    const performanceSummary = await DailyPerformance.getPerformanceSummary(investmentId, 30);

    res.json({
      success: true,
      data: {
        investment,
        performanceHistory,
        performanceSummary
      }
    });

  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment',
      error: error.message
    });
  }
});

// Add daily performance update (Admin and Superadmin only)
router.post('/:id/performance', authenticate, authorize(['admin', 'superadmin']),
  param('id').isMongoId(), dailyPerformanceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const investmentId = req.params.id;
    const userRole = req.user.role?.type || req.user.role?.id;
    const { marketValue, notes, marketConditions, date } = req.body;

    // Find investment with access control
    const query = { _id: investmentId, isActive: true };

    if (userRole === 'admin') {
      // Admins can only update investments they created
      query.createdBy = req.user.id;
    }

    const investment = await Investment.findOne(query);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found or you do not have permission to update it'
      });
    }

    // Check if performance for this date already exists
    const performanceDate = date ? new Date(date) : new Date();
    performanceDate.setHours(0, 0, 0, 0); // Set to start of day

    const existingPerformance = await DailyPerformance.findOne({
      investmentId: investmentId,
      date: {
        $gte: performanceDate,
        $lt: new Date(performanceDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingPerformance) {
      // Update existing performance
      existingPerformance.marketValue = marketValue;
      existingPerformance.notes = notes || existingPerformance.notes;
      existingPerformance.marketConditions = marketConditions || existingPerformance.marketConditions;
      existingPerformance.updatedBy = req.user.id;

      await existingPerformance.save();

      // Update investment's latest performance
      await investment.updateLatestPerformance(marketValue, notes);

      res.json({
        success: true,
        message: 'Daily performance updated successfully',
        data: existingPerformance
      });
    } else {
      // Create new performance record
      const dailyPerformance = new DailyPerformance({
        investmentId: investmentId,
        date: performanceDate,
        marketValue: marketValue,
        notes: notes || '',
        marketConditions: marketConditions || 'Neutral',
        updatedBy: req.user.id,
        dataSource: 'Manual'
      });

      await dailyPerformance.save();

      // Update investment's latest performance
      await investment.updateLatestPerformance(marketValue, notes);

      res.status(201).json({
        success: true,
        message: 'Daily performance added successfully',
        data: dailyPerformance
      });
    }

  } catch (error) {
    console.error('Add daily performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add daily performance',
      error: error.message
    });
  }
});

// Get performance history for an investment
router.get('/:id/performance', authenticate, param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const investmentId = req.params.id;
    const { days = 30, page = 1, limit = 50 } = req.query;
    const userRole = req.user.role?.type || req.user.role?.id;

    // Verify user has access to this investment
    const query = { _id: investmentId, isActive: true };

    if (userRole === 'admin') {
      const userCompanyAssignments = await mongoose.model('CompanyAssignment').find({
        userId: req.user.id,
        status: 'active'
      }).select('subCompanyId');

      const assignedCompanyIds = userCompanyAssignments.map(assignment => assignment.subCompanyId);

      query.$or = [
        { createdBy: req.user.id },
        { subCompanyId: { $in: assignedCompanyIds } }
      ];
    } else if (userRole === 'investor') {
      const userInvestment = await mongoose.model('InvestorInvestment').findOne({
        userId: req.user.id,
        investmentId: investmentId
      });

      if (!userInvestment) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this investment'
        });
      }
      query.isPublic = true;
    }

    const investment = await Investment.findOne(query);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Get performance data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const skip = (parseInt(page) - 1) * Math.min(parseInt(limit), 100);

    const [performanceData, total, summary] = await Promise.all([
      DailyPerformance.find({
        investmentId: investmentId,
        date: { $gte: startDate }
      })
      .populate('updatedBy', 'firstName lastName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),

      DailyPerformance.countDocuments({
        investmentId: investmentId,
        date: { $gte: startDate }
      }),

      DailyPerformance.getPerformanceSummary(investmentId, parseInt(days))
    ]);

    res.json({
      success: true,
      data: {
        performance: performanceData,
        summary: summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get performance history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance history',
      error: error.message
    });
  }
});

export default router;
