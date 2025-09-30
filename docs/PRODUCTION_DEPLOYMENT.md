# HandyWriterz Production Deployment Guide

> **Status**: Production-ready deployment guide for Strapi 5 + Mattermost + Cloudflare R2 + Workers stack
>
> **Target**: Railway (apps) + Cloudflare (edge/storage)
>
> **Last Updated**: 2025-09-29

---

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Overview](#infrastructure-overview)
3. [Phase 1: Cloudflare Setup](#phase-1-cloudflare-setup)
4. [Phase 2: Railway Database Setup](#phase-2-railway-database-setup)
5. [Phase 3: Strapi CMS Deployment](#phase-3-strapi-cms-deployment)
6. [Phase 4: Mattermost Deployment](#phase-4-mattermost-deployment)
7. [Phase 5: Workers Deployment](#phase-5-workers-deployment)
8. [Phase 6: Frontend Deployment](#phase-6-frontend-deployment)
9. [Environment Variables Reference](#environment-variables-reference)
10. [Post-Deployment Verification](#post-deployment-verification)
11. [Monitoring & Alerts](#monitoring--alerts)
12. [Troubleshooting](#troubleshooting)

---

## Pre-deployment Checklist

### Required Accounts & Access
- [ ] Clerk account with production application created
- [ ] Cloudflare account with R2 enabled
- [ ] Railway account with payment method
- [ ] Domain name configured in Cloudflare DNS
- [ ] Git repository access for deployment hooks

### Required Secrets (prepare in advance)
- [ ] Clerk publishable key & secret key
- [ ] Strapi admin JWT secret (generate with `openssl rand -base64 32`)
- [ ] Strapi API token salt (generate with `openssl rand -base64 32`)
- [ ] Strapi transfer token salt (generate with `openssl rand -base64 32`)
- [ ] Strapi APP_KEYS (4 comma-separated keys, each `openssl rand -base64 32`)
- [ ] Cloudflare R2 access key ID & secret
- [ ] Mattermost database password (generate secure password)
- [ ] Strapi database password (generate secure password)

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                          │
├─────────────────────────────────────────────────────────────┤
│ DNS: handywriterz.com                                       │
│   ├─ api.handywriterz.com    → Railway Strapi (proxied)    │
│   ├─ chat.handywriterz.com   → Railway Mattermost (proxied)│
│   ├─ media.handywriterz.com  → R2 Public Bucket (proxied)  │
│   └─ www.handywriterz.com    → Cloudflare Pages (proxied)  │
│                                                             │
│ Workers:                                                     │
│   ├─ upload-broker           → R2 presign + multipart      │
│   ├─ mm-auth                 → Clerk↔Mattermost SSO bridge  │
│   └─ subpath-router          → Pages routing logic         │
│                                                             │
│ R2 Buckets:                                                 │
│   ├─ cms-media               → Strapi uploads              │
│   ├─ chat-uploads            → Mattermost files            │
│   └─ user-documents          → Direct uploads             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RAILWAY SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│ Strapi CMS                                                   │
│   ├─ PostgreSQL (Strapi DB)                                │
│   └─ Strapi v4.25 (Node 18)                                │
│                                                             │
│ Mattermost                                                   │
│   ├─ PostgreSQL (Mattermost DB)                            │
│   └─ Mattermost v9.x (Docker)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Cloudflare Setup

### 1.1 Create R2 Buckets

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create buckets
wrangler r2 bucket create cms-media
wrangler r2 bucket create chat-uploads
wrangler r2 bucket create user-documents
```

### 1.2 Generate R2 Access Keys

1. Navigate to Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. Create API Token with:
   - **Permissions**: Object Read & Write
   - **Buckets**: cms-media, chat-uploads, user-documents
3. Save **Access Key ID** and **Secret Access Key**

### 1.3 Configure Custom Domain for R2 (Optional)

```bash
# Link custom domain to bucket
wrangler r2 bucket domain add cms-media --domain media.handywriterz.com
```

### 1.4 Configure DNS Records

In Cloudflare Dashboard → DNS:

| Type  | Name  | Target                          | Proxy | TTL  |
|-------|-------|---------------------------------|-------|------|
| CNAME | api   | `<strapi>.up.railway.app`       | ✅    | Auto |
| CNAME | chat  | `<mattermost>.up.railway.app`   | ✅    | Auto |
| CNAME | media | `<account>.r2.cloudflarestorage.com` | ✅    | Auto |
| CNAME | www   | `handywriterz.pages.dev`        | ✅    | Auto |

**Note**: Replace `<strapi>`, `<mattermost>`, `<account>` with actual values after Railway deployments.

### 1.5 Configure SSL/TLS

1. Navigate to SSL/TLS → Overview
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### 1.6 Configure Page Rules (for caching)

Create page rules in order:

1. **API/Chat bypass cache**:
   - URL: `api.handywriterz.com/*` and `chat.handywriterz.com/*`
   - Cache Level: Bypass

2. **Media aggressive cache**:
   - URL: `media.handywriterz.com/*`
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 day

---

## Phase 2: Railway Database Setup

### 2.1 Create Strapi PostgreSQL Database

1. Login to Railway → New Project → Provision PostgreSQL
2. Name: `handywriterz-strapi-db`
3. Copy connection string from **Variables** tab
4. Format: `postgres://user:pass@host:port/database`

### 2.2 Create Mattermost PostgreSQL Database

1. In same Railway project → Add Service → PostgreSQL
2. Name: `handywriterz-mattermost-db`
3. Copy connection string from **Variables** tab

### 2.3 Configure Database Backups

For each database:
1. Navigate to Database → Settings
2. Enable **Daily Backups**
3. Retention: 7 days minimum (upgrade to 30 for production)

---

## Phase 3: Strapi CMS Deployment

### 3.1 Prepare Strapi for Railway

Create `apps/strapi/.railwayignore`:

```
node_modules
.tmp
.cache
dist
build
.env
.env.local
*.log
```

### 3.2 Deploy to Railway

1. Railway Dashboard → New Service → GitHub Repo
2. Select repository, branch: `main`, root directory: `apps/strapi`
3. Configure build & start commands:
   ```
   Build: pnpm install && pnpm --filter @handywriterz/strapi build
   Start: pnpm --filter @handywriterz/strapi start
   ```

### 3.3 Configure Strapi Environment Variables

In Railway service **Variables** tab:

```bash
# Server
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_URL=https://api.handywriterz.com

# Security (generate each with openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=<generated>
ADMIN_JWT_SECRET=<generated>
TRANSFER_TOKEN_SALT=<generated>
JWT_SECRET=<generated>

# Database (from Railway Postgres)
DATABASE_CLIENT=postgres
DATABASE_URL=${{handywriterz-strapi-db.DATABASE_URL}}

# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_REGION=auto
R2_BUCKET_CMS=cms-media
R2_ACCESS_KEY_ID=<from_cloudflare>
R2_SECRET_ACCESS_KEY=<from_cloudflare>
R2_PUBLIC_BASE=https://media.handywriterz.com

# Clerk (for future SSO)
CLERK_ISSUER=https://<your-clerk-domain>.clerk.accounts.dev
CLERK_AUDIENCE=handywriterz
CLERK_JWKS=https://<your-clerk-domain>.clerk.accounts.dev/.well-known/jwks.json
```

### 3.4 Deploy & Verify

1. Railway will auto-deploy on variable save
2. Check **Deployments** tab for build logs
3. Access Strapi admin at `https://api.handywriterz.com/admin`
4. Create first admin user

### 3.5 Generate API Token for Frontend

1. Login to Strapi admin
2. Settings → API Tokens → Create new token
3. Name: `Frontend Read Token`
4. Token type: Read-only
5. Duration: Unlimited
6. Save token securely (needed for `VITE_CMS_TOKEN`)

---

## Phase 4: Mattermost Deployment

### 4.1 Prepare Mattermost for Railway

Update `apps/mattermost/docker-compose.yml` for production:

```yaml
version: '3.8'

services:
  mattermost:
    image: mattermost/mattermost-team-edition:9.5
    container_name: mattermost
    restart: unless-stopped
    ports:
      - "8065:8065"
    environment:
      MM_SQLSETTINGS_DRIVERNAME: postgres
      MM_SQLSETTINGS_DATASOURCE: ${DATABASE_URL}
      MM_SERVICESETTINGS_SITEURL: https://chat.handywriterz.com
      MM_FILESETTINGS_DRIVERNAME: amazons3
      MM_FILESETTINGS_AMAZONS3ACCESSKEYID: ${R2_ACCESS_KEY_ID}
      MM_FILESETTINGS_AMAZONS3SECRETACCESSKEY: ${R2_SECRET_ACCESS_KEY}
      MM_FILESETTINGS_AMAZONS3BUCKET: chat-uploads
      MM_FILESETTINGS_AMAZONS3REGION: auto
      MM_FILESETTINGS_AMAZONS3ENDPOINT: ${R2_ENDPOINT}
      MM_FILESETTINGS_AMAZONS3SSL: true
    volumes:
      - ./config:/mattermost/config:rw
      - ./data:/mattermost/data:rw
      - ./logs:/mattermost/logs:rw
      - ./plugins:/mattermost/plugins:rw
```

### 4.2 Deploy to Railway

1. Railway → New Service → Docker
2. Select repository, root: `apps/mattermost`
3. Dockerfile: Use `mattermost/mattermost-team-edition:9.5`

### 4.3 Configure Environment Variables

```bash
# Database
DATABASE_URL=${{handywriterz-mattermost-db.DATABASE_URL}}

# R2 Storage
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<from_cloudflare>
R2_SECRET_ACCESS_KEY=<from_cloudflare>

# Site Configuration
MM_SERVICESETTINGS_SITEURL=https://chat.handywriterz.com
MM_SERVICESETTINGS_ENABLEOAUTHSERVICEPROVIDER=false

# Future: Clerk OIDC (when implemented)
# MM_GITLABSETTINGS_ENABLE=true
# MM_GITLABSETTINGS_SCOPE=openid profile email
# MM_GITLABSETTINGS_AUTHENDPOINT=https://<clerk>.clerk.accounts.dev/oauth/authorize
```

### 4.4 Initialize Mattermost

1. Access `https://chat.handywriterz.com`
2. Create system admin account
3. Configure team settings
4. Test file upload to verify R2 integration

---

## Phase 5: Workers Deployment

### 5.1 Deploy Upload Broker Worker

```bash
cd workers/upload-broker

# Configure wrangler.toml with account ID
# Update wrangler.toml:
# account_id = "<your-cloudflare-account-id>"

# Set secrets
wrangler secret put S3_ACCESS_KEY_ID
wrangler secret put S3_SECRET_ACCESS_KEY

# Deploy
wrangler deploy
```

**Environment Variables** (via wrangler.toml or secrets):

```toml
[vars]
S3_ENDPOINT = "https://<account-id>.r2.cloudflarestorage.com"
S3_REGION = "auto"
S3_BUCKET = "user-documents"
FORCE_PATH_STYLE = "true"
DOWNLOAD_TTL_SECONDS = "300"
```

### 5.2 Deploy MM-Auth Worker (when Clerk SSO ready)

```bash
cd workers/mm-auth

# Configure wrangler.toml
# Set secrets
wrangler secret put MATTERMOST_URL
wrangler secret put MATTERMOST_CLIENT_ID
wrangler secret put MATTERMOST_CLIENT_SECRET
wrangler secret put CLERK_SECRET_KEY

# Deploy
wrangler deploy
```

### 5.3 Deploy Subpath Router

```bash
cd workers/subpath-router
wrangler deploy
```

### 5.4 Configure Worker Routes

In Cloudflare Dashboard → Workers & Pages → Routes:

| Route Pattern                       | Worker          | Zone                  |
|-------------------------------------|-----------------|-----------------------|
| `upload.handywriterz.com/*`         | upload-broker   | handywriterz.com     |
| `auth.handywriterz.com/mm/*`        | mm-auth         | handywriterz.com     |

---

## Phase 6: Frontend Deployment

### 6.1 Build Frontend

```bash
cd apps/web

# Create production .env
cp .env.example .env

# Configure production environment
```

Production `apps/web/.env`:

```bash
# App
VITE_APP_NAME=HandyWriterz
VITE_APP_URL=https://handywriterz.com
VITE_APP_DESCRIPTION=Professional academic services platform

# CMS
VITE_CMS_URL=https://api.handywriterz.com
VITE_CMS_TOKEN=<from_strapi_api_tokens>

# Upload Broker
VITE_UPLOAD_BROKER_URL=https://upload.handywriterz.com

# Mattermost
VITE_MATTERMOST_URL=https://chat.handywriterz.com

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=<from_clerk>
VITE_CLERK_DOMAIN=<your-clerk-domain>.clerk.accounts.dev
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Feature Flags
VITE_ENABLE_PUBLIC_ACCESS=true
VITE_ENABLE_COMMENTS=true
VITE_ENABLE_ADMIN_DASHBOARD=true
```

### 6.2 Deploy to Cloudflare Pages

```bash
# Build
pnpm --filter @handywriterz/web build

# Deploy via Wrangler
cd apps/web
wrangler pages deploy ./dist --project-name=handywriterz
```

**OR** Connect via Cloudflare Dashboard:

1. Pages → Create Project → Connect to Git
2. Select repository & branch
3. Build command: `cd apps/web && pnpm build`
4. Build output: `apps/web/dist`
5. Environment variables: Add all `VITE_*` vars above

### 6.3 Configure Pages Settings

- **Custom domain**: handywriterz.com, www.handywriterz.com
- **Build caching**: Enabled
- **Preview deployments**: Enabled for PRs

---

## Environment Variables Reference

### Strapi Production ENV

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_URL=https://api.handywriterz.com
APP_KEYS=<4-comma-separated-keys>
API_TOKEN_SALT=<secret>
ADMIN_JWT_SECRET=<secret>
TRANSFER_TOKEN_SALT=<secret>
JWT_SECRET=<secret>

DATABASE_CLIENT=postgres
DATABASE_URL=postgres://user:pass@host:port/strapi_db

R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_REGION=auto
R2_BUCKET_CMS=cms-media
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_PUBLIC_BASE=https://media.handywriterz.com

CLERK_ISSUER=https://<domain>.clerk.accounts.dev
CLERK_AUDIENCE=handywriterz
CLERK_JWKS=https://<domain>.clerk.accounts.dev/.well-known/jwks.json
```

### Mattermost Production ENV

```bash
DATABASE_URL=postgres://user:pass@host:port/mattermost_db

R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>

MM_SERVICESETTINGS_SITEURL=https://chat.handywriterz.com
MM_FILESETTINGS_DRIVERNAME=amazons3
MM_FILESETTINGS_AMAZONS3BUCKET=chat-uploads
```

### Upload Broker Worker ENV

```toml
# wrangler.toml [vars]
S3_ENDPOINT = "https://<account>.r2.cloudflarestorage.com"
S3_REGION = "auto"
S3_BUCKET = "user-documents"
FORCE_PATH_STYLE = "true"

# Secrets (via wrangler secret put)
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
```

### Frontend ENV (Cloudflare Pages)

```bash
VITE_APP_NAME=HandyWriterz
VITE_APP_URL=https://handywriterz.com
VITE_CMS_URL=https://api.handywriterz.com
VITE_CMS_TOKEN=<strapi_token>
VITE_UPLOAD_BROKER_URL=https://upload.handywriterz.com
VITE_MATTERMOST_URL=https://chat.handywriterz.com
VITE_CLERK_PUBLISHABLE_KEY=<clerk_key>
VITE_ENABLE_PUBLIC_ACCESS=true
```

---

## Post-Deployment Verification

### Verify Strapi

```bash
# Health check
curl https://api.handywriterz.com/_health

# Test API
curl https://api.handywriterz.com/api/services

# Test GraphQL
curl -X POST https://api.handywriterz.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ services { data { attributes { title } } } }"}'
```

### Verify Mattermost

1. Open `https://chat.handywriterz.com`
2. Login with admin credentials
3. Upload test file to verify R2 integration
4. Check System Console → Environment → File Storage (should show S3)

### Verify Workers

```bash
# Test upload broker
curl -X POST https://upload.handywriterz.com/s3/presign-put \
  -H "Content-Type: application/json" \
  -d '{"key":"test/file.txt","contentType":"text/plain"}'

# Should return presigned URL
```

### Verify Frontend

1. Open `https://handywriterz.com`
2. Check homepage loads with Clerk auth buttons
3. Test sign-in flow
4. Navigate to `/services` - should fetch from Strapi
5. Upload document in dashboard - should hit worker
6. Open messages - should show Mattermost embed

### Smoke Test Checklist

- [ ] Homepage loads without errors
- [ ] Clerk sign-in redirects properly
- [ ] Dashboard accessible after auth
- [ ] Services page fetches Strapi data
- [ ] Service detail page renders
- [ ] Document upload succeeds
- [ ] Download link generates
- [ ] Mattermost embed displays
- [ ] Admin dashboard loads (with admin role)
- [ ] Domain pages render

---

## Monitoring & Alerts

### Railway Monitoring

1. **Resource Usage**: Monitor CPU/RAM in Railway dashboard
2. **Logs**: Enable log shipping to external service (Datadog/Sentry)
3. **Uptime**: Set up UptimeRobot pinging:
   - `https://api.handywriterz.com/_health`
   - `https://chat.handywriterz.com`

### Cloudflare Analytics

1. **Workers Analytics**: Review in Cloudflare Dashboard → Workers → Analytics
2. **R2 Metrics**: Monitor storage usage and bandwidth
3. **Pages Analytics**: Track frontend performance

### Application Logs

Configure structured logging:

**Strapi**: Use `pino` logger (already integrated):
```javascript
// strapi/config/logger.ts
module.exports = {
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
};
```

**Mattermost**: Logs available in Railway dashboard under **Deployments → Logs**

### Alerts to Configure

- [ ] Database connection failures
- [ ] Worker error rate >5%
- [ ] R2 storage >80% quota
- [ ] Strapi/Mattermost CPU >80%
- [ ] SSL certificate expiry (30 days)

---

## Troubleshooting

### Strapi Issues

**Cannot connect to database**:
```bash
# Verify DATABASE_URL format
# Check Railway DB is running
# Ensure IP whitelist includes Railway IPs
```

**R2 upload fails**:
```bash
# Verify R2_ENDPOINT has no trailing slash
# Check R2 credentials are correct
# Ensure FORCE_PATH_STYLE=true in plugin config
# Test with: wrangler r2 object put cms-media/test.txt --file=test.txt
```

**GraphQL not working**:
```bash
# Verify @strapi/plugin-graphql installed
# Check plugins.ts enables graphql
# Rebuild: pnpm --filter strapi build
```

### Mattermost Issues

**Cannot start container**:
```bash
# Check DATABASE_URL is valid Postgres connection
# Verify MM_SERVICESETTINGS_SITEURL matches DNS
# Review Railway logs for errors
```

**Files not uploading to R2**:
```bash
# Check MM_FILESETTINGS environment vars
# Verify R2 bucket "chat-uploads" exists
# Test R2 access: wrangler r2 object put chat-uploads/test.txt
```

### Worker Issues

**Upload broker returns 500**:
```bash
# Check secrets are set: wrangler secret list
# Verify S3_ENDPOINT correct
# Review worker logs: wrangler tail upload-broker
```

**CORS errors**:
```bash
# Ensure worker returns proper CORS headers
# Check OPTIONS requests handled
# Verify frontend origin allowed
```

### Frontend Issues

**Build fails**:
```bash
# Verify all VITE_ env vars set
# Check Node version >=18
# Clear cache: pnpm --filter web clean && pnpm install
```

**Strapi fetch fails**:
```bash
# Check VITE_CMS_URL includes https://
# Verify VITE_CMS_TOKEN is valid
# Test Strapi directly: curl https://api.handywriterz.com/api/services
```

**Clerk auth broken**:
```bash
# Verify VITE_CLERK_PUBLISHABLE_KEY correct
# Check Clerk dashboard for app settings
# Ensure redirect URLs configured in Clerk
```

---

## Security Hardening

### Strapi Admin Protection

**Temporary**: Restrict admin access via Cloudflare Access:

1. Cloudflare → Zero Trust → Access → Applications
2. Create application for `api.handywriterz.com/admin`
3. Add email-based policy (admin emails only)

**Long-term**: Implement Clerk SSO via middleware (see `strapi-schemas/` for reference)

### Rate Limiting

Configure Cloudflare rate limiting rules:

1. `/graphql` endpoint: 100 req/min per IP
2. `/api` endpoints: 60 req/min per IP
3. Worker presign: 30 req/min per user (implement in worker with KV)

### DDoS Protection

1. Enable Cloudflare **Under Attack Mode** if needed
2. Configure **Bot Fight Mode**
3. Set up **WAF custom rules** for API protection

---

## Backup & Disaster Recovery

### Database Backups

**Automated** (Railway):
- Daily snapshots (7-day retention)
- Upgrade plan for 30-day retention

**Manual** backup before major changes:
```bash
# Strapi DB
railway run pg_dump $DATABASE_URL > backup-strapi-$(date +%Y%m%d).sql

# Mattermost DB
railway run pg_dump $DATABASE_URL > backup-mattermost-$(date +%Y%m%d).sql
```

### R2 Backup Strategy

**Versioning** (recommended):
```bash
# Enable versioning on buckets
wrangler r2 bucket versioning enable cms-media
```

**Lifecycle Rules**:
```bash
# Archive old objects after 180 days
# Configure via Cloudflare Dashboard → R2 → Lifecycle
```

### Recovery Procedures

**Strapi restore**:
```bash
# Restore from SQL backup
railway run psql $DATABASE_URL < backup-strapi-YYYYMMDD.sql

# Redeploy Strapi to rebuild cache
railway redeploy
```

**R2 restore**:
```bash
# Restore from versioned object
wrangler r2 object get cms-media/file.jpg --version-id=<version>
```

---

## Scaling Considerations

### When to Scale

**Strapi**:
- CPU >70% sustained → Upgrade Railway plan
- Response time >500ms → Add caching layer (Redis)
- DB connections maxed → Increase connection pool

**Mattermost**:
- Active users >500 → Consider Mattermost Enterprise
- Message volume high → Add read replicas
- File storage >100GB → Review retention policies

**Workers**:
- Requests >1M/day → Review Cloudflare plan
- Cold starts noticeable → Enable Durable Objects

### Performance Optimization

1. **Enable Cloudflare Argo** for faster routing
2. **Implement surrogate cache keys** in Strapi webhooks
3. **Add Redis caching** for Strapi queries
4. **Optimize images** via Cloudflare Image Resizing
5. **Enable HTTP/3** in Cloudflare SSL/TLS settings

---

## Deployment Checklist (Copy/Paste)

```markdown
## Pre-deployment
- [ ] All secrets generated and stored securely
- [ ] DNS records configured in Cloudflare
- [ ] R2 buckets created
- [ ] Railway databases provisioned
- [ ] Clerk production app configured

## Strapi
- [ ] Deployed to Railway
- [ ] Environment variables set
- [ ] Database migration successful
- [ ] Admin account created
- [ ] API token generated for frontend
- [ ] R2 upload tested

## Mattermost
- [ ] Deployed to Railway
- [ ] Database initialized
- [ ] S3 (R2) integration verified
- [ ] System admin created
- [ ] Test team created

## Workers
- [ ] upload-broker deployed
- [ ] Secrets configured
- [ ] Routes mapped
- [ ] CORS tested

## Frontend
- [ ] Built successfully
- [ ] Deployed to Cloudflare Pages
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL verified

## Verification
- [ ] All smoke tests passed
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Backup strategy documented
- [ ] Team notified
```

---

## Maintenance Windows

### Regular Tasks

**Weekly**:
- Review Railway logs for errors
- Check Cloudflare analytics for anomalies
- Verify R2 storage usage trending

**Monthly**:
- Rotate Strapi API tokens
- Review and prune unused Mattermost channels
- Test backup restore procedure
- Update dependencies

**Quarterly**:
- Security audit
- Performance review
- DR drill (restore from backup)
- Cost optimization review

---

## Support Contacts

**Critical Issues**:
- Railway: https://railway.app/help
- Cloudflare: Enterprise support / Community
- Strapi: Community forum / Enterprise support
- Mattermost: Community / Enterprise support

**Internal Escalation**:
- Infrastructure: DevOps team
- Application: Development team
- Security: Security team

---

## Appendix: Quick Commands

```bash
# Check Strapi health
curl https://api.handywriterz.com/_health

# Check Mattermost API
curl https://chat.handywriterz.com/api/v4/system/ping

# Test worker
curl -X POST https://upload.handywriterz.com/s3/presign-put \
  -H "Content-Type: application/json" \
  -d '{"key":"test.txt","contentType":"text/plain"}'

# View worker logs
wrangler tail upload-broker

# Railway logs
railway logs --service strapi

# Deploy workers
wrangler deploy

# Deploy frontend
wrangler pages deploy ./dist
```

---

**Next Steps**: After deployment, proceed to `OPERATIONAL_RUNBOOKS.md` for ongoing operations.
