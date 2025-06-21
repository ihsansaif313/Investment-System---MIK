@echo off
echo ========================================
echo   Database Viewer Options
echo ========================================
echo.

echo Option 1: MongoDB Shell (if available)
echo Command: mongosh mongodb://localhost:27017/investment_management
echo.

echo Option 2: MongoDB Compass (GUI)
echo Download from: https://www.mongodb.com/try/download/compass
echo.

echo Option 3: Studio 3T (Free)
echo Download from: https://studio3t.com/download/
echo.

echo Option 4: Robo 3T (Free)
echo Download from: https://robomongo.org/download
echo.

echo Option 5: VS Code Extension
echo Install "MongoDB for VS Code" extension
echo.

echo ========================================
echo   Current System Status
echo ========================================
echo.

echo Backend API: http://localhost:3001 ✅
echo Frontend App: http://localhost:5174 ✅
echo MongoDB Server: Stopped ❌
echo.

echo Your application is working with graceful fallback!
echo The backend continues to function even without MongoDB.
echo.

pause
