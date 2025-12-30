# Railway + Local runbook (HandyWriterz)

This repo is a pnpm-workspaces monorepo with these deployable services:

| Service | Path | Local URL | Default Port | Railway Notes |
| --- | --- | ---: | ---: | --- |
| Web (Vite SPA) | `apps/web` | [http://localhost:5173](http://localhost:5173) | 5173 (dev), 4173 (prod server) | Deployed as its own service |
| API (Express) | `apps/api` | [http://localhost:3001](http://localhost:3001) | 3001 | Upload presigns + payments + messaging + sitemap/robots |
| Strapi (CMS) | `apps/strapi` | [http://localhost:1337](http://localhost:1337) | 1337 | Admin at `/admin` |
| Mattermost | `apps/mattermost` | [http://localhost:8065](http://localhost:8065) | 8065 | Typically runs via Docker |
| Postgres | Railway plugin / Docker | localhost or Railway private host | 5432 | Used by Strapi + Mattermost |

## Security note (important)

- Do not commit secrets, API keys, DB passwords, JWT secrets, or Clerk keys.
- If you previously committed secrets here, rotate/revoke them immediately (assume they are compromised).

## Local development

### Prereqs

- Node.js (see root `package.json` engines), Corepack enabled.
- `pnpm` via Corepack.
- Docker Desktop (only required for Mattermost local stack).

### Install

```bash
pnpm install --frozen-lockfile
```

### Run (recommended split terminals)

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:strapi
```

Local ports:

- Web: `5173`
- API: `3001` (health at `/health`)
- Strapi: `1337` (health at `/_health`)

### Web local env (apps/web/.env)

The SPA uses `VITE_API_URL` (via `resolveApiUrl()`) for backend calls.

Minimum useful local values:

```bash
VITE_API_URL=http://localhost:3001
VITE_CMS_URL=http://localhost:1337

# Clerk (required for auth flows)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_DOMAIN=https://<your-clerk-domain>
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Optional:

```bash
VITE_CMS_TOKEN=<strapi-api-token>
VITE_MATTERMOST_URL=http://localhost:8065
VITE_UPLOAD_BROKER_URL=<optional>
```

Notes:

- The Vite dev proxy in `apps/web/vite.config.ts` currently points `/api` at a production Strapi URL; for local API development, rely on `VITE_API_URL=http://localhost:3001` and ensure the web app uses `resolveApiUrl()` for backend calls.

### Mattermost local (optional)

Mattermost is easiest locally via Docker Compose:

```bash
cd apps/mattermost
cp .env.example .env
docker compose up -d
```

Then open [http://localhost:8065](http://localhost:8065).

## Production (Railway)

This section is a practical checklist for deploying each service as a separate Railway service.

### Recommended public domains

- Web: `https://handywriterz.com` (or Railway domain)
- API: `https://api.handywriterz.com` (or Railway domain)
- Strapi: `https://cms.handywriterz.com` (or Railway domain)
- Mattermost: `https://message.handywriterz.com` (or Railway domain)

If you want the API to appear under the same domain as the web app (e.g. `https://handywriterz.com/api/*`), you must add a reverse proxy/CDN rule; the web server in `apps/web/scripts/server.mjs` does not proxy `/api/*`.

### Web service (apps/web)

Local:

- Dev: `pnpm dev:web` (5173)
- Prod preview-style: `pnpm --filter @handywriterz/web build && pnpm --filter @handywriterz/web start` (uses `PORT`, default 4173)

Railway requirements:

- Build method: Dockerfile (see `apps/web/Dockerfile`).
- Start command: `node scripts/server.mjs`.
- Must set `PORT` (Railway injects this automatically).

Required variables (build-time for Vite, set in Railway Variables):

```bash
VITE_API_URL=https://api.handywriterz.com
VITE_CMS_URL=https://cms.handywriterz.com

VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_DOMAIN=https://<your-clerk-domain>
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Optional:

```bash
VITE_CMS_TOKEN=<strapi-api-token>
VITE_MATTERMOST_URL=https://message.handywriterz.com
VITE_UPLOAD_BROKER_URL=<optional>
```

More detail: see `apps/web/RAILWAY_ENV_SETUP.md`.

### API service (apps/api)

Local:

```bash
pnpm dev:api
```

Railway:

- Build method: Dockerfile (`apps/api/Dockerfile`).
- Health check: `/health`.
- Port: `PORT` (default 3001 locally).

Recommended variables:

```bash
NODE_ENV=production
CORS_ORIGINS=https://handywriterz.com,https://www.handywriterz.com,https://cms.handywriterz.com
```

### Strapi service (apps/strapi)

Local:

```bash
pnpm dev:strapi
```

Railway:

- Attach a Railway Postgres plugin to Strapi.
- Set Strapi proxy/cookie variables correctly (critical for admin sessions).

Required variables are documented in `docs/NEW/RAILWAY_ENV_VARIABLES.md`. The key ones:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
URL=https://cms.handywriterz.com

ENABLE_PROXY=true
ADMIN_SESSION_COOKIE_SECURE=true
ADMIN_SESSION_COOKIE_SAMESITE=none

DATABASE_CLIENT=postgres
DATABASE_URL=<provided by Railway when Postgres is attached>

# plus Strapi secrets: APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, TRANSFER_TOKEN_SALT, JWT_SECRET, ENCRYPTION_KEY
```

Health endpoint: `/_health`.

### Mattermost service (apps/mattermost)

Local:

- Prefer Docker Compose: see `apps/mattermost/README.md`.

Railway:

- Attach Postgres to Mattermost (or provide an external Postgres URL).
- Configure `MM_SQLSETTINGS_DATASOURCE` to point at the attached Postgres.

Minimum variables (example placeholders):

```bash
MM_SERVICESETTINGS_SITEURL=https://message.handywriterz.com
MM_SQLSETTINGS_DRIVERNAME=postgres
MM_SQLSETTINGS_DATASOURCE=postgres://<user>:<password>@<host>:5432/<db>?sslmode=require
```

Optional: configure S3/R2 file storage via `MM_FILESETTINGS_*` / `MM_R2_*`.

### Postgres (Railway plugin)

- For Strapi: attach Postgres and use the injected `DATABASE_URL`.
- For Mattermost: either attach Postgres or set `MM_SQLSETTINGS_DATASOURCE` to an external connection string.

## Quick health checks

- Web: `GET /` and `GET /health` (the web server responds `OK`)
- API: `GET /health`
- Strapi: `GET /_health`
- Mattermost: `GET /api/v4/system/ping`
