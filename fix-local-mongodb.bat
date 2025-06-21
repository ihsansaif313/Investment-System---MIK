@echo off
echo ========================================
echo   MongoDB Local Fix Utility
echo ========================================
echo.

echo [1/6] Stopping MongoDB service...
net stop MongoDB 2>nul

echo [2/6] Checking MongoDB installation...
if exist "C:\Program Files\MongoDB\Server" (
    echo ✅ MongoDB is installed
) else (
    echo ❌ MongoDB is not installed
    echo Please install MongoDB Community Server first
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo [3/6] Backing up current data directory...
if exist "C:\data\db" (
    if not exist "C:\data\db_backup" (
        echo Creating backup of corrupted data...
        xcopy "C:\data\db" "C:\data\db_backup\" /E /I /H /Y
    )
)

echo [4/6] Removing corrupted data directory...
if exist "C:\data\db" (
    rmdir /S /Q "C:\data\db"
)

echo [5/6] Creating fresh data directory...
mkdir "C:\data\db"

echo [6/6] Starting MongoDB service...
net start MongoDB

echo.
echo ========================================
echo   Testing MongoDB Connection
echo ========================================
timeout /t 3 /nobreak >nul
netstat -ano | findstr :27017

if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB is now running successfully!
    echo 🌐 Connection: mongodb://localhost:27017
    echo 📊 Database: investment_management
    echo.
    echo ⚠️  Note: All previous data has been lost due to corruption
    echo The system will recreate the database structure automatically
) else (
    echo ❌ MongoDB still not working
    echo.
    echo Recommended: Use MongoDB Atlas instead
    echo See setup-mongodb-atlas.md for instructions
)

echo.
pause
