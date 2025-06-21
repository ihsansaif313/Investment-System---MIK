import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = 3001;

// Simple CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// Simple rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // High limit for testing
  message: {
    error: 'Too many requests, please try again later.',
  },
});

app.use('/api/auth', authLimiter);

// Body parsing
app.use(express.json());

// Test routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({ 
    success: false, 
    message: 'Test server - login not implemented yet' 
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Test server running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});
