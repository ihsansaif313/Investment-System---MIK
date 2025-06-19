import { validationResult } from 'express-validator';
import InvestorAnalyticsService from '../services/InvestorAnalyticsService.js';
import { asyncHandler, successResponse, errorResponse } from '../utils/errors.js';

class InvestorAnalyticsController {
  /**
   * Get comprehensive investor analytics
   * GET /api/analytics/investor
   */
  getInvestorAnalytics = asyncHandler(async (req, res) => {
    const { userId, subCompanyId } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const analytics = await InvestorAnalyticsService.getInvestorAnalytics(targetUserId, subCompanyId);
    successResponse(res, analytics, 'Investor analytics retrieved successfully');
  });

  /**
   * Get detailed investor investments
   * GET /api/investor-investments
   */
  getInvestorInvestments = asyncHandler(async (req, res) => {
    const { userId, subCompanyId } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const investments = await InvestorAnalyticsService.getInvestorInvestments(targetUserId, subCompanyId);
    successResponse(res, investments, 'Investor investments retrieved successfully');
  });

  /**
   * Get investment performance history
   * GET /api/analytics/investor/performance-history
   */
  getPerformanceHistory = asyncHandler(async (req, res) => {
    const { userId, subCompanyId, months = 12 } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const history = await InvestorAnalyticsService.getInvestmentPerformanceHistory(
      targetUserId, 
      subCompanyId, 
      parseInt(months)
    );
    successResponse(res, history, 'Performance history retrieved successfully');
  });

  /**
   * Get portfolio summary for investor
   * GET /api/analytics/investor/portfolio-summary
   */
  getPortfolioSummary = asyncHandler(async (req, res) => {
    const { userId, subCompanyId } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const analytics = await InvestorAnalyticsService.getInvestorAnalytics(targetUserId, subCompanyId);
    
    // Return simplified summary
    const summary = {
      totalInvested: analytics.totalValue,
      currentValue: analytics.currentValue,
      totalReturn: analytics.totalProfit - analytics.totalLoss,
      roi: analytics.roi,
      monthlyGrowth: analytics.monthlyGrowth,
      investmentCount: analytics.totalInvestments,
      portfolioDistribution: analytics.portfolioDistribution,
      performanceMetrics: analytics.performanceMetrics
    };

    successResponse(res, summary, 'Portfolio summary retrieved successfully');
  });

  /**
   * Get investment comparison data
   * GET /api/analytics/investor/investment-comparison
   */
  getInvestmentComparison = asyncHandler(async (req, res) => {
    const { userId, subCompanyId } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const investments = await InvestorAnalyticsService.getInvestorInvestments(targetUserId, subCompanyId);
    
    // Create comparison data
    const comparison = investments.map(inv => ({
      id: inv._id,
      name: inv.investment?.name || 'Unknown',
      amountInvested: inv.amountInvested,
      currentValue: inv.currentValue,
      roi: inv.roi,
      profitLoss: inv.profitLoss,
      riskLevel: inv.investment?.riskLevel,
      assetType: inv.asset?.type || inv.investment?.asset?.type,
      daysInvested: inv.daysInvested,
      annualizedReturn: inv.annualizedReturn,
      status: inv.status
    }));

    successResponse(res, comparison, 'Investment comparison data retrieved successfully');
  });

  /**
   * Get risk analysis for investor portfolio
   * GET /api/analytics/investor/risk-analysis
   */
  getRiskAnalysis = asyncHandler(async (req, res) => {
    const { userId, subCompanyId } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const investments = await InvestorAnalyticsService.getInvestorInvestments(targetUserId, subCompanyId);
    
    // Calculate risk distribution
    const riskDistribution = {
      Low: { count: 0, value: 0, percentage: 0 },
      Medium: { count: 0, value: 0, percentage: 0 },
      High: { count: 0, value: 0, percentage: 0 }
    };
    
    const totalValue = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
    
    investments.forEach(inv => {
      const riskLevel = inv.investment?.riskLevel || 'Medium';
      const value = inv.amountInvested || 0;
      
      if (riskDistribution[riskLevel]) {
        riskDistribution[riskLevel].count++;
        riskDistribution[riskLevel].value += value;
      }
    });
    
    // Calculate percentages
    Object.keys(riskDistribution).forEach(risk => {
      riskDistribution[risk].percentage = totalValue > 0 
        ? (riskDistribution[risk].value / totalValue) * 100 
        : 0;
    });
    
    // Calculate portfolio risk score (weighted average)
    const riskWeights = { Low: 1, Medium: 2, High: 3 };
    let weightedRiskSum = 0;
    let totalWeight = 0;
    
    Object.entries(riskDistribution).forEach(([risk, data]) => {
      const weight = riskWeights[risk] * data.value;
      weightedRiskSum += weight;
      totalWeight += data.value;
    });
    
    const portfolioRiskScore = totalWeight > 0 ? weightedRiskSum / totalWeight : 0;
    
    const riskAnalysis = {
      riskDistribution,
      portfolioRiskScore,
      riskLevel: portfolioRiskScore <= 1.5 ? 'Low' : portfolioRiskScore <= 2.5 ? 'Medium' : 'High',
      recommendations: this.generateRiskRecommendations(riskDistribution, portfolioRiskScore)
    };

    successResponse(res, riskAnalysis, 'Risk analysis retrieved successfully');
  });

  /**
   * Generate risk recommendations based on portfolio analysis
   */
  generateRiskRecommendations(riskDistribution, portfolioRiskScore) {
    const recommendations = [];
    
    if (portfolioRiskScore > 2.5) {
      recommendations.push({
        type: 'warning',
        message: 'Your portfolio has high risk concentration. Consider diversifying with lower-risk investments.',
        priority: 'high'
      });
    }
    
    if (riskDistribution.Low.percentage < 20) {
      recommendations.push({
        type: 'suggestion',
        message: 'Consider adding more low-risk investments to balance your portfolio.',
        priority: 'medium'
      });
    }
    
    if (riskDistribution.High.percentage > 50) {
      recommendations.push({
        type: 'warning',
        message: 'High-risk investments make up more than 50% of your portfolio. This may lead to significant volatility.',
        priority: 'high'
      });
    }
    
    if (Object.values(riskDistribution).every(risk => risk.count <= 1)) {
      recommendations.push({
        type: 'suggestion',
        message: 'Consider diversifying across more investments to reduce concentration risk.',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Get benchmark comparison
   * GET /api/analytics/investor/benchmark-comparison
   */
  getBenchmarkComparison = asyncHandler(async (req, res) => {
    const { userId, subCompanyId } = req.query;
    
    // Use authenticated user's ID if not provided
    const targetUserId = userId || req.user.id;
    
    // Ensure user can only access their own data (unless they're admin/superadmin)
    if (req.user.role.type !== 'superadmin' && req.user.role.type !== 'admin' && targetUserId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const analytics = await InvestorAnalyticsService.getInvestorAnalytics(targetUserId, subCompanyId);
    
    // Mock benchmark data (in real system, this would come from market data)
    const benchmarks = {
      marketIndex: {
        name: 'Market Index',
        roi: 8.5,
        volatility: 12.3,
        sharpeRatio: 0.69
      },
      industryAverage: {
        name: 'Industry Average',
        roi: 6.2,
        volatility: 10.1,
        sharpeRatio: 0.61
      },
      riskFreeRate: {
        name: 'Risk-Free Rate',
        roi: 2.1,
        volatility: 0,
        sharpeRatio: 0
      }
    };
    
    const portfolioVolatility = analytics.performanceMetrics?.volatility || 0;
    const portfolioSharpeRatio = portfolioVolatility > 0 
      ? (analytics.roi - benchmarks.riskFreeRate.roi) / portfolioVolatility 
      : 0;
    
    const comparison = {
      portfolio: {
        name: 'Your Portfolio',
        roi: analytics.roi,
        volatility: portfolioVolatility,
        sharpeRatio: portfolioSharpeRatio
      },
      benchmarks,
      analysis: {
        outperformingMarket: analytics.roi > benchmarks.marketIndex.roi,
        outperformingIndustry: analytics.roi > benchmarks.industryAverage.roi,
        riskAdjustedPerformance: portfolioSharpeRatio > benchmarks.marketIndex.sharpeRatio ? 'Better' : 'Worse'
      }
    };

    successResponse(res, comparison, 'Benchmark comparison retrieved successfully');
  });
}

export default new InvestorAnalyticsController();
