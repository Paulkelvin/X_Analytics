param(
    [Parameter(Mandatory = $true)]
    [string]$Password,

    [string]$Username = "matt015014_db_user",
    [string]$ClusterHost = "fhfassistant.arlanol.mongodb.net",
    [string]$Database = "x_analytics",
    [string]$AppName = "FHFassistant",

    [ValidateSet("production", "preview", "development", "all")]
    [string]$Target = "all"
)

function Ensure-Command {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        Write-Error "Required command '$Name' not found in PATH. Please install it first."
        exit 1
    }
}

# 1) Verify Vercel CLI is available
Ensure-Command -Name "vercel"

# 2) URL-encode password (safe even if already simple)
$encoded = [System.Uri]::EscapeDataString($Password)

# 3) Build MongoDB URI
$uri = "mongodb+srv://$Username:$encoded@$ClusterHost/$Database?retryWrites=true&w=majority&appName=$AppName"
Write-Host "Using URI (redacted password):" -ForegroundColor Cyan
Write-Host ($uri -replace [regex]::Escape($encoded), "********")

# 4) Ensure project is linked (requires interactive selection if not yet linked)
if (-not (Test-Path -Path (Join-Path $PSScriptRoot "..\.vercel"))) {
    Write-Host "Project not linked. Running 'vercel link'..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "..")
    vercel link
    Pop-Location
}

# 5) Set env(s)
function Set-VercelEnv {
    param(
        [string]$Environment
    )
    Write-Host "Setting MONGODB_URI for $Environment ..." -ForegroundColor Green
    Push-Location (Join-Path $PSScriptRoot "..")
    vercel env set MONGODB_URI "$uri" $Environment
    Pop-Location
}

switch ($Target) {
    "production"   { Set-VercelEnv -Environment "production" }
    "preview"      { Set-VercelEnv -Environment "preview" }
    "development"  { Set-VercelEnv -Environment "development" }
    "all"          { Set-VercelEnv -Environment "production"; Set-VercelEnv -Environment "preview" }
}

Write-Host "Done. To redeploy now, run: vercel --prod" -ForegroundColor Cyan
