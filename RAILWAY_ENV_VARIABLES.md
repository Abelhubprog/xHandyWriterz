# 🔐 Complete Railway Environment Variables Guide

## ⚡ Quick Start - Minimum Required Variables

These are the **CRITICAL** variables needed for Railway deployment to work:

```bash
# ✅ REQUIRED - Server Configuration
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
URL=https://ahandywriterz-production.up.railway.app

# ✅ REQUIRED - Proxy Trust (fixes secure cookie error)
ENABLE_PROXY=true

# ✅ REQUIRED - Security Keys (Railway auto-generates if missing, or generate manually)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=randomsalt
ADMIN_JWT_SECRET=randomsecret
TRANSFER_TOKEN_SALT=randomsalt
JWT_SECRET=randomsecret

# ✅ REQUIRED - Database (Railway auto-injects this)
DATABASE_URL=postgresql://postgres:password@host:port/database
DATABASE_CLIENT=postgres
```

---

## 📋 Complete Environment Variables List

### 🏗️ Core Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ Yes | `development` | Set to `production` in Railway |
| `HOST` | ✅ Yes | `0.0.0.0` | Server bind address (0.0.0.0 for Railway) |
| `PORT` | ✅ Yes | `1337` | Server port (Railway auto-injects) |
| `URL` | ✅ Yes | `http://localhost:1337` | **Full public URL** (must be HTTPS URL) |
| `ENABLE_PROXY` | ✅ Yes | `false` | **Set to `true`** to trust Railway's proxy headers |

**Railway Action**:
```bash
# Add these in Railway Dashboard → Variables:
URL=https://ahandywriterz-production.up.railway.app
ENABLE_PROXY=true
```

---

### 🔐 Security Keys

| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `APP_KEYS` | ✅ Yes | `key1,key2,key3,key4` | Comma-separated session encryption keys |
| `API_TOKEN_SALT` | ✅ Yes | Random string | Salt for API tokens |
| `ADMIN_JWT_SECRET` | ✅ Yes | Random string | Admin JWT signing secret |
| `TRANSFER_TOKEN_SALT` | ✅ Yes | Random string | Salt for transfer tokens |
| `JWT_SECRET` | ✅ Yes | Random string | General JWT signing secret |

**Generate Secure Keys**:
```bash
# Option 1: Use Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: Use OpenSSL
openssl rand -base64 32

# Generate all 5 keys and add to Railway Variables
```

**Railway Auto-Generation**:
Railway may auto-generate these on first deploy. Verify they exist:
```bash
railway run printenv | grep -E "APP_KEYS|JWT_SECRET|SALT"
```

---

### 💾 Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | **Railway auto-injects** when Postgres added |
| `DATABASE_CLIENT` | ✅ Yes | `sqlite` | Set to `postgres` for production |
| `DATABASE_HOST` | ⚠️ Optional | From `DATABASE_URL` | Host (extracted from URL) |
| `DATABASE_PORT` | ⚠️ Optional | `5432` | Port (extracted from URL) |
| `DATABASE_NAME` | ⚠️ Optional | From `DATABASE_URL` | Database name |
| `DATABASE_USERNAME` | ⚠️ Optional | From `DATABASE_URL` | Username |
| `DATABASE_PASSWORD` | ⚠️ Optional | From `DATABASE_URL` | Password |
| `DATABASE_SSL` | ⚠️ Optional | `false` | Enable SSL connection |

**Railway Note**: When you add Postgres service, Railway automatically injects `DATABASE_URL`. You only need to set `DATABASE_CLIENT=postgres`.

**Verify Database Connection**:
```bash
railway run printenv | grep DATABASE_URL
# Should show: postgresql://postgres:...@...railway.app:.../railway
```

---

### 📦 Cloudflare R2 Storage (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `R2_ACCESS_KEY_ID` | ⚠️ Optional | - | R2 access key |
| `R2_SECRET_ACCESS_KEY` | ⚠️ Optional | - | R2 secret key |
| `R2_ENDPOINT` | ⚠️ Optional | - | R2 endpoint URL (e.g., `https://abc.r2.cloudflarestorage.com`) |
| `R2_BUCKET` | ⚠️ Optional | - | R2 bucket name |
| `R2_REGION` | ⚠️ Optional | `auto` | R2 region (usually `auto`) |

**When to Use**:
- ✅ Use R2 for **persistent file storage** (Railway containers are ephemeral)
- ❌ Skip if you don't need file uploads or are testing

**How to Get R2 Credentials**:
1. Go to: https://dash.cloudflare.com/
2. R2 → Create bucket → Get credentials
3. Add to Railway Variables

**Plugin Behavior**:
- If R2 vars **present**: Uses Cloudflare R2 storage
- If R2 vars **missing**: Falls back to local file system (files lost on redeploy)

---

### 📧 Email Provider (Optional)

#### Resend (Recommended - FREE tier)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_PROVIDER` | ⚠️ Optional | `sendmail` | Set to `resend` |
| `RESEND_API_KEY` | ⚠️ Required if using Resend | - | API key from Resend dashboard |
| `EMAIL_FROM` | ⚠️ Optional | `noreply@handywriterz.com` | From address |
| `EMAIL_REPLY_TO` | ⚠️ Optional | `support@handywriterz.com` | Reply-to address |

**Setup Steps**:
1. Sign up: https://resend.com (100 emails/day free)
2. Get API key from dashboard
3. Add to Railway:
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app
   EMAIL_REPLY_TO=support@ahandywriterz-production.up.railway.app
   ```
4. Install package:
   ```bash
   cd apps/strapi
   pnpm add @strapi/provider-email-resend
   git commit -am "Add Resend email provider"
   git push
   ```

#### NodeMailer (SMTP Alternative)

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_PROVIDER` | ⚠️ Optional | Set to `nodemailer` |
| `SMTP_HOST` | ⚠️ Required | SMTP server host |
| `SMTP_PORT` | ⚠️ Required | SMTP port (usually 587) |
| `SMTP_USERNAME` | ⚠️ Required | SMTP username |
| `SMTP_PASSWORD` | ⚠️ Required | SMTP password |
| `SMTP_SECURE` | ⚠️ Optional | Use TLS (false for port 587) |

#### SendGrid (Alternative)

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_PROVIDER` | ⚠️ Optional | Set to `sendgrid` |
| `SENDGRID_API_KEY` | ⚠️ Required | SendGrid API key |

**Plugin Behavior**:
- If `EMAIL_PROVIDER` **set**: Uses configured provider
- If `EMAIL_PROVIDER` **missing**: Falls back to `sendmail` (won't work in Railway)

---

## 🚀 How to Add Variables in Railway

### Method 1: Railway Dashboard (Recommended)

1. Go to: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click: **Strapi service** (aHandyWriterz)
3. Click: **Variables** tab
4. Click: **+ New Variable**
5. Add each variable name and value
6. Railway auto-redeploys after saving

### Method 2: Railway CLI

```bash
# Set individual variables
railway variables --set ENABLE_PROXY=true
railway variables --set URL=https://ahandywriterz-production.up.railway.app

# Or set multiple at once (PowerShell)
railway variables --set ENABLE_PROXY=true `
  --set URL=https://ahandywriterz-production.up.railway.app `
  --set EMAIL_PROVIDER=resend `
  --set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

### Method 3: .env File (Local Development Only)

Create `apps/strapi/.env`:
```bash
# Core
NODE_ENV=development
HOST=0.0.0.0
PORT=1337
URL=http://localhost:1337
ENABLE_PROXY=false

# Security (generate these!)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=randomsalt
ADMIN_JWT_SECRET=randomsecret
TRANSFER_TOKEN_SALT=randomsalt
JWT_SECRET=randomsecret

# Database (local)
DATABASE_CLIENT=sqlite

# Optional: R2
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_ENDPOINT=https://account.r2.cloudflarestorage.com
R2_BUCKET=your-bucket
R2_REGION=auto

# Optional: Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@localhost
EMAIL_REPLY_TO=support@localhost
```

**⚠️ NEVER commit `.env` to git** - Already in `.gitignore`

---

## ✅ Verify Variables Are Set

### Check All Variables
```bash
railway run printenv | Sort-Object
```

### Check Specific Variables
```bash
railway run printenv | Select-String -Pattern "ENABLE_PROXY|URL|DATABASE"
```

Expected output:
```
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://postgres:...@...railway.app:.../railway
ENABLE_PROXY=true
NODE_ENV=production
URL=https://ahandywriterz-production.up.railway.app
```

---

## 🔍 Current Railway Setup Status

### ✅ Already Configured (Railway Auto-Injects)
- `DATABASE_URL` - Auto-injected when Postgres service added
- `PORT` - Auto-injected by Railway
- `RAILWAY_ENVIRONMENT` - Auto-injected
- `RAILWAY_SERVICE_NAME` - Auto-injected

### ⚠️ MUST ADD MANUALLY
- `ENABLE_PROXY=true` ← **CRITICAL** (fixes secure cookie error)
- `URL=https://ahandywriterz-production.up.railway.app` ← **CRITICAL**
- `DATABASE_CLIENT=postgres` ← **Required** for production

### 🔐 VERIFY EXIST (Generate if Missing)
- `APP_KEYS` - Should have 4 comma-separated keys
- `API_TOKEN_SALT` - Random string
- `ADMIN_JWT_SECRET` - Random string
- `TRANSFER_TOKEN_SALT` - Random string
- `JWT_SECRET` - Random string

### 📧 Optional (Add When Ready)
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=re_xxx`
- `EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app`
- `EMAIL_REPLY_TO=support@ahandywriterz-production.up.railway.app`

### 📦 Optional (Add If Using R2)
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_BUCKET`

---

## 🎯 Recommended Production Setup

### Minimal (Just to Get Login Working)
```bash
# Set these NOW:
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
DATABASE_CLIENT=postgres

# Verify these exist (Railway auto-generates):
APP_KEYS=(should exist)
ADMIN_JWT_SECRET=(should exist)
JWT_SECRET=(should exist)
```

### Standard (Production Ready)
```bash
# Core (required)
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
DATABASE_CLIENT=postgres
NODE_ENV=production

# Email (enables forgot password)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app
EMAIL_REPLY_TO=support@ahandywriterz-production.up.railway.app
```

### Full (All Features)
```bash
# Core
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
DATABASE_CLIENT=postgres
NODE_ENV=production

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app
EMAIL_REPLY_TO=support@ahandywriterz-production.up.railway.app

# R2 Storage (persistent files)
R2_ACCESS_KEY_ID=your_key_id
R2_SECRET_ACCESS_KEY=your_secret
R2_ENDPOINT=https://account.r2.cloudflarestorage.com
R2_BUCKET=handywriterz-uploads
R2_REGION=auto
```

---

## 🆘 Troubleshooting

### "Secure cookie over unencrypted connection"
**Missing**: `ENABLE_PROXY=true`

**Fix**:
```bash
railway variables --set ENABLE_PROXY=true
```

### "Cannot connect to database"
**Missing**: `DATABASE_URL` or `DATABASE_CLIENT`

**Fix**:
1. Verify Postgres service is attached to Strapi service
2. Check variable exists:
   ```bash
   railway run printenv | grep DATABASE_URL
   ```
3. Set client:
   ```bash
   railway variables --set DATABASE_CLIENT=postgres
   ```

### "Email sending failed"
**Missing**: Email provider configuration

**Fix**:
1. Sign up for Resend: https://resend.com
2. Get API key
3. Set variables:
   ```bash
   railway variables --set EMAIL_PROVIDER=resend
   railway variables --set RESEND_API_KEY=re_xxx
   ```

### Build Fails with "undefined properties"
**Issue**: Plugin trying to access missing env vars during build

**Fix**: Already fixed in commit d6d8c67 - plugins now conditional. If still failing:
```bash
railway redeploy --service 86580b8f-90de-4205-b8b1-52ee9747da96
```

---

## 📚 Related Documentation

- **[RAILWAY_FIX_SUMMARY.md](./RAILWAY_FIX_SUMMARY.md)** - Complete fix guide
- **[RAILWAY_QUICK_FIX.md](./RAILWAY_QUICK_FIX.md)** - 60-second action plan
- **[RAILWAY_CRITICAL_FIX.md](./RAILWAY_CRITICAL_FIX.md)** - Deep troubleshooting

---

## 🎓 Understanding Environment Variables

### Why ENABLE_PROXY Matters
```
User → HTTPS → Railway Proxy → HTTP → Your App
                     ↓
                Sets headers:
                X-Forwarded-Proto: https
                X-Forwarded-Host: yourdomain.com
```

Without `ENABLE_PROXY=true`:
- Strapi sees HTTP connection
- Refuses to set Secure cookie flag
- Login fails with "secure cookie over unencrypted connection"

With `ENABLE_PROXY=true`:
- Strapi trusts X-Forwarded-Proto header
- Knows external connection is HTTPS
- Sets Secure cookie flag
- Login succeeds ✅

### Why URL Matters
```typescript
// server.ts uses this for:
url: env('URL', 'http://localhost:1337'),

// Generates links like:
https://ahandywriterz-production.up.railway.app/admin/content
// Instead of:
http://localhost:1337/admin/content
```

### Why Conditional Plugins Matter
```typescript
// Build phase: No secrets available
npm run build → strapi build

// Runtime phase: All secrets available  
npm run start → strapi start

// Solution: Only configure plugins if credentials exist
...(env('R2_ACCESS_KEY_ID') ? { upload: {...} } : {})
```

---

**Last Updated**: October 3, 2025  
**Railway Project**: 9e62407b-8aae-4958-b87f-db206b359006  
**Next Action**: Add `ENABLE_PROXY=true` and `URL` variables in Railway Dashboard
