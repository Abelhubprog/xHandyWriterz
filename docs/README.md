# newHandyWriterz — HandyWriterz × Microfeed × Strapi 5

Unified monorepo wiring HandyWriterz web (Vite) with Microfeed (Cloudflare Pages) and Strapi 5 CMS for content management.

## � **LATEST**: Railway Deployment Ready

**Status**: ✅ **Configured** | ⚠️ **Database Provisioning Required**

All Strapi 5 secrets configured. Just need to provision Postgres database:

```bash
# One-command setup (Windows)
railway-setup-database.bat

# OR manual (from apps/strapi)
railway add --database postgres
railway up
```

📖 **Complete Guide**: [RAILWAY_DEPLOYMENT_COMPLETE.md](./RAILWAY_DEPLOYMENT_COMPLETE.md)  
📊 **Current Status**: [RAILWAY_DEPLOYMENT_STATUS.md](./RAILWAY_DEPLOYMENT_STATUS.md)  
🔧 **Troubleshooting**: [RAILWAY_COMPLETE_GUIDE.md](./RAILWAY_COMPLETE_GUIDE.md)

---

## �🚨 Railway Deployment Issues?

### Problem: "Cannot send secure cookie over unencrypted connection"

👉 **Step-by-Step Fix (5 min)**: [RAILWAY_PROXY_FIX_STEPS.md](./RAILWAY_PROXY_FIX_STEPS.md)
👉 **Comprehensive Guide**: [RAILWAY_PROXY_FIX.md](./RAILWAY_PROXY_FIX.md)
👉 **Automation Script**: `railway-reset-password.ps1`

**Quick Fix:**
1. Add `ENABLE_PROXY=true` in Railway Variables
2. Add `URL=https://ahandywriterz-production.up.railway.app`
3. Run: `.\railway-reset-password.ps1`
4. Login and change password!

### Problem: Can't create first admin

👉 **Quick Fix (2 minutes)**: [QUICK_FIX_RAILWAY_ADMIN.md](./QUICK_FIX_RAILWAY_ADMIN.md)
👉 **Comprehensive Guide**: [RAILWAY_ADMIN_FIX_GUIDE.md](./RAILWAY_ADMIN_FIX_GUIDE.md)
👉 **Understanding the Issue**: [RAILWAY_ISSUE_EXPLAINED.md](./RAILWAY_ISSUE_EXPLAINED.md)

**Automation Scripts:**
- Windows: `railway-admin-reset.bat`
- Mac/Linux: `railway-admin-reset.sh`

### Problem: Database connection failed (ECONNREFUSED 127.0.0.1:5432)

**Status**: ✅ All environment variables configured | ⚠️ **Database not provisioned**

👉 **Complete Deployment Guide**: [RAILWAY_DEPLOYMENT_COMPLETE.md](./RAILWAY_DEPLOYMENT_COMPLETE.md)  
👉 **Troubleshooting Reference**: [RAILWAY_COMPLETE_GUIDE.md](./RAILWAY_COMPLETE_GUIDE.md)  
👉 **Current Status**: [RAILWAY_DEPLOYMENT_STATUS.md](./RAILWAY_DEPLOYMENT_STATUS.md)

**Quick Fix (5 minutes):**

```bash
# Option 1: Automated setup (Windows)
railway-setup-database.bat

# Option 2: Automated setup (Mac/Linux)
./railway-setup-database.sh

# Option 3: Manual setup
cd apps/strapi
railway add --database postgres
railway up
railway logs --follow
```

**What's Configured**:
- ✅ APP_KEYS (4 session keys)
- ✅ All 6 Strapi secrets (JWT, API, encryption)
- ✅ Proxy settings (ENABLE_PROXY, ADMIN_SESSION cookies)
- ✅ Build pipeline (passes TypeScript compilation)

**What's Missing**:
- ❌ DATABASE_URL (auto-injected after `railway add --database postgres`)

**Next Steps After Database Setup**:
1. Wait for deployment to complete (~2 min)
2. Get URL: `railway status`
3. Create admin: Navigate to `/admin` and register first user
4. Generate API token for front-end integration

## Local development

1. Install deps at the root (pnpm recommended):
   - `pnpm install --frozen-lockfile`
2. Start both apps in one terminal:
   - `pnpm dev` (runs Vite on `5173` and Microfeed Pages dev on `8788`)
   - _or_ start individually with `pnpm dev:web` and `pnpm dev:mf`

Vite proxies:
- `/api/*` → http://127.0.0.1:8789 (Pages Functions dev server)
- `/services/*` → http://127.0.0.1:8788 (Microfeed public UI)
- `/mf/*` → http://127.0.0.1:8788 (Microfeed JSON/RSS)

The `/services` hub consumes `GET /api/mf/content`, which streams and caches Microfeed JSON, applying domain (`domain:*`) and type (`type:*`) tag filters server-side for stable UX.

The homepage lives in `apps/web`. The "Learning Hub" button navigates to `/learning-hub`, which redirects to `/services/` so Microfeed renders content.

### Environment bindings

- `CLERK_SECRET_KEY`, `WEB_BACKEND_SIGNING_SECRET`, `MICROFEED_ORIGIN` are required for Pages Functions.
- Optional `RATE_LIMIT_KV` binding enables server-side rate limiting for uploads, messaging, and Turnitin webhooks.
- `STABLELINK_API_KEY` (secret) and optional `STABLELINK_CHECKOUT_URL` / `STABLELINK_ENVIRONMENT` configure the StableLink crypto payment hand-off.

## Deployments

- Web (apps/web): Cloudflare Pages (SPA + Pages Functions under `functions/`)
- Microfeed (apps/microfeed): Cloudflare Pages with D1 + R2; admin via Cloudflare Access

For a one-domain UX in production, mount Microfeed at `/services/*` using a Zone Worker (recommended) or use a subdomain such as `cms.<domain>` and update the Learning Hub redirect accordingly.

## Notes

- This repo also contains a top-level `microfeed/` folder retained for reference. The active instance is `apps/microfeed/`.
- Do not commit secrets. Use GitHub Actions secrets and Cloudflare env bindings.
