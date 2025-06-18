// Placeholder for assets routes
import express from 'express';
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Assets route placeholder' });
});

export default router;
