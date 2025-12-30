# 🚨 CRITICAL: Railway Web Service Configuration Fix Required

## ⚠️ Current Status: Build Still Failing

**Time:** October 4, 2025, 1:23 PM GMT+1  
**Issue:** Railway build continues to fail with same error  
**Root Cause:** Service-level settings are overriding `railway.json`  

### Error Still Occurring:
```
ERROR: failed to build: failed to solve: failed to compute cache key: 
failed to calculate checksum of ref we96q361ujz8vixv3njkx21b3::le8ymzijtstb52u75jz7ctr4x: 
"/apps/web/package.json": not found
```

---

## 🎯 IMMEDIATE ACTION REQUIRED

Railway has **TWO** places where build context can be configured:
1. ✅ `railway.json` file (we fixed this)
2. ⚠️ **Service Settings in Dashboard** (THIS is overriding our fix)

---

## 📋 Step-by-Step Fix in Railway Dashboard

### Step 1: Access Railway Dashboard
1. Go to: https://railway.app/dashboard
2. Select project: **handywriterz-production**
3. Click on service: **web**

### Step 2: Update Service Settings
1. Click **Settings** tab (in service view)
2. Scroll to **Service** section
3. Look for these fields:

#### A. Root Directory
```
Current setting: Probably "apps/web" ❌
Required setting: "/" or EMPTY ✅
```
**ACTION:** Clear this field or set it to `/`

#### B. Config Path (if present)
```
Current: Might be unset or wrong
Required: "apps/web/railway.json" ✅
```
**ACTION:** Set to `apps/web/railway.json`

### Step 3: Update Build Settings (if visible)
1. In Settings → **Build** section
2. Look for **Dockerfile Path**:
   ```
   Set to: apps/web/Dockerfile ✅
   ```
3. Look for **Docker Context** or **Build Context**:
   ```
   Set to: . (root) ✅
   OR leave EMPTY to use railway.json
   ```

### Step 4: Save and Redeploy
1. Click **Save** or **Update** button
2. Navigate to **Deployments** tab
3. Click **Deploy** → **Redeploy**
4. Select the latest deployment
5. Confirm redeploy

---

## 🔧 Alternative: Update railway.json (Already Done)

I've updated `apps/web/railway.json` to remove explicit `contextPath` since Railway might be interpreting it incorrectly:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "apps/web/Dockerfile",
    "watchPatterns": ["apps/web/**"]
  }
}
```

**Key Change:** Removed `contextPath: "."` and simplified `dockerfilePath`

---

## 🚀 Option 2: Use Railway CLI to Override

If you have Railway CLI installed:

```bash
# Navigate to project root
cd /d/HandyWriterzNEW

# Link to the correct service
railway link

# Set the service
railway service web

# Deploy with explicit settings
railway up --dockerfile apps/web/Dockerfile
```

---

## 🔍 Diagnostic Commands

Run these to verify the configuration:

```bash
# Check current railway.json
cat apps/web/railway.json

# Check Railway service info (if CLI installed)
railway status --service web

# Verify Dockerfile exists
ls -la apps/web/Dockerfile

# Verify we're at repo root
pwd  # Should be /d/HandyWriterzNEW
```

---

## 📊 What Railway SHOULD Be Doing

```
┌─────────────────────────────────────────────┐
│ Correct Configuration                       │
├─────────────────────────────────────────────┤
│ Service Root Directory: / (or empty)        │
│ Config Path: apps/web/railway.json          │
│ Dockerfile Path: apps/web/Dockerfile        │
│ Build Context: Repository root (.)          │
└─────────────────────────────────────────────┘

Build Process:
1. Railway clones entire repo
2. Uses repository root as context
3. Finds Dockerfile at apps/web/Dockerfile
4. COPY commands work because context includes apps/web/
```

---

## ⚠️ Common Railway Pitfalls

### Pitfall 1: Service Root Directory Override
If "Root Directory" in service settings is set to `apps/web`, Railway will:
- Change to that directory BEFORE building
- Make that the build context
- Our paths won't work

**Fix:** Clear or set to `/`

### Pitfall 2: Config Not Applied
Railway might not pick up `railway.json` if:
- Config Path isn't set in service settings
- There's a conflicting `railway.toml` at root
- Service was created before config-as-code feature

**Fix:** Manually set in dashboard

### Pitfall 3: Cached Settings
Railway caches service configurations

**Fix:** Make a change, save, THEN redeploy

---

## 🎯 Visual Checklist for Railway Dashboard

Go to Railway → handywriterz-production → web → Settings:

```
Service Section:
┌────────────────────────────────────────┐
│ Service Name: web                      │
│ Root Directory: [EMPTY] ✅             │
│ Config Path: apps/web/railway.json ✅  │
│ Environment: production                │
└────────────────────────────────────────┘

Build Section (if present):
┌────────────────────────────────────────┐
│ Builder: Dockerfile                    │
│ Dockerfile Path: apps/web/Dockerfile ✅│
│ Docker Context: [Use railway.json] ✅  │
└────────────────────────────────────────┘
```

---

## 📸 Screenshot Guide

### What to Look For:

1. **Root Directory Field** - Should be empty or `/`
   - If you see `apps/web` here, CLEAR IT

2. **Config as Code Path** - Should show `apps/web/railway.json`
   - If empty, set it manually

3. **Build Settings** - Should reference Dockerfile correctly
   - Path: `apps/web/Dockerfile` (no leading `./`)

---

## 🔄 Commit New Configuration

```bash
# Stage the updated railway.json
git add apps/web/railway.json

# Commit
git commit -m "fix(railway): Remove explicit contextPath, simplify dockerfilePath

Railway was not respecting the contextPath setting. Simplified
configuration to rely on implicit repository root context."

# Push
git push origin main
```

---

## ✅ Expected Outcome After Fix

After updating Railway dashboard settings and redeploying:

```
✓ [ 1/10] FROM node:20-alpine
✓ [ 2/10] RUN corepack enable
✓ [ 3/10] WORKDIR /app
✓ [ 4/10] COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
✓ [ 5/10] RUN mkdir -p apps/web
✓ [ 6/10] COPY apps/web/package.json apps/web/package.json  ← SHOULD WORK
✓ [ 7/10] RUN pnpm install
✓ [ 8/10] COPY . .
✓ [ 9/10] RUN pnpm build
✓ [10/10] WORKDIR /app/apps/web
```

---

## 🆘 If Still Failing

### Last Resort: Create Service from Scratch

If Railway service has corrupted settings:

1. **In Railway Dashboard:**
   - Create new service
   - Select "Empty Service"
   - Connect to GitHub repo
   - Set root directory: `/` (or empty)
   - Set config path: `apps/web/railway.json`
   - Deploy

2. **Transfer Settings:**
   - Copy environment variables from old service
   - Copy domain settings
   - Copy volume mounts (if any)
   - Delete old service once new one works

---

## 📞 Railway Support

If all else fails, contact Railway support with these details:

```
Subject: Build context not respecting railway.json configuration

Project: handywriterz-production
Service: web
Issue: Dockerfile build failing with "package.json not found"
Config: apps/web/railway.json specifies repository root context
Error: Railway appears to be using apps/web as context instead of root

Build logs show:
ERROR: "/apps/web/package.json": not found

Expected behavior:
Railway should use repository root as Docker build context
as specified in apps/web/railway.json

Repository: https://github.com/Abelhubprog/xHandyWriterz
```

---

## 🎯 Action Items (Priority Order)

### ⚡ IMMEDIATE (Do this NOW)
1. [ ] Open Railway Dashboard
2. [ ] Go to web service → Settings
3. [ ] Check "Root Directory" field
4. [ ] Clear it if set to `apps/web`
5. [ ] Save changes
6. [ ] Redeploy

### 🔄 NEXT (If still failing)
1. [ ] Commit updated railway.json
2. [ ] Push to trigger new build
3. [ ] Monitor build logs

### 🛠️ IF PERSISTS
1. [ ] Use Railway CLI to deploy directly
2. [ ] Contact Railway support
3. [ ] Consider recreating service

---

**Status:** ⚠️ CRITICAL - Manual Dashboard Fix Required  
**Priority:** 🔴 HIGH - Service is down  
**ETA to Fix:** 5 minutes (if dashboard updated correctly)  

**Last Updated:** October 4, 2025, 1:25 PM GMT+1
