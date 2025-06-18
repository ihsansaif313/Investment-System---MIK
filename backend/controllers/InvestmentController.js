/**
 * Investment Controller
 * Handles HTTP requests for investment-related operations
 */

import InvestmentService from '../services/InvestmentService.js';
import { asyncHandler, successResponse, errorResponse } from '../utils/errors.js';
import { validationResult } from 'express-validator';

class InvestmentController {
  /**
   * Create a new investment
   * POST /api/investments
   */
  createInvestment = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const investment = await InvestmentService.createInvestment(req.body, req.user.id);
    successResponse(res, investment, 'Investment created successfully', 201);
  });

  /**
   * Get investment by ID
   * GET /api/investments/:id
   */
  getInvestmentById = asyncHandler(async (req, res) => {
    const investment = await InvestmentService.getInvestmentById(req.params.id);
    successResponse(res, investment, 'Investment retrieved successfully');
  });

  /**
   * Update investment
   * PUT /api/investments/:id
   */
  updateInvestment = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const investment = await InvestmentService.updateInvestment(
      req.params.id, 
      req.body, 
      req.user.id
    );
    successResponse(res, investment, 'Investment updated successfully');
  });

  /**
   * Delete investment
   * DELETE /api/investments/:id
   */
  deleteInvestment = asyncHandler(async (req, res) => {
    const result = await InvestmentService.deleteInvestment(req.params.id, req.user.id);
    successResponse(res, result, 'Investment deleted successfully');
  });

  /**
   * Get all investments with filtering and pagination
   * GET /api/investments
   */
  getInvestments = asyncHandler(async (req, res) => {
    const filters = {
      subCompanyId: req.query.subCompanyId,
      status: req.query.status,
      riskLevel: req.query.riskLevel,
      assetType: req.query.assetType,
      search: req.query.search,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await InvestmentService.getInvestments(filters, pagination);
    successResponse(res, result, 'Investments retrieved successfully');
  });

  /**
   * Invest in an investment
   * POST /api/investments/:id/invest
   */
  investInInvestment = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { amount } = req.body;
    const investorInvestment = await InvestmentService.investInInvestment(
      req.params.id,
      req.user.id,
      amount
    );
    
    successResponse(res, investorInvestment, 'Investment request created successfully', 201);
  });

  /**
   * Approve investor investment
   * POST /api/investments/investor-investments/:id/approve
   */
  approveInvestorInvestment = asyncHandler(async (req, res) => {
    const investorInvestment = await InvestmentService.approveInvestorInvestment(
      req.params.id,
      req.user.id
    );
    
    successResponse(res, investorInvestment, 'Investment request approved successfully');
  });

  /**
   * Get investment performance
   * GET /api/investments/:id/performance
   */
  getInvestmentPerformance = asyncHandler(async (req, res) => {
    const performance = await InvestmentService.calculateInvestmentPerformance(req.params.id);
    successResponse(res, performance, 'Investment performance calculated successfully');
  });

  /**
   * Get investment analytics
   * GET /api/investments/analytics
   */
  getInvestmentAnalytics = asyncHandler(async (req, res) => {
    const { subCompanyId } = req.query;
    const analytics = await InvestmentService.getInvestmentAnalytics(subCompanyId);
    successResponse(res, analytics, 'Investment analytics retrieved successfully');
  });

  /**
   * Get investments by sub-company
   * GET /api/investments/sub-company/:subCompanyId
   */
  getInvestmentsBySubCompany = asyncHandler(async (req, res) => {
    const filters = {
      subCompanyId: req.params.subCompanyId,
      status: req.query.status,
      riskLevel: req.query.riskLevel,
      search: req.query.search,
      isActive: true
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await InvestmentService.getInvestments(filters, pagination);
    successResponse(res, result, 'Sub-company investments retrieved successfully');
  });

  /**
   * Get active investments
   * GET /api/investments/active
   */
  getActiveInvestments = asyncHandler(async (req, res) => {
    const filters = {
      status: 'active',
      isActive: true,
      subCompanyId: req.query.subCompanyId,
      search: req.query.search
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await InvestmentService.getInvestments(filters, pagination);
    successResponse(res, result, 'Active investments retrieved successfully');
  });

  /**
   * Get investment statistics
   * GET /api/investments/stats
   */
  getInvestmentStats = asyncHandler(async (req, res) => {
    const { subCompanyId } = req.query;
    const analytics = await InvestmentService.getInvestmentAnalytics(subCompanyId);
    
    // Add additional statistics
    const stats = {
      ...analytics,
      performanceMetrics: {
        bestPerforming: null, // Would be calculated
        worstPerforming: null, // Would be calculated
        averageInvestmentSize: analytics.totalInvested / (analytics.totalInvestments || 1),
        completionRate: analytics.successRate
      }
    };

    successResponse(res, stats, 'Investment statistics retrieved successfully');
  });

  /**
   * Search investments
   * GET /api/investments/search
   */
  searchInvestments = asyncHandler(async (req, res) => {
    const { q: search, status, riskLevel, limit = 10 } = req.query;

    if (!search) {
      return errorResponse(res, 'Search query is required', 400);
    }

    const filters = {
      search,
      status,
      riskLevel,
      isActive: true
    };

    const pagination = {
      page: 1,
      limit: parseInt(limit),
      sortBy: 'name',
      sortOrder: 'asc'
    };

    const result = await InvestmentService.getInvestments(filters, pagination);
    successResponse(res, result.investments, 'Search results retrieved successfully');
  });

  /**
   * Update investment status
   * PUT /api/investments/:id/status
   */
  updateInvestmentStatus = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { status } = req.body;
    const investment = await InvestmentService.updateInvestment(
      req.params.id,
      { status },
      req.user.id
    );

    successResponse(res, investment, 'Investment status updated successfully');
  });

  /**
   * Get investment history
   * GET /api/investments/:id/history
   */
  getInvestmentHistory = asyncHandler(async (req, res) => {
    // This would fetch audit trail and activity logs for the investment
    const history = [];
    successResponse(res, history, 'Investment history retrieved successfully');
  });

  /**
   * Get investment documents
   * GET /api/investments/:id/documents
   */
  getInvestmentDocuments = asyncHandler(async (req, res) => {
    const investment = await InvestmentService.getInvestmentById(req.params.id);
    successResponse(res, investment.documents || [], 'Investment documents retrieved successfully');
  });

  /**
   * Upload investment document
   * POST /api/investments/:id/documents
   */
  uploadInvestmentDocument = asyncHandler(async (req, res) => {
    // This would handle file upload
    const document = {
      name: req.file.originalname,
      url: req.file.path,
      type: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Update investment with new document
    const investment = await InvestmentService.getInvestmentById(req.params.id);
    investment.documents = investment.documents || [];
    investment.documents.push(document);

    const updatedInvestment = await InvestmentService.updateInvestment(
      req.params.id,
      { documents: investment.documents },
      req.user.id
    );

    successResponse(res, document, 'Document uploaded successfully', 201);
  });
}

export default new InvestmentController();
