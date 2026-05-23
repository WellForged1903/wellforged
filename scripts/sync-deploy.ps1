# =============================================================
# WellForged Deployment Sync Script
# Usage: .\scripts\sync-deploy.ps1
#        .\scripts\sync-deploy.ps1 -CommitMessage "your message"
# =============================================================

param(
    [string]$CommitMessage = "sync: update from main monorepo"
)

$ErrorActionPreference = "Stop"

$MONOREPO_ROOT = Split-Path -Parent $PSScriptRoot
$FRONTEND_DIR  = Join-Path $MONOREPO_ROOT "frontend"
$BACKEND_DIR   = Join-Path $MONOREPO_ROOT "Backend"

$UI_REPO  = "https://github.com/AMOLIAYUSH/wellforged-ui.git"
$API_REPO = "https://github.com/AMOLIAYUSH/wellforged-api.git"

$TEMP_DIR = Join-Path $env:TEMP "wellforged-sync"

# Files/folders to NEVER copy into deployment repos
$EXCLUDE_NAMES = @(
    "node_modules",
    "dist",
    "dist-ssr",
    ".env",
    "*.env",
    ".env.local",
    ".env.production",
    ".env.development",
    "*.log",
    ".DS_Store"
)

function Write-Step {
    param([string]$msg)
    Write-Host ""
    Write-Host ">> $msg" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$msg)
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Fail {
    param([string]$msg)
    Write-Host "[ERROR] $msg" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------
# Copy files while respecting the exclusion list
# ------------------------------------------------------------------
function Copy-Safe {
    param(
        [string]$Source,
        [string]$Dest
    )

    Get-ChildItem -Path $Source | ForEach-Object {
        $item = $_
        $shouldSkip = $false

        foreach ($pattern in $EXCLUDE_NAMES) {
            if ($item.Name -like $pattern) {
                Write-Host "  [SKIP] $($item.Name)" -ForegroundColor DarkGray
                $shouldSkip = $true
                break
            }
        }

        if (-not $shouldSkip) {
            $destPath = Join-Path $Dest $item.Name
            if ($item.PSIsContainer) {
                # Recurse into subdirectory
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                Copy-Safe -Source $item.FullName -Dest $destPath
            } else {
                Copy-Item -Path $item.FullName -Destination $destPath -Force
            }
        }
    }
}

# ------------------------------------------------------------------
# Sync a source folder into a remote GitHub repo and push
# ------------------------------------------------------------------
function Sync-Folder {
    param(
        [string]$SourceDir,
        [string]$RemoteUrl,
        [string]$RepoName,
        [string]$Message
    )

    Write-Step "Syncing $RepoName ..."

    $cloneDir = Join-Path $TEMP_DIR $RepoName

    # Remove previous temp clone if it exists
    if (Test-Path $cloneDir) {
        Remove-Item $cloneDir -Recurse -Force
    }

    # Shallow-clone the deployment repo
    Write-Host "  Cloning $RemoteUrl ..." -ForegroundColor Gray
    git clone --depth=1 $RemoteUrl $cloneDir
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to clone $RemoteUrl" }

    # Delete everything except .git
    Get-ChildItem -Path $cloneDir -Exclude ".git" | Remove-Item -Recurse -Force

    # Copy source files (excluding secrets / build artifacts)
    Write-Host "  Copying files from $SourceDir (excluding node_modules, .env, dist) ..." -ForegroundColor Gray
    Copy-Safe -Source $SourceDir -Dest $cloneDir

    Push-Location $cloneDir

    git add -A

    # Only commit if there are actual changes
    $changes = git status --porcelain
    if (-not $changes) {
        Write-Host "  [SKIP] No changes detected in $RepoName" -ForegroundColor Yellow
        Pop-Location
        return
    }

    git commit -m $Message
    if ($LASTEXITCODE -ne 0) { Write-Fail "git commit failed for $RepoName" }

    git push origin main --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Retrying push as HEAD:main ..." -ForegroundColor Yellow
        git push origin HEAD:main --force
        if ($LASTEXITCODE -ne 0) { Write-Fail "git push failed for $RepoName" }
    }

    Pop-Location
    Write-Ok "$RepoName pushed successfully!"
}

# ==============================
# MAIN
# ==============================

Write-Host ""
Write-Host "WellForged Deploy Sync" -ForegroundColor Magenta
Write-Host "Commit message: $CommitMessage" -ForegroundColor Gray
Write-Host "--------------------------------------" -ForegroundColor DarkGray

# Create temp dir if needed
if (-not (Test-Path $TEMP_DIR)) {
    New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null
}

# 1. Sync frontend/ -> wellforged-ui
Sync-Folder `
    -SourceDir $FRONTEND_DIR `
    -RemoteUrl $UI_REPO `
    -RepoName  "wellforged-ui" `
    -Message   $CommitMessage

# 2. Sync Backend/ -> wellforged-api
Sync-Folder `
    -SourceDir $BACKEND_DIR `
    -RemoteUrl $API_REPO `
    -RepoName  "wellforged-api" `
    -Message   $CommitMessage

# Cleanup temp folder
Remove-Item $TEMP_DIR -Recurse -Force

Write-Host ""
Write-Host "All done! Vercel will auto-deploy from the updated repos." -ForegroundColor Magenta
