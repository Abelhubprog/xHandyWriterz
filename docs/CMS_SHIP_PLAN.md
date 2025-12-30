# CMS Ship Plan (Strapi 5 + CMS-first web)

## Mission
Ship a production-grade Strapi 5 CMS that lets admins publish content and drive every major public page. The web front-end becomes CMS-first (no hardcoded marketing content). Humans get public content; agents use x402 paywall access for API consumption.

## Current State Snapshot (Audit)

### CMS (Strapi 5)
- Content types present:
  - `service` (apps/strapi/src/api/service/content-types/service/schema.json)
  - `article` (apps/strapi/src/api/article/content-types/article/schema.json)
  - `landing-section` (apps/strapi/src/api/landing-section/content-types/landing-section/schema.json)
  - `domain-page` (apps/strapi/src/api/domain-page/content-types/domain-page/schema.json)
  - Components: `seo.seo`, `landing.landing-item`, `domain.domain-highlight`
- GraphQL enabled; REST in use.
- Upload provider configured for R2 (apps/strapi/config/plugins.ts).
- Strapi bootstrap empty (apps/strapi/src/index.ts) -> no auto-permissions.

### Public Pages (Web)
- Homepage uses `landing-section` with fallback static content: apps/web/src/pages/Homepage.tsx.
- Services list and detail use Strapi via `cms.ts`: apps/web/src/pages/services/ServicesHub.tsx and apps/web/src/pages/services/ServicesPage.tsx.
- Domain pages use `domain-page` + `landing-section` items: apps/web/src/pages/domains/EnterpriseDomainPage.tsx.
- Rich content rendering: apps/web/src/components/Content/ModernContentRenderer.tsx and apps/web/src/components/Services/RichContentRenderer.tsx.

### Admin / Publishing
- Custom admin publishing UI: apps/web/src/pages/admin/ContentPublisher.tsx (uses client-side `VITE_CMS_TOKEN`).
- Admin dashboard shows CMS metrics: apps/web/src/pages/admin/AdminDashboard.tsx.
- Strapi admin exists but not fully configured for permissions or workflows.

### Critical Gaps
- CMS model is partial for full page control; most public pages still hardcode layout/visuals.
- Client-side CMS token exposure in web admin (security risk).
- No default public permissions for content types (manual setup required).
- No unified content block system; multiple renderers and ad-hoc mapping.
- Preview/publish workflows are split and fragile.

## Target CMS Model (Minimal + Extensible)

### Keep existing types
- `service`, `article`, `domain-page`, `landing-section` stay in place.

### Add / evolve content primitives
- Expand `landing-section` to serve as the CMS-first layout engine.
- Standardize `sectionKey` values (e.g., `hero`, `proof`, `features`, `stats`, `testimonials`, `content-grid`, `cta`, `faq`).
- Enrich `landing-item` with optional fields needed for layouts: `metric`, `metricLabel`, `image`, `quote`, `author`, `role`, `rating`, `tag`, `buttonLabel`, `buttonUrl`.
- Optional (Phase 2): add `page` content type to group sections with metadata (SEO, route, theme).

## Publishing Workflow (Target)

1. Editor creates content in Strapi Admin.
2. Content is drafted -> preview link generated.
3. Publish triggers Strapi webhook to API -> web cache revalidation.
4. Public pages query Strapi directly (REST) with `publicationState=live`.

### Security / permissions
- Public role: read-only for `service`, `article`, `landing-section`, `domain-page`.
- Authenticated role: editor access via Strapi admin.
- No client-side admin tokens in web app.

## x402 Access (Agents)
- Humans: web pages stay public.
- Agents: new API surface (apps/api) with `402 Payment Required` when not paid.
- Flow:
  - Agent calls `GET /api/content/:slug`.
  - If no valid x402 payment, return 402 with payment link/metadata.
  - On payment success, issue short-lived access token.
  - Token grants API read to content (same Strapi source).

## Execution Plan (Phased)

### Phase 1 — CMS foundation (Now)
- Normalize `landing-section` schema for the needed layouts.
- Add Strapi bootstrap to enforce public read permissions.
- Build a CMS section renderer in web using `sectionKey` as layout selector.
- Redesign Homepage to be 100% CMS-driven with new renderer.

### Phase 2 — Core pages redesign
- Services Hub: CMS-first hero + taxonomy-driven sections.
- Service detail: upgraded editorial layout using `ModernContentRenderer` + a CMS-configured sidebar.
- Domain pages: `domain-page` + `landing-section` blocks for a consistent, high-end layout.

### Phase 3 — Admin + workflow
- Move publishing actions to a server-side API proxy (apps/api) to eliminate client CMS tokens.
- Add preview token pipeline and preview UI.
- Add publish/schedule flows in admin UI.

### Phase 4 — x402 + API access
- Implement x402 gateway in apps/api.
- Add access token issuance + validation for agent requests.

## Stack Decisions (Reliability + Cost)
- Keep Railway for web + API + Strapi; keep Postgres on Railway.
- Object storage: keep R2 via S3 API unless a single-provider constraint requires S3/Backblaze.
- Replace Cloudflare Workers with Railway API endpoints (already in progress).

## Immediate Next Steps (This sprint)
1. Finalize the landing-section spec (section keys + item fields).
2. Add Strapi bootstrap for public read permissions.
3. Implement CMS section renderer + redesign Homepage as first showcase.
