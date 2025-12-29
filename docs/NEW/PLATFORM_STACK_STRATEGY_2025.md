# Platform Stack Strategy 2025 (No AWS)

This document describes the production stack, how Strapi, Mattermost, R2, and Railway are used, and when to consider alternatives.

## Principles
- No AWS services. Use Cloudflare R2 or other S3-compatible storage.
- Prefer Railway-managed services where possible.
- Keep the web app thin; route privileged CMS actions through the API.
- Preserve all existing features while improving reliability.

## Current Stack (Validated)
- Web: Vite + React + React Router in `apps/web`.
- API: Express in `apps/api`.
- CMS: Strapi 5 in `apps/strapi`.
- Messaging: Mattermost in `apps/mattermost`.
- Storage: Cloudflare R2 (S3-compatible).
- Auth: Clerk.

## Strapi Usage
- GraphQL and REST enabled for public content delivery.
- Admin mutations proxied through `/api/cms/*` to avoid exposing tokens.
- R2 configured as the upload provider via S3-compatible settings.
- Content types in scope: articles, services, authors, domain pages, landing sections, testimonials.

### Production Notes
- Use Postgres on Railway for Strapi.
- Enable webhook signing for publish/unpublish events.
- Cache invalidation via API endpoints or Cloudflare cache purge.

## API Usage (apps/api)
- Upload pipeline (presign PUT/GET) with R2.
- Mattermost session exchange using Clerk tokens.
- Payments (StableLink, Stripe, PayPal, Coinbase) with webhook verification.
- Turnitin notifications (Mattermost + email).
- CMS admin proxy (GraphQL + REST) with Clerk admin guard.

### Production Notes
- Replace in-memory stores (orders, uploads) with Postgres.
- Add a background job queue for scan events and email retries.

## Mattermost Usage
- Native chat and file upload used by the dashboard.
- Session exchange handled by `/api/messaging/*`.
- Configure R2 as S3 storage for file attachments.
- Plan OIDC integration via Clerk.

## Storage Strategy (No AWS)
- R2 buckets or prefixes:
  - `cms-media/` for Strapi assets
  - `chat-uploads/` for Mattermost attachments
  - `user-uploads/` for direct uploads
- Signed URL TTL: 5 minutes.
- AV scan results stored in DB and used to gate downloads.

## Railway Services
- Web: static build + Node runtime
- API: Express service
- Strapi: full service with Postgres
- Mattermost: service with Postgres
- Optional: Redis (queues, rate limiting, session cache)

## Alternatives If Strapi Becomes a Blocker
- Payload CMS (TypeScript-first, strong local dev, faster schema evolution)
- Directus (robust RBAC, great admin, SQL-first)
- Sanity (hosted, fast authoring, higher cost)

### Migration Strategy
1. Freeze new content types in Strapi.
2. Export content via Strapi REST/GraphQL.
3. Import into new CMS with domain-first schema.
4. Swap CMS URL and tokens; keep existing frontend routes.

## Legacy References
- Docs mention Microfeed and Cloudflare Workers, but no corresponding app folders exist.
- Treat Microfeed as fully deprecated unless reintroduced intentionally.

## Production Readiness Checklist (Stack)
- Strapi: Postgres + R2 + webhook signing
- Mattermost: R2 storage + OIDC + bot token
- API: persistent orders + upload metadata
- Web: stable env config and error handling
- Observability: Sentry in web and api
