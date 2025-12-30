# Railway Deployment Complete Guide

## 🎯 Current State Summary

### What's Working ✅
- **Strapi 5 Configuration**: All config files properly handle SQLite (local) vs Postgres (production)
- **Environment Secrets**: All required Strapi 5 secrets generated and set on Railway
- **Build Pipeline**: Code successfully compiles and builds on Railway
- **Admin Auth**: Config properly handles both `ADMIN_JWT_SECRET` and `ADMIN_AUTH_SECRET`
- **Proxy & Cookies**: Production-ready settings for Railway's reverse proxy

### What's Blocking 🚫
- **Database Connection**: `DATABASE_URL` environment variable not set
  - Strapi is crashing with `ECONNREFUSED 127.0.0.1:5432`
  - Need to provision Railway Postgres OR link external database

---

## 🚀 Quick Start: Complete the Deployment

### Option 1: One-Command Setup (Recommended)

**Windows:**
```cmd
railway-setup-database.bat
```

**Linux/macOS:**
```bash
chmod +x railway-setup-database.sh
./railway-setup-database.sh
```

This script will:
1. Check Railway link status
2. Detect if DATABASE_URL exists
3. Prompt to provision Railway Postgres OR enter external DB
4. Deploy and tail logs

### Option 2: Manual Steps

#### A. Provision Railway Postgres

```bash
cd apps/strapi

# Add Postgres to the project
railway add --database postgres

# Wait ~10 seconds for provisioning
# Railway auto-links and injects DATABASE_URL

# Deploy
railway up

# Monitor
railway logs --follow
```

#### B. Use External Postgres (Supabase/Neon/RDS)

```bash
cd apps/strapi

# Set your external connection string
railway variables --set "DATABASE_URL=postgresql://user:pass@host:5432/dbname"

# Deploy
railway up

# Monitor
railway logs --follow
```

---

## 📊 Environment Variables Status

### ✅ Already Configured (11 variables)

```bash
APP_KEYS=GruBjF...CupuKgJw==  # 4 session keys
ADMIN_JWT_SECRET=3K8q9Y...8nddjU=
ADMIN_AUTH_SECRET=WM75Xv...N5tW0  # Fallback
API_TOKEN_SALT=90AKEU...iG98Ug=
TRANSFER_TOKEN_SALT=OEY3JT...Min1Zog=
JWT_SECRET=DoSpKZ...p0kWf8=
ENCRYPTION_KEY=k7eYPZ...9q0EI=
DATABASE_CLIENT=postgres
ENABLE_PROXY=true
ADMIN_SESSION_COOKIE_SECURE=true
ADMIN_SESSION_COOKIE_SAMESITE=none
```

### ⚠️ Missing (Will be auto-injected by Railway Postgres)

```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/railway
```

### 🔧 Optional Production Enhancements

```bash
# After database is working, optionally add:
NODE_ENV=production
URL=https://your-domain.com  # Custom domain
STRAPI_TELEMETRY_DISABLED=true
STRAPI_LOG_LEVEL=info
```

---

## 🔍 Verification Steps

### 1. Confirm Deployment Success

```bash
cd apps/strapi
railway logs --lines 50
```

**Look for these success indicators:**
- ✅ `Server listening on port 1337` (or Railway's assigned port)
- ✅ No crash loop (continuous restarts)
- ✅ Admin panel builds successfully

### 2. Get Public URL

```bash
railway status
# OR
railway open
```

Should show something like:
```
https://handywriterz-production-production.up.railway.app
```

### 3. Access Admin Panel

Navigate to: `https://[your-railway-url]/admin`

**Expected:**
- Admin login screen loads
- No console errors
- Can proceed to create admin user

### 4. Create Admin User

#### Method 1: Using Strapi CLI (After Deployment)

```bash
cd apps/strapi

railway run node scripts/reset-admin-password.js -- \
  --email admin@handywriterz.com \
  --password "SecurePassword123!"
```

#### Method 2: Via Railway Shell

```bash
cd apps/strapi
railway shell

# Inside container:
npm run strapi admin:create-user -- \
  --firstname=Admin \
  --lastname=User \
  --email=admin@handywriterz.com \
  --password=SecurePassword123!

exit
```

#### Method 3: Via Admin UI (First Visit)

If no admin exists, Strapi may show a registration form on first `/admin` visit.

---

## 🔐 Security Checklist

### Before Going Live

- [ ] Admin password is strong (12+ chars, mixed case, numbers, symbols)
- [ ] `ADMIN_SESSION_COOKIE_SECURE=true` is set (✅ already done)
- [ ] `ADMIN_SESSION_COOKIE_SAMESITE=none` is set (✅ already done)
- [ ] `ENABLE_PROXY=true` is set for Railway (✅ already done)
- [ ] All secrets are Base64-encoded and random (✅ already done via generator)
- [ ] Database backups configured (Railway auto-backups if using their Postgres)
- [ ] Rate limiting configured (optional, via Strapi plugins or Cloudflare)

### After Admin Access

- [ ] Generate API token in Strapi admin for `apps/web` to consume
- [ ] Set `VITE_CMS_URL` and `VITE_CMS_TOKEN` in `apps/web/.env`
- [ ] Test Services API endpoints from web app
- [ ] Verify CORS settings allow web app origin
- [ ] Review and adjust Strapi role permissions

---

## 🌐 Front-End Integration

Once Strapi is deployed and admin user created:

### 1. Generate API Token

1. Login to `https://[railway-url]/admin`
2. Navigate to **Settings** → **API Tokens**
3. Click **Create new API Token**
4. Name: `Web App Token`
5. Token type: **Read-only** (or **Full access** if creating content via web)
6. Copy the generated token

### 2. Update Web App Environment

Edit `apps/web/.env`:

```bash
# Strapi CMS
VITE_CMS_URL=https://handywriterz-production-production.up.railway.app
VITE_CMS_TOKEN=your_generated_token_here

# Test locally
cd apps/web
pnpm dev
```

### 3. Deploy Web App

```bash
cd apps/web

# Build
pnpm build

# Deploy to Cloudflare Pages or your hosting
# Ensure VITE_CMS_URL and VITE_CMS_TOKEN are set in hosting environment
```

---

## 🐛 Troubleshooting

### Issue: `connect ECONNREFUSED 127.0.0.1:5432`

**Cause**: No `DATABASE_URL` environment variable  
**Fix**: Run `railway add --database postgres` or set external `DATABASE_URL`

### Issue: `Missing admin.auth.secret configuration`

**Status**: ✅ **FIXED** (added fallback in `apps/strapi/config/admin.ts`)  
**Verification**: Latest deployment uses both `ADMIN_JWT_SECRET` and `ADMIN_AUTH_SECRET`

### Issue: `App keys are required`

**Status**: ✅ **FIXED** (set `APP_KEYS` with 4 comma-separated keys)  
**Verification**: Check `railway variables` shows `APP_KEYS=...`

### Issue: Database schema not migrated

**Symptoms**: Admin loads but content types missing  
**Fix**:
```bash
cd apps/strapi
railway run npm run strapi build
```

### Issue: CORS errors from web app

**Fix**: Add your web app origin to Strapi CORS config:

Edit `apps/strapi/config/middlewares.ts`:
```typescript
'strapi::cors': {
  enabled: true,
  config: {
    origin: ['https://your-web-app.pages.dev', 'http://localhost:5173'],
  },
},
```

Then redeploy:
```bash
railway up
```

---

## 📚 Reference Documentation

- **Main Status**: `RAILWAY_DEPLOYMENT_STATUS.md`
- **Environment Variables**: `RAILWAY_ENV_VARIABLES.md`
- **Database Configuration**: `RAILWAY_DATABASE_FIX.md`
- **Strapi Environments**: `docs/STRAPI_ENVIRONMENTS.md`
- **Secrets Generator**: `generate-railway-secrets.js`

---

## 🎯 Next Steps After Database Connection

1. ✅ **Verify Deployment**: Check logs for success
2. ✅ **Create Admin User**: Use CLI or UI registration
3. ✅ **Generate API Token**: From Strapi admin panel
4. ✅ **Update Web App**: Set `VITE_CMS_URL` and `VITE_CMS_TOKEN`
5. ✅ **Test API Endpoints**: Verify `/api/services` returns data
6. ✅ **Create Sample Content**: Add a service or article in Strapi admin
7. ✅ **Verify Front-End**: Services page should render Strapi data

---

## 🚦 Deployment Status Dashboard

| Component | Status | URL/Command |
|-----------|--------|-------------|
| **Railway Link** | ✅ Linked | `apps/strapi` → `handywriterz-production` |
| **Environment Vars** | ✅ Complete | 11/11 required secrets set |
| **Build Process** | ✅ Passing | No compilation errors |
| **Database** | ⚠️ **Needs Setup** | Run `railway add --database postgres` |
| **Deployment** | ⏳ Pending DB | Will succeed after database linked |
| **Admin Panel** | ⏳ Pending | Will be accessible at `/admin` after deployment |
| **API Endpoints** | ⏳ Pending | Will be live at `/api/*` after deployment |

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.com/
- **Strapi 5 Docs**: https://docs.strapi.io/
- **Project Dashboard**: https://railway.com/project/9e62407b-8aae-4958-b87f-db206b359006
- **Deployment Logs**: `railway logs --follow` from `apps/strapi`

---

**Last Updated**: October 3, 2025  
**Status**: Awaiting Database Provisioning  
**Action Required**: Run `railway add --database postgres` from `apps/strapi`
