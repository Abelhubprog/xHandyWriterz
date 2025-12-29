# Source Review (End to End)

This document is the end-to-end scan of the src folders and related docs. It derives intended features, confirms the current stack, and calls out gaps and cleanup candidates.

## Discovery Summary
- Package manager: pnpm workspace (apps/*)
- Apps: web (Vite + React Router), api (Express), strapi (Strapi 5), mattermost (Docker)
- Auth: Clerk in web and api
- Content: Strapi 5 (REST + GraphQL) with admin proxy in api
- Messaging: Mattermost (REST + WebSocket) with Clerk exchange in api
- Storage: Cloudflare R2 via S3-compatible SDKs (no AWS services)

## Frontend Scope (apps/web/src)

### Routing Map
- Routing is defined in `apps/web/src/router.tsx` with three shells: RootLayout, DashboardLayout, AdminLayout.

### Public CMS Pages
- `/` uses `HomepageNew.tsx` with CMS landing sections and fallback hero.
- `/domains`, `/domains/:slug`, `/domains/:slug/services/:serviceSlug`, `/domains/:slug/articles/:articleSlug` for domain content.
- `/articles`, `/articles/:slug`, `/authors`, `/authors/:slug` for editorial content.
- `/services` (ServicesHub), plus marketing pages: `/pricing`, `/about`, `/contact`, `/faq`, `/how-it-works`, `/support`, `/terms`, `/privacy`, `/search`.
- `/docs/x402` and `/api` for documentation pages.

### Dashboard Pages
- `/dashboard` main hub via `DashboardWrapper`.
- `/dashboard/orders` uses `/api/orders` and filters by status.
- `/dashboard/new-order` uses Mattermost-integrated order flow and uploads.
- `/dashboard/messages`, `/dashboard/email-admin`, `/dashboard/documents`, `/dashboard/profile`, `/dashboard/settings`.

### Admin Pages
- `/admin` overview and operational monitoring.
- `/admin/content` and `/admin/content/:id` for editor view.
- `/admin/publish` and `/admin/publish/:id` for publish workflow.
- `/admin/messaging`, `/admin/turnitin-reports`, `/admin/media/upload`, `/admin/settings`.

### CMS Integration
- REST client: `apps/web/src/lib/cms.ts` (public read, REST mapping).
- GraphQL client + admin proxy: `apps/web/src/lib/cms-client.ts` and `/api/cms`.
- Domain- and landing-section components: `apps/web/src/components/landing/*`.

### Messaging Integration
- Mattermost REST + WS client in `apps/web/src/lib/mm-client.ts` and `apps/web/src/lib/mm-ws.ts`.
- Hooks in `apps/web/src/hooks/mattermost/*`.
- Order flow and messaging UIs reuse Mattermost file uploads and posts.

### Payments + Turnitin
- Payment pages under `apps/web/src/pages/payment/*`.
- Payment services in `apps/web/src/services/*`.
- Turnitin flows in `apps/web/src/pages/TurnitinSubmission.tsx` and `apps/web/src/pages/turnitin-check.tsx`.

### UI System
- Tailwind + custom primitives under `apps/web/src/components/ui/*`.
- Two global stylesheets: `apps/web/src/index.css` (Tailwind + tokens) and `apps/web/src/styles.css` (legacy, Inter-based).

## API Scope (apps/api/src)
- `/api/uploads`: R2 presign (PUT/GET), list/delete, metadata, admin notifications (Mattermost + email).
- `/api/orders`: order CRUD stored in memory (non-persistent today).
- `/api/payments`: StableLink, PayPal, Stripe, Coinbase; webhook verification.
- `/api/messaging`: Clerk token exchange to Mattermost session, status check, notify.
- `/api/turnitin`: admin notifications + user receipt emails.
- `/api/cms`: admin proxy to Strapi REST and GraphQL.
- `/api/webhooks`: Strapi publish/unpublish, R2 scan results, payment webhooks.
- `/sitemap.xml` and `/robots.txt` served by api from Strapi content.

## CMS Scope (apps/strapi and strapi-schemas)
- Strapi 5 with GraphQL plugin and S3-compatible upload provider (R2).
- DB config supports Postgres for production, SQLite in dev.
- Content types: article, service, author, category, tag, domain-page, landing-section, testimonial.
- Components: SEO metadata, landing items, domain highlights/features/faq, content blocks.

## Messaging Scope (apps/mattermost)
- Docker-based Mattermost with Postgres and optional MinIO for local S3 emulation.
- R2 S3 settings are configured via env; OIDC placeholders for Clerk.
- Dashboard uses native Mattermost REST + WebSocket for chat and files.

## Intended Features (Docs + Code Alignment)
- CMS-first editorial site with domain-first content and services.
- User dashboard for orders, documents, messaging, payments, and profile.
- Admin operations dashboard for content publishing, messaging oversight, and Turnitin reports.
- x402 documentation + API surface.
- File pipeline using R2 presign, notifications, and scan webhook.
- Payments via StableLink primary plus optional Stripe/PayPal/Coinbase.
- Messaging via Mattermost with Clerk SSO exchange.

## Gaps and Risks
- Orders and upload metadata are stored in-memory in `apps/api` (not production safe).
- Payment UI coverage is partial; provider availability is env-driven.
- Legacy CSS (`apps/web/src/styles.css`) conflicts with Tailwind tokens and uses Inter.
- Docs mention Microfeed and Workers, but no `apps/microfeed` or `workers/` directory exists.
- Mattermost config defaults to local file storage; needs R2 and OIDC enablement in production.

## Cleanup Candidates (Safe First)
- Remove top-level `nul` file (contains a failed shell command).
- Validate whether `apps/api/dist` is build output before deletion (keep until build pipeline is enforced).
- Archive legacy docs in `docs/` after the new docs are confirmed as canonical.
