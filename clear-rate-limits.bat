@echo off
echo ========================================
echo   Clearing Rate Limits - Quick Fix
echo ========================================
echo.

echo Restarting backend server to clear rate limits...

echo [1/3] Finding backend process...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)

echo [2/3] Waiting for port to be free...
timeout /t 3 /nobreak >nul

echo [3/3] Starting backend server...
start "Backend Server" cmd /k "cd /d "D:\Investment managment system\Investment managment system\backend" && npm run dev"

echo.
echo ========================================
echo   Rate limits cleared!
echo   You can now try logging in again.
echo ========================================
echo.
pause
