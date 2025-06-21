# 🚀 Daily Startup Guide - Investment Management System

## ⚡ **Quick Start (Recommended)**

### Option 1: One-Click Startup
1. **Double-click** `start-investment-system.bat`
2. Wait for all services to start (about 30 seconds)
3. Your browser will automatically open to http://localhost:5173

### Option 2: Manual Startup
1. **Start MongoDB**: Double-click `start-mongodb.ps1`
2. **Start Backend**: Open terminal in `backend/` folder → `npm run dev`
3. **Start Frontend**: Open terminal in root folder → `npm run dev`
4. **Open Browser**: Go to http://localhost:5173

## 🛑 **Stopping the System**

### Quick Stop
- **Double-click** `stop-investment-system.bat`

### Manual Stop
- Close all terminal windows
- Or press `Ctrl+C` in each terminal

## 🌐 **Access URLs**

- **Main Application**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs (if available)

## 📋 **Daily Checklist**

### Before Starting:
- [ ] Ensure you have internet connection
- [ ] Close any previous instances
- [ ] Check if ports 3001, 5173, and 27017 are free

### After Starting:
- [ ] MongoDB is running (check terminal for "waiting for connections")
- [ ] Backend shows "Server running on port 3001"
- [ ] Frontend shows "Local: http://localhost:5173"
- [ ] Browser opens automatically to the login page

## 🔧 **Troubleshooting**

### If MongoDB won't start:
```bash
# Check if MongoDB service is running
Get-Service -Name MongoDB*

# Start MongoDB service
Start-Service -Name MongoDB
```

### If Backend won't start:
```bash
cd backend
npm install  # Reinstall dependencies
npm run dev
```

### If Frontend won't start:
```bash
npm install  # Reinstall dependencies
npm run dev
```

### If ports are busy:
```bash
# Check what's using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :27017

# Kill processes if needed
taskkill /f /pid [PID_NUMBER]
```

## 🎯 **Default Login Credentials**

### Super Admin
- **Email**: superadmin@example.com
- **Password**: SuperAdmin123!

### Admin
- **Email**: admin@example.com  
- **Password**: Admin123!

### Investor
- **Email**: investor@example.com
- **Password**: Investor123!

## 📱 **Testing Responsive Design**

1. Open browser developer tools (F12)
2. Click device toolbar icon
3. Test different screen sizes:
   - Mobile: 375px width
   - Tablet: 768px width  
   - Desktop: 1200px+ width

## 🔄 **Auto-Startup (Optional)**

To start automatically when Windows boots:
1. Press `Win + R`, type `shell:startup`
2. Copy `start-investment-system.bat` to this folder
3. System will start automatically on boot

## 📞 **Need Help?**

If you encounter issues:
1. Check the terminal outputs for error messages
2. Ensure all dependencies are installed (`npm install`)
3. Verify MongoDB is properly installed and running
4. Check firewall settings for ports 3001, 5173, 27017
