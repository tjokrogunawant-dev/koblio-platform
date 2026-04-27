# Deploying Koblio for Testing

No external accounts needed. Runs on any VPS with Docker.

---

## Requirements

- A VPS (Ubuntu 22.04+ recommended, 1 GB RAM minimum)
- Docker + Docker Compose installed
- Ports 3000 and 3001 open (or a reverse proxy like nginx/Caddy in front)

---

## 1. Install Docker on the VPS

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
```

---

## 2. Clone the repo

```bash
git clone https://github.com/tjokrogunawant-dev/koblio-platform.git
cd koblio-platform
```

---

## 3. Create a `.env` file

```bash
cp .env.example .env
```

Edit `.env` with these values:

```env
# Generate with: openssl rand -hex 32
JWT_SECRET=replace_with_64_char_random_string

# Generate with: openssl rand -hex 16
POSTGRES_PASSWORD=replace_with_random_password

# The public URL of your API (no trailing slash)
# If running locally: http://localhost:3001
# If on a VPS with a domain: https://api.yourdomain.com
API_URL=http://YOUR_VPS_IP:3001

# The public URL of the web app (used for CORS on the API)
# If running locally: http://localhost:3000
# If on a VPS with a domain: https://app.yourdomain.com
WEB_URL=http://YOUR_VPS_IP:3000
```

To generate secrets:
```bash
openssl rand -hex 32   # for JWT_SECRET
openssl rand -hex 16   # for POSTGRES_PASSWORD
```

---

## 4. Deploy

```bash
docker compose up -d --build
```

This builds both images and starts postgres, redis, api, and web. The API runs `prisma migrate deploy` automatically on startup.

Check logs:
```bash
docker compose logs -f api
docker compose logs -f web
```

---

## 5. Seed the problems (first deploy only)

```bash
docker compose exec api npx prisma db seed
```

This loads 200 math problems (Grades 1–3).

---

## 6. Verify

```bash
curl http://YOUR_VPS_IP:3001/api/health
# → {"status":"ok","db":"ok"}
```

Open `http://YOUR_VPS_IP:3000` in a browser — you should see the Koblio homepage.

---

## Testing the full flow

1. Go to `/register` → click **I'm a Teacher** → fill in the form
2. In the teacher dashboard, click **Create Class** → note the **class code** shown
3. Open an incognito tab → go to `/register` → click **I'm a Student**
4. Enter the class code → create a username and password → pick an avatar
5. Start solving problems

---

## Updating

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on API startup.

---

## Optional: Nginx reverse proxy with HTTPS

If you have a domain, install Caddy (easiest) or Nginx + Certbot.

**Caddy** (auto HTTPS):
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

Then set in `.env`:
```
API_URL=https://api.yourdomain.com
WEB_URL=https://app.yourdomain.com
```

And redeploy: `docker compose up -d --build`

---

## Environment variable reference

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Signs all JWTs. Min 32 chars. |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password. |
| `API_URL` | Yes | Public URL of the API (used by the web app). |
| `WEB_URL` | Yes | Public URL of the web app (used for CORS). |
| `SENTRY_DSN` | No | Error tracking. Leave blank to disable. |
| `SENDGRID_API_KEY` | No | Weekly email digest. Leave blank to disable. |
| `STRIPE_SECRET_KEY` | No | Subscription payments. Leave blank to disable. |
