# Test & Start Script

Write-Host "=== X Analytics Dashboard - Test & Start ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostgreSQL
Write-Host "Step 1: Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue

if (-not $pgService) {
    Write-Host "   ✗ PostgreSQL not found. Please install it from:" -ForegroundColor Red
    Write-Host "   https://www.postgresql.org/download/" -ForegroundColor Cyan
    exit 1
}

if ($pgService.Status -ne 'Running') {
    Write-Host "   ! Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service $pgService.Name
}

Write-Host "   ✓ PostgreSQL is running" -ForegroundColor Green
Write-Host ""

# Step 2: Test Database Connection
Write-Host "Step 2: Testing database connection..." -ForegroundColor Yellow
Write-Host "   Enter your PostgreSQL password for user 'postgres':" -ForegroundColor Cyan
$dbTest = psql -U postgres -d postgres -c "\l" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database connection successful" -ForegroundColor Green
    
    # Check if x_analytics database exists
    Write-Host "   Checking for x_analytics database..." -ForegroundColor Yellow
    $dbExists = psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname='x_analytics'" -t 2>&1
    
    if ($dbExists -match "1") {
        Write-Host "   ✓ Database 'x_analytics' exists" -ForegroundColor Green
    } else {
        Write-Host "   Creating database 'x_analytics'..." -ForegroundColor Yellow
        psql -U postgres -d postgres -c "CREATE DATABASE x_analytics;"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Database created successfully" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Failed to create database" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "   ✗ Database connection failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please update DB_PASSWORD in backend/.env with your PostgreSQL password" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 3: Check Node.js
Write-Host "Step 3: Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ Node.js not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Check if packages are installed
Write-Host "Step 4: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Write-Host "   ✓ Dependencies ready" -ForegroundColor Green

Write-Host ""
Write-Host "=== Ready to Start! ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Before starting, update these in backend/.env:" -ForegroundColor Yellow
Write-Host "  1. DB_PASSWORD=your_actual_postgres_password" -ForegroundColor White
Write-Host "  2. X_API_CLIENT_ID=your_twitter_client_id" -ForegroundColor White
Write-Host "  3. X_API_CLIENT_SECRET=your_twitter_client_secret" -ForegroundColor White
Write-Host ""
Write-Host "To get X API credentials:" -ForegroundColor Cyan
Write-Host "  1. Go to https://developer.twitter.com/en/portal/dashboard" -ForegroundColor White
Write-Host "  2. Create a new project/app" -ForegroundColor White
Write-Host "  3. Enable OAuth 2.0 with read/write permissions" -ForegroundColor White
Write-Host "  4. Set callback URL: http://localhost:5000/api/auth/x/callback" -ForegroundColor White
Write-Host ""
Write-Host "Starting the application..." -ForegroundColor Yellow
Write-Host "  Backend will start on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Frontend will start on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start the application
npm run dev:all
