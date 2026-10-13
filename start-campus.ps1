$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$smartTrack = Join-Path $root "Smartracker-Chinu\SmartTrack"
$campusWeb = Join-Path $root "campus-3d-main\campus-3d-main\web-platform"
$requirements = Join-Path $smartTrack "requirements.txt"
$database = Join-Path $smartTrack "db.sqlite3"
$facultyData = Join-Path $root "Smartracker-Chinu\Faculty data.json"
$environment = Join-Path $env:LOCALAPPDATA "CampusGuide3D\SmartTrack"
$python = Join-Path $environment "Scripts\python.exe"
$requirementsMarker = Join-Path $environment "requirements.sha256"
$isNewDatabase = -not (Test-Path -LiteralPath $database)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required. Install Node.js 18.18 or newer, then run this command again."
}

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "The Windows Python launcher is required. Install Python 3.10 or newer, then run this command again."
}

if (-not (Test-Path -LiteralPath $campusWeb)) {
    throw "Campus Guide web app was not found: $campusWeb"
}

if (-not (Test-Path -LiteralPath $smartTrack)) {
    throw "SmartTracker was not found: $smartTrack"
}

if (-not (Test-Path -LiteralPath $python)) {
    New-Item -ItemType Directory -Path $environment -Force | Out-Null
    & py -3 -m venv $environment
    if ($LASTEXITCODE -ne 0) {
        throw "Could not create the SmartTracker Python environment."
    }
}

$requirementsHash = (Get-FileHash -LiteralPath $requirements -Algorithm SHA256).Hash
$installedHash = if (Test-Path -LiteralPath $requirementsMarker) {
    (Get-Content -LiteralPath $requirementsMarker -Raw).Trim()
} else {
    ""
}

if ($installedHash -ne $requirementsHash) {
    Write-Host "Installing SmartTracker Python dependencies (first run or requirements changed)..."
    & $python -m pip install -r $requirements
    if ($LASTEXITCODE -ne 0) {
        throw "SmartTracker dependency installation failed."
    }
    Set-Content -LiteralPath $requirementsMarker -Value $requirementsHash -NoNewline
}

$nodeModules = Join-Path $campusWeb "node_modules"
if (-not (Test-Path -LiteralPath $nodeModules)) {
    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw "npm was not found. Install Node.js with npm, then run this command again."
    }
    Write-Host "Installing Campus Guide frontend dependencies..."
    Push-Location $campusWeb
    try {
        & npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) {
            throw "Campus Guide frontend dependency installation failed."
        }
    } finally {
        Pop-Location
    }
}

$env:CAMPUS_APP_ORIGIN = "http://localhost:3000"
Push-Location $smartTrack
try {
    & $python manage.py migrate --noinput
    if ($LASTEXITCODE -ne 0) {
        throw "SmartTracker database migrations failed."
    }

    if ($isNewDatabase) {
        if (-not (Test-Path -LiteralPath $facultyData)) {
            throw "Faculty data was not found for the first SmartTracker database setup: $facultyData"
        }
        & $python manage.py import_faculty $facultyData
        if ($LASTEXITCODE -ne 0) {
            throw "Initial SmartTracker faculty import failed."
        }
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Starting Campus Guide + SmartTracker. Open http://localhost:3000"
Write-Host "Choose Explore/Game, then click Find Faculty. Press Ctrl+C to stop both."
Write-Host ""

& node (Join-Path $root "start-campus.js")
exit $LASTEXITCODE
