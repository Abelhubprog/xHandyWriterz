# HandyWriterz Implementation Checklist

**Last Updated:** January 2025  
**Purpose:** Track active fixes and shipping milestones.

---

## Active Checklist (P0/P1)

- [x] Add Railway API scaffold (`apps/api`) with core route wiring.
- [x] Fix `VITE_UPLOAD_BROKER_URL` ingestion in `apps/web/src/env.ts`.
- [x] Add `/api/turnitin/*` endpoints for submission notifications.
- [x] Add upload compatibility endpoints:
  - `/s3/presign-put`
  - `/s3/presign-get`
  - `/s3/presign`
  - `/api/upload-url`
- [x] Update front-end to use `VITE_API_URL` for uploads + Turnitin flows.
- [x] Update remaining front-end API calls to use `VITE_API_URL` (payments, messaging, notifications).
- [x] Align Strapi schemas to web contract and add fallback mapping in `cms.ts`.
- [x] Add missing Strapi content types: `landing-sections`, `domain-pages`.
- [x] Replace static ServicesHub and domain data with CMS-driven fetch.
- [x] Serve `/sitemap.xml` and `/robots.txt` from Railway API in production.
- [ ] Unify messaging: keep Mattermost path, gate/remove D1 legacy client.

---

## In Progress

- [ ] Upload metadata persistence (move in-memory map to DB).
- [ ] Payments API placeholders → real providers or gated UI.

---

## Done (Recent)

- [x] API routes: `uploads`, `payments`, `messaging`, `webhooks`, `sitemap`.
- [x] Added `resolveApiUrl` helper and wired uploads + Turnitin + payment services to it.
- [x] Updated DocumentsUpload + UploadDropzone to use API presign endpoints.
- [x] Fixed submission hook + NotificationSystem API wiring.
- [x] Normalized upload broker base in file upload service for Railway fallback.
- [x] Added file upload service compatibility exports + `/s3/delete` API endpoint.
- [x] Added `/api/r2/list` compatibility endpoint for document manager.
- [x] Mattermost auth exchange/refresh endpoints + token-based client auth.
- [x] Fixed Strapi ContentPublisher hero image to send media IDs.
- [x] Fixed Strapi ContentPublisher to parse REST `attributes` shape.
- [x] Updated cms-client GraphQL queries to match Strapi schema.
- [x] Fixed ServicesHub CMS mapping + reading time fields.
- [x] Proxy `/sitemap.xml` and `/robots.txt` to the API in `apps/web/scripts/server.mjs`.
- [x] Turnitin upload flows now fall back to `VITE_API_URL` when the broker is unset.

---

## Notes

- Anonymous upload access is currently allowed via `ALLOW_ANON_UPLOADS=true` for compatibility.  
  Plan: wire Clerk tokens from the front-end and disable anonymous uploads in production.
