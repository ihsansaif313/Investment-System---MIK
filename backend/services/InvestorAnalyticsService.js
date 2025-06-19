import mongoose from 'mongoose';
import { InvestorInvestment, Investment, Asset, SubCompany, User } from '../models/index.js';
import { AppError } from '../utils/errors.js';

class InvestorAnalyticsService {
  /**
   * Get comprehensive investor analytics
   */
  async getInvestorAnalytics(userId, subCompanyId = null) {
    try {
      // Build match conditions
      const matchConditions = { userId: new mongoose.Types.ObjectId(userId) };
      
      // If subCompanyId is provided, filter by company
      let investmentMatchConditions = {};
      if (subCompanyId) {
        investmentMatchConditions.subCompanyId = new mongoose.Types.ObjectId(subCompanyId);
      }

      // Get investor investments with detailed information
      const investorInvestments = await InvestorInvestment.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: 'investments',
            localField: 'investmentId',
            foreignField: '_id',
            as: 'investment',
            pipeline: investmentMatchConditions.subCompanyId ? [
              { $match: investmentMatchConditions }
            ] : []
          }
        },
        { $unwind: { path: '$investment', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'assets',
            localField: 'investment.assetId',
            foreignField: '_id',
            as: 'asset'
          }
        },
        { $unwind: { path: '$asset', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'subcompanies',
            localField: 'investment.subCompanyId',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } }
      ]);

      // Filter out investments that don't match company filter
      const filteredInvestments = subCompanyId 
        ? investorInvestments.filter(inv => inv.investment && inv.investment.subCompanyId?.toString() === subCompanyId)
        : investorInvestments;

      // Calculate basic metrics
      const totalInvested = filteredInvestments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
      const totalCurrentValue = filteredInvestments.reduce((sum, inv) => {
        const currentValue = this.calculateCurrentValue(inv);
        return sum + currentValue;
      }, 0);
      
      const totalProfit = Math.max(0, totalCurrentValue - totalInvested);
      const totalLoss = Math.max(0, totalInvested - totalCurrentValue);
      const roi = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;

      // Calculate portfolio distribution by asset type
      const portfolioDistribution = this.calculatePortfolioDistribution(filteredInvestments);

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(filteredInvestments);

      // Get investment status counts
      const statusCounts = this.getInvestmentStatusCounts(filteredInvestments);

      // Calculate monthly growth (mock calculation based on recent performance)
      const monthlyGrowth = this.calculateMonthlyGrowth(filteredInvestments);

      return {
        totalInvestments: filteredInvestments.length,
        totalInvestors: 1, // Current user
        totalValue: totalInvested,
        currentValue: totalCurrentValue,
        totalProfit,
        totalLoss,
        roi,
        monthlyGrowth,
        activeInvestments: statusCounts.active,
        pendingInvestments: statusCounts.pending,
        completedInvestments: statusCounts.completed,
        withdrawnInvestments: statusCounts.withdrawn,
        portfolioDistribution,
        performanceMetrics,
        recentTransactions: filteredInvestments.slice(0, 10).map(inv => ({
          id: inv._id,
          investmentName: inv.investment?.name || 'Unknown',
          amount: inv.amountInvested,
          date: inv.investmentDate,
          type: 'investment',
          status: inv.status
        }))
      };
    } catch (error) {
      throw new AppError('Failed to get investor analytics', 500, error);
    }
  }

  /**
   * Get detailed investor investments with enhanced data
   */
  async getInvestorInvestments(userId, subCompanyId = null) {
    try {
      const matchConditions = { userId: new mongoose.Types.ObjectId(userId) };
      
      const pipeline = [
        { $match: matchConditions },
        {
          $lookup: {
            from: 'investments',
            localField: 'investmentId',
            foreignField: '_id',
            as: 'investment'
          }
        },
        { $unwind: { path: '$investment', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'assets',
            localField: 'investment.assetId',
            foreignField: '_id',
            as: 'asset'
          }
        },
        { $unwind: { path: '$asset', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'subcompanies',
            localField: 'investment.subCompanyId',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } }
      ];

      // Add company filter if provided
      if (subCompanyId) {
        pipeline.push({
          $match: {
            'investment.subCompanyId': new mongoose.Types.ObjectId(subCompanyId)
          }
        });
      }

      const investments = await InvestorInvestment.aggregate(pipeline);

      // Enhance each investment with calculated values
      return investments.map(inv => ({
        ...inv,
        currentValue: this.calculateCurrentValue(inv),
        profitLoss: this.calculateProfitLoss(inv),
        roi: this.calculateROI(inv),
        daysInvested: this.calculateDaysInvested(inv.investmentDate),
        annualizedReturn: this.calculateAnnualizedReturn(inv)
      }));
    } catch (error) {
      throw new AppError('Failed to get investor investments', 500, error);
    }
  }

  /**
   * Calculate current value of an investment
   */
  calculateCurrentValue(investment) {
    if (!investment.investment) return investment.amountInvested || 0;
    
    // Use the investment's current value ratio to calculate investor's current value
    const investmentCurrentValue = investment.investment.currentValue || investment.investment.targetAmount || investment.investment.initialAmount;
    const investmentInitialValue = investment.investment.initialAmount || investment.investment.targetAmount;
    
    if (investmentInitialValue > 0) {
      const valueRatio = investmentCurrentValue / investmentInitialValue;
      return (investment.amountInvested || 0) * valueRatio;
    }
    
    return investment.amountInvested || 0;
  }

  /**
   * Calculate profit/loss for an investment
   */
  calculateProfitLoss(investment) {
    const currentValue = this.calculateCurrentValue(investment);
    return currentValue - (investment.amountInvested || 0);
  }

  /**
   * Calculate ROI for an investment
   */
  calculateROI(investment) {
    const amountInvested = investment.amountInvested || 0;
    if (amountInvested === 0) return 0;
    
    const currentValue = this.calculateCurrentValue(investment);
    return ((currentValue - amountInvested) / amountInvested) * 100;
  }

  /**
   * Calculate days invested
   */
  calculateDaysInvested(investmentDate) {
    const now = new Date();
    const invested = new Date(investmentDate);
    return Math.floor((now - invested) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate annualized return
   */
  calculateAnnualizedReturn(investment) {
    const roi = this.calculateROI(investment);
    const daysInvested = this.calculateDaysInvested(investment.investmentDate);
    
    if (daysInvested === 0) return 0;
    return roi * (365 / daysInvested);
  }

  /**
   * Calculate portfolio distribution by asset type
   */
  calculatePortfolioDistribution(investments) {
    const distribution = {};
    const totalValue = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
    
    investments.forEach(inv => {
      const assetType = inv.asset?.type || inv.investment?.asset?.type || 'Other';
      const value = inv.amountInvested || 0;
      
      if (!distribution[assetType]) {
        distribution[assetType] = { value: 0, count: 0 };
      }
      
      distribution[assetType].value += value;
      distribution[assetType].count += 1;
    });
    
    return Object.entries(distribution).map(([assetType, data]) => ({
      assetType,
      value: data.value,
      count: data.count,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
    }));
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(investments) {
    if (investments.length === 0) {
      return {
        bestPerforming: null,
        worstPerforming: null,
        averageROI: 0,
        totalReturn: 0,
        volatility: 0
      };
    }

    const rois = investments.map(inv => this.calculateROI(inv));
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + this.calculateCurrentValue(inv), 0);
    
    return {
      bestPerforming: Math.max(...rois),
      worstPerforming: Math.min(...rois),
      averageROI: rois.reduce((sum, roi) => sum + roi, 0) / rois.length,
      totalReturn: totalCurrentValue - totalInvested,
      volatility: this.calculateVolatility(rois)
    };
  }

  /**
   * Calculate volatility (standard deviation of returns)
   */
  calculateVolatility(returns) {
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  /**
   * Get investment status counts
   */
  getInvestmentStatusCounts(investments) {
    const counts = {
      active: 0,
      pending: 0,
      completed: 0,
      withdrawn: 0
    };
    
    investments.forEach(inv => {
      const status = inv.status || 'active';
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });
    
    return counts;
  }

  /**
   * Calculate monthly growth (simplified calculation)
   */
  calculateMonthlyGrowth(investments) {
    // This is a simplified calculation
    // In a real system, you'd track historical values
    const totalROI = investments.reduce((sum, inv) => sum + this.calculateROI(inv), 0);
    const avgROI = investments.length > 0 ? totalROI / investments.length : 0;
    
    // Estimate monthly growth based on average ROI and time invested
    return avgROI * 0.1; // Simplified calculation
  }

  /**
   * Get investment performance history
   */
  async getInvestmentPerformanceHistory(userId, subCompanyId = null, months = 12) {
    try {
      // This would typically query historical performance data
      // For now, we'll generate mock historical data based on current performance
      const analytics = await this.getInvestorAnalytics(userId, subCompanyId);
      const history = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        // Generate mock historical values based on current performance
        const progressFactor = (months - i) / months;
        const portfolioValue = analytics.totalValue * (1 - (analytics.roi / 100) * (1 - progressFactor));
        
        history.push({
          date: date.toISOString().split('T')[0],
          portfolioValue: Math.max(0, portfolioValue),
          invested: analytics.totalValue,
          returns: portfolioValue - analytics.totalValue,
          roi: analytics.totalValue > 0 ? ((portfolioValue - analytics.totalValue) / analytics.totalValue) * 100 : 0
        });
      }
      
      return history;
    } catch (error) {
      throw new AppError('Failed to get performance history', 500, error);
    }
  }
}

export default new InvestorAnalyticsService();
