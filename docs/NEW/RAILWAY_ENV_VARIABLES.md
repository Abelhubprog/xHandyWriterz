# Railway Environment Variables

This guide lists the variables required to run Strapi 5 on Railway alongside the HandyWriterz front-end.

## Required Variables (Strapi service)

| Key | Example | Notes |
|-----|---------|-------|
| `NODE_ENV` | `production` | Railway sets this automatically when using the production environment. |
| `HOST` | `0.0.0.0` | Allows Strapi to bind to all interfaces. |
| `PORT` | `1337` | Keep default; Railway maps it to the public port. |
| `URL` | `https://<your-app>.up.railway.app` | Public HTTPS URL used by Strapi to generate absolute links. |
| `ENABLE_PROXY` | `true` | Trust Railway's reverse proxy so secure cookies work. |
| `ADMIN_SESSION_COOKIE_SECURE` | `true` | Ensures the admin cookie is marked as secure in production. |
| `ADMIN_SESSION_COOKIE_SAMESITE` | `none` | Required when the admin UI sits behind the Railway proxy. |
| `APP_KEYS` | generated | Comma-separated list of four random secrets. |
| `API_TOKEN_SALT` | generated | Random secret for API tokens. |
| `ADMIN_JWT_SECRET` | generated | Secret used to sign admin JWTs. |
| `TRANSFER_TOKEN_SALT` | generated | Secret for transfer tokens. |
| `JWT_SECRET` | generated | Secret used for public-facing JWTs. |
| `ENCRYPTION_KEY` | generated | Used by Strapi for sensitive data at rest. |
| `DATABASE_CLIENT` | `postgres` | Railway Postgres driver. |
| `DATABASE_URL` | injected by Railway | Automatically provided when a Postgres service is attached. |

> Use `node generate-railway-secrets.js` to generate secure values for the Strapi secrets above.

## Optional Variables

| Key | Description |
|-----|-------------|
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Enable the Cloudflare R2 upload provider. |
| `R2_ENDPOINT` / `R2_BUCKET` / `R2_REGION` | R2 endpoint configuration. |
| `R2_PUBLIC_BASE` | Public CDN domain for serving media. |
| `EMAIL_PROVIDER` + provider-specific keys | Configure email notifications (Resend, SendGrid, SMTP, etc.). |

## Front-end (`apps/web`) Variables on Railway (if deployed separately)

| Key | Example | Notes |
|-----|---------|-------|
| `VITE_CMS_URL` | `https://<your-app>.up.railway.app` | Points the web app to the Railway-hosted Strapi instance. |
| `VITE_CMS_TOKEN` | Strapi API token | Needed for server-side operations in the web app. |
| `VITE_CLERK_PUBLISHABLE_KEY` | from Clerk | Required for Clerk authentication. |
| `VITE_MATTERMOST_URL` | optional | Only needed when the Mattermost embed is enabled. |
| `VITE_UPLOAD_BROKER_URL` | optional | URL of the Cloudflare Worker handling upload presigns. |

## Railway CLI Cheat Sheet

```
# Link the local Strapi app to a Railway project
cd apps/strapi
railway link

# Generate recommended secrets
node ../../generate-railway-secrets.js

# Set required variables
railway variables set ENABLE_PROXY true
railway variables set ADMIN_SESSION_COOKIE_SECURE true
railway variables set ADMIN_SESSION_COOKIE_SAMESITE none
railway variables set DATABASE_CLIENT postgres
# ...set the generated secrets from the script output...

# Deploy
railway up
```

## Post-deploy Checklist

1. Wait for the build to finish and confirm logs show `Server listening on 0.0.0.0:1337`.
2. Reset the admin password if needed:
   ```powershell
   railway run --service strapi node scripts/reset-admin-password.js -- --email admin@example.com --password TempPassw0rd!2024
   ```
3. Log into the Strapi admin at `<URL>/admin` and rotate the temporary password.
4. Update the web application `.env` (local or production) with the live `VITE_CMS_URL` and API token.

Tip: keep a copy of the Railway variables (without secrets) in the repository docs so future deployments are repeatable.
