#!/usr/bin/env bash
set -euo pipefail

# Ensure node, npm, and pm2 are on PATH in non-interactive SSH shells
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NODE_DIR=$(ls -1 "$HOME/.nvm/versions/node" | sort -V | tail -n 1)
  if [ -n "$LATEST_NODE_DIR" ]; then
    export PATH="$HOME/.nvm/versions/node/$LATEST_NODE_DIR/bin:$PATH"
  fi
fi

APP_DIR="/var/www/social-pulse"
APP_NAME="social-pulse-dashboard"
PORT="3006"

echo "==> [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting auto-deploy for $APP_NAME"
cd "$APP_DIR"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

npm ci --no-audit --no-fund
npm run build

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  PORT="$PORT" pm2 start npm --name "$APP_NAME" -- start -- -p "$PORT"
fi

pm2 save
echo "==> Live at https://socialpulse.64.247.186.26.sslip.io/"
