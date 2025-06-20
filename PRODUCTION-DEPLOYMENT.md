# Investment Management System - Production Deployment Guide

## 🚀 Production Deployment Overview

This guide covers the complete production deployment process for the Investment Management System, including all security configurations, performance optimizations, and monitoring setup.

## 📋 Pre-Deployment Checklist

### ✅ System Requirements
- [ ] Node.js 18+ installed
- [ ] MongoDB 6.0+ running (local or Atlas)
- [ ] SSL certificates configured (for HTTPS)
- [ ] Domain name configured
- [ ] Firewall rules configured
- [ ] Backup strategy in place

### ✅ Security Requirements
- [ ] Environment variables configured with secure values
- [ ] JWT secrets generated (32+ characters)
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database authentication enabled
- [ ] SSL/TLS encryption enabled

### ✅ Performance Requirements
- [ ] Database indexes created
- [ ] Caching enabled
- [ ] Compression enabled
- [ ] Log rotation configured
- [ ] Memory limits set
- [ ] Process monitoring configured

## 🔧 Environment Configuration

### Backend Environment (.env.production)
```bash
# Application
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment_management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_different_from_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50

# Logging
LOG_LEVEL=warn
LOG_FILE=logs/combined.log

# Email Configuration (if using email features)
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_email_password
EMAIL_FROM=Investment Management System <noreply@yourdomain.com>
```

### Frontend Environment (.env.production)
```bash
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Investment Management System
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment Steps

### 1. Prepare Production Environment
```bash
# Clone repository
git clone https://github.com/yourusername/investment-management-system.git
cd investment-management-system

# Install dependencies
npm install
cd backend && npm install && cd ..

# Create production environment files
cp .env.example .env.production
cp backend/.env.example backend/.env.production

# Edit environment files with production values
nano .env.production
nano backend/.env.production
```

### 2. Database Setup
```bash
# Run database optimization
cd backend
npm run optimize:db

# Verify database connection
npm run health
```

### 3. Security Configuration
```bash
# Run security audit
npm run security:audit

# Generate secure secrets if needed
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Build and Deploy
```bash
# Build frontend for production
npm run build:prod

# Start production services
npm run start:full

# Or use the production startup script
node start-production.js
```

### 5. Verification
```bash
# Run complete test suite
npm run test:production

# Run end-to-end tests
node backend/test-end-to-end.js

# Run performance tests
node backend/test-performance.js

# Verify production fixes
node backend/test-production-fixes.js
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Configure nginx or your web server to use certificates
```

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (for redirects)
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # API (if not behind reverse proxy)
sudo ufw enable
```

### Database Security
```bash
# MongoDB security configuration
# Enable authentication
# Configure SSL
# Set up user roles
# Enable audit logging
```

## 📊 Monitoring and Logging

### Log Files Location
- Application logs: `backend/logs/combined.log`
- Error logs: `backend/logs/error.log`
- Access logs: `backend/logs/access.log`

### Log Rotation Setup
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/investment-management

# Add configuration:
/path/to/investment-management/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload investment-management
    endscript
}
```

### Health Monitoring
```bash
# Check system health
curl https://yourdomain.com/health

# Monitor logs
tail -f backend/logs/combined.log

# Check performance metrics
curl https://yourdomain.com/api/companies -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 Process Management

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'investment-management-backend',
    script: 'backend/server.js',
    env: {
      NODE_ENV: 'production'
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using systemd
```bash
# Create service file
sudo nano /etc/systemd/system/investment-management.service

# Add service configuration:
[Unit]
Description=Investment Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/investment-management
ExecStart=/usr/bin/node start-production.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable investment-management
sudo systemctl start investment-management
```

## 🔧 Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        access_log off;
    }
}
```

## 📈 Performance Optimization

### Database Optimization
- Indexes created automatically via `npm run optimize:db`
- Connection pooling configured
- Query optimization enabled
- TTL indexes for automatic cleanup

### Caching Strategy
- Response caching for GET requests
- Cache invalidation on data changes
- Memory-based caching for development
- Redis recommended for production scaling

### Compression
- Gzip compression enabled
- Static asset optimization
- Image optimization recommended

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string
   node -e "console.log(process.env.MONGODB_URI)"
   ```

2. **Authentication Issues**
   ```bash
   # Verify JWT secrets
   node -e "console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)"
   
   # Test authentication
   curl -X POST https://yourdomain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"superadmin@example.com","password":"password123"}'
   ```

3. **CORS Issues**
   ```bash
   # Check CORS configuration
   curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS https://yourdomain.com/api/health
   ```

### Log Analysis
```bash
# Check error logs
tail -f backend/logs/error.log

# Check access patterns
grep "POST /api/auth/login" backend/logs/access.log | tail -20

# Monitor performance
grep "Response Time" backend/logs/combined.log | tail -20
```

## 🔄 Maintenance

### Regular Tasks
- [ ] Monitor disk space and logs
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Backup database daily
- [ ] Test disaster recovery quarterly

### Updates
```bash
# Update dependencies
npm update
cd backend && npm update && cd ..

# Run tests after updates
npm run test:production

# Deploy updates
npm run build:prod
pm2 restart all
```

## 📞 Support

For production support and issues:
- Check logs first: `backend/logs/`
- Run health check: `curl https://yourdomain.com/health`
- Run security audit: `node backend/security-audit.js`
- Contact system administrator

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Environment:** Production Ready
