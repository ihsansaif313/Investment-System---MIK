/**
 * MongoDB Transaction Utilities
 * Handles complex operations with ACID compliance
 */

import mongoose from 'mongoose';
import { AppError, DatabaseError } from './errors.js';
import logger from './logger.js';

/**
 * Execute operation within a transaction
 */
export const withTransaction = async (operation, options = {}) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      return await operation(session);
    }, {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      ...options
    });

    return result;
  } catch (error) {
    logger.error('Transaction failed:', error);
    throw new DatabaseError('Transaction failed', error);
  } finally {
    await session.endSession();
  }
};

/**
 * Investment Transaction Operations
 */
export const investmentTransactions = {
  /**
   * Create investment with all related data
   */
  createInvestment: async (investmentData, createdBy) => {
    return withTransaction(async (session) => {
      const { Investment, Asset, SubCompany, ActivityLog } = mongoose.models;

      // Verify sub-company exists
      const subCompany = await SubCompany.findById(investmentData.subCompanyId).session(session);
      if (!subCompany) {
        throw new AppError('Sub-company not found', 404);
      }

      // Verify asset exists
      const asset = await Asset.findById(investmentData.assetId).session(session);
      if (!asset) {
        throw new AppError('Asset not found', 404);
      }

      // Create investment
      const investment = new Investment({
        ...investmentData,
        createdBy,
        totalInvested: 0,
        totalInvestors: 0,
        currentValue: 0
      });

      await investment.save({ session });

      // Log activity
      const activityLog = new ActivityLog({
        userId: createdBy,
        action: 'INVESTMENT_CREATED',
        entity: 'investment',
        entityId: investment._id,
        details: {
          name: investment.name,
          targetAmount: investment.targetAmount,
          subCompanyId: investment.subCompanyId
        }
      });

      await activityLog.save({ session });

      return investment;
    });
  },

  /**
   * Process investor investment with all updates
   */
  processInvestorInvestment: async (investmentId, userId, amount, approvedBy) => {
    return withTransaction(async (session) => {
      const { Investment, InvestorInvestment, User, ActivityLog } = mongoose.models;

      // Get investment with lock
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Verify investment can accept investors
      if (!investment.canAcceptInvestors()) {
        throw new AppError('Investment is not accepting new investors', 400);
      }

      // Validate investment amount
      if (amount < investment.minInvestment) {
        throw new AppError(`Minimum investment amount is ${investment.minInvestment}`, 400);
      }

      if (investment.maxInvestment && amount > investment.maxInvestment) {
        throw new AppError(`Maximum investment amount is ${investment.maxInvestment}`, 400);
      }

      // Check if user already invested
      const existingInvestment = await InvestorInvestment.findOne({
        userId,
        investmentId
      }).session(session);

      if (existingInvestment) {
        throw new AppError('User has already invested in this investment', 400);
      }

      // Create investor investment
      const investorInvestment = new InvestorInvestment({
        userId,
        investmentId,
        amountInvested: amount,
        currentValue: amount,
        status: 'approved',
        approvedBy,
        approvedAt: new Date()
      });

      await investorInvestment.save({ session });

      // Update investment totals
      investment.totalInvested += amount;
      investment.totalInvestors += 1;
      investment.currentValue += amount; // Initially same as invested amount

      await investment.save({ session });

      // Log activity for investor
      const investorActivityLog = new ActivityLog({
        userId,
        action: 'INVESTMENT_MADE',
        entity: 'investment',
        entityId: investmentId,
        details: {
          amount,
          investmentName: investment.name
        }
      });

      await investorActivityLog.save({ session });

      // Log activity for approver
      const approverActivityLog = new ActivityLog({
        userId: approvedBy,
        action: 'INVESTMENT_APPROVED',
        entity: 'investment',
        entityId: investmentId,
        details: {
          amount,
          investorId: userId,
          investmentName: investment.name
        }
      });

      await approverActivityLog.save({ session });

      return {
        investorInvestment,
        investment
      };
    });
  },

  /**
   * Update investment performance with profit/loss calculation
   */
  updateInvestmentPerformance: async (investmentId, newCurrentValue, updatedBy) => {
    return withTransaction(async (session) => {
      const { Investment, InvestorInvestment, ProfitLoss, ActivityLog } = mongoose.models;

      // Get investment
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      const oldCurrentValue = investment.currentValue;
      const valueChange = newCurrentValue - oldCurrentValue;

      // Update investment current value
      investment.currentValue = newCurrentValue;
      investment.actualROI = investment.totalInvested > 0 
        ? ((newCurrentValue - investment.totalInvested) / investment.totalInvested) * 100 
        : 0;

      await investment.save({ session });

      // Get all investor investments for this investment
      const investorInvestments = await InvestorInvestment.find({
        investmentId,
        status: { $in: ['approved', 'active'] }
      }).session(session);

      // Update each investor's current value proportionally
      for (const investorInvestment of investorInvestments) {
        const proportion = investorInvestment.amountInvested / investment.totalInvested;
        const oldInvestorValue = investorInvestment.currentValue;
        const newInvestorValue = newCurrentValue * proportion;
        const investorValueChange = newInvestorValue - oldInvestorValue;

        // Update investor investment current value
        investorInvestment.currentValue = newInvestorValue;
        await investorInvestment.save({ session });

        // Create profit/loss record if there's a significant change
        if (Math.abs(investorValueChange) > 0.01) {
          const profitLoss = new ProfitLoss({
            investorInvestmentId: investorInvestment._id,
            userId: investorInvestment.userId,
            investmentId: investmentId,
            type: investorValueChange > 0 ? 'profit' : 'loss',
            amount: Math.abs(investorValueChange),
            percentage: (investorValueChange / investorInvestment.amountInvested) * 100,
            date: new Date(),
            description: 'Investment value update',
            calculatedBy: 'system'
          });

          await profitLoss.save({ session });
        }
      }

      // Log activity
      const activityLog = new ActivityLog({
        userId: updatedBy,
        action: 'INVESTMENT_PERFORMANCE_UPDATED',
        entity: 'investment',
        entityId: investmentId,
        details: {
          oldValue: oldCurrentValue,
          newValue: newCurrentValue,
          change: valueChange,
          changePercent: oldCurrentValue > 0 ? (valueChange / oldCurrentValue) * 100 : 0
        }
      });

      await activityLog.save({ session });

      return {
        investment,
        valueChange,
        affectedInvestors: investorInvestments.length
      };
    });
  },

  /**
   * Withdraw investment with all related updates
   */
  withdrawInvestment: async (investorInvestmentId, withdrawnBy) => {
    return withTransaction(async (session) => {
      const { Investment, InvestorInvestment, ProfitLoss, ActivityLog } = mongoose.models;

      // Get investor investment
      const investorInvestment = await InvestorInvestment.findById(investorInvestmentId).session(session);
      if (!investorInvestment) {
        throw new AppError('Investor investment not found', 404);
      }

      if (investorInvestment.status === 'withdrawn') {
        throw new AppError('Investment already withdrawn', 400);
      }

      // Get investment
      const investment = await Investment.findById(investorInvestment.investmentId).session(session);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Calculate final profit/loss
      const finalProfitLoss = investorInvestment.currentValue - investorInvestment.amountInvested;

      // Create final profit/loss record
      if (Math.abs(finalProfitLoss) > 0.01) {
        const profitLoss = new ProfitLoss({
          investorInvestmentId: investorInvestment._id,
          userId: investorInvestment.userId,
          investmentId: investment._id,
          type: 'withdrawal',
          amount: Math.abs(finalProfitLoss),
          percentage: (finalProfitLoss / investorInvestment.amountInvested) * 100,
          date: new Date(),
          description: 'Investment withdrawal',
          calculatedBy: 'system'
        });

        await profitLoss.save({ session });
      }

      // Update investor investment status
      investorInvestment.status = 'withdrawn';
      investorInvestment.withdrawnAt = new Date();
      await investorInvestment.save({ session });

      // Update investment totals
      investment.totalInvested -= investorInvestment.amountInvested;
      investment.currentValue -= investorInvestment.currentValue;
      investment.totalInvestors -= 1;

      // Recalculate ROI
      investment.actualROI = investment.totalInvested > 0 
        ? ((investment.currentValue - investment.totalInvested) / investment.totalInvested) * 100 
        : 0;

      await investment.save({ session });

      // Log activity
      const activityLog = new ActivityLog({
        userId: withdrawnBy,
        action: 'INVESTMENT_WITHDRAWN',
        entity: 'investment',
        entityId: investment._id,
        details: {
          investorId: investorInvestment.userId,
          amountInvested: investorInvestment.amountInvested,
          finalValue: investorInvestment.currentValue,
          profitLoss: finalProfitLoss
        }
      });

      await activityLog.save({ session });

      return {
        investorInvestment,
        investment,
        finalProfitLoss
      };
    });
  }
};

/**
 * User Transaction Operations
 */
export const userTransactions = {
  /**
   * Create user with role assignment
   */
  createUserWithRole: async (userData, roleType, createdBy) => {
    return withTransaction(async (session) => {
      const { User, Role, ActivityLog } = mongoose.models;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: userData.email.toLowerCase() 
      }).session(session);

      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Create user
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase()
      });

      await user.save({ session });

      // Create role
      const role = new Role({
        userId: user._id,
        type: roleType,
        isActive: true
      });

      await role.save({ session });

      // Log activity
      const activityLog = new ActivityLog({
        userId: createdBy || user._id,
        action: 'USER_CREATED',
        entity: 'user',
        entityId: user._id,
        details: {
          email: user.email,
          role: roleType
        }
      });

      await activityLog.save({ session });

      return { user, role };
    });
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId, newRoleType, updatedBy) => {
    return withTransaction(async (session) => {
      const { User, Role, ActivityLog } = mongoose.models;

      // Get user
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get current role
      const currentRole = await Role.findOne({ userId, isActive: true }).session(session);
      const oldRoleType = currentRole?.type;

      // Deactivate current role
      if (currentRole) {
        currentRole.isActive = false;
        await currentRole.save({ session });
      }

      // Create new role
      const newRole = new Role({
        userId,
        type: newRoleType,
        isActive: true
      });

      await newRole.save({ session });

      // Log activity
      const activityLog = new ActivityLog({
        userId: updatedBy,
        action: 'USER_ROLE_UPDATED',
        entity: 'user',
        entityId: userId,
        details: {
          email: user.email,
          oldRole: oldRoleType,
          newRole: newRoleType
        }
      });

      await activityLog.save({ session });

      return { user, oldRole: currentRole, newRole };
    });
  }
};

/**
 * Data consistency validation
 */
export const validateDataConsistency = async () => {
  const issues = [];

  try {
    // Check investment totals consistency
    const { Investment, InvestorInvestment } = mongoose.models;
    
    const investments = await Investment.find({ isActive: true });
    
    for (const investment of investments) {
      const investorInvestments = await InvestorInvestment.find({
        investmentId: investment._id,
        status: { $in: ['approved', 'active'] }
      });

      const calculatedTotalInvested = investorInvestments.reduce(
        (sum, ii) => sum + ii.amountInvested, 0
      );

      const calculatedTotalInvestors = investorInvestments.length;

      if (Math.abs(investment.totalInvested - calculatedTotalInvested) > 0.01) {
        issues.push({
          type: 'investment_total_mismatch',
          investmentId: investment._id,
          recorded: investment.totalInvested,
          calculated: calculatedTotalInvested
        });
      }

      if (investment.totalInvestors !== calculatedTotalInvestors) {
        issues.push({
          type: 'investor_count_mismatch',
          investmentId: investment._id,
          recorded: investment.totalInvestors,
          calculated: calculatedTotalInvestors
        });
      }
    }

    return {
      isConsistent: issues.length === 0,
      issues
    };
  } catch (error) {
    logger.error('Data consistency validation failed:', error);
    throw new DatabaseError('Data consistency validation failed', error);
  }
};

/**
 * Fix data consistency issues
 */
export const fixDataConsistency = async () => {
  return withTransaction(async (session) => {
    const { Investment, InvestorInvestment } = mongoose.models;
    const fixes = [];

    const investments = await Investment.find({ isActive: true }).session(session);
    
    for (const investment of investments) {
      const investorInvestments = await InvestorInvestment.find({
        investmentId: investment._id,
        status: { $in: ['approved', 'active'] }
      }).session(session);

      const calculatedTotalInvested = investorInvestments.reduce(
        (sum, ii) => sum + ii.amountInvested, 0
      );

      const calculatedTotalInvestors = investorInvestments.length;

      let updated = false;

      if (Math.abs(investment.totalInvested - calculatedTotalInvested) > 0.01) {
        investment.totalInvested = calculatedTotalInvested;
        updated = true;
        fixes.push({
          type: 'total_invested_fixed',
          investmentId: investment._id,
          newValue: calculatedTotalInvested
        });
      }

      if (investment.totalInvestors !== calculatedTotalInvestors) {
        investment.totalInvestors = calculatedTotalInvestors;
        updated = true;
        fixes.push({
          type: 'total_investors_fixed',
          investmentId: investment._id,
          newValue: calculatedTotalInvestors
        });
      }

      if (updated) {
        await investment.save({ session });
      }
    }

    return fixes;
  });
};

export default {
  withTransaction,
  investmentTransactions,
  userTransactions,
  validateDataConsistency,
  fixDataConsistency
};
