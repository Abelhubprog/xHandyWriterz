# Strapi 5 Deployment (Railway + Cloudflare R2)

This is the production-ready checklist to ship the existing Strapi app in `apps/strapi`.

## Services
- Runtime: Node 18+ on Railway
- DB: Railway Postgres (SSL on)
- Storage: Cloudflare R2 (S3-compatible)
- Auth: Strapi admin only (Clerk is handled by web/API)
- Port: 1337

## Required environment variables
```
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=<comma-separated random strings>
API_TOKEN_SALT=<random>
ADMIN_JWT_SECRET=<random>
JWT_SECRET=<random>
TRANSFER_TOKEN_SALT=<random>

# Postgres (Railway)
DATABASE_CLIENT=postgres
DATABASE_URL=<postgres connection string>
DATABASE_SSL=true
DATABASE_SCHEMA=public

# Cloudflare R2 (uploads)
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_REGION=auto
R2_BUCKET=<bucket-name>
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>

# Email (optional)
EMAIL_PROVIDER=resend|sendgrid|nodemailer
RESEND_API_KEY=...
SENDGRID_API_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
EMAIL_FROM=noreply@handywriterz.com
EMAIL_REPLY_TO=support@handywriterz.com

# URL & Security
URL=https://cms.handywriterz.com
ENABLE_PROXY=true
CORS_ORIGIN=https://handywriterz.com,https://www.handywriterz.com,https://cms.handywriterz.com
```

## Build & run on Railway
```
# Service command
cd apps/strapi && pnpm install && pnpm run build && pnpm start
```
- Set Railway service port to 1337.
- First boot will prompt admin user creation via /admin.

## Upload provider (Cloudflare R2)
- Wired in `config/plugins.ts` using the `aws-s3` provider when `R2_*` vars are present.
- **Important:** `forcePathStyle: true` is set for R2 compatibility.
- Keep `R2_REGION=auto` and the R2 endpoint; set bucket policy for Put/Get/Delete.

## Database
- `config/database.ts` prefers Postgres when `DATABASE_CLIENT=postgres`.
- SSL is enabled via `DATABASE_SSL=true` (Railway PG usually needs it).

## Health Check
- Endpoint: `/api/health` returns JSON `{ status: "ok", timestamp, uptime }`.
- Use this for Railway uptime monitoring.

## Hardening (Completed)
- [x] `plugins.ts` - GraphQL playground disabled in production, introspection off.
- [x] `plugins.ts` - R2 upload provider with `forcePathStyle: true`.
- [x] `middlewares.ts` - CORS configured via `CORS_ORIGIN` env var, CSP directives set.
- [x] Health check endpoint at `/api/health`.
- [x] Admin registration auto-locks after first user in Strapi 5.
- [x] Set `ENABLE_PROXY=true` so Strapi trusts Railway proxy headers for HTTPS.

## Smoke test after deploy
1) Open `/admin`, create admin user.
2) Create one Article and one Service; upload an image -> verify it lands in R2.
3) Hit `/api/health` to confirm health check works.
4) Run a GraphQL query at `/graphql` (dev only, disabled in prod).
5) Confirm locales (i18n) work on Service content type.

## Content Types (Source of Truth)
- `apps/strapi/src/api/*` includes: article, author, category, tag, service, domain-page, landing-section, testimonial.
- `apps/strapi/src/components/*` includes: seo/seo, domain/domain-highlight, domain/domain-feature, domain/domain-faq, landing/landing-item.
- The `strapi-schemas/` folder is now aligned as a snapshot for reference.

## Notes
- Re-export schemas to `strapi-schemas` after any content type changes.
- Run `strapi export --no-encrypt` to generate schema snapshot.
