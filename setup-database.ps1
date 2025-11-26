# Database Setup Script for X Analytics Dashboard

Write-Host "=== X Analytics Dashboard - Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "1. Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue

if ($pgService) {
    if ($pgService.Status -eq 'Running') {
        Write-Host "   ✓ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "   ! PostgreSQL service found but not running" -ForegroundColor Red
        Write-Host "   Starting PostgreSQL..." -ForegroundColor Yellow
        Start-Service $pgService.Name
    }
} else {
    Write-Host "   ! PostgreSQL service not found" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL 14+ from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Database Setup" -ForegroundColor Yellow
Write-Host "   Please enter your PostgreSQL password when prompted" -ForegroundColor Cyan
Write-Host ""

# Create database if it doesn't exist
$createDbCommand = @"
SELECT 'CREATE DATABASE x_analytics'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'x_analytics')\gexec
"@

$createDbCommand | psql -U postgres -d postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database 'x_analytics' is ready" -ForegroundColor Green
} else {
    Write-Host "   ! Failed to create database. Please check your PostgreSQL credentials." -ForegroundColor Red
    Write-Host "   Update the DB_PASSWORD in backend/.env file with your PostgreSQL password" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your PostgreSQL password (DB_PASSWORD)" -ForegroundColor White
Write-Host "2. Get X (Twitter) API credentials from https://developer.twitter.com/" -ForegroundColor White
Write-Host "3. Update X_API_CLIENT_ID and X_API_CLIENT_SECRET in backend/.env" -ForegroundColor White
Write-Host "4. Run: npm run dev:all (to start both frontend and backend)" -ForegroundColor White
Write-Host ""
