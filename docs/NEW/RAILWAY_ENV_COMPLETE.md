# Railway Environment Variables - Complete Guide

> **Updated:** December 29, 2025
> **Services:** Web, Strapi, API, Mattermost, Postgres

---

## 🚂 Quick Setup by Service

### 1. POSTGRES (Database)

Railway auto-provisions these. Just add the Postgres plugin and reference variables.

| Variable | Source | Notes |
|----------|--------|-------|
| `DATABASE_URL` | Auto | Provided by Railway Postgres |
| `PGHOST` | Auto | Provided by Railway Postgres |
| `PGPORT` | Auto | Provided by Railway Postgres |
| `PGUSER` | Auto | Provided by Railway Postgres |
| `PGPASSWORD` | Auto | Provided by Railway Postgres |
| `PGDATABASE` | Auto | Provided by Railway Postgres |

---

### 2. STRAPI (CMS) - `cms.handywriterz.com`

**Root Directory:** `apps/strapi`

#### Required Variables
```env
# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
URL=https://cms.handywriterz.com
ENABLE_PROXY=true

# Database (from Postgres service)
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Security Keys (generate with: openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret
```

#### Optional - Cloudflare R2 Storage
```env
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET=handywriterz-media
R2_REGION=auto
```

#### Optional - Email
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@handywriterz.com
EMAIL_REPLY_TO=support@handywriterz.com
```

---

### 3. WEB (Frontend) - `handywriterz.com`

**Root Directory:** `apps/web`

#### Required Variables
```env
# Core URLs
VITE_API_URL=https://api.handywriterz.com
VITE_CMS_URL=https://cms.handywriterz.com
VITE_APP_URL=https://handywriterz.com
VITE_APP_NAME=HandyWriterz

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxx
VITE_CLERK_DOMAIN=clerk.handywriterz.com
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### Optional - CMS Token (for authenticated requests)
```env
VITE_CMS_TOKEN=your-strapi-api-token
```

#### Optional - Mattermost Integration
```env
VITE_MATTERMOST_URL=https://mattermost.handywriterz.com
VITE_MATTERMOST_API_URL=https://mattermost.handywriterz.com/api/v4
VITE_MATTERMOST_TEAM_ID=your-team-id
```

#### Optional - Feature Flags
```env
VITE_ENABLE_PUBLIC_ACCESS=true
VITE_ENABLE_PUBLIC_ROUTES=true
VITE_ENABLE_COMMENTS=true
VITE_ENABLE_ADMIN_DASHBOARD=true
VITE_ENABLE_TURNITIN=true
VITE_ENABLE_TELEGRAM=true
```

#### Optional - Payments (StableLink)
```env
VITE_STABLELINK_API_KEY=your-stablelink-key
VITE_STABLELINK_WEBHOOK_SECRET=your-webhook-secret
VITE_STABLELINK_ENVIRONMENT=production
```

---

### 4. API (Backend) - `api.handywriterz.com`

**Root Directory:** `apps/api`

#### Required Variables
```env
# Server
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://handywriterz.com,https://www.handywriterz.com,https://cms.handywriterz.com

# Strapi Connection
STRAPI_URL=https://cms.handywriterz.com
STRAPI_TOKEN=your-strapi-api-token
CMS_URL=https://cms.handywriterz.com
CMS_TOKEN=your-strapi-api-token

# Clerk Authentication (Backend)
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxx
```

#### Optional - Cloudflare R2 Storage
```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET=handywriterz-uploads
```

#### Optional - Mattermost
```env
MATTERMOST_URL=https://mattermost.handywriterz.com
MATTERMOST_ADMIN_TOKEN=your-mattermost-admin-token
MATTERMOST_BOT_TOKEN=your-mattermost-bot-token
MATTERMOST_ADMIN_CHANNEL=admin-channel-id
```

#### Optional - Payments
```env
# StableLink (Crypto)
STABLELINK_API_KEY=your-stablelink-api-key
STABLELINK_API_SECRET=your-stablelink-api-secret

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxx

# Coinbase Commerce
COINBASE_API_KEY=your-coinbase-api-key
```

#### Optional - SEO
```env
SITE_URL=https://handywriterz.com
```

---

### 5. MATTERMOST (Messaging) - `mattermost.handywriterz.com`

**Root Directory:** `apps/mattermost`

#### Required Variables
```env
# Database
MM_SQLSETTINGS_DRIVERNAME=postgres
MM_SQLSETTINGS_DATASOURCE=${{Postgres.DATABASE_URL}}?sslmode=require

# Server
MM_SERVICESETTINGS_SITEURL=https://mattermost.handywriterz.com
MM_SERVICESETTINGS_LISTENADDRESS=:8065

# Security
MM_SQLSETTINGS_DISABLEDATABASESEARCH=false
MM_PASSWORDSETTINGS_MINIMUMLENGTH=8
```

#### Optional - File Storage (Cloudflare R2)
```env
MM_FILESETTINGS_DRIVERNAME=amazons3
MM_FILESETTINGS_AMAZONS3ACCESSKEYID=your-r2-access-key
MM_FILESETTINGS_AMAZONS3SECRETACCESSKEY=your-r2-secret-key
MM_FILESETTINGS_AMAZONS3BUCKET=handywriterz-mattermost
MM_FILESETTINGS_AMAZONS3ENDPOINT=YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
MM_FILESETTINGS_AMAZONS3REGION=auto
MM_FILESETTINGS_AMAZONS3SSL=true
```

#### Optional - Email
```env
MM_EMAILSETTINGS_ENABLESMTPAUTH=true
MM_EMAILSETTINGS_SMTPUSERNAME=your-smtp-username
MM_EMAILSETTINGS_SMTPPASSWORD=your-smtp-password
MM_EMAILSETTINGS_SMTPSERVER=smtp.yourprovider.com
MM_EMAILSETTINGS_SMTPPORT=587
MM_EMAILSETTINGS_FEEDBACKEMAIL=no-reply@handywriterz.com
MM_EMAILSETTINGS_FEEDBACKNAME=HandyWriterz Support
```

---

## 🔧 Railway Service Settings

### Build Commands

| Service | Watch Paths | Build Command | Start Command |
|---------|-------------|---------------|---------------|
| **Strapi** | `apps/strapi/**` | `cd apps/strapi && pnpm install && pnpm build` | `cd apps/strapi && pnpm start` |
| **Web** | `apps/web/**` | `cd apps/web && pnpm install && pnpm build` | `cd apps/web && pnpm preview --host 0.0.0.0 --port $PORT` |
| **API** | `apps/api/**` | `cd apps/api && pnpm install && pnpm build` | `cd apps/api && pnpm start` |
| **Mattermost** | `apps/mattermost/**` | (Docker) | (Docker) |

### Health Checks

| Service | Health Endpoint | Expected Response |
|---------|-----------------|-------------------|
| Strapi | `/_health` | `{ "status": "ok" }` |
| Web | `/` | HTTP 200 |
| API | `/health` | `{ "status": "ok" }` |
| Mattermost | `/api/v4/system/ping` | `{ "status": "OK" }` |

---

## 🔑 Generating Secrets

### Strapi Keys (generate 4 keys for APP_KEYS)
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Example APP_KEYS format:
```
APP_KEYS=base64key1==,base64key2==,base64key3==,base64key4==
```

---

## 📋 Railway Variable Reference Syntax

To reference variables from other services:
```
${{ServiceName.VARIABLE_NAME}}
```

Examples:
- `${{Postgres.DATABASE_URL}}` - Get database URL from Postgres service
- `${{Strapi.RAILWAY_PUBLIC_DOMAIN}}` - Get Strapi's public domain

---

## ⚠️ Common Issues

### 1. Strapi HTTPS/Proxy Issues
Make sure these are set:
```env
URL=https://cms.handywriterz.com
ENABLE_PROXY=true
```

### 2. Database Connection Failures
```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### 3. Mattermost Healthcheck Failures
Ensure database URL is correct with SSL:
```env
MM_SQLSETTINGS_DATASOURCE=postgresql://user:pass@host:port/db?sslmode=require
```

### 4. CORS Errors
Make sure API has all frontend URLs:
```env
CORS_ORIGINS=https://handywriterz.com,https://www.handywriterz.com,https://cms.handywriterz.com
```

---

## 🚀 Quick Copy-Paste Templates

### Strapi Minimum Required
```env
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
URL=https://cms.handywriterz.com
ENABLE_PROXY=true
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
APP_KEYS=GENERATE_ME,GENERATE_ME,GENERATE_ME,GENERATE_ME
API_TOKEN_SALT=GENERATE_ME
ADMIN_JWT_SECRET=GENERATE_ME
TRANSFER_TOKEN_SALT=GENERATE_ME
JWT_SECRET=GENERATE_ME
```

### Web Minimum Required
```env
VITE_API_URL=https://api.handywriterz.com
VITE_CMS_URL=https://cms.handywriterz.com
VITE_APP_URL=https://handywriterz.com
VITE_APP_NAME=HandyWriterz
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

### API Minimum Required
```env
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://handywriterz.com,https://www.handywriterz.com,https://cms.handywriterz.com
STRAPI_URL=https://cms.handywriterz.com
CLERK_SECRET_KEY=sk_live_YOUR_KEY
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

### Mattermost Minimum Required
```env
MM_SQLSETTINGS_DRIVERNAME=postgres
MM_SQLSETTINGS_DATASOURCE=${{Postgres.DATABASE_URL}}?sslmode=require
MM_SERVICESETTINGS_SITEURL=https://mattermost.handywriterz.com
MM_SERVICESETTINGS_LISTENADDRESS=:8065
```
