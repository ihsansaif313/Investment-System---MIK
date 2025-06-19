// Placeholder for analytics routes
import express from 'express';
import InvestorAnalyticsController from '../controllers/InvestorAnalyticsController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Analytics route placeholder' });
});

// Superadmin analytics route
router.get('/superadmin', (req, res) => {
  // Return comprehensive mock analytics data
  const mockAnalytics = {
    totalSubCompanies: 5,
    totalAdmins: 8,
    totalInvestments: 25,
    totalInvestors: 150,
    totalValue: 2500000,
    totalProfit: 125000,
    totalLoss: 15000,
    roi: 4.4,
    monthlyGrowth: 12.5,
    activeInvestments: 20,
    pendingInvestments: 3,
    completedInvestments: 2,
    topPerformingCompanies: [
      {
        id: '1',
        name: 'Tech Innovations Ltd',
        industry: 'Technology',
        totalValue: 850000,
        roi: 15.2
      },
      {
        id: '2',
        name: 'Green Energy Corp',
        industry: 'Energy',
        totalValue: 720000,
        roi: 12.8
      }
    ],
    recentActivities: [
      {
        id: '1',
        description: 'New investment created in Tech Innovations Ltd',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        description: 'Admin assigned to Green Energy Corp',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ]
  };

  res.json({
    success: true,
    data: mockAnalytics
  });
});

// Admin analytics route with error handling
router.get('/admin', authenticate, (req, res) => {
  try {
    const { subCompanyId } = req.query;
    console.log('📊 Admin analytics requested by user:', req.user?.id, 'Role:', req.user?.role?.type, 'SubCompany:', subCompanyId);

    // Verify user has admin role or superadmin permissions
    if (!req.user || !req.user.role) {
      console.warn('⚠️ Admin analytics request without proper user/role information');
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const userRole = req.user.role.type || req.user.role.id;
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      console.warn(`⚠️ Unauthorized admin analytics access attempt by role: ${userRole}`);
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin analytics requires admin or superadmin role.' }
      });
    }

    // Return mock admin analytics data
    const mockAnalytics = {
      totalInvestments: 12,
      totalInvestors: 45,
      totalValue: 850000,
      totalProfit: 42000,
      totalLoss: 8000,
      roi: 4.0,
      monthlyGrowth: 8.5,
      activeInvestments: 10,
      pendingInvestments: 2,
      completedInvestments: 0,
      recentTransactions: [
        {
          id: '1',
          investorName: 'John Smith',
          amount: 25000,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          type: 'investment'
        },
        {
          id: '2',
          investorName: 'Sarah Johnson',
          amount: 15000,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'withdrawal'
        }
      ]
    };

    console.log('✅ Admin analytics data successfully retrieved');
    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    console.error('❌ Error in admin analytics endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while fetching admin analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// Salesman analytics route with comprehensive error handling
router.get('/salesman', authenticate, (req, res) => {
  try {
    console.log('📊 Salesman analytics requested by user:', req.user?.id, 'Role:', req.user?.role?.type);

    // Verify user has salesman role or admin/superadmin permissions
    if (!req.user || !req.user.role) {
      console.warn('⚠️ Analytics request without proper user/role information');
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const userRole = req.user.role.type || req.user.role.id;
    if (userRole !== 'salesman' && userRole !== 'admin' && userRole !== 'superadmin') {
      console.warn(`⚠️ Unauthorized analytics access attempt by role: ${userRole}`);
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Salesman analytics requires salesman, admin, or superadmin role.' }
      });
    }

    // Return mock salesman analytics data focused on sales metrics
    const mockAnalytics = {
      totalLeads: 85,
      convertedLeads: 23,
      conversionRate: 27.1,
      totalSales: 650000,
      totalCommission: 32500,
      monthlyTarget: 750000,
      targetProgress: 86.7,
      monthlyGrowth: 15.2,
      activePipeline: 42,
      closedDeals: 23,
      averageDealSize: 28260,
      topPerformingInvestments: [
        {
          id: '1',
          name: 'Tech Growth Fund',
          salesCount: 8,
          totalValue: 180000,
          commission: 9000
        },
        {
          id: '2',
          name: 'Green Energy Portfolio',
          salesCount: 6,
          totalValue: 150000,
          commission: 7500
        }
      ],
      recentSales: [
        {
          id: '1',
          clientName: 'Michael Brown',
          investmentName: 'Tech Growth Fund',
          amount: 35000,
          commission: 1750,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          clientName: 'Lisa Davis',
          investmentName: 'Real Estate REIT',
          amount: 22000,
          commission: 1100,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]
    };

    console.log('✅ Salesman analytics data successfully retrieved');
    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    console.error('❌ Error in salesman analytics endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while fetching salesman analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// Enhanced Investor analytics routes
router.get('/investor', authenticate, InvestorAnalyticsController.getInvestorAnalytics);
router.get('/investor/performance-history', authenticate, InvestorAnalyticsController.getPerformanceHistory);
router.get('/investor/portfolio-summary', authenticate, InvestorAnalyticsController.getPortfolioSummary);
router.get('/investor/investment-comparison', authenticate, InvestorAnalyticsController.getInvestmentComparison);
router.get('/investor/risk-analysis', authenticate, InvestorAnalyticsController.getRiskAnalysis);
router.get('/investor/benchmark-comparison', authenticate, InvestorAnalyticsController.getBenchmarkComparison);

export default router;
