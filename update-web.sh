#!/bin/bash
# Quick web-only redeploy: no migrations, no API rebuild (~1 min)
set -euo pipefail

echo "==> Pulling latest code..."
git pull origin master

echo "==> Symlinking root .env into web app..."
ln -sf "$(pwd)/.env" apps/web/.env

echo "==> Building web..."
pnpm --filter @koblio/web build

echo "==> Copying Next.js static assets..."
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public apps/web/.next/standalone/apps/web/public

echo "==> Reloading koblio-web..."
pm2 reload koblio-web

echo "==> Done!"
pm2 status
