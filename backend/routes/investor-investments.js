// Enhanced investor investments routes
import express from 'express';
import { InvestorInvestment, Investment, SubCompany, Asset, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { param, query, validationResult } from 'express-validator';

const router = express.Router();

// Get all investor investments
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, investmentId, status } = req.query;
    const skip = (page - 1) * Math.min(parseInt(limit), 100);

    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (investmentId) query.investmentId = investmentId;
    if (status) query.status = status;

    const [investorInvestments, total] = await Promise.all([
      InvestorInvestment.find(query)
        .populate({
          path: 'userId',
          select: 'firstName lastName email'
        })
        .populate({
          path: 'investmentId',
          select: 'name description initialAmount currentValue riskLevel status',
          populate: [
            { path: 'subCompanyId', select: 'name industry' },
            { path: 'assetId', select: 'name type category' }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      InvestorInvestment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: investorInvestments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get investor investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investor investments',
      error: error.message
    });
  }
});

// Get investor investment by ID
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

    const investorInvestment = await InvestorInvestment.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate({
        path: 'investmentId',
        populate: [
          { path: 'subCompanyId', select: 'name industry' },
          { path: 'assetId', select: 'name type category' }
        ]
      });

    if (!investorInvestment) {
      return res.status(404).json({
        success: false,
        message: 'Investor investment not found'
      });
    }

    res.json({
      success: true,
      data: investorInvestment
    });
  } catch (error) {
    console.error('Get investor investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investor investment',
      error: error.message
    });
  }
});

export default router;
