/**
 * User Service
 * Handles all user-related business logic and database operations
 */

import { User, Role, ActivityLog } from '../models/index.js';
import { AppError } from '../utils/errors.js';
import { logActivity } from '../utils/logger.js';

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData, createdBy = null) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Create user
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase()
      });

      await user.save();

      // Create role if specified
      if (userData.role) {
        const role = new Role({
          userId: user._id,
          type: userData.role,
          isActive: true
        });
        await role.save();
      }

      // Log activity
      await logActivity({
        userId: createdBy || user._id,
        action: 'USER_CREATED',
        entity: 'user',
        entityId: user._id,
        details: { email: user.email, role: userData.role }
      });

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create user', 500, error);
    }
  }

  /**
   * Get user by ID with role information
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user role
      const role = await Role.findOne({ userId: user._id, isActive: true });
      
      return {
        ...user.toObject(),
        role: role ? { id: role.type, name: role.type, permissions: role.permissions } : null
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get user', 500, error);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user role
      const role = await Role.findOne({ userId: user._id, isActive: true });
      
      return {
        ...user.toObject(),
        role: role ? { id: role.type, name: role.type, permissions: role.permissions } : null
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get user', 500, error);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData, updatedBy = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Store old data for audit
      const oldData = user.toObject();

      // Update user
      Object.assign(user, updateData);
      await user.save();

      // Log activity
      await logActivity({
        userId: updatedBy || userId,
        action: 'USER_UPDATED',
        entity: 'user',
        entityId: userId,
        details: { changes: updateData }
      });

      // Return updated user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update user', 500, error);
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId, deletedBy = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Soft delete by deactivating
      user.isActive = false;
      await user.save();

      // Deactivate role
      await Role.updateOne(
        { userId: userId },
        { isActive: false }
      );

      // Log activity
      await logActivity({
        userId: deletedBy || userId,
        action: 'USER_DELETED',
        entity: 'user',
        entityId: userId,
        details: { email: user.email }
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete user', 500, error);
    }
  }

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(filters = {}, pagination = {}) {
    try {
      const {
        role,
        isActive = true,
        search,
        subCompanyId
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = pagination;

      // Build query
      const query = { isActive };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Get users
      const users = await User.find(query)
        .select('-password')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Get roles for all users
      const userIds = users.map(user => user._id);
      const roles = await Role.find({ userId: { $in: userIds }, isActive: true });
      const roleMap = roles.reduce((map, role) => {
        map[role.userId.toString()] = role;
        return map;
      }, {});

      // Combine users with roles
      const usersWithRoles = users.map(user => {
        const role = roleMap[user._id.toString()];
        return {
          ...user.toObject(),
          role: role ? { id: role.type, name: role.type, permissions: role.permissions } : null
        };
      });

      // Filter by role if specified
      let filteredUsers = usersWithRoles;
      if (role) {
        filteredUsers = usersWithRoles.filter(user => user.role?.id === role);
      }

      // Get total count
      const total = await User.countDocuments(query);

      return {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError('Failed to get users', 500, error);
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if account is locked
      if (user.isLocked()) {
        throw new AppError('Account is temporarily locked due to too many failed login attempts', 423);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new AppError('Invalid credentials', 401);
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Get user role
      const role = await Role.findOne({ userId: user._id, isActive: true });

      // Log activity
      await logActivity({
        userId: user._id,
        action: 'USER_LOGIN',
        entity: 'user',
        entityId: user._id,
        details: { email: user.email }
      });

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return {
        ...userObject,
        role: role ? { id: role.type, name: role.type, permissions: role.permissions } : null
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Authentication failed', 500, error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Log activity
      await logActivity({
        userId: userId,
        action: 'PASSWORD_CHANGED',
        entity: 'user',
        entityId: userId,
        details: { email: user.email }
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to change password', 500, error);
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, newRole, updatedBy = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Deactivate current role
      await Role.updateOne(
        { userId: userId },
        { isActive: false }
      );

      // Create new role
      const role = new Role({
        userId: userId,
        type: newRole,
        isActive: true
      });
      await role.save();

      // Log activity
      await logActivity({
        userId: updatedBy || userId,
        action: 'USER_ROLE_UPDATED',
        entity: 'user',
        entityId: userId,
        details: { email: user.email, newRole }
      });

      return { message: 'User role updated successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update user role', 500, error);
    }
  }
}

export default new UserService();
