# Investment Management System - Vercel Deployment Guide

## Overview
This guide covers deploying the Investment Management System to Vercel for client presentation purposes. The application includes comprehensive demo data and authentication bypass features for seamless demonstrations.

## Demo Accounts
The system includes three hardcoded demo accounts that bypass normal authentication:

### Super Admin Demo Account
- **Email:** `miksupadmin@gmail.com`
- **Password:** `Mik123!`
- **Access:** Full system access with all companies, investments, and analytics

### Admin Demo Account
- **Email:** `mikadmin@gmail.com`
- **Password:** `Mik123!`
- **Access:** Company-level access with investment and investor management

### Investor Demo Account
- **Email:** `mikinvestor@gmail.com`
- **Password:** `Mik123!`
- **Access:** Personal portfolio access with investment opportunities

## Deployment Steps

### 1. Prerequisites
- Vercel account connected to GitHub
- GitHub repository with the latest code
- Node.js 18+ for local testing

### 2. Vercel Configuration
The project includes:
- `vercel.json` - Vercel deployment configuration
- `.env.production` - Production environment variables
- `vite.config.ts` - Optimized build configuration

### 3. Environment Variables
Set the following environment variables in Vercel dashboard:
```
NODE_ENV=production
VITE_DEMO_MODE=true
VITE_DEMO_BANNER_ENABLED=true
VITE_DEMO_ACCOUNTS_ENABLED=true
VITE_USE_MOCK_API=true
```

### 4. Build Settings
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 5. Domain Configuration
- Custom domain can be configured in Vercel dashboard
- SSL certificates are automatically provisioned

## Features Included

### Demo Data
- 18 diverse investments across different asset classes
- 6 companies with realistic business profiles
- 45+ days of historical performance data
- Multiple user roles with appropriate permissions

### Authentication Bypass
- Demo accounts skip normal authentication flow
- Direct access to role-specific dashboards
- No backend dependencies required

### UI Components
- Responsive design for all screen sizes
- Interactive charts and data visualizations
- Demo banner indicating demo mode
- Developer credits footer

### Dashboard Features
- **Superadmin:** System-wide analytics, user management, company oversight
- **Admin:** Company-specific investment management, investor oversight
- **Investor:** Personal portfolio, investment opportunities, performance tracking

## Testing Checklist

### Pre-Deployment
- [ ] All demo accounts authenticate successfully
- [ ] Dashboard data loads correctly for each role
- [ ] Charts and visualizations display properly
- [ ] Navigation between sections works
- [ ] Responsive design functions on mobile/tablet
- [ ] Demo banner and credits display correctly

### Post-Deployment
- [ ] Application loads on Vercel URL
- [ ] All three demo accounts can log in
- [ ] Demo data displays correctly
- [ ] No console errors in browser
- [ ] Performance is acceptable
- [ ] All routes work correctly

## Troubleshooting

### Common Issues
1. **Build Failures:** Check Node.js version and dependencies
2. **Routing Issues:** Verify vercel.json rewrites configuration
3. **Environment Variables:** Ensure all VITE_ prefixed variables are set
4. **Demo Data Missing:** Check that demo mode is enabled

### Performance Optimization
- Assets are automatically optimized by Vercel
- Code splitting is configured in vite.config.ts
- Static assets are cached with appropriate headers

## Client Presentation Notes

### Demo Flow
1. Start with login page showing demo accounts
2. Demonstrate each role's dashboard capabilities
3. Show data visualizations and analytics
4. Highlight responsive design features
5. Emphasize no backend dependencies

### Key Selling Points
- Professional UI/UX design
- Comprehensive investment management features
- Role-based access control
- Real-time data visualization
- Mobile-responsive design
- Enterprise-grade architecture

## Support
For deployment issues or questions:
- **Developer:** Eskillvisor
- **Powered by:** MIK Services
- **GitHub:** ihsansaif313
- **Email:** ihsansaifedwardion@gmail.com

## Security Notes
- Demo accounts are for presentation only
- No real financial data is stored
- All data is hardcoded and simulated
- Production deployment would require proper authentication
