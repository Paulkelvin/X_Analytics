# X Analytics Dashboard - Environment Check

Write-Host "🔍 X Analytics Dashboard - Environment Check" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

# Check Node.js
Write-Host "1️⃣  Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
    
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        Write-Host "   ⚠️  Warning: Node.js 18+ recommended (you have v$nodeMajor)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
}

Write-Host ""

# Check npm
Write-Host "2️⃣  Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
}

Write-Host ""

# Check PostgreSQL
Write-Host "3️⃣  Checking PostgreSQL..." -ForegroundColor Yellow
$pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if ($pgProcess) {
    Write-Host "   ✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL not running" -ForegroundColor Red
    Write-Host "   → Please start PostgreSQL service" -ForegroundColor Yellow
}

Write-Host ""

# Check backend dependencies
Write-Host "4️⃣  Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\backend\node_modules") {
    Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend dependencies not installed" -ForegroundColor Red
    Write-Host "   → Run: cd backend && npm install" -ForegroundColor Yellow
}

Write-Host ""

# Check frontend dependencies
Write-Host "5️⃣  Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\frontend\node_modules") {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend dependencies not installed" -ForegroundColor Red
    Write-Host "   → Run: cd frontend && npm install" -ForegroundColor Yellow
}

Write-Host ""

# Check backend .env
Write-Host "6️⃣  Checking backend configuration..." -ForegroundColor Yellow
if (Test-Path ".\backend\.env") {
    Write-Host "   ✅ Backend .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content ".\backend\.env" -Raw
    
    if ($envContent -match "your_password" -or $envContent -match "your_client_id") {
        Write-Host "   ⚠️  Warning: .env contains placeholder values" -ForegroundColor Yellow
        Write-Host "   → Please update with real credentials" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Backend .env file not found" -ForegroundColor Red
    Write-Host "   → Copy .env.example to .env and configure" -ForegroundColor Yellow
}

Write-Host ""

# Check frontend .env.local
Write-Host "7️⃣  Checking frontend configuration..." -ForegroundColor Yellow
if (Test-Path ".\frontend\.env.local") {
    Write-Host "   ✅ Frontend .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend .env.local file not found" -ForegroundColor Red
    Write-Host "   → Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Gray

# Summary
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "   ❌ Install Node.js 18+" -ForegroundColor Red
    $allGood = $false
}

if (-not $pgProcess) {
    Write-Host "   ❌ Start PostgreSQL" -ForegroundColor Red
    $allGood = $false
}

if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "   ❌ Install backend dependencies: cd backend && npm install" -ForegroundColor Red
    $allGood = $false
}

if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "   ❌ Install frontend dependencies: cd frontend && npm install" -ForegroundColor Red
    $allGood = $false
}

if (-not (Test-Path ".\backend\.env")) {
    Write-Host "   ❌ Configure backend .env file" -ForegroundColor Red
    $allGood = $false
}

if ($allGood) {
    Write-Host "   ✅ All checks passed! You're ready to start." -ForegroundColor Green
    Write-Host ""
    Write-Host "   Run: .\start.ps1" -ForegroundColor Cyan
    Write-Host "   Or: npm run dev:all" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "   ⚠️  Please fix the issues above before starting" -ForegroundColor Yellow
}

Write-Host ""
