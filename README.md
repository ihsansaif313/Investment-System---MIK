# Investment Management System

A comprehensive, production-ready investment management platform built with React and Node.js, featuring advanced security, performance optimization, and real-time analytics.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based with role-based access control
- **Investment Portfolio Management** - Complete CRUD operations with real-time updates
- **Company & Asset Tracking** - Multi-level company hierarchy with admin assignments
- **Admin Dashboard** - Comprehensive management interface for superadmins
- **Real-time Analytics** - Performance metrics and investment tracking
- **Activity Logging** - Complete audit trail of user actions

### Production Features
- **Security Hardened** - Rate limiting, CORS protection, input validation
- **Performance Optimized** - Caching, compression, database indexing
- **Monitoring Ready** - Comprehensive logging and health checks
- **Scalable Architecture** - Modular design with production middleware
- **Error Handling** - Graceful error handling with detailed logging

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Helmet** - Security middleware
- **Compression** - Response compression

### Production Infrastructure
- **PM2** - Process management
- **Nginx** - Reverse proxy and load balancing
- **Let's Encrypt** - SSL/TLS certificates
- **Logrotate** - Log management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Development Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd investment-management-system
npm install
cd backend && npm install && cd ..
```

2. **Environment Configuration**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
# Edit environment files with your configuration
```

3. **Database Setup**
```bash
cd backend
npm run seed  # Populate with sample data
npm run optimize:db  # Create indexes
```

4. **Start Development**
```bash
npm run start:full:dev  # Starts both frontend and backend
```

### Production Deployment

See [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md) for complete production setup guide.

```bash
# Quick production start
npm run build:prod
npm run start:full
```

## 🔧 Configuration

### Backend Environment (.env)
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/investment_management
JWT_SECRET=your_super_secure_jwt_secret_32_chars_min
JWT_REFRESH_SECRET=your_super_secure_refresh_secret
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

### Frontend Environment (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Investment Management System
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
POST /api/auth/refresh        # Refresh token
```

### User Management
```
GET    /api/users             # Get all users (admin)
GET    /api/users/profile     # Get current user profile
PUT    /api/users/profile     # Update user profile
DELETE /api/users/:id         # Delete user (admin)
```

### Company Management
```
GET    /api/companies         # Get all companies
POST   /api/companies         # Create company
GET    /api/companies/:id     # Get company details
PUT    /api/companies/:id     # Update company
DELETE /api/companies/:id     # Delete company
```

### Investment Operations
```
GET    /api/investments       # Get investments
POST   /api/investments       # Create investment
PUT    /api/investments/:id   # Update investment
DELETE /api/investments/:id   # Delete investment
```

### Admin Management
```
GET    /api/admin-management/pending    # Get pending approvals
POST   /api/admin-management/approve/:id # Approve admin
GET    /api/admin-management/status/:id  # Check admin status
```

### Analytics & Reporting
```
GET    /api/analytics/superadmin        # Superadmin analytics
GET    /api/analytics/admin/:companyId  # Admin analytics
GET    /api/analytics/investor/:userId  # Investor analytics
```

## 🧪 Testing

### Test Suites Available
```bash
npm run test:production      # Production fixes verification
node backend/test-end-to-end.js        # Complete workflow testing
node backend/test-performance.js       # Performance benchmarking
node backend/test-complete-workflow.js # User workflow testing
```

### Security Testing
```bash
node backend/security-audit.js  # Comprehensive security audit
```

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Rate Limiting** on all endpoints with stricter auth limits
- **CORS Protection** with domain validation
- **Input Validation** and sanitization
- **SQL Injection Protection** via Mongoose ODM
- **XSS Prevention** with proper encoding
- **Security Headers** (Helmet.js)
- **Environment Validation** for production deployment

## ⚡ Performance Features

- **Response Caching** for GET requests
- **Database Indexing** for optimized queries
- **Compression** for reduced payload sizes
- **Connection Pooling** for database efficiency
- **Memory Monitoring** with automatic cleanup
- **Query Optimization** with lean queries

## 📊 Monitoring & Logging

### Log Files
- `backend/logs/combined.log` - All application logs
- `backend/logs/error.log` - Error logs only
- `backend/logs/access.log` - HTTP access logs

### Health Monitoring
```bash
curl http://localhost:3001/health  # System health check
```

### Performance Metrics
- Response time tracking
- Memory usage monitoring
- Cache hit/miss ratios
- Request throughput

## 🔄 Development Workflow

### Available Scripts
```bash
# Development
npm run dev                  # Start frontend dev server
npm run backend:dev         # Start backend dev server
npm run start:full:dev      # Start both in development

# Production
npm run build:prod          # Build for production
npm run start:prod          # Start production frontend
npm run backend:prod        # Start production backend
npm run start:full          # Start both in production

# Database
npm run optimize:db         # Optimize database indexes
npm run seed               # Seed development data

# Testing
npm run test:production     # Run production tests
npm run security:audit      # Run security audit

# Utilities
npm run clean              # Clean build artifacts
npm run logs:view          # View application logs
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check MongoDB is running: `sudo systemctl status mongod`
   - Verify connection string in `.env`

2. **Authentication Problems**
   - Ensure JWT secrets are set and secure (32+ characters)
   - Check token expiration settings

3. **CORS Errors**
   - Verify CORS_ORIGIN matches your frontend URL
   - Check for trailing slashes in URLs

4. **Performance Issues**
   - Run database optimization: `npm run optimize:db`
   - Check memory usage in logs
   - Verify caching is working

### Debug Mode
```bash
NODE_ENV=development npm run backend:dev  # Verbose logging
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm run test:production`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure security best practices
- Test in both development and production modes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md)
- **Issues**: Create an issue on GitHub
- **Security**: Report security issues privately

---

**Version**: 1.0.0 (Production Ready)
**Last Updated**: December 2024
**Node.js**: 18+
**MongoDB**: 6.0+
