# HandyWriterz Stack + Platform Plan (No AWS)

## Goals
- Run all services on Railway where possible.
- Use Cloudflare R2 for object storage only (S3-compatible).
- Remove Cloudflare Workers dependency for uploads/presign until stable.
- Keep costs predictable and simplify ops.

## Deployment Targets (Railway + Cloudflare)

### Railway (Core Runtime)
- **Web**: `apps/web` (Vite SPA build + static hosting)
- **API**: `apps/api` (Express, presign, payments, messaging bridge, webhooks)
- **CMS**: `apps/strapi` (Strapi 5 + admin)
- **Messaging**: Mattermost service
- **Postgres (CMS)**: Strapi database
- **Postgres (Chat)**: Mattermost database
- **Redis**: optional (queues, rate limits, session cache, background jobs)

### Cloudflare (Storage + Delivery)
- **R2**: S3-compatible object storage
  - `cms-media/*` (Strapi uploads)
  - `chat-uploads/*` (Mattermost file storage)
  - `user-uploads/*` (direct uploads)
- **CDN/DNS**: optional (if keeping Cloudflare for edge caching and DNS)

## Core Services

### 1) Web App (apps/web)
- **Host**: Railway static + Node runtime
- **Runtime**: Vite SPA
- **Auth**: Clerk
- **APIs**: Strapi public API + HandyWriterz API

### 2) CMS (apps/strapi)
- **Host**: Railway service
- **DB**: Railway Postgres
- **Storage**: Cloudflare R2 via S3 provider
- **Access**: Public read APIs for published content only

### 3) API (apps/api)
- **Host**: Railway service
- **Purpose**: uploads, messaging bridge, payment webhooks, x402 gateway
- **Storage**: R2 presign and metadata
- **Queue**: Railway cron or background worker (if needed)

### 4) Mattermost
- **Host**: Railway service
- **DB**: Dedicated Railway Postgres
- **S3 storage**: Cloudflare R2
- **Auth**: OIDC via Clerk

## Stack Needs + Rationale (No AWS)

| Capability | Why We Need It | Primary Choice (No AWS) | Best Alternatives (No AWS) |
| --- | --- | --- | --- |
| App hosting / compute | Run web, API, CMS, and messaging with minimal ops | Railway | Fly.io, Render, DigitalOcean App Platform, Hetzner + Docker, Coolify on a VPS |
| Database | Persistent data for CMS, orders, messaging metadata | Railway Postgres | Neon Postgres, Supabase Postgres, Crunchy Bridge |
| Object storage | Media, uploads, chat attachments | Cloudflare R2 | Backblaze B2, Bunny Storage, Wasabi |
| CMS | Editorial content, drafts, previews, workflow | Strapi 5 | Directus, Payload, Sanity (hosted) |
| Auth | Admin gating, user sessions, OIDC for Mattermost | Clerk | WorkOS, Auth0, Stytch, Supabase Auth |
| Messaging | Customer support + file attachments | Mattermost (self-host) | Chatwoot, Rocket.Chat, Matrix (Synapse) |
| Payments | Orders + card/crypto checkout | Stripe + PayPal + StableLink | Paddle, Paystack, Flutterwave |
| x402 payments | Agent-payable content access | x402 gateway + BTCPay (self-host) | OpenNode, Alby/Lightning provider |
| File scanning | Security for user uploads | ClamAV service on Railway | ClamAV on separate VM + queue, VirusTotal (paid, external) |
| Queues / jobs | AV pipeline, retries, scheduled publish | pg-boss (Postgres) | BullMQ + Redis (Railway Redis), Temporal (heavier) |
| Search | Fast content discovery | Meilisearch | Typesense |
| Email | Transactional notifications | Resend | Postmark, Mailgun |
| Analytics | Product insights without heavy ops | Plausible, Umami | PostHog (self-host) |
| CDN / DNS | SSL, edge caching | Cloudflare (DNS + CDN) | Bunny CDN + DNS provider |

Notes:
- If Cloudflare must be removed entirely, pair Backblaze/Bunny Storage with Bunny CDN for media delivery.
- Keep admin-only CMS mutations behind the Railway API proxy (`/api/cms/*`) to avoid exposing Strapi tokens in the frontend.

## Replace Cloudflare Workers
**Current**: presign/upload flows rely on Workers and client-side Cloudflare SDKs.
**Plan**:
- Implement presign endpoints in `apps/api`:
  - `POST /s3/create` (multipart init)
  - `POST /s3/sign` (part upload)
  - `POST /s3/complete` (finalize)
  - `POST /s3/presign` (download)
- Keep AV scan metadata in Postgres or KV-like table.
- Maintain 5-minute TTL and x-scan gating in API.
 - **Frontend** must not call Cloudflare APIs directly; use the Railway API only.

## Storage Strategy (No AWS)
- **Media**: Cloudflare R2 buckets
  - `cms-media/*` for Strapi
  - `chat-uploads/*` for Mattermost
  - `user-uploads/*` for direct uploads
- **Signed URLs**: generated in API (not Workers)

## Observability
- Sentry for frontend + API
- Railway metrics + logs
- Health endpoints for API + Strapi + Mattermost

## x402 Protocol
- **Entry**: `/api/x402/*`
- **Flow**:
  1) Request content
  2) Validate x402 payment proof
  3) Return gated response or presigned URL

## Alternatives (If Strapi Becomes a Blocker)
- **Payload CMS**: TypeScript-native, easier schema control
- **Directus**: robust admin and RBAC
- **Sanity**: hosted CMS, easy previews

Default remains Strapi 5 for now to avoid migration costs.

## Migration Steps
1. Bring API presign endpoints online.
2. Update frontend to use Railway API instead of Workers.
3. Remove Worker bindings + dead code (`cloudflare*.ts`).
4. Consolidate upload flow through API.
