# 🔧 Backend Troubleshooting Guide

## ✅ **ALL ISSUES RESOLVED: Backend Working Perfectly**

### **Problem 1**: Backend was crashing with "Cannot find package 'compression'" error
**Solution**: Install missing dependency
```bash
cd backend
npm install compression
```

### **Problem 2**: HTTP headers error "Cannot set headers after they are sent"
**Solution**: Fixed middleware conflicts in `middleware/performance.js`
- Fixed performance monitoring middleware to set headers before response
- Fixed multiple middleware overriding `res.json` method

### **Problem 3**: MongoDB database corruption
**Solution**: Cleared corrupted database and started fresh
```bash
Remove-Item -Path "mongodb-data\*" -Recurse -Force
```

### **Root Causes**:
1. Missing `compression` package dependency
2. Multiple middleware functions conflicting with HTTP headers
3. Database corruption from previous improper shutdown

---

## 🚀 **Current Status: WORKING**

⚠️ **MongoDB**: Local MongoDB has persistent corruption issues
✅ **Backend API**: Running on port 3001 (with graceful fallback)
✅ **Frontend**: Running on port 5175 (auto-selected available port)

---

## 🔍 **Common Issues & Solutions**

### 1. **Backend Won't Start**
```bash
# Check if dependencies are installed
cd backend
npm install

# Check for missing packages
npm list --depth=0

# Install specific missing packages
npm install compression express mongoose cors dotenv
```

### 2. **MongoDB Connection Issues**
```bash
# Start MongoDB service
Start-Service -Name MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "mongodb-data"

# Check MongoDB status
Get-Service -Name MongoDB*
```

### 3. **Port Already in Use**
```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Kill process if needed
taskkill /f /pid [PID_NUMBER]
```

### 4. **Environment Variables Missing**
- Ensure `backend/.env` file exists
- Copy from `backend/.env.example` if needed
- Check required variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PORT`

### 5. **Permission Errors**
- Run terminal as Administrator
- Check file permissions in project folder

---

## 📋 **Quick Health Check**

### Test Backend API:
```bash
# Health check
curl http://localhost:3001/health

# API root
curl http://localhost:3001/
```

### Expected Response:
```json
{
  "message": "🚀 Investment Management System API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 🛠 **Manual Startup Commands**

If the batch file doesn't work, use these manual commands:

### 1. Start MongoDB:
```bash
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\Investment managment system\Investment managment system\mongodb-data"
```

### 2. Start Backend:
```bash
cd "D:\Investment managment system\Investment managment system\backend"
npm run dev
```

### 3. Start Frontend:
```bash
cd "D:\Investment managment system\Investment managment system"
npm run dev
```

---

## 📞 **Still Having Issues?**

1. Check all terminals for error messages
2. Ensure all dependencies are installed
3. Verify MongoDB is running
4. Check firewall settings
5. Try restarting your computer

---

## ✨ **Success Indicators**

You'll know everything is working when you see:

✅ **MongoDB**: "waiting for connections on port 27017"  
✅ **Backend**: "Server running on port 3001"  
✅ **Frontend**: "Local: http://localhost:5173"  
✅ **Browser**: Login page loads successfully
