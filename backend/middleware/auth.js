/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

import jwt from 'jsonwebtoken';
import { User, Role, Session, CompanyAssignment } from '../models/index.js';
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

    // Get user role - check both separate Role document and embedded role
    // Allow pending status for admins to show pending approval screen
    let role = await Role.findOne({
      userId: user._id,
      status: { $in: ['active', 'pending'] }
    });

    // If no separate role document, check for embedded role in user
    if (!role && user.role) {
      role = {
        type: user.role.type || user.role.id,
        permissions: user.role.permissions || [],
        status: 'active' // Embedded roles are considered active
      };
    }

    if (!role) {
      return res.status(401).json({
        success: false,
        error: { message: 'User role not found' }
      });
    }

    // For admin users with pending status, only allow access to specific endpoints
    if (role.type === 'admin' && role.status === 'pending') {
      const allowedPendingPaths = [
        '/api/admin-management/status',
        '/api/auth/logout',
        '/api/auth/me'
      ];

      const isAllowedPath = allowedPendingPaths.some(path =>
        req.path.startsWith(path) || req.path === path
      );

      if (!isAllowedPath) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Admin approval pending',
            code: 'ADMIN_PENDING_APPROVAL',
            status: 'pending'
          }
        });
      }
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
        permissions: role.permissions || [],
        status: role.status || 'active'
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

/**
 * Check if admin user has access to specific company
 */
export const hasCompanyAccess = (companyIdParam = 'companyId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        });
      }

      // Super admins have access to all companies
      if (req.user.role.id === 'superadmin') {
        return next();
      }

      // For admin users, check company assignment
      if (req.user.role.id === 'admin') {
        const companyId = req.params[companyIdParam] || req.body[companyIdParam] || req.query[companyIdParam];

        if (!companyId) {
          return res.status(400).json({
            success: false,
            error: { message: 'Company ID is required' }
          });
        }

        const assignment = await CompanyAssignment.findOne({
          userId: req.user.id,
          subCompanyId: companyId,
          status: 'active'
        });

        if (!assignment) {
          return res.status(403).json({
            success: false,
            error: { message: 'Access denied to this company' }
          });
        }

        // Add company assignment to request for later use
        req.companyAssignment = assignment;
        return next();
      }

      // Investors don't have company-level access
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    } catch (error) {
      console.error('Company access check error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error' }
      });
    }
  };
};

/**
 * Get user's assigned companies (for admin users)
 */
export const getUserCompanies = async (userId) => {
  try {
    const assignments = await CompanyAssignment.find({
      userId,
      status: 'active'
    }).populate('subCompanyId', 'name industry description logo');

    return assignments.map(assignment => assignment.subCompanyId);
  } catch (error) {
    console.error('Get user companies error:', error);
    return [];
  }
};

/**
 * Middleware to add user's assigned companies to request
 */
export const attachUserCompanies = async (req, res, next) => {
  try {
    if (req.user && req.user.role.id === 'admin') {
      req.userCompanies = await getUserCompanies(req.user.id);
    }
    next();
  } catch (error) {
    console.error('Attach user companies error:', error);
    next(); // Continue without companies data
  }
};
