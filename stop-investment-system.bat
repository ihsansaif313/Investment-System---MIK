@echo off
echo ========================================
echo   Investment Management System Shutdown
echo ========================================
echo.

echo Stopping all Investment System processes...

echo [1/3] Stopping Frontend Server (Node.js on port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173"') do taskkill /f /pid %%a 2>nul

echo [2/3] Stopping Backend Server (Node.js on port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do taskkill /f /pid %%a 2>nul

echo [3/3] Stopping MongoDB...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":27017"') do taskkill /f /pid %%a 2>nul

echo.
echo All services stopped successfully!
echo.
pause
