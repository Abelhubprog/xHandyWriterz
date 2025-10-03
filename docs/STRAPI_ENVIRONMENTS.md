# Strapi 5 Environments

This reference explains how HandyWriterz runs Strapi locally, on Railway, and what would change if we migrate to Strapi Cloud. It also clarifies how Clerk authentication relates to Strapi's own admin accounts.

## 1. Local Development
- **Database**: SQLite (DATABASE_CLIENT=sqlite, DATABASE_FILENAME=.tmp/data.db).
- **Storage**: Local public/uploads directory. R2 variables are optional.
- **Session cookies**: ADMIN_SESSION_COOKIE_SECURE=false, ADMIN_SESSION_COOKIE_SAMESITE=lax.
- **Clerk**: Only used by the Vite web app. Strapi admin login still uses Strapi's own credentials.
- **Start commands**:
  `powershell
  pnpm install
  pnpm --filter strapi dev
  `

## 2. Railway (Self-hosted Production)
- **Database**: Railway Postgres. Set DATABASE_CLIENT=postgres and DATABASE_URL in Railway variables.
- **Storage**: Cloudflare R2 via the S3 provider (R2_* variables) if media must be shared with the front-end.
- **Session cookies**: ENABLE_PROXY=true, ADMIN_SESSION_COOKIE_SECURE=true, ADMIN_SESSION_COOKIE_SAMESITE=none to keep cookies valid behind Railway's HTTPS proxy.
- **Admin access**: Use the bundled scripts:
  `powershell
  railway run --service strapi node scripts/create-admin.js
  railway run --service strapi node scripts/reset-admin-password.js
  `
  They proxy to the official Strapi CLI and respect ADMIN_EMAIL / ADMIN_PASSWORD env vars.
- **Clerk**: Still powers only the web dashboard. Strapi admin remains separate; do not reuse Clerk credentials.

## 3. Strapi Cloud (Managed)
- **Database & file storage**: Managed by Strapi Cloud. Do not set DATABASE_* or R2_* variables—Strapi Cloud injects its own.
- **Admin auth**: Managed accounts, optional SSO via Strapi Cloud UI. Existing admin CLI scripts are not needed.
- **Front-end integration**: VITE_CMS_URL should target the Strapi Cloud domain. Access tokens are managed via Personal Access Tokens or GraphQL auth policies.

## 4. Double Admin Clarification
- **Clerk** authenticates HandyWriterz end-users and staff inside the Vite SPA.
- **Strapi Admin** uses its own auth stack (either email/password or optional SSO in Strapi Cloud).
- There is no shared session between Clerk and Strapi; keep roles aligned by synchronising metadata (e.g., replicate Clerk roles inside Strapi's Permission roles if required).

## 5. Required Environment Variables
| Scope | Variable | Local | Railway | Notes |
|-------|----------|-------|---------|-------|
| Database | DATABASE_CLIENT | sqlite | postgres | Selects driver |
| Database | DATABASE_URL | _not set_ | postgresql://... | Railway connection string |
| Database | DATABASE_POOL_MIN / MAX | optional | tune per service | Prevents exhausted pools |
| Session | ENABLE_PROXY | 	rue | 	rue | Trust x-forwarded-* |
| Session | ADMIN_SESSION_COOKIE_SECURE | alse | 	rue | HTTPS cookies in prod |
| Session | ADMIN_SESSION_COOKIE_SAMESITE | lax | 
one | Required when embedding admin via HTTPS |
| Storage | R2_* | optional | required if using R2 | Provide when S3 provider is enabled |
| Front-end | VITE_CMS_URL | http://localhost:1337 | Railway URL | Consumed by Vite app |

## 6. Recommended Workflow
1. Develop locally with SQLite and file uploads stored on disk.
2. Before deploying, run pnpm --filter strapi build to refresh the compiled dist/ output.
3. Push to GitHub; Railway auto-builds the strapi app.
4. After deployment, run the password reset script if the admin user list is empty.
5. Update the Vite app environment variables (VITE_CMS_URL, VITE_CMS_TOKEN) so the front-end hits the live Strapi instance.

## 7. Security Checklist
- Rotate APP_KEYS, JWT_SECRET, and ADMIN_JWT_SECRET for each environment.
- Restrict R2 credentials to the cms-media bucket with least privilege.
- Never expose Strapi admin over HTTP; always front it with HTTPS (Railway provides TLS).
- Use Clerk metadata to decide who may access links to the Strapi admin; do **not** attempt to reuse Clerk sessions with Strapi-admin cookies.

