// Enhanced investor investments routes
import express from 'express';
import InvestorAnalyticsController from '../controllers/InvestorAnalyticsController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();

// Get detailed investor investments
router.get('/', authenticate, InvestorAnalyticsController.getInvestorInvestments);

export default router;
