import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/market-data
 * @desc Get market data for charts and comparisons
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // For now, return the enhanced market data we created
    // In a real application, this would fetch from external APIs or database
    const marketData = await getMarketData();
    
    res.json({
      success: true,
      data: marketData,
      message: 'Market data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-data/historical
 * @desc Get historical market data for trend analysis
 * @access Private
 */
router.get('/historical', authenticate, async (req, res) => {
  try {
    const { period = '1y', symbol } = req.query;
    const historicalData = await getHistoricalMarketData(period, symbol);
    
    res.json({
      success: true,
      data: historicalData,
      message: 'Historical market data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching historical market data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical market data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-data/sectors
 * @desc Get sector performance data
 * @access Private
 */
router.get('/sectors', authenticate, async (req, res) => {
  try {
    const sectorData = await getSectorPerformanceData();
    
    res.json({
      success: true,
      data: sectorData,
      message: 'Sector performance data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching sector data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sector data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-data/geographic
 * @desc Get geographic distribution data
 * @access Private
 */
router.get('/geographic', authenticate, async (req, res) => {
  try {
    const geographicData = await getGeographicData();
    
    res.json({
      success: true,
      data: geographicData,
      message: 'Geographic data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch geographic data',
      error: error.message
    });
  }
});

// Helper functions to get data from MongoDB collections
async function getMarketData() {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('investment_management');
    
    // Get market comparison data
    const marketData = await db.collection('market_data').find().sort({ date: 1 }).toArray();
    
    // Get monthly metrics
    const monthlyMetrics = await db.collection('monthly_metrics').find().sort({ date: 1 }).toArray();
    
    return {
      marketComparison: marketData,
      monthlyMetrics: monthlyMetrics,
      lastUpdated: new Date()
    };
  } finally {
    await client.close();
  }
}

async function getHistoricalMarketData(period, symbol) {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('investment_management');
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1m': startDate.setMonth(endDate.getMonth() - 1); break;
      case '3m': startDate.setMonth(endDate.getMonth() - 3); break;
      case '6m': startDate.setMonth(endDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
      case '2y': startDate.setFullYear(endDate.getFullYear() - 2); break;
      default: startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    const marketData = await db.collection('market_data').find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).toArray();
    
    return marketData;
  } finally {
    await client.close();
  }
}

async function getSectorPerformanceData() {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('investment_management');
    
    const sectorData = await db.collection('sector_data').find().toArray();
    return sectorData;
  } finally {
    await client.close();
  }
}

async function getGeographicData() {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('investment_management');
    
    const geographicData = await db.collection('geographic_data').find().toArray();
    return geographicData;
  } finally {
    await client.close();
  }
}

export default router;
