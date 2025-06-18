/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

import jwt from 'jsonwebtoken';
import { User, Role, Session } from '../models/index.js';
import { config } from '../config/environment.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { securityLogger } from '../utils/logger.js';

/**
 * Authenticate user using JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access token required' }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token type' }
      });
    }

    // Check if session exists and is active
    const session = await Session.findOne({
      token,
      userId: decoded.userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired session' }
      });
    }

    // Get user with role
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found or inactive' }
      });
    }

    // Get user role
    const role = await Role.findOne({ userId: user._id, isActive: true });
    if (!role) {
      return res.status(401).json({
        success: false,
        error: { message: 'User role not found' }
      });
    }

    // Update session last activity
    session.lastActivity = new Date();
    await session.save();

    // Attach user and role to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: {
        id: role.type,
        name: role.type,
        permissions: role.permissions || []
      },
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token' }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired' }
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication failed' }
    });
  }
};

// Legacy middleware for backward compatibility
export const authMiddleware = authenticate;

/**
 * Authorize user based on roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    if (!allowedRoles.includes(req.user.role.id)) {
      // Log unauthorized access attempt
      securityLogger.logUnauthorizedAccess(
        req.user.id,
        req.originalUrl,
        req.ip
      );

      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          requiredRoles: allowedRoles,
          userRole: req.user.role.id
        }
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const userPermissions = req.user.role.permissions || [];
    const hasPermission = userPermissions.some(permission =>
      permission.resource === resource &&
      (permission.actions.includes(action) || permission.actions.includes('manage'))
    );

    if (!hasPermission) {
      // Log unauthorized access attempt
      securityLogger.logUnauthorizedAccess(
        req.user.id,
        `${resource}:${action}`,
        req.ip
      );

      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          required: `${resource}:${action}`,
          userPermissions: userPermissions.map(p => `${p.resource}:${p.actions.join(',')}`)
        }
      });
    }

    next();
  };
};

// Legacy middleware for backward compatibility
export const requireRole = (roles) => {
  return authorize(...roles);
};

export const requirePermission = (permission) => {
  const [resource, action] = permission.split(':');
  return hasPermission(resource, action);
};
