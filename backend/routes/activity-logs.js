import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { ActivityLog } from '../models/index.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Mock activity logs for now - in a real system this would come from a database
const generateMockActivityLogs = (limit = 10) => {
  const activities = [
    'User registered',
    'Investment created',
    'Company created',
    'Admin assigned',
    'Investment updated',
    'User approved',
    'Company updated',
    'Investment completed',
    'Profit recorded',
    'User login'
  ];

  const users = [
    'John Doe',
    'Jane Smith', 
    'Admin User',
    'Super Admin',
    'Test User'
  ];

  const logs = [];
  for (let i = 0; i < limit; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    logs.push({
      id: `log_${i + 1}`,
      user_id: `user_${Math.floor(Math.random() * 5) + 1}`,
      action: activity.toLowerCase().replace(' ', '_'),
      entity_type: 'system',
      entity_id: `entity_${Math.floor(Math.random() * 100) + 1}`,
      description: `${user} ${activity.toLowerCase()}`,
      metadata: {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timestamp: timestamp
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Get activity logs
router.get('/', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const {
      limit = 10,
      userId = null,
      entityType = null,
      entityId = null,
      actions = null,
      startDate = null,
      endDate = null
    } = req.query;

    // Parse actions if provided
    const actionArray = actions ? actions.split(',') : null;

    // Build query for database schema
    let query = {};
    if (userId) query.userId = userId;
    if (entityType) query.entity = entityType;
    if (entityId) query.entityId = entityId;
    if (actionArray && Array.isArray(actionArray)) query.action = { $in: actionArray };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get real activity logs from database
    const logs = await ActivityLog.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Transform data for frontend compatibility
    const transformedLogs = logs.map(log => ({
      id: log._id,
      user_id: log.userId?._id || log.userId,
      userName: log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'Unknown User',
      userEmail: log.userId?.email || 'unknown@email.com',
      action: log.action,
      entity_type: log.entity,
      entity_id: log.entityId,
      description: log.details?.description || log.action,
      metadata: log.details,
      timestamp: log.createdAt
    }));

    res.json({
      success: true,
      data: transformedLogs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
});

// Get activity logs for specific entity
router.get('/entity/:entityType/:entityId', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 10 } = req.query;

    // Get real activity logs filtered by entity
    const logs = await ActivityLog.find({
      entity: entityType,
      entityId: entityId
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Transform data for frontend compatibility
    const transformedLogs = logs.map(log => ({
      id: log._id,
      user_id: log.userId?._id || log.userId,
      userName: log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'Unknown User',
      userEmail: log.userId?.email || 'unknown@email.com',
      action: log.action,
      entity_type: log.entity,
      entity_id: log.entityId,
      description: log.details?.description || log.action,
      metadata: log.details,
      timestamp: log.createdAt
    }));

    res.json({
      success: true,
      data: transformedLogs
    });
  } catch (error) {
    console.error('Get entity activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity activity logs',
      error: error.message
    });
  }
});

// Get activity logs for specific user
router.get('/user/:userId', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Get real activity logs filtered by user
    const logs = await ActivityLog.find({ userId })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Transform data for frontend compatibility
    const transformedLogs = logs.map(log => ({
      id: log._id,
      user_id: log.userId?._id || log.userId,
      userName: log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'Unknown User',
      userEmail: log.userId?.email || 'unknown@email.com',
      action: log.action,
      entity_type: log.entity,
      entity_id: log.entityId,
      description: log.details?.description || log.action,
      metadata: log.details,
      timestamp: log.createdAt
    }));

    res.json({
      success: true,
      data: transformedLogs
    });
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity logs',
      error: error.message
    });
  }
});

// Create activity log (for manual logging)
router.post('/', authenticate, async (req, res) => {
  try {
    const { action, entity, entityId, description, details } = req.body;

    const log = new ActivityLog({
      userId: req.user.id,
      action,
      entity,
      entityId,
      details: {
        description,
        ...details,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info'
    });

    await log.save();

    res.status(201).json({
      success: true,
      data: log,
      message: 'Activity logged successfully'
    });
  } catch (error) {
    logger.error('Create activity log error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to create activity log',
      error: error.message
    });
  }
});

export default router;
