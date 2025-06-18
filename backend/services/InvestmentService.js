/**
 * Investment Service
 * Handles all investment-related business logic and database operations
 */

import { Investment, InvestorInvestment, Asset, SubCompany, ProfitLoss } from '../models/index.js';
import { AppError } from '../utils/errors.js';
import { logActivity } from '../utils/logger.js';

class InvestmentService {
  /**
   * Create a new investment
   */
  async createInvestment(investmentData, createdBy) {
    try {
      // Validate sub-company exists
      const subCompany = await SubCompany.findById(investmentData.subCompanyId);
      if (!subCompany) {
        throw new AppError('Sub-company not found', 404);
      }

      // Validate asset exists
      const asset = await Asset.findById(investmentData.assetId);
      if (!asset) {
        throw new AppError('Asset not found', 404);
      }

      // Create investment
      const investment = new Investment({
        ...investmentData,
        createdBy
      });

      await investment.save();

      // Log activity
      await logActivity({
        userId: createdBy,
        action: 'INVESTMENT_CREATED',
        entity: 'investment',
        entityId: investment._id,
        details: { name: investment.name, targetAmount: investment.targetAmount }
      });

      return await this.getInvestmentById(investment._id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create investment', 500, error);
    }
  }

  /**
   * Get investment by ID with related data
   */
  async getInvestmentById(investmentId) {
    try {
      const investment = await Investment.findById(investmentId)
        .populate('subCompanyId', 'name')
        .populate('assetId', 'name symbol type currentPrice')
        .populate('createdBy', 'firstName lastName email');

      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Get investor investments
      const investorInvestments = await InvestorInvestment.find({ 
        investmentId: investment._id 
      }).populate('userId', 'firstName lastName email');

      return {
        ...investment.toObject(),
        investorInvestments
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get investment', 500, error);
    }
  }

  /**
   * Update investment
   */
  async updateInvestment(investmentId, updateData, updatedBy) {
    try {
      const investment = await Investment.findById(investmentId);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Store old data for audit
      const oldData = investment.toObject();

      // Update investment
      Object.assign(investment, updateData);
      await investment.save();

      // Log activity
      await logActivity({
        userId: updatedBy,
        action: 'INVESTMENT_UPDATED',
        entity: 'investment',
        entityId: investmentId,
        details: { changes: updateData }
      });

      return await this.getInvestmentById(investmentId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update investment', 500, error);
    }
  }

  /**
   * Delete investment
   */
  async deleteInvestment(investmentId, deletedBy) {
    try {
      const investment = await Investment.findById(investmentId);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Check if there are active investor investments
      const activeInvestorInvestments = await InvestorInvestment.countDocuments({
        investmentId: investmentId,
        status: { $in: ['approved', 'active'] }
      });

      if (activeInvestorInvestments > 0) {
        throw new AppError('Cannot delete investment with active investor investments', 400);
      }

      // Soft delete
      investment.isActive = false;
      await investment.save();

      // Log activity
      await logActivity({
        userId: deletedBy,
        action: 'INVESTMENT_DELETED',
        entity: 'investment',
        entityId: investmentId,
        details: { name: investment.name }
      });

      return { message: 'Investment deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete investment', 500, error);
    }
  }

  /**
   * Get investments with filtering and pagination
   */
  async getInvestments(filters = {}, pagination = {}) {
    try {
      const {
        subCompanyId,
        status,
        riskLevel,
        assetType,
        search,
        isActive = true
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = pagination;

      // Build query
      const query = { isActive };

      if (subCompanyId) {
        query.subCompanyId = subCompanyId;
      }

      if (status) {
        query.status = status;
      }

      if (riskLevel) {
        query.riskLevel = riskLevel;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Get investments with populated data
      const investments = await Investment.find(query)
        .populate('subCompanyId', 'name')
        .populate('assetId', 'name symbol type currentPrice')
        .populate('createdBy', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Get investor counts for each investment
      const investmentIds = investments.map(inv => inv._id);
      const investorCounts = await InvestorInvestment.aggregate([
        { $match: { investmentId: { $in: investmentIds } } },
        { $group: { _id: '$investmentId', count: { $sum: 1 }, totalInvested: { $sum: '$amountInvested' } } }
      ]);

      const countMap = investorCounts.reduce((map, item) => {
        map[item._id.toString()] = item;
        return map;
      }, {});

      // Add investor data to investments
      const investmentsWithData = investments.map(investment => {
        const investorData = countMap[investment._id.toString()] || { count: 0, totalInvested: 0 };
        return {
          ...investment.toObject(),
          totalInvestors: investorData.count,
          totalInvested: investorData.totalInvested
        };
      });

      // Get total count
      const total = await Investment.countDocuments(query);

      return {
        investments: investmentsWithData,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError('Failed to get investments', 500, error);
    }
  }

  /**
   * Invest in an investment
   */
  async investInInvestment(investmentId, userId, amount) {
    try {
      const investment = await Investment.findById(investmentId);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Check if investment is active and accepting investments
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
      });

      if (existingInvestment) {
        throw new AppError('User has already invested in this investment', 400);
      }

      // Create investor investment
      const investorInvestment = new InvestorInvestment({
        userId,
        investmentId,
        amountInvested: amount,
        currentValue: amount, // Initially same as invested amount
        status: 'pending'
      });

      await investorInvestment.save();

      // Log activity
      await logActivity({
        userId,
        action: 'INVESTMENT_REQUEST_CREATED',
        entity: 'investment',
        entityId: investmentId,
        details: { amount, investmentName: investment.name }
      });

      return await InvestorInvestment.findById(investorInvestment._id)
        .populate('investmentId', 'name')
        .populate('userId', 'firstName lastName email');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create investment request', 500, error);
    }
  }

  /**
   * Approve investor investment
   */
  async approveInvestorInvestment(investorInvestmentId, approvedBy) {
    try {
      const investorInvestment = await InvestorInvestment.findById(investorInvestmentId);
      if (!investorInvestment) {
        throw new AppError('Investor investment not found', 404);
      }

      if (investorInvestment.status !== 'pending') {
        throw new AppError('Investment request is not pending', 400);
      }

      // Update status
      investorInvestment.status = 'approved';
      investorInvestment.approvedBy = approvedBy;
      investorInvestment.approvedAt = new Date();
      await investorInvestment.save();

      // Update investment totals
      const investment = await Investment.findById(investorInvestment.investmentId);
      investment.totalInvested += investorInvestment.amountInvested;
      investment.totalInvestors += 1;
      await investment.save();

      // Log activity
      await logActivity({
        userId: approvedBy,
        action: 'INVESTMENT_REQUEST_APPROVED',
        entity: 'investment',
        entityId: investorInvestment.investmentId,
        details: { 
          amount: investorInvestment.amountInvested,
          investorId: investorInvestment.userId
        }
      });

      return await InvestorInvestment.findById(investorInvestmentId)
        .populate('investmentId', 'name')
        .populate('userId', 'firstName lastName email');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to approve investment request', 500, error);
    }
  }

  /**
   * Calculate investment performance
   */
  async calculateInvestmentPerformance(investmentId) {
    try {
      const investment = await Investment.findById(investmentId);
      if (!investment) {
        throw new AppError('Investment not found', 404);
      }

      // Get all investor investments
      const investorInvestments = await InvestorInvestment.find({
        investmentId,
        status: { $in: ['approved', 'active'] }
      });

      // Calculate totals
      const totalInvested = investorInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
      const totalCurrentValue = investorInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
      const totalROI = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;

      // Update investment
      investment.totalInvested = totalInvested;
      investment.currentValue = totalCurrentValue;
      investment.actualROI = totalROI;
      investment.totalInvestors = investorInvestments.length;
      await investment.save();

      return {
        totalInvested,
        currentValue: totalCurrentValue,
        roi: totalROI,
        totalInvestors: investorInvestments.length,
        profitLoss: totalCurrentValue - totalInvested
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to calculate investment performance', 500, error);
    }
  }

  /**
   * Get investment analytics
   */
  async getInvestmentAnalytics(subCompanyId = null) {
    try {
      const matchStage = { isActive: true };
      if (subCompanyId) {
        matchStage.subCompanyId = subCompanyId;
      }

      const analytics = await Investment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalInvestments: { $sum: 1 },
            totalTargetAmount: { $sum: '$targetAmount' },
            totalCurrentValue: { $sum: '$currentValue' },
            totalInvested: { $sum: '$totalInvested' },
            avgROI: { $avg: '$actualROI' },
            activeInvestments: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            closedInvestments: {
              $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
            }
          }
        }
      ]);

      const result = analytics[0] || {
        totalInvestments: 0,
        totalTargetAmount: 0,
        totalCurrentValue: 0,
        totalInvested: 0,
        avgROI: 0,
        activeInvestments: 0,
        closedInvestments: 0
      };

      // Calculate additional metrics
      result.totalProfitLoss = result.totalCurrentValue - result.totalInvested;
      result.successRate = result.totalInvestments > 0 
        ? (result.closedInvestments / result.totalInvestments) * 100 
        : 0;

      return result;
    } catch (error) {
      throw new AppError('Failed to get investment analytics', 500, error);
    }
  }
}

export default new InvestmentService();
