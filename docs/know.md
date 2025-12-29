# 🧰 Master Prompt — Strapi v5 + TypeScript (Domain-Agnostic) on Railway with Cloudflare DNS/R2, Clerk Auth, and Mattermost
 
 
**Instruction to the assistant:** Use the **INPUTS** to generate a **complete, production-ready implementation guide** (with copy-paste code) for a headless content platform powered by **Strapi v5 + TypeScript**, deployed **entirely on Railway** (compute + Postgres), fronted by **Cloudflare** (DNS/CDN/SSL/WAF) with **Cloudflare R2** for media and **Clerk** for auth (incl. Web3), and **Mattermost** for team chat. Output must be **executable and unambiguous**: concrete file paths, env vars, commands, and DNS records. Avoid vague language.
 
  
## INPUTS (fill these before you start)
 
 
- **PROJECT_TYPE**: e.g., News platform, Recipe hub, Docs portal
 
- **PRIMARY_CONTENT**: e.g., article, recipe, doc page, case study, product
 
- **GROUPING**: e.g., category, cuisine, product area, industry, collection
 
- **CREATOR**: e.g., author, chef, instructor, brand
 
- **DOMAIN**: e.g., `example.com` (managed in Cloudflare)
 
- **SUBDOMAINS**: 
 
  - **API_SUBDOMAIN**: e.g., `api.example.com` (Strapi)
 
  - **CHAT_SUBDOMAIN**: e.g., `chat.example.com` (Mattermost)
 
  - **MEDIA_SUBDOMAIN**: e.g., `media.example.com` (R2 public/custom domain)
 

 
 
- **DB_SIZE_EXPECTED**: rough size in months 1–6 (helps with sizing on Railway)
 
- **PUBLIC_ROUTES**: list of Strapi routes that should remain public (read-only)
 
- **PROTECTED_ROUTES**: list of Strapi routes gated by Clerk JWT
 
- **R2_BUCKET_NAME**: bucket for media
 
- **R2_PUBLIC_URL**: public base URL (e.g., `https://pub-xxxx.r2.dev` or custom)
 

 
 
If any INPUT is missing, make a reasonable default, but clearly state your assumption at the top of the output.
 
  
## OBJECTIVE
 
Produce a **turn-key, domain-agnostic** blueprint that I can apply to any project by swapping nouns (**PRIMARY_CONTENT**, **GROUPING**, **CREATOR**). The result must include **content modeling**, **schemas**, **typed server code**, **auth**, **storage**, **deployment on Railway**, **Cloudflare DNS setup**, and **operational runbooks**. Keep everything **Strapi v5** and **TypeScript**.
  
## SCOPE & CONSTRAINTS
 
 
- **Hosting**: All app services on **Railway** (Strapi, Mattermost, two Postgres instances or DBs).
 
- **Domain & Edge**: **Cloudflare** for DNS/CDN/SSL/WAF. Only Cloudflare services (no AWS).
 
- **Storage**: **Cloudflare R2** (S3-compatible) for uploads (Strapi + Mattermost).
 
- **Auth**: **Clerk** (include Web3 wallet claims) to protect selected Strapi routes. Strapi Admin uses native auth.
 
- **DB**: Postgres on Railway (one DB for Strapi, one for Mattermost).
 
- **APIs**: Strapi REST + optional GraphQL plugin.
 
- **Security**: HTTPS end-to-end, Cloudflare proxy orange-cloud, CORS/CSP examples, minimal public surface.
 
- **No AWS**. If S3 SDKs are referenced, configure for **R2 endpoint**.
 

  
## REQUIRED OUTPUT STRUCTURE (exact order)
 
### 1) Architecture Overview
 
 
- A concise diagram or bullet map showing: **Cloudflare** in front → **Railway** services (Strapi, Mattermost) → **Railway Postgres** → **Cloudflare R2** for media.
 
- Data flows: content authoring, public read, media uploads, auth checks, WebSockets for Mattermost.
 
- Trust boundaries and which subdomain maps to which service.
 

 
### 2) Content Model (Domain-Agnostic)
 
 
- Collections: 
 
  - **PRIMARY_CONTENT**: `title`, `slug`, `excerpt`, `readingTime`, `publishedAt`, relations to **GROUPING**, **CREATOR**, `tags`, optional `seo`.
 
  - **GROUPING**: `name`, `slug`, `description`, `heroImage?`
 
  - **CREATOR**: `displayName`, `slug`, `bio`, `avatar`, `socials`
 
  - **Tag**
 

 
 
- **Dynamic Zone** on `PRIMARY_CONTENT.content` with components: 
 
  - `blocks.rich-text{ body }`
 
  - `blocks.image{ image, caption, alt }`
 
  - `blocks.gallery{ images[], caption? }`
 
  - `blocks.video-embed{ provider|url|file }`
 
  - `blocks.quote{ text, attribution? }`
 
  - `blocks.code{ language, code, showLineNumbers? }`
 
  - `blocks.diagram{ kind, source }` (e.g., mermaid)
 
  - `blocks.table{ csv?, html? }`
 
  - `meta.seo{ metaTitle, metaDescription, ogImage }`
 

 
 
- Draft & Publish enabled for **PRIMARY_CONTENT**.
 
- Any domain-specific optional blocks you propose (e.g., callouts, metrics, steps, ingredients).
 

 
### 3) Schemas (Copy-Paste)
 
Provide **ready-to-use** Strapi v5 schema files:
 
 
- `src/api/primary-content/content-types/primary-content/schema.json`
 
- `src/api/grouping/content-types/grouping/schema.json`
 
- `src/api/creator/content-types/creator/schema.json`
 
- `src/api/tag/content-types/tag/schema.json`
 
- Components under `src/components/blocks/*.json` and `src/components/meta/seo.json`
 

 
 
Ensure valid Strapi v5 JSON structure, capitalizations, and component UIDs. Use `dynamiczone` and correct media attribute shapes.
 
 
### 4) TypeScript Server Code (Strapi v5)
 
 
- **Controllers/services/routes** using the **Document Service API** (`strapi.documents`) for: 
 
  - `GET /PRIMARY_CONTENT/latest`
 
  - `GET /PRIMARY_CONTENT/by-:GROUPING/:slug`
 
  - `GET /PRIMARY_CONTENT/featured` (optional)
 

 
 
- Correct `populate` usage for dynamic zones and nested media (`on[component]`).
 
- **Lifecycle hook** calculating `readingTime` from rich-text blocks.
 
- **Permissions**: Public role read-only on list/detail + the chosen feeds.
 

 
 
Include file paths: `src/api/primary-content/controllers/primary-content.ts` `src/api/primary-content/services/primary-content.ts` `src/api/primary-content/routes/custom.ts` `src/api/primary-content/content-types/primary-content/lifecycles.ts`
 
 
### 5) Auth: Clerk → Strapi Middleware
 
 
- A minimal **TypeScript** middleware verifying **Clerk JWTs** (incl. Web3 wallet claims), allowing **PUBLIC_ROUTES** and protecting **PROTECTED_ROUTES**.
 
- Registration in `config/middlewares.ts`.
 
- Required env vars and example `.env` values.
 

 
### 6) Storage: Cloudflare R2
 
 
- **Strapi** upload provider configuration (`config/plugins.ts`) targeting **R2 endpoint, bucket, access key, secret, public URL**.
 
- **Mattermost** S3-compatible configuration snippet (endpoint, bucket, access/secret, region placeholder).
 
- Bucket policy notes and public URL strategy (`R2_PUBLIC_URL` or custom `MEDIA_SUBDOMAIN` via Cloudflare).
 

 
### 7) APIs & Queries
 
 
- **REST** examples (with `populate` for each block): list, detail, latest by GROUPING, featured.
 
- **GraphQL** plugin setup (optional) + sample `*_connection` queries and variables.
 
- Example response shapes (trimmed) to show how dynamic zones appear.
 

 
### 8) Frontend Rendering Guide
 
 
- How to map dynamic zones (`__component` in REST / `__typename` in GraphQL).
 
- Code highlighting (Prism/Shiki), diagrams (Mermaid), responsive images/video.
 
- Security: HTML sanitization, allowed tags/attrs, CSP example.
 

 
### 9) Deployment on Railway (Step-by-Step)
 
 
- **Postgres**: create two Railway Postgres instances (Strapi/Mattermost), connection secrets, required extensions if any.
 
- **Strapi service**: build & start commands, health check path, CPU/RAM sizing (based on DB_SIZE_EXPECTED), required env vars.
 
- **Mattermost service**: image config, WebSocket considerations, env vars (DB, file storage).
 
- **Secrets & variables**: exact names expected by the code you provided.
 
- **Builds**: cache tips, migrations, automations (e.g., `strapi build`, `strapi start`).
 

 
### 10) Cloudflare DNS/CDN/SSL (Domain in Cloudflare)
 
 
- DNS table with records to create (use **DOMAIN** and **SUBDOMAINS**): 
 
  - `A`/`CNAME` for **API_SUBDOMAIN** → Railway Strapi host (proxied: **ON**)
 
  - `A`/`CNAME` for **CHAT_SUBDOMAIN** → Railway Mattermost host (proxied: **ON**)
 
  - `CNAME` for **MEDIA_SUBDOMAIN** → R2 public endpoint (proxied: **ON**)
 

 
 
- SSL: **Full (strict)**, origin certs or Tunnel alternative.
 
- CDN cache rules for media; WAF suggestions; optional Access for `/admin` and MM System Console.
 

 
### 11) Optional Edge: Workers + D1 (Read-Model)
 
 
- Show how to mirror **published** Strapi entries to D1 via webhook (code snippet), for ultra-fast public feeds.
 
- Make it strictly optional and clearly isolated from core deployment.
 

 
### 12) Ops Runbook & Hardening
 
 
- **Environment variables** master list (name, example value, which service uses it).
 
- **Backups**: DB snapshots on Railway, exporting R2, config backups.
 
- **Monitoring**: logs/metrics, alerts, health endpoints.
 
- **Security**: rotate keys, JWT expiry/clock skew, rate limiting, CORS, CSP, admin IP allowlist or Access.
 
- **Performance**: pagination defaults, query indexes, image formats (WebP/AVIF), CDN caching of public GETs.
 
- **Cost controls**: initial RAM/CPU sizing, when to scale up, egress awareness for R2.
 
- **Migrations**: Strapi schema versioning, content type changes, DB migrations on deploy.
 

 
### 13) Acceptance Criteria (Checklist)
 
 
- Starting from zero, I can: 
 
  1. Create both DBs on Railway and connect both services on the first try.
 
  2. Deploy Strapi and Mattermost; both are reachable over **Cloudflare proxied** subdomains with **valid SSL**.
 
  3. Upload media from Strapi and Mattermost → files accessible via **MEDIA_SUBDOMAIN** (R2).
 
  4. Hit public Strapi list/detail/feeds; protected endpoints require **Clerk JWT**.
 
  5. See WebSockets functioning for Mattermost via Cloudflare.
 
  6. Pass a production smoke test (health checks green, logs clean).
 

 
 

  
## STYLE & OUTPUT RULES
 
 
- Use **Strapi v5** conventions and **TypeScript** everywhere.
 
- Provide **copy-paste files** with **correct paths** and **code fences** labeled like: 
 
  - `ts title="src/api/primary-content/controllers/primary-content.ts"`
 
  - `json title="src/components/blocks/code.json"`
 
  - `ts title="config/plugins.ts"`
 

 
 
- Use my **INPUTS** to resolve placeholders. Do **not** leave `[BRACKETS]` in final code.
 
- Include **exact CLI commands** for Railway and any seed scripts.
 
- Keep wording tight; prioritize **accuracy and completeness** over exposition.
 

  
## QUICK ADAPTATION HINTS (for you, the assistant)
 
 
- If **PROJECT_TYPE** suggests extra blocks (e.g., ingredients/steps for recipes), include those as optional components.
 
- If **DB_SIZE_EXPECTED** is tiny, recommend smaller RAM on Railway and short cache TTLs; otherwise suggest sensible defaults.
 
- If **PUBLIC_ROUTES** is empty, set public read for list/detail only.
 
- If **MEDIA_SUBDOMAIN** is not provided, default to `R2_PUBLIC_URL`.
 

  
**Deliver exactly the sections 1–13 above with working code/configs, filled with the provided INPUTS.**
# ✅ What to do in Cloudflare, Railway, and locally (Strapi v5 + Mattermost + R2, domain on Cloudflare)
 
Below is a crisp, copy-pasteable plan: **develop locally**, then **deploy both apps to Railway** (each with its own Postgres), put **Cloudflare in front** (DNS/CDN/SSL), and store media in **R2**. Clerk auth fits in the Strapi step if you’re using it.
  
## 0) Local development (before deployment)
 
### A) Project layout
 `repo/   strapi/           # Strapi v5 + TS app   mattermost/       # (optional) docker-compose for local MM, or run separate   docker/           # local infra (Postgres, etc.) ` 
### B) Local infra with Docker (Postgres for both)
 `# docker/compose.yml version: "3.9" services:   pg-strapi:     image: postgres:16     environment:       POSTGRES_DB: strapi       POSTGRES_USER: strapi       POSTGRES_PASSWORD: strapi     ports: ["5433:5432"]     volumes: [pgs:/var/lib/postgresql/data]   pg-mm:     image: postgres:16     environment:       POSTGRES_DB: mattermost       POSTGRES_USER: mm       POSTGRES_PASSWORD: mm     ports: ["5434:5432"]     volumes: [pgmm:/var/lib/postgresql/data] volumes: { pgs: {}, pgmm: {} } ` 
Run: `docker compose -f docker/compose.yml up -d`
 
### C) Strapi local
 
 
- In `strapi/config/database.ts` use the local DB:
 

 `host=127.0.0.1 port=5433 db=strapi user=strapi pass=strapi ssl=false ` 
 
- In `strapi/config/plugins.ts`, **use local file upload** in development (switch to R2 in production):
 

 `export default ({ env }) => ({   upload: env('NODE_ENV') === 'production'     ? { /* R2 config – set in prod section below */ }     : { /* default local provider */ }, }); ` 
 
- Run:
 

 `cd strapi npm i npm run develop ` 
### D) Mattermost local (simple)
 
 
- For fast local testing, use **local file storage** (switch to R2 in prod).
 
- Point to local DB: `postgres://mm:mm@127.0.0.1:5434/mattermost?sslmode=disable`
 
- Start via docker image or your own compose; set `ServiceSettings.SiteURL` to `http://localhost:8065`.
 

 
**Smoke tests locally**
 
 
- Create content in Strapi admin; read public API route.
 
- Create a channel in Mattermost; send a file (local storage).
 
- If using Clerk, run your frontend locally, fetch Strapi with a Bearer token; verify middleware.
 

  
## 1) Railway — provision databases
 
Create **two Postgres instances** (one per app) in the same Railway project.
 
 
- Railway exposes env vars like `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`. You’ll use these in your services. 
 

 
 
Tip: keep the DBs separate to simplify scaling/backups.
 
  
## 2) Railway — deploy Strapi
 
 
1. **Create a service** from your Strapi repo (GitHub connect or “Deploy from repo”).
 
2. **Build & start commands** 
 
  - Build: `npm ci && npm run build`
 
  - Start: `npm run start`
 

 
 
3. **Set variables** in Strapi service (copy from Railway Postgres): 
 
  - `DATABASE_URL=${{ Postgres.DATABASE_URL }}`
 
  - `NODE_ENV=production`
 
  - R2 (for prod uploads): 
 
    - `R2_ACCESS_KEY_ID=...`
 
    - `R2_SECRET_ACCESS_KEY=...`
 
    - `R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
 
    - `R2_BUCKET=your-bucket`
 
    - `R2_PUBLIC_URL=https://pub-XXXX.r2.dev` (or your custom media domain)
 

 
 

 
 
4. **Configure Strapi upload (prod)** in `config/plugins.ts`:
 

 `// config/env/production/plugins.ts export default ({ env }) => ({   upload: {     config: {       provider: 'cloudflare-r2', // or S3-compatible provider       providerOptions: {         accessKeyId: env('R2_ACCESS_KEY_ID'),         secretAccessKey: env('R2_SECRET_ACCESS_KEY'),         endpoint: env('R2_ENDPOINT'), // https://<ACCOUNT_ID>.r2.cloudflarestorage.com         bucket: env('R2_BUCKET'),         publicUrl: env('R2_PUBLIC_URL'),       },     },   }, }); ` 
(Using a third-party R2 provider or the S3 provider with a **custom endpoint** is supported by Strapi. )
 
 
1.  
**Health check**: set `/` or `/admin` (after first build) as health endpoint.
 
 
2.  
**(Optional Clerk)**: add `CLERK_JWT_KEY=...` and enable your Strapi Clerk middleware for protected routes.
 
 

  
## 3) Railway — deploy Mattermost
 
 
1. **Create a service** for Mattermost (Docker image `mattermost/mattermost-team-edition:latest` or your Dockerfile).
 
2. **Env vars**: 
 
  - DB DSN: `MM_SQLSETTINGS_DATASOURCE=postgres://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require` (use Railway Postgres values)
 
  - `MM_SERVICESETTINGS_SITEURL=https://chat.yourdomain.com`
 

 
 
3. **File storage to R2 (prod)** (System Console or env vars / `config.json`): 
 
  - Storage: Amazon S3
 
  - Access Key / Secret Key: your R2 keys
 
  - Bucket: your bucket name
 
  - **Endpoint**: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
 
  - Region: any string (some UIs require one; `auto` or `us-east-1` commonly works)
 
  - Secure: **enabled**
 
  - Save → **Test Connection**, then upload a file in a channel to verify
 
  - If a storage-class field is required by your setup, set it per docs (“some S3-compatible solutions require the storage class parameter”). 
 

 
 

 
 
Notes:
 
 
- R2 uses S3-compatible API at `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. 
 
- Historically, a few Mattermost builds had checksum quirks with some S3-compat providers; ensure you’re on a **current Mattermost** and test uploads. If you hit a checksum/`x-amz-checksum-algorithm` error, upgrade MM and re-test. 
 

 
  
## 4) Cloudflare — R2 bucket & (optional) custom domain
 
 
1. **Create R2 bucket** in Cloudflare dashboard.
 
2. **Get S3 API credentials** and the **endpoint** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. 
 
3. **Public access**: enable public bucket if you want direct asset URLs (you’ll get an `r2.dev` hostname). 
 
4. **(Optional) Custom domain** for the bucket (e.g., `media.example.com`): add it in the bucket’s **Settings → Custom Domains** and accept the suggested DNS record.  
 
  - Alternatively, use **Origin Rules** tutorial to point your subdomain to an R2 bucket. 
 
  - **Important:** uploads via the S3 API use the **r2.cloudflarestorage.com** endpoint, not the custom domain; custom domains are for **serving** public objects. 
 

 
 

  
## 5) Cloudflare — DNS & SSL for your services (domain stays in Cloudflare)
 
For each subdomain:
 
 
- **api.example.com** → Strapi service on Railway
 
- **chat.example.com** → Mattermost service on Railway
 
- **media.example.com** → your R2 public bucket (or keep `R2_PUBLIC_URL`)
 

 
**Steps**
 
 
1. In **Railway → Domains** for each service, add `api.example.com` (Strapi) and `chat.example.com` (MM). Railway will show a **CNAME target** like `abc123.up.railway.app`.
 
2. In **Cloudflare DNS**, create a **CNAME**: 
 
  - Name: `api` → Target: `abc123.up.railway.app` → **Proxy: ON (orange cloud)**
 
  - Name: `chat` → Target: `xyz789.up.railway.app` → **Proxy: ON** (Railway’s doc explicitly shows pointing a CNAME at the `*.up.railway.app` value.) 
 

 
 
3. For **media.example.com**, either: 
 
  - Use the R2 bucket’s **Custom Domain** flow (it will add the correct record), or
 
  - Manually CNAME to the R2 public host you configured. 
 

 
 
4. **SSL/TLS mode**: set to **Full (strict)** if your origins (Railway) serve valid HTTPS (they do). This ensures TLS browser↔Cloudflare and Cloudflare↔origin. 
 
5. **WebSockets**: Cloudflare proxies WS on supported ports (80/443). Mattermost uses 443—no extra toggles needed. 
 

  
## 6) First deployment & smoke tests (prod)
 
 
1. **Deploy Strapi** on Railway (build→start).
 
2. **Open the Strapi admin** at `https://api.example.com/admin`, create the first admin, create a test entry, attach an image → check it loads from **R2** (URL should be `R2_PUBLIC_URL/...` or `media.example.com/...`).
 
3. **Deploy Mattermost** on Railway; set `MM_SERVICESETTINGS_SITEURL=https://chat.example.com`.
 
4. **Upload a file** in a channel → confirm it appears in your R2 bucket.
 
5. **Public API**: hit `https://api.example.com/api/...` with and without a Clerk Bearer token (if you enabled the middleware) to verify protected vs public routes.
 
6. **WebSockets**: open Mattermost in a browser; presence/typing indicators should work.
 

  
## 7) Common production tweaks
 
 
- **Cache**: in Cloudflare, cache static media (R2) aggressively; bypass cache for Strapi/Mattermost dynamic routes.
 
- **CORS/Headers**: set Strapi CORS to your frontend origin; consider CSP defaults in your frontend.
 
- **Backups**: enable Railway Postgres snapshots; consider lifecycle policies for R2.
 
- **Rate limiting**: add Cloudflare WAF rules to throttle abusive paths (e.g., `/api/` auth endpoints).
 

  
## Quick reference (copy this into your runbook)
 
 
- **R2 S3 endpoint**: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (S3-compatible). 
 
- **R2 public/custom domain**: use bucket **Custom Domains** to map `media.example.com`. 
 
- **Railway custom domain**: add domain in Railway, create **CNAME** in Cloudflare to `*.up.railway.app` (proxy ON). 
 
- **Cloudflare SSL**: **Full (strict)** recommended when origin has valid HTTPS. 
 
- **WebSockets**: works via Cloudflare on port 443 (no toggle needed). 
 
- **Strapi upload provider config**: set in `config/env/production/plugins.ts` per Strapi docs. 
 
- **Railway Postgres envs**: `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`. 
 

  
### Troubleshooting tips
 
 
- **R2 uploads fail in Mattermost**: upgrade to a current MM release; ensure endpoint is exactly the R2 S3 URL; test with “Test Connection” then try a real file upload. If you see checksum errors, update and retry (R2’s S3 API evolved; older clients had issues). 
 
- **Strapi media not public**: confirm `publicUrl` in provider options and that the bucket/object is public (or served via your custom domain). 
 
- **Domain not resolving**: verify Cloudflare CNAME is proxied **ON**, DNS has propagated, and Railway shows the domain as **verified/active**. 
 

 Below I’ve filled in any missing INPUTS with sensible defaults so the blueprint is turnkey. You can swap nouns later without breaking anything.

# Assumptions (you can change these in-place)

* **PROJECT_TYPE:** News platform
* **PRIMARY_CONTENT:** `article`
* **GROUPING:** `category`
* **CREATOR:** `author`
* **DOMAIN:** `example.com`
* **SUBDOMAINS:**

  * **API_SUBDOMAIN:** `api.example.com`
  * **CHAT_SUBDOMAIN:** `chat.example.com`
  * **MEDIA_SUBDOMAIN:** `media.example.com`
* **DB_SIZE_EXPECTED:** Tiny (≤1 GB in months 1–6)
* **PUBLIC_ROUTES:**

  * `GET /api/articles`
  * `GET /api/articles/:id` (or by slug)
  * `GET /api/articles/latest`
  * `GET /api/articles/by-category/:slug`
  * `GET /api/articles/featured`
* **PROTECTED_ROUTES:** all non-GET under `/api/*` + uploads (POST/PUT/PATCH/DELETE)
* **R2_BUCKET_NAME:** `example-media`
* **R2_PUBLIC_URL:** `https://media.example.com` (served via Cloudflare custom domain to R2)

---

### 1) Architecture Overview

* **Cloudflare** (DNS/CDN/SSL/WAF) → proxies:

  * **`api.example.com` → Strapi v5 (Railway)** → **Railway Postgres (Strapi)** → **Cloudflare R2** for uploads
  * **`chat.example.com` → Mattermost (Railway)** → **Railway Postgres (Mattermost)** → **Cloudflare R2** for file storage
  * **`media.example.com`** (CNAME to R2 public/custom domain) → serves public media
* **Data flows**

  * Authoring: Admin users log into **Strapi Admin** (`/admin`) over `api.example.com` (Cloudflare proxied).
  * Public read: Frontend or consumers fetch **REST/GraphQL** from Strapi; media URLs resolve at `media.example.com`.
  * Auth checks: **Clerk JWT** (RS256) verified by **custom Strapi middleware** on protected routes.
  * Team chat: **Mattermost** over `chat.example.com`, WebSockets proxied by Cloudflare (443).
* **Trust boundaries**

  * Internet ↔ Cloudflare (WAF/Rate-limit/Caching)
  * Cloudflare ↔ Railway HTTPS origins
  * Services ↔ Railway Postgres (private over Railway network)
  * Services ↔ R2 (S3-compatible API) for media

---

### 2) Content Model (Domain-Agnostic)

**Collections**

* **article**

  * `title`, `slug` (UID), `excerpt`, `readingTime` (int, mins), `publishedAt` (datetime)
  * Relations: many-to-one **category**, many-to-one **author**, many-to-many **tag**
  * `content` **dynamic zone** (see components)
  * Optional `seo` (component `meta.seo`)
  * Draft & Publish: **enabled**
* **category**: `name`, `slug`, `description`, `heroImage?`
* **author**: `displayName`, `slug`, `bio`, `avatar`, `socials` (JSON)
* **tag**: `name`, `slug`

**Dynamic Zone on `article.content`**

* `blocks.rich-text{ body }` (Markdown/HTML string)
* `blocks.image{ image, caption, alt }`
* `blocks.gallery{ images[], caption? }`
* `blocks.video-embed{ provider, url, file? }`
* `blocks.quote{ text, attribution? }`
* `blocks.code{ language, code, showLineNumbers? }`
* `blocks.diagram{ kind, source }` (e.g., mermaid)
* `blocks.table{ csv?, html? }`
* `meta.seo{ metaTitle, metaDescription, ogImage }` (as single component on article)

**Optional blocks (include if your PROJECT_TYPE needs them)**

* `blocks.callout{ tone, title?, body }`
* `blocks.metrics{ items[{ label, value, unit? }] }`

---

### 3) Schemas (Copy-Paste)

> All files are **Strapi v5** JSON schemas. Replace `article/category/author/tag` with your nouns if you change INPUTS.

```json title="src/api/primary-content/content-types/primary-content/schema.json"
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": { "singularName": "article", "pluralName": "articles", "displayName": "Article", "description": "" },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": false } },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "excerpt": { "type": "text" },
    "readingTime": { "type": "integer" },
    "publishedAt": { "type": "datetime" },
    "content": {
      "type": "dynamiczone",
      "components": [
        "blocks.rich-text",
        "blocks.image",
        "blocks.gallery",
        "blocks.video-embed",
        "blocks.quote",
        "blocks.code",
        "blocks.diagram",
        "blocks.table"
      ]
    },
    "seo": { "type": "component", "repeatable": false, "component": "meta.seo" },
    "category": { "type": "relation", "relation": "manyToOne", "target": "api::grouping.grouping" },
    "author": { "type": "relation", "relation": "manyToOne", "target": "api::creator.creator" },
    "tags": { "type": "relation", "relation": "manyToMany", "target": "api::tag.tag" }
  }
}
```

```json title="src/api/grouping/content-types/grouping/schema.json"
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": { "singularName": "grouping", "pluralName": "groupings", "displayName": "Category" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "description": { "type": "text" },
    "heroImage": { "type": "media", "multiple": false }
  }
}
```

```json title="src/api/creator/content-types/creator/schema.json"
{
  "kind": "collectionType",
  "collectionName": "authors",
  "info": { "singularName": "creator", "pluralName": "creators", "displayName": "Author" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "displayName": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "displayName", "required": true },
    "bio": { "type": "richtext" },
    "avatar": { "type": "media", "multiple": false },
    "socials": { "type": "json" }
  }
}
```

```json title="src/api/tag/content-types/tag/schema.json"
{
  "kind": "collectionType",
  "collectionName": "tags",
  "info": { "singularName": "tag", "pluralName": "tags", "displayName": "Tag" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true, "unique": true },
    "slug": { "type": "uid", "targetField": "name", "required": true }
  }
}
```

**Components**

```json title="src/components/blocks/rich-text.json"
{
  "collectionName": "components_blocks_rich_text",
  "info": { "displayName": "Rich Text" },
  "attributes": { "body": { "type": "text", "required": true } }
}
```

```json title="src/components/blocks/image.json"
{
  "collectionName": "components_blocks_image",
  "info": { "displayName": "Image" },
  "attributes": {
    "image": { "type": "media", "multiple": false, "required": true },
    "caption": { "type": "string" },
    "alt": { "type": "string" }
  }
}
```

```json title="src/components/blocks/gallery.json"
{
  "collectionName": "components_blocks_gallery",
  "info": { "displayName": "Gallery" },
  "attributes": {
    "images": { "type": "media", "multiple": true, "required": true },
    "caption": { "type": "string" }
  }
}
```

```json title="src/components/blocks/video-embed.json"
{
  "collectionName": "components_blocks_video_embed",
  "info": { "displayName": "Video Embed" },
  "attributes": {
    "provider": { "type": "enumeration", "enum": ["youtube", "vimeo", "file", "other"], "default": "other" },
    "url": { "type": "string" },
    "file": { "type": "media", "multiple": false }
  }
}
```

```json title="src/components/blocks/quote.json"
{
  "collectionName": "components_blocks_quote",
  "info": { "displayName": "Quote" },
  "attributes": {
    "text": { "type": "text", "required": true },
    "attribution": { "type": "string" }
  }
}
```

```json title="src/components/blocks/code.json"
{
  "collectionName": "components_blocks_code",
  "info": { "displayName": "Code" },
  "attributes": {
    "language": { "type": "string" },
    "code": { "type": "text", "required": true },
    "showLineNumbers": { "type": "boolean", "default": true }
  }
}
```

```json title="src/components/blocks/diagram.json"
{
  "collectionName": "components_blocks_diagram",
  "info": { "displayName": "Diagram" },
  "attributes": {
    "kind": { "type": "enumeration", "enum": ["mermaid", "plantuml", "other"], "default": "mermaid" },
    "source": { "type": "text", "required": true }
  }
}
```

```json title="src/components/blocks/table.json"
{
  "collectionName": "components_blocks_table",
  "info": { "displayName": "Table" },
  "attributes": {
    "csv": { "type": "text" },
    "html": { "type": "text" }
  }
}
```

```json title="src/components/meta/seo.json"
{
  "collectionName": "components_meta_seo",
  "info": { "displayName": "SEO" },
  "attributes": {
    "metaTitle": { "type": "string" },
    "metaDescription": { "type": "text" },
    "ogImage": { "type": "media", "multiple": false }
  }
}
```

---

### 4) TypeScript Server Code (Strapi v5)

```ts title="src/api/primary-content/controllers/primary-content.ts"
import { Context } from 'koa';

const UID = 'api::primary-content.primary-content';

const populate = {
  category: true,
  author: { populate: ['avatar'] },
  tags: true,
  seo: { populate: ['ogImage'] },
  content: {
    on: {
      'blocks.image': { populate: ['image'] },
      'blocks.gallery': { populate: ['images'] },
      'blocks.video-embed': { populate: ['file'] }
    }
  }
};

export default {
  async latest(ctx: Context) {
    const docs = await strapi.documents(UID).findMany({
      filters: { publishedAt: { $notNull: true } },
      sort: ['publishedAt:desc'],
      populate,
      limit: 10
    });
    ctx.body = docs;
  },

  async byGrouping(ctx: Context) {
    const { slug } = ctx.params; // category slug
    const docs = await strapi.documents(UID).findMany({
      filters: { category: { slug: { $eq: slug } }, publishedAt: { $notNull: true } },
      sort: ['publishedAt:desc'],
      populate
    });
    ctx.body = docs;
  },

  async featured(ctx: Context) {
    const docs = await strapi.documents(UID).findMany({
      filters: { tags: { slug: { $in: ['featured'] } }, publishedAt: { $notNull: true } },
      sort: ['publishedAt:desc'],
      populate,
      limit: 12
    });
    ctx.body = docs;
  }
};
```

```ts title="src/api/primary-content/services/primary-content.ts"
const UID = 'api::primary-content.primary-content';
export default {
  async findOneBySlug(slug: string) {
    const [doc] = await strapi.documents(UID).findMany({
      filters: { slug: { $eq: slug } },
      limit: 1,
      populate: {
        category: true,
        author: { populate: ['avatar'] },
        tags: true,
        seo: { populate: ['ogImage'] },
        content: {
          on: {
            'blocks.image': { populate: ['image'] },
            'blocks.gallery': { populate: ['images'] },
            'blocks.video-embed': { populate: ['file'] }
          }
        }
      }
    });
    return doc;
  }
};
```

```ts title="src/api/primary-content/routes/custom.ts"
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/latest',
      handler: 'primary-content.latest',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/articles/by-category/:slug',
      handler: 'primary-content.byGrouping',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'primary-content.featured',
      config: { auth: false }
    }
  ]
};
```

```ts title="src/api/primary-content/content-types/primary-content/lifecycles.ts"
type RichTextBlock = { __component?: string; body?: string; code?: string };
const WORDS_PER_MIN = 200;

function textFromBlocks(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((b: RichTextBlock) => {
      if (!b || typeof b !== 'object') return '';
      if (b.__component === 'blocks.rich-text' && b.body) return String(b.body);
      if (b.__component === 'blocks.code' && b.code) return String(b.code);
      if (b.__component === 'blocks.quote' && b.text) return String(b.text);
      return '';
    })
    .join(' ');
}

function calcReadingTime(text: string): number {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MIN));
}

export default {
  async beforeCreate(event: any) {
    const content = event.params?.data?.content || [];
    const text = textFromBlocks(content);
    event.params.data.readingTime = calcReadingTime(text);
  },
  async beforeUpdate(event: any) {
    const content = event.params?.data?.content;
    if (content) {
      const text = textFromBlocks(content);
      event.params.data.readingTime = calcReadingTime(text);
    }
  }
};
```

> **Permissions:** In **Settings → Users & Permissions → Roles**, set **Public** → `article` `find`/`findOne` and the three custom routes above to **enabled**. Everything else remains private (middleware below enforces JWT for non-GET).

---

### 5) Auth: Clerk → Strapi Middleware

```ts title="src/middlewares/clerk-auth.ts"
import type { DefaultContext } from 'koa';
import jwt from 'jsonwebtoken';

type RouteRule = { method?: string; pattern: RegExp };

function match(rules: RouteRule[], method: string, path: string) {
  return rules.some(r => (!r.method || r.method === method) && r.pattern.test(path));
}

const publicRules: RouteRule[] = [
  { method: 'GET', pattern: /^\/api\/articles(\/?$|\?.*)/ },
  { method: 'GET', pattern: /^\/api\/articles\/latest/ },
  { method: 'GET', pattern: /^\/api\/articles\/by-category\/[^/]+/ },
  { method: 'GET', pattern: /^\/api\/articles\/featured/ }
];

export default (config: any, { strapi }: any) => {
  return async (ctx: DefaultContext, next: () => Promise<void>) => {
    const method = ctx.method.toUpperCase();
    const path = ctx.path;

    // Allow Strapi admin, assets, and explicitly public routes
    if (
      path.startsWith('/admin') ||
      path.startsWith('/uploads') ||
      match(publicRules, method, path)
    ) {
      return next();
    }

    // Require Clerk JWT on other /api routes (non-GET or non-listed GET)
    if (path.startsWith('/api')) {
      const auth = ctx.get('authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return ctx.unauthorized('Missing Bearer token');

      try {
        const key = process.env.CLERK_JWT_PUBLIC_KEY;
        if (!key) throw new Error('CLERK_JWT_PUBLIC_KEY not set');
        const decoded = jwt.verify(token, key, { algorithms: ['RS256'] }) as any;

        // optional web3 claims passthrough
        ctx.state.auth = {
          userId: decoded.sub,
          email: decoded.email,
          wallets: decoded.wallets || decoded.wallet_addresses || []
        };

        return next();
      } catch (e: any) {
        return ctx.unauthorized(`Invalid token: ${e.message}`);
      }
    }

    return next();
  };
};
```

```ts title="config/middlewares.ts"
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: { contentSecurityPolicy: { useDefaults: true } }
  },
  'strapi::cors',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Clerk auth before router
  { resolve: './src/middlewares/clerk-auth' }
];
```

```ini title=".env.example (Strapi)"
# Server
NODE_ENV=production
APP_KEYS=replace,with,your,comma,separated,keys
API_TOKEN_SALT=replace-with-random
ADMIN_JWT_SECRET=replace-with-random
JWT_SECRET=replace-with-random

# Database (Railway injects DATABASE_URL; or set manually)
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require

# Clerk
CLERK_JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...your Clerk JWKS-exported RSA public key...\n-----END PUBLIC KEY-----

# R2 (S3-compatible)
R2_ACCESS_KEY_ID=xxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxx
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_BUCKET=example-media
R2_PUBLIC_URL=https://media.example.com
```

---

### 6) Storage: Cloudflare R2

```ts title="config/plugins.ts"
export default ({ env }) => ({
  // Optional: GraphQL plugin enabled
  graphql: {
    enabled: true,
    config: { defaultLimit: 25, maxLimit: 100, apolloServer: { introspection: true } }
  },
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('R2_ACCESS_KEY_ID'),
        secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
        region: 'auto',
        params: { Bucket: env('R2_BUCKET') },
        s3Options: {
          endpoint: env('R2_ENDPOINT'),
          forcePathStyle: true,
          signatureVersion: 'v4'
        }
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {}
      },
      breakpoints: { large: 1000, medium: 750, small: 500, thumbnail: 245 },
      baseUrl: env('R2_PUBLIC_URL') // ensures URLs point to your public/custom domain
    }
  }
});
```

**Mattermost (R2 via envs)**

```ini title="Railway → Mattermost service → Variables"
MM_SERVICESETTINGS_SITEURL=https://chat.example.com
MM_SQLSETTINGS_DRIVERNAME=postgres
MM_SQLSETTINGS_DATASOURCE=postgres://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require

# Files to R2
MM_FILESETTINGS_DRIVERNAME=amazons3
MM_FILESETTINGS_AMAZONS3ACCESSKEYID=xxxxxxxx
MM_FILESETTINGS_AMAZONS3SECRETACCESSKEY=xxxxxxxx
MM_FILESETTINGS_AMAZONS3BUCKET=example-media
MM_FILESETTINGS_AMAZONS3ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
MM_FILESETTINGS_AMAZONS3REGION=auto
MM_FILESETTINGS_AMAZONS3SSL=true
MM_FILESETTINGS_AMAZONS3S3SERVICESIGNV2=false
MM_FILESETTINGS_AMAZONS3FORCEPATHSTYLE=true
```

**Bucket policy & public URL**

* For public media, set object ACL/public access ON in R2 UI and map **Custom Domain** to `media.example.com`. **Uploads** continue to use the S3 endpoint; **serving** uses `https://media.example.com`.

---

### 7) APIs & Queries

**REST (examples)**

* List with deep populate of components/media:

  ```
  GET https://api.example.com/api/articles?populate[category]=*&populate[author][populate]=avatar&populate[tags]=*&populate[seo][populate]=ogImage&populate[content][on][blocks.image][populate]=image&populate[content][on][blocks.gallery][populate]=images&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=10
  ```
* Detail by slug (custom service suggested above):

  ```
  GET https://api.example.com/api/articles?filters[slug][$eq]=my-post&populate[...same as above]
  ```
* Latest:

  ```
  GET https://api.example.com/api/articles/latest
  ```
* By category:

  ```
  GET https://api.example.com/api/articles/by-category/news
  ```
* Featured:

  ```
  GET https://api.example.com/api/articles/featured
  ```

**GraphQL (optional)**

```graphql
query LatestArticles($limit: Int = 10) {
  articles(pagination: { limit: $limit }, sort: "publishedAt:desc") {
    data {
      id
      attributes {
        title
        slug
        excerpt
        readingTime
        publishedAt
        category { data { attributes { name slug } } }
        author { data { attributes { displayName slug } } }
        tags { data { attributes { name slug } } }
        seo { metaTitle metaDescription ogImage { data { attributes { url }}}}
        content {
          __typename
          ... on BlocksImage { image { data { attributes { url alternativeText }}} caption alt }
          ... on BlocksRichText { body }
          ... on BlocksQuote { text attribution }
          ... on BlocksGallery { images { data { attributes { url }}} caption }
          ... on BlocksCode { language code showLineNumbers }
          ... on BlocksVideoEmbed { provider url file { data { attributes { url }}} }
        }
      }
    }
  }
}
```

**Example REST response (trimmed)**

```json
{
  "data": [{
    "id": 1,
    "attributes": {
      "title": "Hello World",
      "slug": "hello-world",
      "readingTime": 3,
      "content": [
        { "__component": "blocks.rich-text", "body": "<p>...</p>" },
        { "__component": "blocks.image", "image": { "data": { "attributes": { "url": "https://media.example.com/uploads/x.jpg" }}}}
      ]
    }
  }]
}
```

---

### 8) Frontend Rendering Guide

* Map **dynamic zones** by `__component` (REST) or `__typename` (GraphQL). Create a component registry:

  * `blocks.rich-text` → render sanitized HTML/markdown
  * `blocks.image`/`blocks.gallery` → responsive `<img srcset>`; use `width` query if you proxy
  * `blocks.video-embed` → iframe for `provider=url`; HTML5 `<video>` for `file`
  * `blocks.code` → Prism/Shiki client rendering
  * `blocks.diagram` → Render mermaid in a safe container
* **Security**

  * Sanitize HTML (DOMPurify / sanitize-html) with an allowlist (a, p, h1–h6, pre, code, img[src|alt], iframe[src|allow|allowfullscreen], table/thead/tbody/tr/td/th).
  * Example **CSP** (tune per app):

    ```
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.youtube.com https://player.vimeo.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://media.example.com data:;
    frame-src https://www.youtube.com https://player.vimeo.com;
    connect-src 'self' https://api.example.com;
    ```
* Handle code highlight/mermaid **after mount** to avoid SSR pitfalls.

---

### 9) Deployment on Railway (Step-by-Step)

**Postgres (x2)**

1. In your Railway project, create **Postgres – Strapi** and **Postgres – Mattermost**.
2. Note `DATABASE_URL` for each.

**Strapi service**

1. Create **New Service → GitHub Repo** (your `strapi/`).
2. **Build Command:** `npm ci && npm run build`
   **Start Command:** `npm run start`
3. **Service variables** (add exactly):

   * `NODE_ENV=production`
   * `DATABASE_URL` = (attach from Railway Postgres – Strapi)
   * `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET` (random strings)
   * `CLERK_JWT_PUBLIC_KEY` (RSA public key from Clerk)
   * `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET=example-media`, `R2_PUBLIC_URL=https://media.example.com`
4. **Resources (Tiny DB size)**: 0.5–1 vCPU, **512–1024 MB RAM**, 1 instance.
5. **Health check:** `/` (200 once started).
6. **Domains:** add `api.example.com` → follow CNAME instructions shown by Railway.

**Mattermost service**

1. Create **New Service → Docker Image**: `mattermost/mattermost-team-edition:latest`
2. Variables (see block in §6): DB DSN, SITEURL, and all `MM_FILESETTINGS_*` for R2.
3. **Start command**: container default (no override)
4. **Resources**: 1 vCPU, **1–2 GB RAM** (WebSockets/users), 1 instance.
5. **Domains:** add `chat.example.com` in Railway.

**Cache/build tips**

* Commit `package-lock.json` and enable build cache in Railway for faster redeploys.
* Strapi runs its own schema sync on start; no manual migrations required.

---

### 10) Cloudflare DNS/CDN/SSL (Domain in Cloudflare)

| Type  | Name  | Target/Content          | Proxy | Purpose                    |
| ----- | ----- | ----------------------- | ----- | -------------------------- |
| CNAME | api   | `abc123.up.railway.app` | ON    | Strapi over Cloudflare     |
| CNAME | chat  | `xyz789.up.railway.app` | ON    | Mattermost over Cloudflare |
| CNAME | media | `<your-r2-public-host>` | ON    | R2 public/custom domain    |

* Replace the `Target` values with the **exact CNAME** shown by Railway (for `api`/`chat`) and by **R2 Custom Domains** (for `media`).
* **SSL/TLS**: set mode to **Full (strict)**.
* **Caching**

  * Rule: Cache **everything** on `media.example.com/*` with long TTL (e.g., 1–7 days).
  * Bypass cache for `api.example.com/*` and `chat.example.com/*`.
* **WAF**

  * Rate-limit `POST /api/*` to e.g., 200/min/IP.
  * Optional: **Cloudflare Access** to protect `/admin` and Mattermost **System Console** (`/admin_console`).

---

### 11) Optional Edge: Workers + D1 (Read-Model)

**Goal:** mirror published articles to a **D1** table via Strapi webhook for a super-fast public feed.

```sql title="D1 schema (once)"
CREATE TABLE articles_feed (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  excerpt TEXT,
  category_slug TEXT,
  publishedAt TEXT,
  seo JSON,
  updatedAt TEXT
);
```

```ts title="worker/src/index.ts (Cloudflare Worker)"
export interface Env { DB: D1Database; SECRET: string; }

export default {
  async fetch(req: Request, env: Env) {
    if (new URL(req.url).pathname !== '/mirror') return new Response('ok');
    const sig = req.headers.get('x-strapi-signature');
    if (sig !== env.SECRET) return new Response('unauthorized', { status: 401 });

    const body = await req.json();
    const doc = body?.entry;
    if (!doc || !doc.slug || !doc.publishedAt) return new Response('skip');

    const seo = JSON.stringify(doc.seo || null);
    await env.DB.prepare(
      `INSERT INTO articles_feed (id, slug, title, excerpt, category_slug, publishedAt, seo, updatedAt)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title=excluded.title, excerpt=excluded.excerpt, category_slug=excluded.category_slug,
         publishedAt=excluded.publishedAt, seo=excluded.seo, updatedAt=excluded.updatedAt`
    ).bind(String(doc.id), doc.slug, doc.title, doc.excerpt || '', doc.category?.slug || null, doc.publishedAt, seo, new Date().toISOString()).run();

    return new Response('ok');
  }
};
```

**Strapi webhook**

* **Settings → Webhooks**: on `Entry publish`/`Entry update` for **article** → POST `https://edge.example.com/mirror` with header `x-strapi-signature: <SECRET>`; payload include relations, seo.

---

### 12) Ops Runbook & Hardening

**Environment variables (master list)**

*Strapi service*

* `NODE_ENV`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`
* `DATABASE_URL`
* `CLERK_JWT_PUBLIC_KEY`
* `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL`

*Mattermost service*

* `MM_SERVICESETTINGS_SITEURL`
* `MM_SQLSETTINGS_DRIVERNAME=postgres`
* `MM_SQLSETTINGS_DATASOURCE`
* `MM_FILESETTINGS_*` set as in §6

**Backups**

* Railway: enable **automatic Postgres snapshots** (daily). Test restore monthly.
* R2: periodically export to another bucket or local; enable object versioning if needed.
* Repo: commit `/src/components` and `/src/api` to version content model.

**Monitoring**

* Railway logs/metrics; set alerts on CPU > 80% for 15 min or RAM > 85%.
* Add `/health` route via a tiny Strapi controller if you want explicit 200; otherwise `/` suffices.

**Security**

* Rotate `APP_KEYS`/secrets quarterly.
* Clerk JWT expiry ≤ 60 minutes; accept up to 60s clock skew.
* Cloudflare WAF: rate-limit and bot-fight for `/api/*`.
* CORS: restrict to your frontend origin(s).
* CSP: apply as in §8; forbid inline scripts where possible.
* Admin hardening: enable **Cloudflare Access** or IP allowlist for `/admin`.

**Performance**

* Use pagination defaults `pageSize=10–20`.
* Add Postgres indexes: `slug`, `publishedAt`, joins on `category`/`author`.
* Media formats: upload **WebP/AVIF**; set image breakpoints in upload plugin.
* Cache public GETs at frontend edge; keep Strapi behind Cloudflare with no caching (dynamic).

**Cost controls**

* Start small: Strapi 512–1024 MB, Mattermost 1–2 GB. Scale on sustained >70% usage.
* R2: beware egress from `media.example.com`; keep assets on same region and cache at Cloudflare.

**Migrations**

* Changing content types updates DB automatically; always **export a snapshot** before schema edits.
* For breaking changes (rename, delete), plan a content migration script and run once at deploy.

---

### 13) Acceptance Criteria (Checklist)

1. **Railway DBs created** (Strapi & Mattermost) and connected via `DATABASE_URL`/`MM_SQLSETTINGS_DATASOURCE`.
2. **Strapi** deployed at `api.example.com` (Cloudflare proxied, SSL valid).
3. **Mattermost** deployed at `chat.example.com` (Cloudflare proxied); WebSockets functioning.
4. **Uploads** from Strapi and Mattermost land in **R2** and are publicly reachable at `media.example.com/...`.
5. **Public routes** (`/api/articles`, `/latest`, `/by-category/:slug`, `/featured`) respond without JWT.
6. **Protected non-GET routes** require **Clerk Bearer JWT**; invalid/missing tokens get 401.
7. **Smoke tests green:** Strapi admin loads, create/publish an article, fetch via API, media displays; MM channels work, file upload OK; logs clean.

---

## Exact CLI/Setup Commands

```bash
# 1) Clone and bootstrap Strapi v5 + TS
npx create-strapi-app@latest strapi --quickstart --typescript
# Move provided schema/component files into the paths above, add middlewares.ts & plugins.ts

# 2) Add dependencies
cd strapi
npm i jsonwebtoken @strapi/plugin-graphql @strapi/provider-upload-aws-s3

# 3) Local run (optional)
# Use a local Postgres or change database.ts to Railway DATABASE_URL for direct prod run
npm run develop

# 4) Commit & push to GitHub

# 5) Railway: create 2 Postgres (Strapi, Mattermost), then create services from repo/image.
#    Set variables exactly as in sections 6 & 9.

# 6) Cloudflare: create R2 bucket `example-media`, generate S3 API token, add Custom Domain -> media.example.com

# 7) Cloudflare DNS: add CNAMEs
# api  -> <railway-strapi>.up.railway.app (proxy ON)
# chat -> <railway-mm>.up.railway.app (proxy ON)
# media-> <r2-custom-host> (proxy ON)
```

> Swap the nouns (`article/category/author`) to your own **PRIMARY_CONTENT/GROUPING/CREATOR** at any time—schemas, controllers, routes, and middleware are already domain-agnostic.
Zeroing in on the screenshots and matching them to the codebase, here’s what we need to address next:

Action plan
Diagnose what each empty state in the screenshots tells us and map it to the current Strapi-powered services flow.
Define concrete content + UI requirements so the services pages render properly with Strapi data.
Propose the native Mattermost client UI structure so we can replace the “Messaging not configured” placeholder with a real experience.
Findings from the images (and repo)
Services landing (screenshot 1) – The hero and grid come from ServicesPage.tsx. When fetchServicesList returns [], we fall back to “Content is on the way”. Root causes:
Strapi has the service content-type but no seed entries, and rich content (body, attachments, tags) isn’t populated.
There’s no CMS-driven hero or highlights (the hero text is hard-coded in the component).
Dashboard → Messages (screenshot 2) – The component shows the hard-coded warning because useMattermostConfig() detects missing env vars and the mm-auth worker isn’t wired yet. We still ship an iframe fallback; F‑091 wants a native REST/WS client.
Domain landing (screenshot 3) – Route /services/:domain uses the same ServicesPage component with the DOMAINS map. With zero Strapi articles filtered by that domain, the “No articles found” state appears; there’s also no domain-specific hero copy/illustrations coming from Strapi.
What to fix for Strapi-backed pages
Strapi content requirements
Seed data & schema alignment
In strapi, ensure the service type includes: title, slug, summary, body (Markdown), domain, typeTags, heroImage, attachments, seo, author, readingMinutes.
Import at least a starter set for each domain (Adult Health Nursing, Mental Health, etc.) so the front end has something to render.
Domain metadata
Create a supporting collection, e.g., domain (or reuse category), with fields: slug, name, heroTitle, heroSubtitle, heroIllustration, ctaLinks, and optional stats.
Expose /api/domains/:slug so the UI no longer relies on the local DOMAINS constant.
Content blocks
For richer detail pages, extend service.body to a dynamic zone (as outlined earlier) or store Markdown that includes the [[media:n]] markers expected by RichContentRenderer.
Attachments should be uploaded to R2 so the renderer can build mediaBlocks.
Front-end adjustments (services experience)
Hero + filters
Replace the hard-coded hero text with data fetched from Strapi (domain entry). Show hero illustration, summary, CTA buttons, and quick stats (e.g., article count).
Add filter tabs/pills for type tags and a search box that filters client-side while we build the Strapi filter endpoints.
Card design tweaks
Display domain badges using the domain color palette from Strapi.
Include reading time and author by default, pulled from Strapi fields.
Add a subtle shimmer while loading and a friendlier empty state banner (“No articles yet in Mental Health Nursing. Be the first to submit.”) that links to the editor if the user has permissions.
Detail page layout
Provide a sticky right rail with:
“About this article” summary (domain, published date, reading time).
Downloadable attachments (list with file size).
“Related resources” populated from Strapi (/api/services?filters[...]).
Add a share menu and breadcrumb built from domain metadata.
CMS preview support
Wire /preview?token=... to fetch draft content via the new preview-token endpoint (F‑039) so editors can see unpublished articles in situ.
What to fix for the Mattermost experience
Native client UX (replaces the warning panel)
Layout skeleton
Left rail (~320px): workspaces/domains → channel list with unread badges.
Center column: message timeline with day separators, typing indicators, and inline attachments.
Right rail (optional/condensed on mobile): channel info, active members, pinned posts.
Header
Shows channel name, members count, quick actions (search, start call, files).
State badges: “Connecting…”, “Reconnecting…”, “Unread messages”.
Composer
Rich text box with slash-commands, emoji picker, file dropzone (wired to upload broker), schedule send button.
Attachment tray preview before sending; integrate AV gating (“scanning…” badge) tied to F‑093.
States
Loading shimmer while /channels & /users/me fetch.
Empty state with CTA (“Join a channel to start conversations”).
Error toasts on connection issues, with retry.
Integrations
Typing indicators via WS events.
Read receipts: grey/colored ticks aligned to user bubble.
Threaded replies displayed inline with expand-on-demand.
Technical wiring implied
Use the forthcoming mm-client.ts (REST) and mm-ws.ts (WS) to source data.
Authenticate via Clerk → mm-auth worker; set HttpOnly cookie.
Upload broker must stream attachments to R2, gate via AV worker, and post “File scanned & ready” system message to the same channel.
Immediate tasks to unblock content visibility
Populate Strapi with at least a handful of service entries per domain, filling in heroImage, typeTags, summary, body.
Expose domain metadata from Strapi and update ServicesPage to fetch it (remove the static DOMAINS map).
Implement richer empty states in the UI (per domain hero, CTA to request content).
Prototype native Mattermost layout using mock data so the product team can sign off while the backend (F‑091/F‑092/F‑093) lands.
Once those pieces are in place, the pages will display real Strapi-driven content, editors will know exactly what data to provide, and the dashboard’s Messages view can evolve from “not configured” into the native Mattermost experience we’re targeting.

