# Railway Architecture - Service Breakdown

## 🚨 CURRENT ISSUE
The services are mixed up! The **web** service is pointing to Strapi's URL, and there's confusion about which service is which.

## 📊 Correct Architecture (What You Should Have)

```
Railway Project: handywriterz-production
└── Environment: production
    ├── Service 1: handywriterz-production (STRAPI - CMS)
    │   ├── URL: https://handywriterz-production-production.up.railway.app
    │   ├── Port: 1337
    │   ├── Database: Connects to postgres-volume
    │   └── Purpose: Content Management System (Strapi 5)
    │
    ├── Service 2: web (FRONTEND - React SPA)
    │   ├── URL: https://web-production-xxxx.up.railway.app (NEEDS OWN URL)
    │   ├── Port: 4173
    │   ├── Connects to: Strapi service via VITE_CMS_URL
    │   └── Purpose: User-facing web application
    │
    ├── Service 3: mattermost (MESSAGING - Not deployed yet)
    │   ├── URL: https://mattermost-production-xxxx.up.railway.app (Future)
    │   ├── Port: 8065
    │   ├── Database: Needs own Postgres instance
    │   └── Purpose: Team messaging and file sharing
    │
    └── Service 4: Postgres (DATABASE for Strapi)
        ├── Internal only (no public URL)
        ├── Port: 5432
        ├── Connected to: handywriterz-production service
        └── Purpose: Strapi database storage
```

## 🔴 CRITICAL PROBLEMS IDENTIFIED

### Problem 1: Web Service Has Wrong URL Configuration
```bash
VITE_CMS_URL=https://handywriterz-production-production.up.railway.app  ✅ Correct
VITE_APP_URL=https://web-production.up.railway.app                     ❌ Should be its own domain
```

The **web** service is using `handywriterz-production-production.up.railway.app` in some places, which is **Strapi's URL**, not the web app's URL!

### Problem 2: Services Don't Have Unique URLs
Each service MUST have its own unique Railway domain:
- ❌ **Current**: Both trying to use same domain
- ✅ **Correct**: Each service has its own subdomain

### Problem 3: Missing Strapi API Token
```bash
VITE_CMS_TOKEN=                    ❌ Empty! Web app can't fetch from Strapi
```

## ✅ IMMEDIATE FIX STEPS

### Step 1: Verify Strapi Service is Separate and Working

1. **In Railway Dashboard**, look at the left panel
2. You should see **TWO services**:
   - `handywriterz-production` (the GitHub-connected one from before)
   - `web` (the new one we're setting up)

3. **Click on `handywriterz-production` service**
4. Go to **Settings** → **Networking** → **Public Networking**
5. Verify URL is: `https://handywriterz-production-production.up.railway.app`
6. Test it: Visit the URL → Should show Strapi login page ✅

### Step 2: Fix Web Service Configuration

**A. Ensure Web Service Connected to Correct Repo Path**

1. Click on **web** service (the one that's failing)
2. Go to **Settings** → **Source**
3. Verify:
   - ✅ **Repository**: `Abelhubprog/xHandyWriterz`
   - ✅ **Branch**: `main`
   - ✅ **Root Directory**: `/` (repository root)
   - ✅ Should auto-detect `apps/web/railway.json`

**B. Generate Web Service Public Domain**

1. Stay in **web** service **Settings**
2. Scroll to **Networking** → **Public Networking**
3. Click **Generate Domain**
4. Copy the new URL (e.g., `web-production-abc123.up.railway.app`)

**C. Update Web Service Environment Variables**

Click **Variables** tab and set these:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuaGFuZHl3cml0ZXJ6LmNvbSQ

# Strapi CMS Connection
VITE_CMS_URL=https://handywriterz-production-production.up.railway.app
VITE_CMS_TOKEN=<GET_FROM_STRAPI_ADMIN>

# Web App Self-Reference
VITE_APP_URL=https://web-production-abc123.up.railway.app  # Use YOUR generated domain

# Server Config
PORT=4173
NODE_ENV=production
BROWSER=none
OPEN=false
```

### Step 3: Get Strapi API Token (Critical!)

1. **Visit Strapi Admin**: https://handywriterz-production-production.up.railway.app/admin
2. **Login**:
   - Email: `abelngeno1@gmail.com`
   - Password: `dunnyYOH#9` (change this after!)
3. **Create API Token**:
   - Settings → API Tokens → Create new API Token
   - Name: "Web App Production"
   - Token type: "Full access"
   - Duration: "Unlimited"
   - Click **Save**
   - Copy the token (shown only once!)
4. **Add to Web Service**:
   - Railway Dashboard → **web** service → Variables
   - Find `VITE_CMS_TOKEN`
   - Paste the token
   - Click **Save**

### Step 4: Redeploy Web Service

After setting all variables:
1. Railway will auto-redeploy
2. Or manually trigger: Click **Deployments** → **Deploy** button

### Step 5: Verify All Services

**Test Strapi (Should Already Work):**
```bash
curl https://handywriterz-production-production.up.railway.app/api/services
```
Should return JSON data ✅

**Test Web App (After Deploy):**
```bash
# Get the web service URL from Railway Dashboard
curl https://web-production-abc123.up.railway.app
```
Should return HTML ✅

**Visit in Browser:**
- Strapi: https://handywriterz-production-production.up.railway.app/admin → Admin login ✅
- Web App: https://web-production-abc123.up.railway.app → Homepage ✅

## 📋 Service Checklist

### ✅ Strapi Service (handywriterz-production)
- [x] GitHub repo connected
- [x] Public URL generated and working
- [x] Postgres database connected
- [x] Admin accessible at `/admin`
- [x] API responding at `/api/*`

### ⏳ Web Service (web)
- [ ] GitHub repo connected to root `/`
- [ ] Separate public URL generated
- [ ] Environment variables set (including VITE_CMS_TOKEN)
- [ ] Successfully building from monorepo root
- [ ] Application loads in browser

### ⛔ Mattermost Service (Not Created Yet)
- [ ] Docker image or Dockerfile ready
- [ ] Separate Postgres database provisioned
- [ ] R2 or S3 storage configured
- [ ] Public URL generated
- [ ] Admin account created

### ✅ Postgres Database (postgres-volume)
- [x] Connected to Strapi service
- [x] Data persisting

## 🔧 Troubleshooting

### If Strapi Broke After Changes

**Symptom**: Strapi not loading or showing errors

**Fix**:
1. Click **handywriterz-production** service (NOT web!)
2. Go to **Deployments**
3. Find the last successful deployment (before changes)
4. Click **...** menu → **Redeploy**

### If Web Service Won't Build

**Check**:
1. Root Directory is `/` (not `apps/web`)
2. `railway.json` exists in `apps/web/`
3. `nixpacks.toml` exists in `apps/web/`
4. Check logs: `railway logs -n 100`

### If Services Share Same URL

**Problem**: Two services trying to use same domain

**Fix**:
1. Each service needs its own domain
2. Click service → Settings → Networking
3. Click **Generate Domain** for each service separately
4. Update environment variables to point to correct services

## 📝 Quick Reference

| Service | Purpose | URL Pattern | Port | Database |
|---------|---------|-------------|------|----------|
| **handywriterz-production** | Strapi CMS | `handywriterz-production-production.up.railway.app` | 1337 | Yes (Postgres) |
| **web** | React SPA | `web-production-xxxx.up.railway.app` | 4173 | No (uses Strapi API) |
| **mattermost** | Messaging | `mattermost-production-xxxx.up.railway.app` | 8065 | Yes (own Postgres) |
| **postgres-volume** | Database | Internal only | 5432 | - |

## 🎯 What to Do Right Now

1. **Don't panic!** Strapi is likely fine, just need to verify it's separate
2. **Check left panel** - Verify you see TWO services (handywriterz-production + web)
3. **Test Strapi URL** - Visit `https://handywriterz-production-production.up.railway.app/admin`
4. **If Strapi loads**: It's fine! Move to configuring web service properly
5. **If Strapi broken**: Redeploy the last good deployment from that service

**Take a screenshot of your Railway Dashboard left panel** showing all services and I'll help you sort out which is which!
