# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Build shared package first (API depends on @koblio/shared types)
RUN pnpm --filter @koblio/shared build

# Generate Prisma client + compile TypeScript
RUN pnpm --filter @koblio/api build

# Create a standalone deployment directory with flat (non-symlinked) node_modules.
# pnpm deploy resolves the workspace symlinks into real files, which lets us
# copy only the production deps to the runner without breaking pnpm's .pnpm store.
RUN pnpm --filter @koblio/api deploy --prod --legacy /app/api-standalone

# Re-run prisma generate in the standalone dir — pnpm deploy installs a
# fresh @prisma/client without the generated enums from the build stage.
RUN cd /app/api-standalone && node ./node_modules/.bin/prisma generate --schema=/app/apps/api/prisma/schema.prisma

# Copy the compiled app (pnpm deploy copies source, not dist)
RUN cp -r apps/api/dist /app/api-standalone/dist

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# node_modules from pnpm deploy — flat, no symlinks, prod only
COPY --from=builder /app/api-standalone/node_modules ./node_modules
COPY --from=builder /app/api-standalone/dist ./dist
COPY --from=builder /app/api-standalone/package.json ./package.json

# Prisma schema + migrations (needed by migrate deploy at startup)
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "node ./node_modules/.bin/prisma migrate deploy && node dist/main.js"]
