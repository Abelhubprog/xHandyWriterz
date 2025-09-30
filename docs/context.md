# Context: Reliable Messaging + Content Platform (Strapi 5 · Mattermost · Cloudflare R2)

## Executive summary
We are replacing a brittle, bespoke stack (Cloudflare Workers proxy + Microfeed D1/R2 + custom UI) with two mature open‑source pillars:

- **Strapi 5** for **structured content management** (articles/services), workflows, preview, and a clean GraphQL/REST API.
- **Mattermost** for **reliable messaging** (channels/threads, WebSocket delivery, search, retention) and first‑class **file attachments**.

Both persist metadata in **PostgreSQL** and store binaries in **Cloudflare R2** (S3‑compatible), fronted by Cloudflare CDN. A small Worker layer issues presigned URLs and triggers antivirus scanning on object‑created events. Authentication and SSO unify through **Clerk (OIDC)** for editors and end‑users.

## Problems we’re solving
- **Fragility & outages:** D1 locks, ad‑hoc APIs, no standardized retries/acknowledgements.
- **No editorial workflow:** Microfeed has minimal authoring UI, no review/scheduling, and limited asset management.
- **Attachment lifecycle gaps:** Missing resumable uploads, scanning/quarantine, retention, and auditing.
- **Developer friction:** Too many custom endpoints; hard to run locally; limited observability.

## Goals (what “good” looks like)
- **Reliability:** SLA‑style behavior for chat & uploads; predictable failover and retries.
- **Editorial velocity:** Draft → review → publish with preview and instant cache invalidation.
- **Security & compliance:** Centralized auth (Clerk), AV scanning, signed downloads, retention, and audit trails.
- **Unified storage:** One object store (R2) for media and attachments; lifecycle rules.
- **DevEx:** Clear repo layout, reproducible local dev, infra-as-code hooks, and traceable logs.

## Non‑goals (for now)
- Building our own chat transport, E2EE/federation (Matrix), or a custom DAM. We prioritize time‑to‑reliability with Strapi + Mattermost + R2.

## Target architecture (overview)
```
[Users & Editors] ─┐            (OIDC)             ┌─> [Clerk]
                   ├─> [Web App: Next.js (Pages/Workers)]
                   │        │  \__ Content  ────────> [Strapi 5 + Postgres]
                   │        │  \__ Messaging ──────> [Mattermost + Postgres]
                   │        │         \__ Attach  ─> [R2 (S3) Buckets]
                   │        └─> [Upload/Presign Worker] ──┐
                   │                                       ├─> presigned PUT/GET
                   │                                       └─> R2 ObjectCreated → AV scan → tag/notify
                   └─────────────────────────────────────────────────────────────
```

### Responsibilities & boundaries
- **Strapi 5**: Content types, validation, roles, draft/publish, preview, i18n, webhooks; **Uploads** via S3 provider → R2.
- **Mattermost**: Teams/channels/threads, delivery via WebSockets, `/files` API for attachments → R2; retention/compliance.
- **R2 (S3)**: Immutable object storage, lifecycle (cold/archive/delete), CDN edge, event notifications.
- **Workers**: Presigned URLs (multipart), download gating, AV scanning pipeline (ClamAV), light glue only.
- **Web (Next.js)**: UI, CMS rendering, dashboard, messaging UI (embed or native via REST/WS), calls Workers for signed links.
- **Clerk**: Single IdP for Admins/Editors (Strapi) and Users (Mattermost); claims map to roles.

## Why these choices
- **Proven OSS** with active communities and clear upgrade paths.
- **PostgreSQL‑first** (Strapi & Mattermost) fits our existing DB ops and analytics.
- **S3‑compatible** storage standardizes uploads and future migration paths (S3 → R2 → MinIO, etc.).

## Security posture
- **AuthN/Z** via Clerk OIDC; least‑privilege roles in Strapi/Mattermost.
- **Data in transit** TLS everywhere; presigned URLs short TTL; cookies `HttpOnly`/`Secure`.
- **Data at rest** R2 SSE; DB encryption at rest; secrets in environment vaults.
- **AV scanning** on every new object; quarantine/delete on fail; deny presign if not `x‑scan=clean`.
- **Audit**: Strapi content history; Mattermost audit/exports; Cloudflare Logpush → central logs.

## SLOs & capacity
- **Chat availability** ≥ 99.9% monthly; message delivery P50 < 200 ms (in‑region), P95 < 900 ms.
- **Uploads** ≤ 5 GB per file (multipart), resumable; P95 time‑to‑first‑byte < 1 s from CDN.
- **CMS publish** → edge invalidation/ISR within 60 s.

## Migration plan (phased)
1. **Chat first**: Stand up Mattermost + R2; switch dashboard MessageCenter; retire `/api/threads*`.
2. **Files pipeline**: Presign Worker + AV; route all new uploads; lifecycle rules.
3. **CMS swap**: Strapi models & content migration; switch `/services` to GraphQL/REST; keep the legacy Microfeed paths available until traffic fully transitions.
4. **Harden & observe**: Dashboards, alerts, backups, DR runbooks.

## Risks & mitigations
- **SSO complexity**: Validate OIDC in staging; fall back to Access‑gated admin if needed.
- **Large uploads**: Use S3 multipart with parallel parts and resumable state in local storage.
- **Scanner backlog**: Gate downloads until `clean`; autoscale the consumer; backpressure on presign if queue depth high.
- **Cost drift**: Bucket lifecycle + analytics; monthly cost reviews; alert on egress anomalies.

## Success metrics
- Message send→receive success rate ≥ 99.99%; attachment error rate < 0.5%.
- Editorial cycle time (create→publish) reduced by 50%.
- Support/ops tickets related to messaging/content infra reduced by 70%.

## Next steps
- Confirm bucket names & domains; provision OIDC apps in Clerk.
- Commit baseline repos (web/cms/chat/workers); wire staging; smoke tests.
- Author the first 3 content types and roll one team/channel live in Mattermost.
