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
  - `/api/upload-url`
- [x] Update front-end to use `VITE_API_URL` for uploads + Turnitin flows.
- [ ] Update remaining front-end API calls to use `VITE_API_URL` (payments, messaging, notifications).
- [ ] Align Strapi schemas to web contract or update mappers to Strapi blocks.
- [ ] Add missing Strapi content types: `landing-sections`, `domain-pages`.
- [ ] Replace static ServicesHub and domain data with CMS-driven fetch.
- [ ] Serve `/sitemap.xml` and `/robots.txt` from Railway API in production.
- [ ] Unify messaging: keep Mattermost path, gate/remove D1 legacy client.

---

## In Progress

- [ ] Upload metadata persistence (move in-memory map to DB).
- [ ] Mattermost auth alignment (cookie domain + session handling).
- [ ] Payments API placeholders → real providers or gated UI.

---

## Done (Recent)

- [x] API routes: `uploads`, `payments`, `messaging`, `webhooks`, `sitemap`.
- [x] Added `resolveApiUrl` helper and wired uploads + Turnitin + payment services to it.
- [x] Updated DocumentsUpload + UploadDropzone to use API presign endpoints.

---

## Notes

- Anonymous upload access is currently allowed via `ALLOW_ANON_UPLOADS=true` for compatibility.  
  Plan: wire Clerk tokens from the front-end and disable anonymous uploads in production.
