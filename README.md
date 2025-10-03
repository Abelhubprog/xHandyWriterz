# newHandyWriterz — HandyWriterz × Microfeed × Strapi 5

Unified monorepo wiring HandyWriterz web (Vite) with Microfeed (Cloudflare Pages) and Strapi 5 CMS for content management.

## 🚨 Railway Deployment Issues?

**Can't access admin at your Railway Strapi URL?**

👉 **Quick Fix (2 minutes)**: See [QUICK_FIX_RAILWAY_ADMIN.md](./QUICK_FIX_RAILWAY_ADMIN.md)

👉 **Comprehensive Guide**: See [RAILWAY_ADMIN_FIX_GUIDE.md](./RAILWAY_ADMIN_FIX_GUIDE.md)

👉 **Understanding the Issue**: See [RAILWAY_ISSUE_EXPLAINED.md](./RAILWAY_ISSUE_EXPLAINED.md)

**Automation Scripts Available:**
- Windows: `railway-admin-reset.bat`
- Mac/Linux: `railway-admin-reset.sh`

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
