# Production-Ready Build Plan

## Phase 0: Ground Truth
- Confirm Strapi content types and domains.
- Define single source of truth for docs (docs/NEW).
- Remove dead pages/components and duplicates.

## Phase 1: Content Platform (Public)
- Finalize CMS-driven layouts for all public routes.
- Enforce domain-first navigation and consistent IA.
- Add canonical URLs and JSON-LD for articles/services.
- Add structured content blocks for domain pages.

## Phase 2: Dashboard (Customer)
- Simplify dashboard UI with a task-first layout.
- Implement real data wiring (orders, uploads, messages).
- Replace placeholders and mock data with API integrations.

## Phase 3: Admin Ops
- Keep admin web UI as operations hub.
- Add CMS status cards, publishing queue, and shortcuts to Strapi.
- Add messaging oversight and doc review pipeline.

## Phase 4: Integrations
- **Strapi**: R2 storage, webhook on publish, preview tokens.
- **Mattermost**: OIDC via Clerk, R2-backed uploads.
- **Uploads**: API presign endpoints (no Workers).
- **Payments**: Stripe + PayPal + x402; single source of truth in API.

## Phase 5: Observability + QA
- Sentry for frontend + API
- Health checks for each service
- End-to-end test plan for core flows

## Phase 6: Launch
- Performance audit
- SEO and sitemap validation
- Hardened secrets + RBAC validation

