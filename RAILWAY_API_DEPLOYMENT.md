# Railway API Service Deployment Guide

This guide walks through deploying the new `apps/api` Express service to Railway.

## Overview

The API service replaces the broken Cloudflare Workers and provides:
- `/api/uploads/*` - R2 presigned URL generation
- `/api/upload-url` - Legacy upload dropzone compatibility
- `/api/r2/list` - Legacy document manager list
- `/s3/*` - Worker-compatible presign endpoints (plus delete)
- `/api/payments/*` - Payment intent creation  
- `/api/messaging/*` - Mattermost auth exchange/refresh
- `/api/turnitin/*` - Submission notifications
- `/api/webhooks/*` - Strapi, R2, and payment webhooks
- `/sitemap.xml` - Dynamic sitemap generation
- `/robots.txt` - SEO robots file
- `/health` - Health check endpoint

## Current Infrastructure

| Service | Domain | Port | Status |
|---------|--------|------|--------|
| Web | handywriterz.com | 4173 | ✅ Online |
| Strapi | cms.handywriterz.com | 1337 | ✅ Online |
| Postgres | postgres.handywriterz.com | 5432 | ✅ Online |
| **API** (NEW) | api.handywriterz.com | 3001 | ⏳ Pending |
| Mattermost | mattermost.handywriterz.com | 8065 | ❌ Offline |

## Step-by-Step Deployment

### 1. Add New Service in Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Open the **HandyWriterz** project
3. Click **+ New** → **Service** → **From Repo**
4. Select the **xHandyWriterz** repository
5. Set **Root Directory** to `apps/api`

### 2. Configure Build Settings

In the service settings:

| Setting | Value |
|---------|-------|
| Builder | DOCKERFILE |
| Root Directory | apps/api |
| Dockerfile Path | Dockerfile |
| Watch Paths | apps/api/** |
| Health Check Path | /health |

### 3. Set Environment Variables

Copy these variables to Railway (replace `<value>` with actual secrets):

```bash
# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGINS=https://handywriterz.com,https://www.handywriterz.com,https://cms.handywriterz.com

# URLs
SITE_URL=https://handywriterz.com
STRAPI_URL=https://cms.handywriterz.com
MATTERMOST_URL=https://mattermost.handywriterz.com

# Clerk Authentication
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>

# R2/S3 Storage
R2_ACCOUNT_ID=<your-r2-account-id>
R2_ACCESS_KEY_ID=<your-r2-access-key>
R2_SECRET_ACCESS_KEY=<your-r2-secret-key>
R2_BUCKET=handywriterz-uploads
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Mattermost (for messaging integration)
MATTERMOST_ADMIN_TOKEN=<your-mm-admin-token>
MATTERMOST_BOT_TOKEN=<your-mm-bot-token>
MATTERMOST_ADMIN_CHANNEL=<your-support-channel-id>

# Payment Providers (optional)
STABLELINK_API_KEY=<stablelink-key>
PAYPAL_CLIENT_ID=<paypal-id>
PAYPAL_CLIENT_SECRET=<paypal-secret>
STRIPE_SECRET_KEY=<stripe-key>
COINBASE_API_KEY=<coinbase-key>

# Webhooks
STRAPI_WEBHOOK_SECRET=<strapi-webhook-secret>
R2_WEBHOOK_SECRET=<r2-webhook-secret>
PAYMENT_WEBHOOK_SECRET=<payment-webhook-secret>

# Upload compatibility (temporary)
ALLOW_ANON_UPLOADS=true
ALLOW_ANON_DOWNLOADS=true

# Cloudflare (for cache purge)
CF_ZONE_ID=<cloudflare-zone-id>
CF_API_TOKEN=<cloudflare-api-token>
```

### 4. Configure Custom Domain

1. In Railway service settings, go to **Networking**
2. Click **+ Custom Domain**
3. Add `api.handywriterz.com`
4. Update DNS with provided CNAME record

### 5. Deploy

1. Click **Deploy** or push to main branch
2. Monitor build logs for errors
3. Once deployed, verify health endpoint:

```bash
curl https://api.handywriterz.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T...",
  "version": "1.0.0",
  "services": {
    "api": "running",
    "strapi": "configured",
    "r2": "configured",
    "clerk": "configured"
  }
}
```

## Post-Deployment: Frontend Update

After the API is deployed, update the frontend to use the API URL.

### Update apps/web/src/lib/env.ts

Add `VITE_API_URL`:

```typescript
export const env = {
  // ... existing vars
  API_URL: import.meta.env.VITE_API_URL || 'https://api.handywriterz.com',
};
```

### Update API calls

Change from relative `/api/*` to full URL:

```typescript
// Before
fetch('/api/uploads/presign-put', ...)

// After
fetch(`${env.API_URL}/api/uploads/presign-put`, ...)
```

### Set Railway Web Service Variable

Add to the **Web** service:
```
VITE_API_URL=https://api.handywriterz.com
```

## Testing Endpoints

### Health Check
```bash
curl https://api.handywriterz.com/health
```

### Upload Presign (requires auth)
```bash
curl -X POST https://api.handywriterz.com/api/uploads/presign-put \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-token>" \
  -d '{"key": "test/file.pdf", "contentType": "application/pdf"}'
```

### Sitemap
```bash
curl https://api.handywriterz.com/sitemap.xml
```

### Robots.txt
```bash
curl https://api.handywriterz.com/robots.txt
```

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Verify root directory is `apps/api`
- Check pnpm lockfile compatibility

### Health Check Fails
- Verify PORT environment variable
- Check container logs in Railway
- Ensure health endpoint returns 200

### CORS Errors
- Update CORS_ORIGINS with all allowed domains
- Verify frontend is using correct API URL

### Auth Errors
- Verify Clerk keys are correct
- Check token format in Authorization header

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐
│   Frontend      │────▶│   API Service    │
│   (Web)         │     │   (Express)      │
│   Port 4173     │     │   Port 3001      │
└─────────────────┘     └──────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Strapi     │     │     R2       │     │  Mattermost  │
│   (CMS)      │     │   (Storage)  │     │   (Chat)     │
│   Port 1337  │     │              │     │   Port 8065  │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Files Reference

| File | Purpose |
|------|---------|
| `apps/api/src/index.ts` | Express entry point |
| `apps/api/src/routes/uploads.ts` | R2 presign endpoints |
| `apps/api/src/routes/payments.ts` | Payment intents |
| `apps/api/src/routes/messaging.ts` | MM auth exchange |
| `apps/api/src/routes/webhooks.ts` | All webhooks |
| `apps/api/src/routes/sitemap.ts` | SEO sitemap/robots |
| `apps/api/src/routes/health.ts` | Health check |
| `apps/api/Dockerfile` | Docker build config |
| `apps/api/railway.json` | Railway config |
