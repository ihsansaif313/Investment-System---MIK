@echo off
echo ========================================
echo   Clean Restart - Investment System
echo ========================================
echo.

echo [1/5] Killing all existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im nodemon.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Starting Backend (without rate limiting)...
start "Backend Server" cmd /k "cd /d "D:\Investment managment system\Investment managment system\backend" && npm run dev"
timeout /t 10 /nobreak >nul

echo [3/5] Starting Frontend...
start "Frontend Server" cmd /k "cd /d "D:\Investment managment system\Investment managment system" && npm run dev"
timeout /t 15 /nobreak >nul

echo [4/5] Opening Application...
timeout /t 5 /nobreak >nul
start http://localhost:5173
timeout /t 2 /nobreak >nul
start http://localhost:5174
timeout /t 2 /nobreak >nul
start http://localhost:5175

echo [5/5] System restarted!
echo.
echo ========================================
echo   Try logging in now!
echo ========================================
echo.
echo Rate limiting has been DISABLED for development.
echo You should be able to login without 429 errors.
echo.
echo Test Credentials:
echo - Super Admin: superadmin@example.com / SuperAdmin123!
echo - Admin: admin@example.com / Admin123!
echo - Investor: investor@example.com / Investor123!
echo.
pause
