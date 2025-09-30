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
3. **CMS swap**: Strapi models & content migration; switch `/services` to GraphQL/REST; maintain compatibility via proxy as needed.
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


# Data Flows: Content · Files · Messaging (Strapi 5 + Mattermost + R2)

> This document traces the end‑to‑end flows and includes sequence diagrams, API touch‑points, and failure handling. It is intentionally long (5+ pages worth) to double as an implementation reference.

---

## Legend & shared concepts
- **IdP** = Clerk (OIDC)
- **CMS** = Strapi 5 (PostgreSQL)
- **Chat** = Mattermost (PostgreSQL)
- **OBJ** = Cloudflare R2 (S3‑compatible)
- **WK** = Cloudflare Worker (presign + AV + small glue)
- **FE** = Front‑end (Next.js on Pages/Workers)
- **AV** = ClamAV (scanner engine)

Shared identifiers
- `user_id` from Clerk `sub`
- `org_id` / `team_id` mapping to MM team
- Object keys: `cms-media/...` and `chat-uploads/...`

---

## 1) Content management & publishing (Strapi 5)

### 1.1 Models (initial)
**Service**
- `title` (string, required, unique slug)
- `summary` (text)
- `body` (rich content)
- `domain` (enum)
- `typeTags` (repeatable string)
- `heroImage` (media)
- `seo` (component: title, desc, og image)
- `publishedAt` (datetime)

**Article**
- `title`, `slug`, `body`, `author`, `category`, `images[]`, `publishedAt`

### 1.2 Storage
- Metadata → **PostgreSQL** (managed: Supabase/Neon/RDS)
- Media → **R2 S3** bucket `cms-media/…` via Strapi S3 provider (forcePathStyle + endpoint = R2)
- Optional CDN domain for public media; private media served via presigned GET from WK

### 1.3 Editorial workflow
1. Editor signs in to **/admin** (OIDC via Clerk or Access‑gated admin)
2. Draft content → validations → save (DB) → upload media (R2)
3. Review: role‑based access (Author/Editor/Admin), comments
4. Publish: set `publishedAt`, emit webhook → FE cache purge or ISR revalidate

### 1.4 Sequence: Create → Publish → Render
```
Editor ──(OIDC)──> Strapi Admin
  │                       │
  │  POST /api/{type}     │  (DB write)
  ├───────────────────────>│
  │  PUT /upload (S3)     │  (R2 object)
  ├──────────────┐        │
  │              └─> OBJ (cms-media/...)
  │
  │  PATCH publish        │ set publishedAt; webhook
  ├───────────────────────>│──────────┐
  │                                    │
  ▼                                    ▼
 FE ──(GraphQL/REST)──> Strapi (PUBLISHED) ──> OBJ URLs → Render
```

### 1.5 Preview & drafts
- Strapi preview token (JWT) appended to FE preview route: `/preview?type=service&id=…&token=…`
- FE forwards token to a FE server function → calls Strapi with `publicationState=PREVIEW` → renders draft

### 1.6 Caching & invalidation
- On publish:
  - Strapi → webhook → FE (Pages Function) → purge CDN path(s) or trigger ISR revalidate
  - Optional: `Surrogate-Key` headers per entity for fine‑grained cache clearing

### 1.7 Internationalization (optional)
- Enable Strapi i18n; each locale has own `publishedAt`; FE routes include locale prefix

### 1.8 Access control
- Public content: direct CDN URLs
- Protected content: FE requests `GET /presign` (WK) → short‑lived URL only if `x-scan=clean`

### 1.9 Failure handling
- **DB write fails** → show inline error; retry safe
- **Upload fails** → retry multipart part(s); if MPU aborted, clean orphaned parts via list‑mpu + abort
- **Webhook fails** → FE polls `publishedAt` and presents “refresh preview” UI; background retry

### 1.10 Backups & DR
- Nightly PostgreSQL logical backups; restore runbook tested quarterly
- R2 bucket versioning (optional) + lifecycle; metadata export for mapping

---

## 2) File sharing between end‑user and admin

We prefer **native Mattermost attachments** for chat contexts. For CMS/private documents, we use a **direct‑to‑R2 pipeline** with presign + AV.

### 2.1 End‑user → Admin (chat attachment)
**Happy path (native MM):**
1. FE (user) authenticated via Clerk → MM (OIDC SSO)
2. User selects file → FE calls MM `/api/v4/files` (MM streams to R2)
3. MM returns `file_id`; FE attaches to a post `/api/v4/posts`
4. R2 object‑created → Queue → AV consumer → `x-scan=clean`
5. Peers click file → MM presigns GET → browser downloads

**Sequence**
```
FE ──WS──> MM
 │  POST /files  ─────────────► MM ───► OBJ (chat-uploads/...)
 │  POST /posts (attach file_id)
 │◄─ WS event: post created
OBJ ──event──> Queue ──> AV ──> tag clean/quarantine
User clicks ► MM GET /files/{id}/link ► presigned URL ► download
```

**Why native?** MM handles thumbnails, quotas, previews, search, and retention automatically.

### 2.2 Admin → End‑user (send a document)
- Same as above via MM channel (admin uploads as a file)
- For documents sourced in CMS (e.g., policy PDFs): FE hits WK presign GET for a protected CMS object and posts the URL into the MM message (or re‑uploads to MM for lifecycle parity)

### 2.3 Generic direct‑to‑R2 (for CMS/private)
1. FE asks WK `/s3/create` (multipart) with `key` + `contentType`
2. FE uploads parts directly to R2 using signed URLs from WK `/s3/sign`
3. FE completes MPU via WK `/s3/complete`
4. OBJ event → Queue → AV → tag
5. FE stores object key in Strapi field or posts link in MM

**Access rules**
- Presign GET only when `x-scan=clean`
- TTL ≤ 5 minutes; scope to `key` and optional IP

### 2.4 Retention & lifecycle
- **MM**: retention policy (e.g., 180 days) deletes posts/files; R2 lifecycle mirrors it
- **CMS**: lifecycle per folder/prefix; archived after N days; cold storage or delete

### 2.5 Failure modes
- **Large file**: MPU with parallel parts; if user abandons, background abort‑MPU job
- **AV timeout**: mark `pending`; UI shows spinner; deny presign until clean; alert after threshold
- **R2 egress blocked**: FE retries presign; fall back CDN path for public assets

---

## 3) Messaging between end‑user and admin (Mattermost)

### 3.1 SSO & session
1. FE user signs in with Clerk → receives ID token
2. FE opens MM (embed) or calls a FE server function to exchange OIDC for MM session
3. FE opens `/api/v4/websocket`

### 3.2 Channels & routing
- Per‑org/team in MM; per‑conversation private channels; naming convention: `support-<org>-<ticket>`
- Bots for automation: `@notifier` posts scan results or workflow updates

### 3.3 Send/receive
- **Send**: POST `/api/v4/posts` with `channel_id`, `message`, `file_ids`
- **Receive**: WS events (`posted`, `post_edited`, `user_typing`, `status_change`)
- **Receipts**: read‐track via user status and plugin if strict delivery is required

### 3.4 Compliance & export
- Built‑in exports (CSV/Actiance/GlobalRelay); admin audit log
- Retention per team/channel; legal hold via export + bucket freeze

### 3.5 Failure handling
- **WS disconnect**: exponential backoff reconnect; buffer outgoing messages and retry POST with idempotency keys
- **Rate limits**: FE respects MM rate headers; queue with jitter

---

## 4) Data catalog (what lives where)

**PostgreSQL (CMS)**
- `services`, `articles`, `components_seo`, `upload_files` (Strapi)

**PostgreSQL (Chat)**
- `users`, `teams`, `channels`, `posts`, `fileinfo` (Mattermost)

**R2 (objects)**
- `cms-media/<model>/<yyyy>/<mm>/<uuid>_<filename>` (public/private)
- `chat-uploads/team/<teamId>/channel/<channelId>/<postId>/<fileId>_<filename>`

**KV / metadata (optional)**
- `scan:<objectKey> = clean|infected|pending`

---

## 5) API surface (minimum viable endpoints)

**Worker (WK)**
- `POST /s3/create` → `{ uploadId }`
- `POST /s3/sign` → `{ url, headers }`
- `POST /s3/complete` → finalize MPU
- `POST /s3/presign` → GET URL for downloads (validates scan status)

**Strapi**
- `POST /api/services` (authed) | `GET /api/services` (public)
- `POST /upload` (internal via provider) | `GET /graphql`
- `POST /webhooks/published` (to FE)

**Mattermost**
- `POST /api/v4/users/oidc/login` (SSO)
- `GET /api/v4/channels/{id}/posts` | `POST /api/v4/posts`
- `POST /api/v4/files` | `GET /api/v4/files/{id}/link`
- `GET /api/v4/websocket`

---

## 6) Testing plan (what to verify)

1. **Auth**: OIDC round‑trip for Strapi Admin & MM; role mapping; logout flows
2. **CMS**: validations, preview token, publish webhook → cache purge
3. **Uploads**: ≥5 GB multipart; abort/cleanup; throttled networks; mobile resume
4. **AV**: seeded EICAR file is quarantined; presign denied
5. **Chat**: WS reconnect under packet loss; message ordering and idempotency; attachment previews
6. **Retention**: MM purge removes objects; R2 lifecycle aligns; restore from backup

---

## 7) Appendix A — Example configs

### Strapi `config/plugins.ts`
```ts
export default () => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
          endpoint: process.env.R2_ENDPOINT, // https://<account>.r2.cloudflarestorage.com
          region: process.env.R2_REGION || 'auto',
          forcePathStyle: true,
        },
        params: { Bucket: process.env.R2_BUCKET! },
        baseUrl: process.env.R2_PUBLIC_BASE,
      },
      actionOptions: { upload: {}, uploadStream: {}, delete: {} },
    },
  },
});
```

### Mattermost `config.json` (S3 + OIDC excerpts)
```json
{
  "FileSettings": {
    "DriverName": "amazons3",
    "AmazonS3AccessKeyId": "${R2_KEY}",
    "AmazonS3SecretAccessKey": "${R2_SECRET}",
    "AmazonS3Bucket": "chat-uploads",
    "AmazonS3Region": "auto",
    "AmazonS3Endpoint": "<account>.r2.cloudflarestorage.com",
    "AmazonS3SSL": true
  },
  "ExperimentalSettings": { "ClientSideCertEnable": false },
  "ServiceSettings": { "EnableOAuthServiceProvider": false },
  "GitLabSettings": { "Enable": false },
  "Office365Settings": { "Enable": false },
  "PluginSettings": { "Enable": true }
}
```

### Worker (presign) — routes
- `POST /s3/create` → Initialize MPU
- `POST /s3/sign` → Sign PUT part
- `POST /s3/complete` → Complete MPU
- `POST /s3/presign` → Sign GET (verify `x-scan=clean`)

---

## 8) Appendix B — Operational runbooks (abridged)

**Backups**
- Nightly DB dumps → encrypted object storage; 7/30/365 retention tiers
- R2 lifecycle + optional versioning; quarterly restore test

**Incidents**
- WS flapping: check MM logs, LB sticky sessions, client backoff
- Upload errors: inspect MPU state; abort stale MPUs; retry policy
- Scanner backlog: autoscale consumer; queue depth alert; temporarily allow downloads for signed editors only

**Upgrades**
- Staging soak 48h; run e2e suite; blue/green or canary for MM/Strapi

---

## 9) Summary
- **Strapi 5** centralizes structured content with workflow, preview, and GraphQL/REST delivery.
- **Mattermost** delivers reliable messaging and native attachments with retention/compliance.
- **R2** unifies object storage; presign + AV produce a safe, auditable file pipeline.
- **Workers** provide minimal glue: presign, AV triggers, signed downloads.

This blueprint is production‑oriented and designed to be implemented incrementally: chat first, uploads pipeline, then CMS swap.

 we have reactpp; home page, clerk auth, user dasboard, we only need 5 or more pages, cms, admin dashboard, file sharing, messaging, analytics, seo.


# reactpp — Pages, routes, and code skeleton (Next.js App Router)

This is a ready-to-extend scaffold for **5+ pages** covering: Home, Clerk auth, User Dashboard, CMS (content), Admin Dashboard, File Sharing, Messaging, Analytics, and SEO.

> Assumes: Next.js 14 (App Router), TypeScript, Tailwind, Clerk, Strapi 5 (CMS), Mattermost (chat), Cloudflare R2 (S3-compatible) via a presign Worker.

---

## 0) Install & env

```bash
pnpm add @clerk/nextjs graphql @apollo/client cross-fetch
pnpm add -D tailwindcss postcss autoprefixer
```

`.env.local`
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_APP_URL=https://app.example.com
# CMS
CMS_URL=https://cms.example.com
CMS_TOKEN=...
# Chat
NEXT_PUBLIC_MM_URL=https://chat.example.com
# Worker for presign (optional for private CMS assets)
NEXT_PUBLIC_UPLOAD_BROKER=https://upload.example.com
```

---

## 1) App directory layout (routes)

```
app/
  layout.tsx                 # global layout, SEO defaults
  page.tsx                   # Home (marketing)
  (authed)/
    dashboard/page.tsx       # User dashboard
    content/page.tsx         # CMS feed (services/articles)
    files/page.tsx           # File sharing (uploads & downloads)
    messages/page.tsx        # Messaging (Mattermost embed or native)
    analytics/page.tsx       # User-facing analytics
  admin/
    page.tsx                 # Admin dashboard (guarded)
  seo/
    page.tsx                 # SEO utilities & preview
  sitemap.ts                 # dynamic sitemap
  robots.ts                  # robots
middleware.ts                # Clerk auth + route protection

components/
  Nav.tsx
  Footer.tsx
  AuthGuard.tsx
  CmsCard.tsx
  FileDrop.tsx
  ChatEmbed.tsx
  Charts.tsx
lib/
  cms.ts                     # Strapi GraphQL fetcher
  mm.ts                      # Mattermost helpers
  auth.ts                    # role helpers via Clerk
  storage.ts                 # presign helpers
styles/
  globals.css
```

---

## 2) Global layout & SEO baseline

`app/layout.tsx`
```tsx
import './styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'reactpp',
    template: '%s · reactpp',
  },
  description: 'Content, messaging, and file sharing platform.',
  openGraph: {
    type: 'website',
    siteName: 'reactpp',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-white text-gray-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 3) Home page (marketing)

`app/page.tsx`
```tsx
export const dynamic = 'force-static';

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="py-16">
        <h1 className="text-4xl font-bold">reactpp</h1>
        <p className="mt-4 max-w-2xl text-lg">A compact platform for content, messaging, and secure file sharing.</p>
        <div className="mt-8 flex gap-3">
          <a href="/sign-in" className="rounded-xl bg-black px-5 py-3 text-white">Sign in</a>
          <a href="/sign-up" className="rounded-xl border px-5 py-3">Create account</a>
        </div>
      </section>
    </main>
  );
}
```

---

## 4) Clerk auth + middleware

`middleware.ts`
```ts
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default withClerkMiddleware((req) => {
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/(authed)(.*)',
    '/admin(.*)',
  ],
};
```

Sign-in/Sign-up routes are auto‑added by Clerk’s Next.js package (`/sign-in`, `/sign-up`).

Guard helper `components/AuthGuard.tsx`
```tsx
'use client';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="p-8 text-center">
          <p>Please sign in to continue.</p>
          <a className="mt-4 inline-block rounded bg-black px-4 py-2 text-white" href="/sign-in">Sign in</a>
        </div>
      </SignedOut>
    </>
  );
}
```

---

## 5) User Dashboard (authed)

`app/(authed)/dashboard/page.tsx`
```tsx
import AuthGuard from '@/components/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-6xl p-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <a className="rounded-xl border p-6" href="/authed/content">Content</a>
          <a className="rounded-xl border p-6" href="/authed/messages">Messages</a>
          <a className="rounded-xl border p-6" href="/authed/files">Files</a>
          <a className="rounded-xl border p-6" href="/authed/analytics">Analytics</a>
        </div>
      </main>
    </AuthGuard>
  );
}
```

---

## 6) CMS page (content feed)

`lib/cms.ts`
```ts
export async function fetchServices() {
  const q = `query { services(publicationState: PUBLISHED){ data { id attributes { title slug summary } } } }`;
  const res = await fetch(`${process.env.CMS_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CMS_TOKEN}`,
    },
    body: JSON.stringify({ query: q }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('CMS fetch failed');
  return res.json();
}
```

`app/(authed)/content/page.tsx`
```tsx
import AuthGuard from '@/components/AuthGuard';
import { fetchServices } from '@/lib/cms';

export const revalidate = 0;

export default async function ContentPage() {
  const data = await fetchServices();
  const items = data?.data?.services?.data ?? [];
  return (
    <AuthGuard>
      <main className="mx-auto max-w-4xl p-6">
        <h2 className="text-2xl font-semibold">Services</h2>
        <ul className="mt-6 space-y-4">
          {items.map((n: any) => (
            <li key={n.id} className="rounded-xl border p-4">
              <a href={`/authed/content/${n.attributes.slug}`} className="font-medium">{n.attributes.title}</a>
              <p className="text-sm text-gray-600">{n.attributes.summary}</p>
            </li>
          ))}
        </ul>
      </main>
    </AuthGuard>
  );
}
```

---

## 7) Messaging page (Mattermost)

**Option A: Embed** (fastest) — `components/ChatEmbed.tsx`
```tsx
'use client';
export default function ChatEmbed() {
  const url = process.env.NEXT_PUBLIC_MM_URL;
  return (
    <iframe src={url} className="h-[80vh] w-full rounded-xl border" />
  );
}
```

`app/(authed)/messages/page.tsx`
```tsx
import AuthGuard from '@/components/AuthGuard';
import ChatEmbed from '@/components/ChatEmbed';

export default function MessagesPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-6xl p-6">
        <h2 className="text-2xl font-semibold">Messages</h2>
        <p className="mb-4 text-sm text-gray-600">Powered by Mattermost (SSO enforced).</p>
        <ChatEmbed />
      </main>
    </AuthGuard>
  );
}
```

*(Option B: Native client via REST/WS can be added later.)*

---

## 8) File sharing page (R2 presign worker)

`lib/storage.ts`
```ts
export async function presignDownload(key: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_BROKER}/s3/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, expires: 300 }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Presign failed');
  return res.json();
}
```

`components/FileDrop.tsx`
```tsx
'use client';
import Uppy from '@uppy/core';
import AwsS3Multipart from '@uppy/aws-s3-multipart';
import { useEffect, useMemo } from 'react';

export default function FileDrop() {
  const uppy = useMemo(() => new Uppy({ allowMultipleUploads: true }), []);

  useEffect(() => {
    uppy.use(AwsS3Multipart, {
      createMultipartUpload: (file) => fetch(`${process.env.NEXT_PUBLIC_UPLOAD_BROKER}/s3/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `uploads/${crypto.randomUUID()}_${file.name}`, contentType: file.type })
      }).then(r => r.json()),
      signPart: (file, { uploadId, key, partNumber }) => fetch(`${process.env.NEXT_PUBLIC_UPLOAD_BROKER}/s3/sign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, key, partNumber })
      }).then(r => r.json()),
      completeMultipartUpload: (file, { uploadId, key, parts }) => fetch(`${process.env.NEXT_PUBLIC_UPLOAD_BROKER}/s3/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, key, parts })
      }).then(r => r.json()),
    });
    return () => uppy.close();
  }, [uppy]);

  return (
    <div className="rounded-xl border p-6">
      <p className="mb-2 font-medium">Upload files</p>
      {/* Integrate @uppy/react / Dashboard here if desired */}
      <p className="text-sm text-gray-600">Large files supported (multipart).</p>
    </div>
  );
}
```

`app/(authed)/files/page.tsx`
```tsx
import AuthGuard from '@/components/AuthGuard';
import FileDrop from '@/components/FileDrop';

export default function FilesPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-4xl p-6">
        <h2 className="text-2xl font-semibold">Files</h2>
        <FileDrop />
      </main>
    </AuthGuard>
  );
}
```

---

## 9) Analytics page (stub)

`app/(authed)/analytics/page.tsx`
```tsx
import AuthGuard from '@/components/AuthGuard';

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-6xl p-6">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border p-6">
            <p className="text-sm text-gray-600">Traffic (last 7 days)</p>
            <div className="mt-3 h-40 rounded bg-gray-50" />
          </div>
          <div className="rounded-xl border p-6">
            <p className="text-sm text-gray-600">Engagement</p>
            <div className="mt-3 h-40 rounded bg-gray-50" />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
```

---

## 10) Admin dashboard (guarded)

`lib/auth.ts`
```ts
import { currentUser } from '@clerk/nextjs/server';

export async function requireAdmin() {
  const user = await currentUser();
  const role = (user?.publicMetadata as any)?.role;
  if (role !== 'admin') throw new Error('Not authorized');
}
```

`app/admin/page.tsx`
```tsx
import { requireAdmin } from '@/lib/auth';

export default async function AdminPage() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold">Admin</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        <li className="rounded-xl border p-6"><a href="/authed/content">Manage content</a></li>
        <li className="rounded-xl border p-6"><a href="/authed/messages">Moderate messaging</a></li>
        <li className="rounded-xl border p-6"><a href="/authed/files">Review uploads</a></li>
        <li className="rounded-xl border p-6"><a href="/seo">SEO tools</a></li>
      </ul>
    </main>
  );
}
```

---

## 11) SEO utilities

`app/seo/page.tsx`
```tsx
export const metadata = { title: 'SEO tools' };
export default function SEOPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold">SEO</h2>
      <ul className="mt-6 list-disc pl-6 text-sm text-gray-700">
        <li>JSON‑LD for organization & article</li>
        <li>OpenGraph image defaults</li>
        <li>Robots & Sitemap</li>
      </ul>
    </main>
  );
}
```

`app/robots.ts`
```ts
import { type MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_APP_URL!;
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${url}/sitemap.xml`,
  };
}
```

`app/sitemap.ts`
```ts
import { type MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/', changeFrequency: 'weekly', priority: 1 },
    { url: '/authed/dashboard', changeFrequency: 'daily', priority: 0.8 },
  ];
}
```

---

## 12) What to wire next

- **Strapi**: point `CMS_URL` + `CMS_TOKEN`, create `Service` model, enable GraphQL.
- **Mattermost**: set OIDC with Clerk; point `NEXT_PUBLIC_MM_URL` to your team UI; decide embed vs native.
- **Uploads**: if using presign Worker, set `NEXT_PUBLIC_UPLOAD_BROKER`; otherwise keep MM native `/files` for chat attachments.
- **Analytics**: drop in Cloudflare Web Analytics or Plausible script; bind charts to real data.
- **Styles**: add Tailwind and (optionally) shadcn/ui; wire Nav/Footer.

This gives you **8 pages** out of the box: Home, Dashboard, Content, Files, Messages, Analytics, Admin, SEO—covering everything you asked with clean seams to Strapi and Mattermost. Extend each page as you plug in your live services.

ROLE: Repo Surgeon + Staff-level Full-Stack Engineer (prioritize reliability)

OBJECTIVE
Introduce Strapi 5, Mattermost, and Cloudflare R2 alongside existing systems (progressive migration):
- Strapi 5 (headless CMS, Postgres, S3-compatible uploads)
- Mattermost (messaging, Postgres, S3-compatible attachments)
- Cloudflare R2 (S3 API) as unified object storage
- Optional CF Worker for multipart presign + signed GET
Integrate with the existing React front-end (Clerk auth, Home, Dashboard, Content, Files, Messages, Analytics, Admin, SEO).
IMPORTANT: Do NOT assume filenames or paths. Discover, then operate only on what exists.

CONSTRAINTS & RULES
- Never invent paths. First, inspect the repo to learn its layout (package manager, monorepo tool, app folders, routing style).
- Prefer minimal surface area changes and small, testable increments.
- Keep secrets in env variables (provide examples; don’t hardcode).
- Use native platform features where available: Strapi upload provider for CMS, Mattermost `/files` for chat.
- Keep the existing front-end’s routing paradigm (Next.js App Router, Pages Router, or react-router)—detect and follow it.

PHASE 1 — DISCOVERY (MANDATORY)
1) Print a succinct repo inventory:
   - package manager, monorepo tool (pnpm/yarn/npm, turbo/nx), top-level folders (apps/packages/services).
   - locate the front-end app (framework, routing style, auth usage).
   - search for “microfeed” references (dirs, env keys, endpoints, D1 usage).
2) Based on what you find, define concrete targets (actual app/service names & paths) for:
   - CMS service (Strapi 5 + Postgres)
   - Chat service (Mattermost + Postgres)
   - Object storage usage (R2 via S3)
   - Optional upload/presign Worker (CF)
3) List risks you see (ports already used, Docker present/missing, mismatch in Node versions).

PHASE 2 — PLAN (BOUND TO DISCOVERY)
Produce an implementation plan tied to the discovered structure, covering:
- Coexistence/migration plan for any legacy CMS (if present): which references to map, which env keys to introduce, which routes to proxy during transition.
- Introduction of CMS service (Strapi 5) in a new service folder consistent with the repo’s convention.
- Introduction of Chat service (Mattermost) likewise.
- Optional Worker for presign/signed GET (only if the repo already uses Workers or if a small service addition is acceptable).
- Front-end integration tasks without naming files: “add Content page that fetches from CMS,” “add Files page that uses multipart presign,” “add Messages page that embeds/uses Mattermost,” “add Admin & SEO pages or sections per existing layout.”
- Rollout order: Chat → Upload pipeline → CMS → Page wiring → Cleanup.

PHASE 3 — IMPLEMENT (GUIDED, NO HARD-CODED PATHS)
A) CMS service (Strapi 5)
- Scaffold a Strapi service folder in the repo’s preferred services/apps area.
- Configure Postgres connection via env.
- Enable uploads via S3-compatible provider (endpoint = R2, region = auto/compatible, path-style on).
- Define two content types: Service and Article (title/slug/body/media/tags, plus publishedAt).
- Expose REST/GraphQL; add a preview token mechanism if feasible.

B) Chat service (Mattermost)
- Provision a Mattermost service folder (containerized if Docker is already used).
- Configure Postgres via env.
- Configure file store: S3 driver pointed at R2 (endpoint, region auto/compatible).
- Enable simple auth for dev; leave OIDC placeholders for Clerk.

C) Unified object storage (R2 via S3)
- Decide on one or two buckets (cms-media, chat-uploads) or prefixes, consistent with existing naming.
- Document lifecycle/retention rules; do not enable by default without confirmation.

D) Optional upload/presign Worker
- If Workers are already used, add a minimal service that:
  - Initiates multipart upload, signs parts, completes upload.
  - Issues short-lived signed GET URLs.
  - All configuration via env; no hardcoding.

E) Front-end integration (non-path-specific)
- Add/extend pages or routes for:
  - Content: lists Services/Articles from Strapi (published only) with a simple card UI.
  - Files: upload UI using multipart presign + progress; on success, show a downloadable link via signed GET.
  - Messages: embed Mattermost web UI (SSO later) or link out; minimally verify WebSocket reachability.
  - Dashboard: link tiles to Content, Files, Messages, Analytics.
  - Admin: guarded by Clerk role/metadata.
  - SEO: ensure robots + sitemap routes exist per the framework’s standard, set sensible default metadata.
- Abstract CMS and Storage calls behind small helpers (no specific filenames—create them where the repo keeps such utilities).

PHASE 4 — ENV & DOCS
- Emit env variable templates (keys only, no secrets):
  CMS_URL, CMS_TOKEN, CMS_DB_URL, R2_ENDPOINT, R2_REGION, R2_BUCKET_MEDIA, R2_BUCKET_CHAT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, MM_URL, MM_DB_URL, UPLOAD_BROKER_URL, CLERK_KEYS, APP_URL, etc.
- Short runbook:
  - Start DBs & services (docker compose if present; otherwise document local starts).
  - Start CMS, Chat, optional Worker, then the front-end.
  - First-run steps: create a CMS item, post a chat message, upload a file.

PHASE 5 — TESTS & VERIFICATION
- Smoke tests:
  - CMS: create/publish content, fetch from front-end.
  - Files: upload a large file (>200MB) via multipart and download via signed GET.
  - Chat: send/receive message; upload attachment natively through Mattermost and download it.
  - SEO: robots & sitemap endpoints respond.
- Verify legacy endpoints continue to function or are proxied appropriately during transition.
- Lint/typecheck/build pass without new warnings.

PHASE 6 — OUTPUTS
- Summarize: what changed, how to run locally, env vars required, and known next steps (SSO for Strapi admin, Clerk OIDC for Mattermost, AV scanning pipeline).
- Provide a concise “diff summary” in prose (not file-by-file) tied to the discovered structure.
- Do NOT print or reference any paths that you did not discover in PHASE 1.

NOTES & CAVEATS
- Strapi Admin SSO is a paid feature; default to local admin for dev and protect admin via network controls. Keep API consumption headless from the front-end.
- Prefer Mattermost’s native `/files` for chat attachments; only use a generic presign Worker for CMS/private assets or very large uploads.
- Keep changes incremental and reversible.

BEGIN NOW.
