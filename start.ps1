# X Analytics Dashboard - Quick Start

Write-Host "🚀 Starting X Analytics Dashboard..." -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "📊 Checking PostgreSQL..." -ForegroundColor Yellow
$pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if ($pgProcess) {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL is not running. Please start PostgreSQL first." -ForegroundColor Red
    Write-Host "   You can start it from services or pgAdmin" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check backend .env file
Write-Host "🔧 Checking backend configuration..." -ForegroundColor Yellow
if (Test-Path ".\backend\.env") {
    Write-Host "✅ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env file not found" -ForegroundColor Red
    Write-Host "   Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".\backend\.env.example" ".\backend\.env"
    Write-Host "   ⚠️  Please edit backend\.env with your settings before continuing" -ForegroundColor Yellow
    Write-Host "   Required: DB credentials, X API credentials, JWT secret" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check frontend .env.local file
Write-Host "🎨 Checking frontend configuration..." -ForegroundColor Yellow
if (Test-Path ".\frontend\.env.local") {
    Write-Host "✅ Frontend .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env.local file not found" -ForegroundColor Red
    Write-Host "   Creating with default settings..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=http://localhost:5000" | Out-File -FilePath ".\frontend\.env.local" -Encoding UTF8
    Write-Host "✅ Created frontend .env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ All checks passed! Starting servers..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers
npm run dev:all
