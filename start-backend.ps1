# PowerShell script to start the backend server
# Usage: .\start-backend.ps1

Write-Host "🚀 Starting Investment Management System Backend..." -ForegroundColor Green
Write-Host ""

# Add Node.js to PATH if not already present
$env:PATH += ";C:\Program Files\nodejs"

# Change to backend directory and start the server
try {
    Set-Location -Path "backend"
    Write-Host "📂 Changed to backend directory" -ForegroundColor Yellow
    Write-Host "🔧 Starting server with 'npm start'..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start the server
    npm start
}
catch {
    Write-Host "❌ Error starting backend server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure you're in the project root directory and Node.js is installed." -ForegroundColor Yellow
}
