# Ibn Batouta Web

A lightweight platform for creating professional websites. It includes:
- `website-server.js` (public website)
- `admin-server.js` (admin panel)

## Local Development

No build step and no external packages are required.

1. Start website server:
   ```bash
   node website-server.js
   ```
   Website: `http://localhost:5500`

2. Start admin server:
   ```bash
   # Set admin credentials before starting
   export ADMIN_USER=admin
   export ADMIN_PASS=change_this_password
   node admin-server.js
   ```
   Admin: `http://localhost:5600/admin`

---

## Deploy to Coolify (Step-by-Step)

This repository is ready for **Docker Compose** deployment on Coolify.

### 1) Prepare repository
Make sure these files exist in your repo root:
- `docker-compose.yml`
- `Dockerfile`
- `.env.example`

### 2) Create project in Coolify
1. In Coolify, click **New Resource**.
2. Choose **Application**.
3. Connect/select your Git repository.
4. Set **Build Pack** to **Docker Compose**.
5. Keep the compose file path as `docker-compose.yml`.

### 3) Configure environment variables in Coolify
Add these variables (use your real domains):

- `WEBSITE_PORT=5500`
- `ADMIN_PORT=5600`
- `WEBSITE_DOMAIN=your-main-domain.com`
- `ADMIN_DOMAIN=admin.your-main-domain.com`
- `ADMIN_USER=admin`
- `ADMIN_PASS=<strong-password>`
- `COOKIE_SECURE=true` (recommended when admin is only served over HTTPS)

Ports must be valid TCP ports (`1-65535`).

> Notes:
> - Internal ports should stay `5500` and `5600` unless you intentionally change them.
> - Coolify can also manage domains via its UI even when compose labels exist.

### 4) Configure domains/routes
In Coolify:
- Map your main domain to the `website` service.
- Map your admin domain to the `admin` service.

### 5) Deploy
Click **Deploy** and wait for both services to be healthy.

### 6) Validate after deployment
Check:
- `https://your-main-domain.com/` loads the website.
- `https://admin.your-main-domain.com/admin` loads the admin panel.
- Health checks pass for both services.

---

## Important fix included for Coolify startup
A startup crash was caused by referencing `PORT` (uppercase) while only `port` (lowercase) was defined in `website-server.js`.

This is now fixed, and the website server correctly listens with:
- `process.env.PORT` (if provided by Coolify), or
- fallback to `5500`.

---

## Troubleshooting

### Error: `ReferenceError: PORT is not defined`
Cause: old image/commit still running.

Fix:
1. Ensure latest commit is deployed.
2. Trigger **Redeploy (Rebuild image)** in Coolify.
3. Confirm logs show: `Server running on 5500` (or your configured port).

### Service starts but domain not reachable
- Verify DNS records point to your Coolify server.
- Verify domain is attached to the correct service.
- Verify TLS/certificate generation completed.

### Data is lost after redeploy
The compose file already uses volumes:
- `/app/data`
- `/app/assets/uploads`

Do not remove volumes unless you intentionally reset data.

---

## Manual Docker Compose Deployment (without Coolify)

```bash
cp .env.example .env
# edit .env values if needed

docker compose up -d --build
```

Check:
- Website: `http://localhost:5500`
- Admin: `http://localhost:5600/admin`

## Data Persistence

Configuration, contacts, and uploads are stored in:
- `data/`
- `assets/uploads/`

In Docker deployment, these are persisted through named volumes.

## Automation Scripts

For easier repeatable deployment, use the scripts in `scripts/`.

1. Setup or update `.env` (domain + secure admin password):
   ```bash
   pwsh ./scripts/setup-env.ps1 -Domain ibnbatoutaweb.com
   ```

2. Build, deploy locally, wait for healthy containers, and run smoke checks:
   ```bash
   pwsh ./scripts/deploy-local.ps1
   ```

3. Commit, push, and optionally trigger Coolify webhook:
   ```bash
   pwsh ./scripts/push-and-deploy.ps1 -Branch main -Remote origin
   ```
   You can pass `-WebhookUrl "<your-coolify-webhook>"` or set `COOLIFY_WEBHOOK_PROD`.

## GitHub Auto Deploy

This repo already includes `.github/workflows/deploy.yml`.
To enable automatic Coolify deploy from GitHub Actions, set:

- `COOLIFY_WEBHOOK_PROD` (required for main branch deploy)
- `COOLIFY_WEBHOOK_STAGING` (optional for staging branch)
