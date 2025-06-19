@echo off
echo 🚀 Starting Investment Management System Backend...
echo.

REM Add Node.js to PATH
set PATH=%PATH%;C:\Program Files\nodejs

REM Change to backend directory and start server
cd backend && npm start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error starting backend server
    echo 💡 Make sure you're in the project root directory and Node.js is installed.
    pause
)
