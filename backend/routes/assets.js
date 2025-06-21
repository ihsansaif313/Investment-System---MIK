// Assets routes
import express from 'express';
import { Asset } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Get all assets
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, category } = req.query;
    const skip = (page - 1) * Math.min(parseInt(limit), 100);

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (category) query.category = category;

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Asset.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: assets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error.message
    });
  }
});

// Get asset by ID
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

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset',
      error: error.message
    });
  }
});

export default router;
