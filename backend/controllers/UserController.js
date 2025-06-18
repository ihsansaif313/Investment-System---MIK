/**
 * User Controller
 * Handles HTTP requests for user-related operations
 */

import UserService from '../services/UserService.js';
import { asyncHandler, successResponse, errorResponse } from '../utils/errors.js';
import { validationResult } from 'express-validator';

class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  createUser = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const user = await UserService.createUser(req.body, req.user?.id);
    successResponse(res, user, 'User created successfully', 201);
  });

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    successResponse(res, user, 'User retrieved successfully');
  });

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.user.id);
    successResponse(res, user, 'Profile retrieved successfully');
  });

  /**
   * Update user
   * PUT /api/users/:id
   */
  updateUser = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const user = await UserService.updateUser(req.params.id, req.body, req.user?.id);
    successResponse(res, user, 'User updated successfully');
  });

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const user = await UserService.updateUser(req.user.id, req.body, req.user.id);
    successResponse(res, user, 'Profile updated successfully');
  });

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  deleteUser = asyncHandler(async (req, res) => {
    const result = await UserService.deleteUser(req.params.id, req.user?.id);
    successResponse(res, result, 'User deleted successfully');
  });

  /**
   * Get all users with filtering and pagination
   * GET /api/users
   */
  getUsers = asyncHandler(async (req, res) => {
    const filters = {
      role: req.query.role,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true,
      search: req.query.search,
      subCompanyId: req.query.subCompanyId
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await UserService.getUsers(filters, pagination);
    successResponse(res, result, 'Users retrieved successfully');
  });

  /**
   * Change password
   * POST /api/users/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { currentPassword, newPassword } = req.body;
    const result = await UserService.changePassword(req.user.id, currentPassword, newPassword);
    successResponse(res, result, 'Password changed successfully');
  });

  /**
   * Update user role
   * PUT /api/users/:id/role
   */
  updateUserRole = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { role } = req.body;
    const result = await UserService.updateUserRole(req.params.id, role, req.user.id);
    successResponse(res, result, 'User role updated successfully');
  });

  /**
   * Get users by role
   * GET /api/users/role/:role
   */
  getUsersByRole = asyncHandler(async (req, res) => {
    const filters = {
      role: req.params.role,
      isActive: true,
      search: req.query.search
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await UserService.getUsers(filters, pagination);
    successResponse(res, result, `${req.params.role} users retrieved successfully`);
  });

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  getUserStats = asyncHandler(async (req, res) => {
    // This would be implemented based on specific requirements
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      usersByRole: {
        superadmin: 0,
        admin: 0,
        investor: 0
      },
      newUsersThisMonth: 0,
      lastLoginStats: {}
    };

    successResponse(res, stats, 'User statistics retrieved successfully');
  });

  /**
   * Activate user
   * POST /api/users/:id/activate
   */
  activateUser = asyncHandler(async (req, res) => {
    const result = await UserService.updateUser(
      req.params.id, 
      { isActive: true }, 
      req.user.id
    );
    successResponse(res, result, 'User activated successfully');
  });

  /**
   * Deactivate user
   * POST /api/users/:id/deactivate
   */
  deactivateUser = asyncHandler(async (req, res) => {
    const result = await UserService.updateUser(
      req.params.id, 
      { isActive: false }, 
      req.user.id
    );
    successResponse(res, result, 'User deactivated successfully');
  });

  /**
   * Get user activity logs
   * GET /api/users/:id/activity
   */
  getUserActivity = asyncHandler(async (req, res) => {
    // This would fetch activity logs for the specific user
    const activities = [];
    successResponse(res, activities, 'User activity retrieved successfully');
  });

  /**
   * Search users
   * GET /api/users/search
   */
  searchUsers = asyncHandler(async (req, res) => {
    const { q: search, role, limit = 10 } = req.query;

    if (!search) {
      return errorResponse(res, 'Search query is required', 400);
    }

    const filters = {
      search,
      role,
      isActive: true
    };

    const pagination = {
      page: 1,
      limit: parseInt(limit),
      sortBy: 'firstName',
      sortOrder: 'asc'
    };

    const result = await UserService.getUsers(filters, pagination);
    successResponse(res, result.users, 'Search results retrieved successfully');
  });

  /**
   * Bulk update users
   * PUT /api/users/bulk
   */
  bulkUpdateUsers = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { userIds, updateData } = req.body;
    const results = [];

    for (const userId of userIds) {
      try {
        const user = await UserService.updateUser(userId, updateData, req.user.id);
        results.push({ userId, success: true, user });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    successResponse(res, results, 'Bulk update completed');
  });
}

export default new UserController();
