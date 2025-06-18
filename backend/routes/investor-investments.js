// Investor investments route for mock data
import express from 'express';
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  // Return mock investor investments data
  res.json({
    success: true,
    data: [
      {
        id: 1,
        company: 'Acme Corp',
        assetType: 'Equity',
        amount: 10000,
        status: 'performing',
        date: '2023-01-15',
        returns: 1200
      },
      {
        id: 2,
        company: 'Beta Holdings',
        assetType: 'Bond',
        amount: 5000,
        status: 'underperforming',
        date: '2022-10-10',
        returns: -200
      },
      {
        id: 3,
        company: 'Gamma Ventures',
        assetType: 'Real Estate',
        amount: 20000,
        status: 'performing',
        date: '2021-07-01',
        returns: 3500
      }
    ]
  });
});

export default router;
