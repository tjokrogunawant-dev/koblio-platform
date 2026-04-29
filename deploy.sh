#!/bin/bash
# Fast deploy: git pull → build → pm2 reload (~3 min, no Docker)
set -euo pipefail

echo "==> Pulling latest code..."
git pull origin master

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building packages..."
pnpm --filter @koblio/shared build
pnpm --filter @koblio/api build
pnpm --filter @koblio/web build

echo "==> Copying Next.js static assets into standalone output..."
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public apps/web/.next/standalone/apps/web/public

echo "==> Running database migrations..."
# Load DATABASE_URL from .env so prisma can connect
set -a; source .env; set +a
pnpm --filter @koblio/api exec prisma migrate deploy

echo "==> Reloading processes (zero-downtime)..."
pm2 startOrReload pm2.config.js --env production

echo "==> Done!"
pm2 status
