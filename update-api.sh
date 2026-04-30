#!/bin/bash
# Quick API-only redeploy: no web rebuild, no migrations (~20s with SWC)
set -euo pipefail

echo "==> Pulling latest code..."
git pull origin master

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building API..."
pnpm --filter @koblio/api build

echo "==> Reloading koblio-api..."
pm2 reload koblio-api

echo "==> Done!"
pm2 status
