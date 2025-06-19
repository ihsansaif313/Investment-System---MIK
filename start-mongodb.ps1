# Start MongoDB Script
# This script helps start MongoDB on Windows

Write-Host "🔍 Checking MongoDB installation..." -ForegroundColor Yellow

# Check if MongoDB is installed
$mongoPath = Get-ChildItem "C:\Program Files\MongoDB" -Recurse -Name "mongod.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($mongoPath) {
    $fullMongoPath = "C:\Program Files\MongoDB\$mongoPath"
    Write-Host "✅ Found MongoDB at: $fullMongoPath" -ForegroundColor Green
    
    # Create data directory if it doesn't exist
    $dataDir = ".\mongodb-data"
    if (!(Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force
        Write-Host "📁 Created data directory: $dataDir" -ForegroundColor Green
    }
    
    # Start MongoDB
    Write-Host "🚀 Starting MongoDB..." -ForegroundColor Yellow
    Write-Host "📊 Data directory: $dataDir" -ForegroundColor Cyan
    Write-Host "🌐 MongoDB will be available at: mongodb://localhost:27017" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "Press Ctrl+C to stop MongoDB" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    
    & $fullMongoPath --dbpath $dataDir --port 27017
} else {
    Write-Host "❌ MongoDB not found. Please wait for installation to complete." -ForegroundColor Red
    Write-Host "💡 Alternative: Use MongoDB Atlas (cloud database)" -ForegroundColor Yellow
    Write-Host "   1. Go to https://www.mongodb.com/atlas" -ForegroundColor White
    Write-Host "   2. Create free account and cluster" -ForegroundColor White
    Write-Host "   3. Get connection string" -ForegroundColor White
    Write-Host "   4. Update backend/.env file" -ForegroundColor White
}
