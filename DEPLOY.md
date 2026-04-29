# Deploying Koblio

Databases run in Docker. The API and web app run directly with Node.js + pm2.
No image rebuilds — `deploy.sh` does `git pull → pnpm build → pm2 reload` in ~3 min.

---

## First-time VPS setup

### 1. Install dependencies

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm@10

# pm2
npm install -g pm2

# Docker (for Postgres + Redis)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in
```

### 2. Clone the repo

```bash
git clone https://github.com/tjokrogunawant-dev/koblio-platform.git
cd koblio-platform
```

### 3. Create `.env`

```bash
cp .env.example .env
```

Fill in all values. The key ones:

```env
# Generate with: openssl rand -hex 32
JWT_SECRET=

# Your Postgres password (any random string)
POSTGRES_PASSWORD=

# Where the API is reachable from the browser (no trailing slash)
API_URL=http://YOUR_VPS_IP:3001

# Your VPS IP or domain (used for CORS on the API)
WEB_URL=http://YOUR_VPS_IP:3000

# Connection strings — localhost because Postgres/Redis run in Docker with host port bindings
DATABASE_URL=postgresql://koblio:YOUR_POSTGRES_PASSWORD@localhost:5432/koblio
REDIS_URL=redis://localhost:6379
```

### 4. Start databases

```bash
docker compose up -d
```

This starts Postgres (port 5432) and Redis (port 6379), both bound to `127.0.0.1`.

### 5. Install dependencies and build

```bash
pnpm install --frozen-lockfile
pnpm --filter @koblio/shared build
pnpm --filter @koblio/api build
pnpm --filter @koblio/web build
```

### 6. Copy Next.js static files into standalone output

```bash
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public apps/web/.next/standalone/apps/web/public
```

### 7. Run migrations and seed

```bash
set -a; source .env; set +a
pnpm --filter @koblio/api exec prisma migrate deploy
pnpm --filter @koblio/api exec prisma db seed
```

### 8. Start with pm2

```bash
pm2 start pm2.config.js --env production
pm2 save          # persist across reboots
pm2 startup       # follow the printed command to enable autostart
```

Check everything is running:

```bash
pm2 status
curl http://localhost:3001/api/health
# → {"status":"ok","db":"ok"}
```

Open `http://YOUR_VPS_IP:3000` in a browser.

---

## Updating (every deploy)

Just run the deploy script:

```bash
bash deploy.sh
```

Or it runs automatically via GitHub Actions on every push to `main` (requires the secrets below).

---

## CI/CD — GitHub Actions auto-deploy

Add these secrets in GitHub → Settings → Secrets → Actions:

| Secret | Value |
|---|---|
| `VPS_HOST` | Your VPS IP or hostname |
| `VPS_USER` | SSH user (e.g. `ubuntu`) |
| `VPS_SSH_KEY` | Private key for SSH access (paste the full `-----BEGIN...` block) |
| `VPS_DEPLOY_PATH` | Absolute path to the repo on the VPS (e.g. `/home/ubuntu/koblio`) |

After that, every push to `main` triggers: lint + typecheck + test → SSH → `deploy.sh`.

To generate an SSH key pair for CI:
```bash
ssh-keygen -t ed25519 -C "koblio-ci" -f koblio_ci_key -N ""
# Add koblio_ci_key.pub to ~/.ssh/authorized_keys on the VPS
# Paste koblio_ci_key (private) into VPS_SSH_KEY secret
```

---

## Optional: Nginx + HTTPS

Install Caddy for automatic HTTPS:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

`/etc/caddy/Caddyfile`:
```
app.yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:3001
}
```

Update `.env`:
```
API_URL=https://api.yourdomain.com
WEB_URL=https://app.yourdomain.com
```

Then redeploy: `bash deploy.sh`

---

## Environment variable reference

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Signs all JWTs. Min 32 chars. |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password. |
| `DATABASE_URL` | Yes | `postgresql://koblio:<password>@localhost:5432/koblio` |
| `REDIS_URL` | Yes | `redis://localhost:6379` |
| `API_URL` | Yes | Public URL of the API (used by the web app at build time). |
| `WEB_URL` | Yes | Public URL of the web app (used for CORS on the API). |
| `SENTRY_DSN` | No | Error tracking. Leave blank to disable. |
| `SENDGRID_API_KEY` | No | Password reset emails. Leave blank to disable. |
