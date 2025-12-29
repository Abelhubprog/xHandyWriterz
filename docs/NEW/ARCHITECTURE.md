# HandyWriterz Technical Architecture

> **Version**: 2.0  
> **Platform**: Railway-First (No AWS)  
> **Status**: Production Target

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HANDYWRITERZ PLATFORM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   CLIENTS                                                                │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │  Web Browser    │    Mobile Browser    │    AI Agents (x402)    │  │
│   └─────────┬───────────────┬────────────────────┬───────────────────┘  │
│             │               │                    │                       │
│             ▼               ▼                    ▼                       │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                      CLOUDFLARE (Edge)                            │  │
│   │  • DNS & CDN                                                      │  │
│   │  • R2 Object Storage                                              │  │
│   │  • (Optional) Workers for edge logic                              │  │
│   └─────────┬────────────────────────────────────────────────────────┘  │
│             │                                                            │
│             ▼                                                            │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                         RAILWAY                                   │  │
│   │                                                                   │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
│   │   │    WEB      │  │     API     │  │   STRAPI    │             │  │
│   │   │ (Vite SPA)  │  │  (Express)  │  │   (CMS)     │             │  │
│   │   │             │  │             │  │             │             │  │
│   │   │ Port: 5173  │  │ Port: 3001  │  │ Port: 1337  │             │  │
│   │   └─────────────┘  └──────┬──────┘  └──────┬──────┘             │  │
│   │                           │                │                     │  │
│   │   ┌─────────────┐        │                │                     │  │
│   │   │ MATTERMOST  │        │                │                     │  │
│   │   │ (Messaging) │        │                │                     │  │
│   │   │ Port: 8065  │        │                │                     │  │
│   │   └──────┬──────┘        │                │                     │  │
│   │          │               │                │                     │  │
│   │          ▼               ▼                ▼                     │  │
│   │   ┌──────────────────────────────────────────────────────────┐  │  │
│   │   │                    POSTGRESQL                             │  │  │
│   │   │   • Strapi data    • Mattermost data    • Order data     │  │  │
│   │   └──────────────────────────────────────────────────────────┘  │  │
│   │                                                                   │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   EXTERNAL SERVICES                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│   │    CLERK    │  │  STABLELINK │  │   SENTRY    │                    │
│   │   (Auth)    │  │  (Payments) │  │ (Monitoring)│                    │
│   └─────────────┘  └─────────────┘  └─────────────┘                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Service Details

### 1. Web App (apps/web)

**Purpose**: Public website + authenticated dashboard SPA

**Runtime**: 
- Dev: Vite dev server
- Prod: Static files + Node preview server

**Key Features**:
- React 18 with TypeScript
- React Router v6 for routing
- React Query for server state
- Clerk for authentication
- Tailwind CSS for styling

**Build**:
```bash
pnpm --filter web build   # Creates dist/
pnpm --filter web start   # Serves via Node
```

**Railway Config** (`apps/web/railway.json`):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 30
  }
}
```

---

### 2. API Server (apps/api)

**Purpose**: Backend API for uploads, payments, messaging bridge

**Runtime**: Express.js on Node 20

**Endpoints**:
```
GET  /health              Health check
POST /api/uploads/presign R2 presigned URLs
POST /api/uploads/complete Finalize multipart
GET  /api/cms/*           CMS proxy (admin)
POST /api/payments/*      Payment processing
POST /api/messaging/*     Mattermost auth bridge
POST /api/turnitin/*      Plagiarism checking
POST /api/webhooks/*      External webhooks
GET  /sitemap.xml         SEO sitemap
GET  /robots.txt          Robots file
```

**R2 Upload Flow**:
```
Client                API                  R2
  │                    │                    │
  │  POST /presign     │                    │
  │───────────────────>│                    │
  │                    │  S3 SDK presign    │
  │                    │───────────────────>│
  │  presignedUrl      │                    │
  │<───────────────────│                    │
  │                    │                    │
  │  PUT to presigned  │                    │
  │────────────────────────────────────────>│
  │                    │                    │
  │  POST /complete    │                    │
  │───────────────────>│                    │
  │                    │  Store metadata    │
  │                    │                    │
```

**Railway Config** (`apps/api/railway.json`):
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health"
  }
}
```

---

### 3. Strapi CMS (apps/strapi)

**Purpose**: Content management for articles, services, domains

**Runtime**: Strapi 5 on Node 20

**Content Types**:
```
article         Long-form editorial content
service         Service offerings per domain
author          Content creator profiles
category        Content categories
tag             Content tags
testimonial     Social proof entries
domain-page     CMS-driven domain landing pages
landing-section Homepage components
```

**Database**: PostgreSQL (Railway)

**Media Storage**: Cloudflare R2 via S3 provider

**Railway Config** (`apps/strapi/railway.json`):
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/admin"
  }
}
```

**Required Environment**:
```bash
DATABASE_URL=postgres://...
APP_KEYS=key1,key2
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...

# R2 Storage
AWS_ACCESS_KEY_ID=...
AWS_ACCESS_SECRET=...
AWS_BUCKET=handywriterz-cms-media
AWS_REGION=auto
AWS_ENDPOINT=https://<account>.r2.cloudflarestorage.com
```

---

### 4. Mattermost (apps/mattermost)

**Purpose**: Real-time messaging between users and support

**Runtime**: Mattermost Server 9.x (Docker)

**Integration**:
- OIDC via Clerk (when enabled)
- File uploads to Cloudflare R2
- WebSocket for real-time

**Railway Config** (`apps/mattermost/railway.json`):
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "mattermost",
    "healthcheckPath": "/api/v4/system/ping"
  }
}
```

---

## Data Architecture

### PostgreSQL Schema

```sql
-- Strapi manages its own schema (articles, services, etc.)
-- Mattermost manages its own schema (users, posts, channels)

-- Custom tables (if needed for orders)
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,  -- Clerk user ID
  service_type VARCHAR(100),
  domain VARCHAR(100),
  word_count INTEGER,
  study_level VARCHAR(50),
  due_date TIMESTAMP,
  instructions TEXT,
  price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_documents (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  file_key VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Cloudflare R2 Buckets

```
handywriterz-cms-media/
  └── uploads/              Strapi media
      ├── articles/
      ├── services/
      └── authors/

handywriterz-user-uploads/
  └── documents/            User document uploads
      └── {userId}/
          └── {orderId}/

handywriterz-mm-files/
  └── channels/             Mattermost file attachments
      └── {channelId}/
```

---

## Authentication Flow

### Clerk Integration

```
┌──────────┐      ┌─────────┐      ┌──────────┐
│  Client  │      │  Clerk  │      │  Backend │
└────┬─────┘      └────┬────┘      └────┬─────┘
     │                 │                │
     │  Sign In        │                │
     │────────────────>│                │
     │                 │                │
     │  JWT + Session  │                │
     │<────────────────│                │
     │                 │                │
     │  API Request + JWT               │
     │─────────────────────────────────>│
     │                 │                │
     │                 │  Verify JWT    │
     │                 │<───────────────│
     │                 │                │
     │                 │  Claims valid  │
     │                 │───────────────>│
     │                 │                │
     │  Response       │                │
     │<─────────────────────────────────│
```

### Role-Based Access

```typescript
// User roles in Clerk publicMetadata
{
  role: 'user' | 'editor' | 'admin'
}

// Access levels
user   → Dashboard, orders, messages
editor → user + content creation
admin  → editor + user management, analytics
```

---

## API Contracts

### CMS API (Strapi REST)

```typescript
// Get published articles
GET /api/articles?status=published&pagination[page]=1&pagination[pageSize]=10

// Get domain page
GET /api/domain-pages?filters[slug][$eq]=adult-nursing&populate=*

// Get services by domain
GET /api/services?filters[domain][$eq]=ai&status=published
```

### Upload API

```typescript
// Request presigned URL
POST /api/uploads/presign
{
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "size": 1024000
}

// Response
{
  "uploadUrl": "https://...",
  "key": "documents/{userId}/{uuid}.pdf",
  "expires": 300
}
```

### Payment API

```typescript
// Create payment intent
POST /api/payments/create
{
  "orderId": "uuid",
  "amount": 150.00,
  "currency": "GBP",
  "gateway": "stablelink"
}

// Webhook callback
POST /api/webhooks/payment
{
  "event": "payment.completed",
  "data": { ... }
}
```

---

## Environment Variables

### Web App

```bash
# App
VITE_APP_NAME=HandyWriterz
VITE_APP_URL=https://handywriterz.com

# CMS
VITE_CMS_URL=https://cms.handywriterz.com
VITE_CMS_TOKEN=strapi-api-token

# API
VITE_API_URL=https://api.handywriterz.com

# Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Messaging
VITE_MATTERMOST_URL=https://mm.handywriterz.com

# Features
VITE_ENABLE_TURNITIN=true
VITE_ENABLE_ADMIN_DASHBOARD=true
```

### API Server

```bash
# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGINS=https://handywriterz.com,https://www.handywriterz.com

# R2 Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=handywriterz-user-uploads
R2_ENDPOINT=https://{account}.r2.cloudflarestorage.com

# Clerk
CLERK_SECRET_KEY=sk_live_...

# CMS
STRAPI_URL=https://cms.handywriterz.com
STRAPI_TOKEN=...

# Payments
STABLELINK_API_KEY=...
STABLELINK_WEBHOOK_SECRET=...

# Mattermost
MATTERMOST_URL=https://mm.handywriterz.com
```

### Strapi CMS

```bash
# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Database
DATABASE_URL=postgres://...

# Security
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...

# R2 Storage
AWS_ACCESS_KEY_ID=...
AWS_ACCESS_SECRET=...
AWS_BUCKET=handywriterz-cms-media
AWS_REGION=auto
AWS_ENDPOINT=https://{account}.r2.cloudflarestorage.com
```

---

## Deployment

### Railway Setup

1. **Create Project** in Railway
2. **Add Services**:
   - `web` → Point to `apps/web`
   - `api` → Point to `apps/api`
   - `strapi` → Point to `apps/strapi`
   - `mattermost` → Point to `apps/mattermost`
   - `postgres` → Railway template
3. **Configure Variables** for each service
4. **Connect Domains**:
   - `handywriterz.com` → web
   - `api.handywriterz.com` → api
   - `cms.handywriterz.com` → strapi
   - `mm.handywriterz.com` → mattermost

### Health Checks

```
web:        GET / → 200
api:        GET /health → 200 { status: 'ok' }
strapi:     GET /admin → 302 (redirect to login)
mattermost: GET /api/v4/system/ping → 200
```

---

## Monitoring

### Sentry Integration

```typescript
// Frontend (apps/web/src/lib/sentry.ts)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});

// Backend (apps/api/src/lib/sentry.ts)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Railway Logs

All services log to Railway's built-in logging:
- Structured JSON logs
- Error tracking
- Request metrics

---

## Security

### Headers

```typescript
// API security headers
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

### Rate Limiting

```typescript
// User-facing routes
app.use('/api/uploads', rateLimiter({ windowMs: 60000, max: 30 }));
app.use('/api/payments', rateLimiter({ windowMs: 60000, max: 10 }));
```

### Input Validation

```typescript
// Zod schemas for all inputs
const uploadSchema = z.object({
  filename: z.string().max(255),
  contentType: z.string().regex(/^[a-z]+\/[a-z0-9-+.]+$/),
  size: z.number().max(200 * 1024 * 1024),
});
```

---

## Future Considerations

### Scaling

- Railway auto-scaling for API/Strapi
- R2 global edge caching
- Read replicas for PostgreSQL (if needed)

### Alternatives (If Strapi Becomes Blocker)

1. **Payload CMS** — TypeScript-native, easier schema control
2. **Directus** — Robust admin and RBAC
3. **Sanity** — Hosted CMS, easy previews

### x402 Protocol

AI agents can access premium content via x402:
```
GET /api/x402/content/:id
→ 402 Payment Required
→ X-Payment-Hash: <proof>
→ 200 OK + Content
```

---

*This architecture document is the technical reference for HandyWriterz infrastructure.*
