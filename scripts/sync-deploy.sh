#!/bin/bash
set -e

# =============================================================
# WellForged Deployment Sync Script for macOS / Linux
# =============================================================

CommitMessage="${1:-sync: update from main monorepo}"

MONOREPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$MONOREPO_ROOT/frontend"
BACKEND_DIR="$MONOREPO_ROOT/Backend"

UI_REPO="https://github.com/AMOLIAYUSH/wellforged-ui.git"
API_REPO="https://github.com/AMOLIAYUSH/wellforged-api.git"

TEMP_DIR="/tmp/wellforged-sync"

echo "=================================================="
echo "🚀 WellForged Deploy Sync (macOS/Linux)"
echo "📝 Commit message: $CommitMessage"
echo "=================================================="

# Create temp dir
mkdir -p "$TEMP_DIR"

sync_folder() {
  local source_dir="$1"
  local remote_url="$2"
  local repo_name="$3"
  local message="$4"

  echo ""
  echo ">> Syncing $repo_name ..."

  local clone_dir="$TEMP_DIR/$repo_name"

  # Remove previous temp clone if it exists
  rm -rf "$clone_dir"

  # Shallow clone
  echo "  Cloning $remote_url ..."
  git clone --depth=1 "$remote_url" "$clone_dir"

  # Delete everything except .git
  find "$clone_dir" -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +

  # Copy safe files (respecting exclusions)
  echo "  Copying files from $source_dir ..."
  rsync -av "$source_dir/" "$clone_dir/" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude "dist-ssr" \
    --exclude ".env" \
    --exclude "*.env" \
    --exclude ".env.local" \
    --exclude ".env.production" \
    --exclude ".env.development" \
    --exclude "*.log" \
    --exclude ".DS_Store"

  cd "$clone_dir"
  git add -A

  if [ -z "$(git status --porcelain)" ]; then
    echo "  [SKIP] No changes detected in $repo_name"
    return
  fi

  git commit -m "$message"
  git push origin main --force || git push origin HEAD:main --force
  echo "✅ [OK] $repo_name pushed successfully!"
}

# 1. Sync frontend
sync_folder "$FRONTEND_DIR" "$UI_REPO" "wellforged-ui" "$CommitMessage"

# 2. Sync Backend
sync_folder "$BACKEND_DIR" "$API_REPO" "wellforged-api" "$CommitMessage"

# Cleanup
rm -rf "$TEMP_DIR"
echo ""
echo "🎉 All done! Vercel will auto-deploy from the updated repos."
