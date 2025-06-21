# Deployment Guide - Admin-Controlled Investor Management System

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Git
- Email service (Gmail, SendGrid, etc.)

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd investment-management-system

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration
Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/investment_management
DB_NAME=investment_management

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="InvestPro" <noreply@investpro.com>

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:5174

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
CORS_ORIGIN=http://localhost:5174
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=InvestPro
VITE_APP_VERSION=1.0.0
```

### 3. Database Setup
```bash
# Start MongoDB
mongod

# The application will automatically create the database and collections
# No manual migration required
```

### 4. Start Services
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

---

## 🏭 Production Deployment

### Environment Setup

#### 1. Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Node.js**: 18.x LTS
- **MongoDB**: 5.0+

#### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 3. Application Deployment
```bash
# Clone repository
git clone <repository-url> /var/www/investpro
cd /var/www/investpro

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci

# Build frontend
cd frontend && npm run build

# Set up environment files
sudo cp backend/.env.example backend/.env
sudo cp frontend/.env.example frontend/.env

# Edit environment files with production values
sudo nano backend/.env
sudo nano frontend/.env
```

#### 4. Database Configuration
```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user (optional but recommended)
mongo
> use investment_management
> db.createUser({
    user: "investpro",
    pwd: "secure-password",
    roles: ["readWrite"]
  })
> exit
```

#### 5. Process Management with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'investpro-backend',
      script: './backend/server.js',
      cwd: '/var/www/investpro',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/investpro-backend-error.log',
      out_file: '/var/log/pm2/investpro-backend-out.log',
      log_file: '/var/log/pm2/investpro-backend.log'
    }
  ]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 6. Nginx Configuration
```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/investpro << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/investpro/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Rate limiting zone
http {
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/investpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Configuration

### Production Environment Variables

**Critical Settings:**
```env
# Security
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
SESSION_SECRET=<generate-strong-secret>
BCRYPT_ROUNDS=12

# Database
MONGODB_URI=mongodb://investpro:password@localhost:27017/investment_management

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=<app-password>

# Application
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Email Service Setup

#### Gmail Configuration
1. Enable 2-factor authentication
2. Generate app password: Google Account → Security → App passwords
3. Use app password in SMTP_PASS

#### SendGrid Configuration
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
```

---

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] Change all default passwords and secrets
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Firewall Configuration
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### MongoDB Security
```bash
# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

---

## 📊 Monitoring & Maintenance

### Log Management
```bash
# View PM2 logs
pm2 logs investpro-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Health Monitoring
```bash
# Check application status
pm2 status

# Check system resources
htop
df -h
free -h

# Check database status
mongo --eval "db.adminCommand('serverStatus')"
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db investment_management --out /backup/mongodb_$DATE
tar -czf /backup/mongodb_$DATE.tar.gz /backup/mongodb_$DATE
rm -rf /backup/mongodb_$DATE

# Add to crontab for daily backups
0 2 * * * /path/to/backup-script.sh
```

---

## 🚨 Troubleshooting

### Common Issues

**Issue**: Application won't start
```bash
# Check logs
pm2 logs investpro-backend
# Check environment variables
pm2 env 0
```

**Issue**: Database connection failed
```bash
# Check MongoDB status
sudo systemctl status mongod
# Check connection
mongo --eval "db.adminCommand('ping')"
```

**Issue**: Email not sending
```bash
# Test SMTP connection
telnet smtp.gmail.com 587
# Check credentials and app password
```

**Issue**: High memory usage
```bash
# Restart application
pm2 restart investpro-backend
# Check for memory leaks
pm2 monit
```

### Performance Optimization
```bash
# Enable MongoDB indexing
mongo investment_management --eval "
  db.users.createIndex({email: 1});
  db.users.createIndex({cnic: 1}, {sparse: true});
  db.roles.createIndex({userId: 1, type: 1});
"

# Optimize Nginx
sudo nano /etc/nginx/nginx.conf
# Add:
# worker_processes auto;
# worker_connections 1024;
# gzip on;
```

---

## 📋 Post-Deployment Checklist

- [ ] Application starts successfully
- [ ] Database connection working
- [ ] Email service configured and tested
- [ ] SSL certificate installed and working
- [ ] All endpoints responding correctly
- [ ] Rate limiting functioning
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] Documentation updated

---

*Last Updated: June 20, 2025*
