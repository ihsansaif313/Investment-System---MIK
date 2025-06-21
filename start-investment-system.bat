@echo off
echo ========================================
echo   Investment Management System Startup
echo ========================================
echo.

echo [1/5] Checking Dependencies...
cd /d "D:\Investment managment system\Investment managment system\backend"
if not exist "node_modules\compression" (
    echo Installing missing backend dependencies...
    npm install compression
)
cd /d "D:\Investment managment system\Investment managment system"
echo Dependencies checked!
echo.

echo [2/5] Starting MongoDB...
start "MongoDB" cmd /k "cd /d "D:\Investment managment system\Investment managment system" && "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "mongodb-data""
timeout /t 5 /nobreak >nul

echo [3/5] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "D:\Investment managment system\Investment managment system\backend" && npm run dev"
timeout /t 10 /nobreak >nul

echo [4/5] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "D:\Investment managment system\Investment managment system" && npm run dev"
timeout /t 15 /nobreak >nul

echo [5/5] Opening Application in Browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173
timeout /t 2 /nobreak >nul
start http://localhost:5174
timeout /t 2 /nobreak >nul
start http://localhost:5175

echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Services Running:
echo - MongoDB: Running on default port 27017
echo - Backend API: http://localhost:3001
echo - Frontend App: http://localhost:5173
echo.
echo Login Credentials:
echo - Super Admin: superadmin@example.com / SuperAdmin123!
echo - Admin: admin@example.com / Admin123!
echo - Investor: investor@example.com / Investor123!
echo.
echo Press any key to close this window...
pause >nul
