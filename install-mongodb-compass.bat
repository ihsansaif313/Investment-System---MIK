@echo off
echo ========================================
echo   Installing MongoDB Compass
echo ========================================
echo.

echo [1/3] Downloading MongoDB Compass...
echo This will download the latest version from MongoDB's official site.
echo.

echo Opening MongoDB Compass download page...
start https://www.mongodb.com/try/download/compass

echo.
echo ========================================
echo   Manual Installation Steps:
echo ========================================
echo.
echo 1. Click "Download" on the page that just opened
echo 2. Choose "Windows x64" if not already selected
echo 3. Download the .msi installer
echo 4. Run the installer and follow the setup wizard
echo 5. Once installed, MongoDB Compass will be available in your Start Menu
echo.
echo ========================================
echo   Alternative: Use Chocolatey (if installed)
echo ========================================
echo.
echo If you have Chocolatey package manager installed, you can run:
echo   choco install mongodb-compass
echo.
echo ========================================
echo   Alternative: Use winget (Windows Package Manager)
echo ========================================
echo.
echo If you have winget installed, you can run:
echo   winget install MongoDB.Compass
echo.
pause
