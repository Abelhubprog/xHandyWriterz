# HandyWriterz Production Backlog

> Last updated: January 2025  
> Status: API Service Ready for Deploy

---

## Infrastructure Status

| Service | Domain | Port | Status |
|---------|--------|------|--------|
| Web | handywriterz.com | 4173 | ✅ Online |
| Strapi | cms.handywriterz.com | 1337 | ✅ Online |
| Postgres | postgres.handywriterz.com | 5432 | ✅ Online |
| **API** | api.handywriterz.com | 3001 | 🔨 Built, needs deploy |
| Mattermost | mattermost.handywriterz.com | 8065 | ❌ Offline |

---

## Immediate Actions

### 1. Deploy API Service (P0 - Blocks Everything)

**Status:** TypeScript compiled ✅, Docker ready ✅, Railway config ready ✅

**Deploy Steps:**
1. Railway Dashboard → HandyWriterz project → + New Service
2. Select GitHub repo, set root to `apps/api`
3. Configure environment variables (see [RAILWAY_API_DEPLOYMENT.md](./RAILWAY_API_DEPLOYMENT.md))
4. Add custom domain `api.handywriterz.com`
5. Deploy and verify `/health` endpoint

**Files ready:**
- `apps/api/dist/` - Compiled JavaScript
- `apps/api/Dockerfile` - Docker build
- `apps/api/railway.json` - Railway config
- `apps/api/.env.example` - Environment template

### 2. Update Frontend (P1 - After API Deployed)

**What:** Update Web app to use `VITE_API_URL` instead of relative `/api/*` paths

**Files to update:**
- `apps/web/src/lib/env.ts` - Add API_URL export
- `apps/web/src/hooks/useDocumentSubmission.ts` - Update fetch URLs
- `apps/web/src/lib/api.ts` - Update base URL
- `apps/web/src/components/Messaging/MessageCenter.tsx` - Update auth calls

**Railway change:** Add `VITE_API_URL=https://api.handywriterz.com` to Web service

### 3. Fix Mattermost (P2 - When Needed)

**Current issue:** Service offline in Railway

**Steps:**
1. Check Mattermost container logs
2. Verify Postgres connection string
3. Restart service or redeploy
4. Test WebSocket connectivity

---

## Recently Completed

| Task | Description | Status |
|------|-------------|--------|
| API Service Code | Express routes for uploads, payments, messaging, webhooks, sitemap | ✅ Done |
| TypeScript Build | All routes compiled to `dist/` folder | ✅ Done |
| Railway Config | Dockerfile and railway.json ready | ✅ Done |
| ServicesHub Fix | Updated to use React Query + CMS fetch | ✅ Done |
| ContentPublisher Fix | Fixed process.env → import.meta.env | ✅ Done |
| Strapi Railway Fix | Changed to DOCKERFILE builder | ✅ Done |

---

## API Endpoints Reference

Once deployed, the API will serve:

```
GET  /health                    - Health check
POST /api/uploads/presign-put   - Get upload URL (auth required)
POST /api/uploads/presign-get   - Get download URL (auth required)
POST /api/payments/create       - Create payment intent
POST /api/messaging/auth/exchange - Clerk → MM token exchange
POST /api/webhooks/strapi/publish - Strapi publish events
POST /api/webhooks/r2/scan      - R2 AV scan results
POST /api/webhooks/payments     - Payment callbacks
GET  /sitemap.xml               - Dynamic sitemap
GET  /robots.txt                - SEO robots file
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              handywriterz.com (Vite + React)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Service                             │
│            api.handywriterz.com (Express)                    │
│                                                              │
│  /api/uploads/*   │  /api/payments/*  │  /api/messaging/*   │
│  /api/webhooks/*  │  /sitemap.xml     │  /health            │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Strapi     │    │     R2       │    │  Mattermost  │
│    CMS       │    │   Storage    │    │    Chat      │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Future Enhancements (P3+)

1. **AV Scanning Pipeline** - Integrate ClamAV for upload scanning
2. **Mattermost Native Client** - Replace iframe with REST/WS client
3. **Admin Dashboard Analytics** - Real metrics from Strapi
4. **Content Preview System** - Draft preview with tokens
5. **Rate Limiting** - Per-user request throttling
6. **Audit Logging** - File operations tracking

---

## Quick Commands

```bash
# Build API locally
cd apps/api && pnpm build

# Run API locally
cd apps/api && pnpm dev

# Test health endpoint
curl http://localhost:3001/health

# Test sitemap
curl http://localhost:3001/sitemap.xml
```
