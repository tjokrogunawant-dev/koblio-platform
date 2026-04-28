# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy workspace manifests and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install all workspace deps (needed for build-time devDeps like @nestjs/cli)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
# Copy source
COPY . .

# Build shared package first (API depends on @koblio/shared types)
RUN pnpm --filter @koblio/shared build

# Generate Prisma client and compile TypeScript
RUN pnpm --filter @koblio/api build

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./dist

# Copy production node_modules (API workspace only)
COPY --from=builder /app/apps/api/node_modules ./node_modules

# Copy Prisma schema + migrations so `prisma migrate deploy` works at startup
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy package.json for metadata / scripts reference
COPY --from=builder /app/apps/api/package.json ./package.json

# Prisma CLI is needed to run migrations; install it at minimal cost
RUN npm install -g prisma --prefer-offline 2>/dev/null || npm install -g prisma

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "prisma migrate deploy && node dist/main.js"]
