/**
 * User Service Unit Tests
 * Tests for user-related business logic
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import UserService from '../../services/UserService.js';
import { setupTestDB, cleanupTestDB, clearDatabase, createTestUsers } from '../setup.js';
import { AppError } from '../../utils/errors.js';

describe('UserService', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'TestPassword123!',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Test Street, Test City, TC 12345',
        role: 'investor'
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.password).toBeUndefined(); // Password should not be returned
      expect(user.isActive).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'TestPassword123!',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Test Street, Test City, TC 12345',
        role: 'investor'
      };

      // Create first user
      await UserService.createUser(userData);

      // Try to create second user with same email
      await expect(UserService.createUser(userData))
        .rejects
        .toThrow(AppError);
    });

    it('should normalize email to lowercase', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN.DOE@TEST.COM',
        password: 'TestPassword123!',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Test Street, Test City, TC 12345',
        role: 'investor'
      };

      const user = await UserService.createUser(userData);

      expect(user.email).toBe('john.doe@test.com');
    });
  });

  describe('getUserById', () => {
    it('should return user with role information', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;

      const user = await UserService.getUserById(userId);

      expect(user).toBeDefined();
      expect(user.id).toBe(userId.toString());
      expect(user.role).toBeDefined();
      expect(user.role.id).toBe('investor');
      expect(user.password).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(UserService.getUserById(fakeId))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const testUsers = await createTestUsers();
      const email = testUsers.investor.user.email;

      const user = await UserService.getUserByEmail(email);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.role).toBeDefined();
    });

    it('should throw error for non-existent email', async () => {
      await expect(UserService.getUserByEmail('nonexistent@test.com'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const updatedUser = await UserService.updateUser(userId, updateData);

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { firstName: 'Updated' };

      await expect(UserService.updateUser(fakeId, updateData))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;

      const result = await UserService.deleteUser(userId);

      expect(result.message).toBe('User deleted successfully');

      // Verify user is deactivated
      const user = await UserService.getUserById(userId);
      expect(user.isActive).toBe(false);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      await createTestUsers();

      const result = await UserService.getUsers({}, { page: 1, limit: 10 });

      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter users by role', async () => {
      await createTestUsers();

      const result = await UserService.getUsers({ role: 'investor' });

      expect(result.users.length).toBe(1);
      expect(result.users[0].role.id).toBe('investor');
    });

    it('should search users by name and email', async () => {
      await createTestUsers();

      const result = await UserService.getUsers({ search: 'investor' });

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users[0].email).toContain('investor');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const testUsers = await createTestUsers();
      const email = testUsers.investor.user.email;

      const user = await UserService.authenticateUser(email, 'testpassword123');

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.role).toBeDefined();
    });

    it('should throw error for incorrect password', async () => {
      const testUsers = await createTestUsers();
      const email = testUsers.investor.user.email;

      await expect(UserService.authenticateUser(email, 'wrongpassword'))
        .rejects
        .toThrow(AppError);
    });

    it('should throw error for non-existent user', async () => {
      await expect(UserService.authenticateUser('nonexistent@test.com', 'password'))
        .rejects
        .toThrow(AppError);
    });

    it('should throw error for inactive user', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;
      const email = testUsers.investor.user.email;

      // Deactivate user
      await UserService.updateUser(userId, { isActive: false });

      await expect(UserService.authenticateUser(email, 'testpassword123'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;

      const result = await UserService.changePassword(
        userId,
        'testpassword123',
        'NewPassword123!'
      );

      expect(result.message).toBe('Password changed successfully');

      // Verify new password works
      const user = await UserService.authenticateUser(
        testUsers.investor.user.email,
        'NewPassword123!'
      );
      expect(user).toBeDefined();
    });

    it('should throw error for incorrect current password', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;

      await expect(UserService.changePassword(
        userId,
        'wrongpassword',
        'NewPassword123!'
      )).rejects.toThrow(AppError);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const testUsers = await createTestUsers();
      const userId = testUsers.investor.user._id;

      const result = await UserService.updateUserRole(userId, 'admin');

      expect(result.message).toBe('User role updated successfully');

      // Verify role was updated
      const user = await UserService.getUserById(userId);
      expect(user.role.id).toBe('admin');
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(UserService.updateUserRole(fakeId, 'admin'))
        .rejects
        .toThrow(AppError);
    });
  });
});
