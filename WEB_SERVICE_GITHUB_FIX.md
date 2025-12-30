# 🚨 WEB SERVICE FIX - Connect to GitHub

## Problem Identified
The **web** service was created via `railway up` CLI command, but it's **NOT connected to your GitHub repository**. That's why it can't find the code files!

**Error in logs**:
```
Error: Failed to read Nixpacks config file `apps/web/nixpacks.toml`
Caused by: No such file or directory (os error 2)
```

**Why**: Railway CLI creates an "empty" service that expects code to be pushed via CLI, but we want it to pull from GitHub like Strapi does.

## ✅ Solution: Connect Web Service to GitHub

### Step 1: Open Web Service Settings

1. Go to Railway Dashboard: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click on the **web** service (the one showing "Failed 14 minutes ago")
3. Click **Settings** tab

### Step 2: Connect GitHub Repository

1. Scroll to **Source** section
2. Click **Connect Repo** (or if it says something else, click to change source)
3. Select:
   - **Repository**: `Abelhubprog/xHandyWriterz` (same as Strapi)
   - **Branch**: `main`
   - **Root Directory**: Leave EMPTY or type `/` (repository root)
   
   **CRITICAL**: Do NOT set Root Directory to `apps/web`! 
   - ❌ Wrong: `apps/web` (will miss pnpm-lock.yaml)
   - ✅ Correct: `/` or empty (repository root)

4. Click **Save**

### Step 3: Verify Railway Will Find Configuration

Once connected, Railway will:
1. Clone your GitHub repo (same as Strapi service)
2. Look for `apps/web/railway.json` (exists in your repo ✅)
3. Read `nixpacksConfigPath: "apps/web/nixpacks.toml"` from railway.json
4. Use that config to build from monorepo root
5. Run `cd apps/web && pnpm run start`

### Step 4: Generate Public Domain for Web Service

1. Still in **Settings** → scroll to **Networking**
2. Under **Public Networking**, click **Generate Domain**
3. Copy the generated URL (e.g., `web-production-abc123.up.railway.app`)
4. **IMPORTANT**: Save this URL!

### Step 5: Update Environment Variables

1. Click **Variables** tab in web service
2. Find `VITE_APP_URL` variable
3. Update it to your newly generated web domain:
   ```
   VITE_APP_URL=https://web-production-abc123.up.railway.app
   ```
4. **Add missing variable** (CRITICAL for fetching Strapi content):
   ```
   VITE_CMS_TOKEN=<GET_FROM_STRAPI>
   ```

### Step 6: Get Strapi API Token

**You MUST do this or web app can't fetch content!**

1. Visit: https://handywriterz-production-production.up.railway.app/admin
2. Login with your credentials
3. Go to **Settings** (left sidebar) → **API Tokens**
4. Click **Create new API Token**
5. Fill in:
   - **Name**: `Web App Production`
   - **Description**: `Token for frontend to fetch content`
   - **Token type**: `Full access`
   - **Token duration**: `Unlimited`
6. Click **Save**
7. **COPY THE TOKEN** (shown only once!)
8. Back in Railway → web service → Variables → Paste into `VITE_CMS_TOKEN`

### Step 7: Deploy

After connecting GitHub and setting variables:
1. Railway will **automatically trigger a deployment**
2. Or click **Deployments** tab → **Deploy** button

## 📋 Expected Result

**Build Process**:
```
✅ Clone GitHub repo
✅ Find apps/web/railway.json
✅ Read nixpacks config path
✅ Install dependencies (pnpm install --frozen-lockfile) at repo root
✅ Build web app (cd apps/web && pnpm run build)
✅ Start server (cd apps/web && pnpm run start)
✅ Deploy successful!
```

**Access**:
- Web App: https://web-production-abc123.up.railway.app → Homepage loads ✅
- Strapi: https://handywriterz-production-production.up.railway.app/admin → Admin works ✅

## 🔍 What About Mattermost?

**Mattermost is NOT deployed yet**. Here's what you'll need:

### Option 1: Deploy Mattermost Later (Recommended)
Get web app working first, then add Mattermost as a third service.

### Option 2: Deploy Mattermost Now

1. **Create new Postgres database** (Mattermost needs its own, separate from Strapi):
   - Railway Dashboard → **+ New** → **Database** → **PostgreSQL**
   - Name it: `mattermost-postgres`

2. **Create Mattermost service**:
   - Railway Dashboard → **+ New** → **Empty Service**
   - Name it: `mattermost`
   - Connect to GitHub: `Abelhubprog/xHandyWriterz`, branch `main`
   - Root Directory: `apps/mattermost`

3. **Configure Mattermost** (complex, do this after web works!)

## 🎯 Current Architecture

```
Railway Project: handywriterz-production
├── handywriterz-production (Strapi CMS) ✅ WORKING
│   ├── Source: GitHub Abelhubprog/xHandyWriterz
│   ├── Root Directory: / or apps/strapi
│   ├── URL: https://handywriterz-production-production.up.railway.app
│   └── Database: Postgres (connected)
│
├── web (React Frontend) ⏳ FIXING NOW
│   ├── Source: NEEDS GitHub connection ← FIX THIS!
│   ├── Root Directory: / (repo root)
│   ├── URL: Generate new domain
│   └── Connects to: Strapi via VITE_CMS_URL
│
├── Postgres ✅ WORKING
│   └── Connected to: handywriterz-production (Strapi)
│
└── mattermost ⛔ NOT CREATED YET
    ├── Needs: Own Postgres database
    ├── Needs: R2/S3 storage configuration
    └── Deploy after web works
```

## 🚦 Action Checklist

### Right Now (Critical):
- [ ] Open Railway → web service → Settings → Source
- [ ] Click "Connect Repo" → Select `Abelhubprog/xHandyWriterz`
- [ ] Set Branch: `main`, Root Directory: `/` (or empty)
- [ ] Generate public domain in Networking section
- [ ] Get Strapi API token from admin panel
- [ ] Set `VITE_CMS_TOKEN` variable in web service
- [ ] Update `VITE_APP_URL` to web service's domain
- [ ] Wait for automatic deployment (or trigger manually)

### After Web Works:
- [ ] Test web app at new URL
- [ ] Verify it fetches content from Strapi
- [ ] Then consider deploying Mattermost

## 🆘 If Build Still Fails

**Check these**:
1. Root Directory is `/` (NOT `apps/web`)
2. GitHub connection shows correct repo
3. Deployment logs show "Cloning repository" (proves GitHub connected)
4. File `apps/web/railway.json` exists in GitHub (it does ✅)
5. File `apps/web/nixpacks.toml` exists in GitHub (it does ✅)

**View logs**:
- Railway Dashboard → web service → Deployments → Click latest → View logs
- Or CLI: `railway logs` (make sure linked to web service)

## 📱 What to Screenshot Next

After connecting GitHub, take a screenshot of:
1. **web service → Settings → Source** (showing GitHub connected)
2. **web service → Deployments** (showing new build progress)
3. Send me the build logs if it fails again

---

**TL;DR**: The web service needs to be connected to your GitHub repo, just like Strapi is. Railway CLI `railway up` created an empty service, but we need it to pull code from GitHub. Connect it, and it'll find all the config files (railway.json, nixpacks.toml) we already committed!
