@echo off
echo ========================================
echo   Starting MongoDB Server
echo ========================================
echo.

echo [1/3] Checking MongoDB service status...
sc query MongoDB

echo.
echo [2/3] Starting MongoDB service...
net start MongoDB

echo.
echo [3/3] Verifying MongoDB is running...
timeout /t 3 /nobreak >nul
netstat -ano | findstr :27017

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB is now running on port 27017
    echo 🌐 You can connect to: mongodb://localhost:27017
) else (
    echo ❌ MongoDB failed to start or is not listening on port 27017
    echo.
    echo Troubleshooting steps:
    echo 1. Check if MongoDB is installed properly
    echo 2. Check Windows Event Logs for MongoDB errors
    echo 3. Try running as Administrator
    echo 4. Check MongoDB configuration file
)

echo.
echo ========================================
echo   MongoDB Server Status
echo ========================================
pause
