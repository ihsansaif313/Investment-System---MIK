// Placeholder for companies routes
import express from 'express';
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Companies route placeholder' });
});

// Sub-companies route
router.get('/sub', (req, res) => {
  // Return an empty array or mock data for now
  res.json({ success: true, data: [] });
});

export default router;
