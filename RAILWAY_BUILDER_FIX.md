# 🚨 RAILWAY BUILDER FIX - Force Nixpacks

## Problem Identified

**Both services are using Railpack** (Railway's new default builder), but **Railpack is ignoring your configuration files**!

**Error in both services**:
```
✖ No start command was found.
```

**Why**: Railway recently switched from Nixpacks to Railpack as the default. Even though you have `railway.json` specifying `"builder": "NIXPACKS"`, Railway Dashboard settings override it.

## ✅ Solution: Force Nixpacks in Railway Dashboard

### Fix 1: Strapi Service (handywriterz-production)

1. **Go to Railway Dashboard**
2. Click **handywriterz-production** service (Strapi)
3. Click **Settings** tab
4. Scroll to **Build** section
5. Find **Builder** dropdown
6. Change from `Railpack` → **`Nixpacks`**
7. Click **Save** or it auto-saves

**Expected Result**: Strapi will use Nixpacks and respect the `start` script in `apps/strapi/package.json`:
```json
"scripts": {
  "start": "strapi start"  ← This will be used
}
```

### Fix 2: Web Service

1. Click **web** service
2. Click **Settings** tab
3. Scroll to **Build** section
4. Find **Builder** dropdown
5. Change from `Railpack` → **`Nixpacks`**
6. Click **Save**

**Expected Result**: Web service will:
1. Use Nixpacks (respects `railway.json`)
2. Read `railway.json` → Find `nixpacksConfigPath: "apps/web/nixpacks.toml"`
3. Use the build configuration we created
4. Build from monorepo root
5. Run `cd apps/web && pnpm run start`

## 📋 After Setting Builder

Both services will **automatically redeploy** once you change the builder.

### Expected Strapi Build (handywriterz-production)
```
✅ Using Nixpacks
✅ Detected Node.js
✅ Installing dependencies
✅ Running npm run build (or default build)
✅ Starting: npm run start (calls "strapi start")
✅ Strapi started on port 1337
✅ Deploy successful!
```

### Expected Web Build
```
✅ Using Nixpacks
✅ Reading apps/web/nixpacks.toml
✅ Installing pnpm dependencies (frozen lockfile)
✅ Building: cd apps/web && pnpm run build
✅ Starting: cd apps/web && pnpm run start
✅ Server listening on port 4173
✅ Deploy successful!
```

## 🎯 If You Can't Change Builder in Dashboard

If the Builder dropdown doesn't exist or won't change, **set it via CLI**:

### For Strapi Service:
```bash
# Link to Strapi service
railway service

# When prompted, select: handywriterz-production

# Set builder
railway variables set RAILWAY_BUILDER=NIXPACKS

# Redeploy
railway up
```

### For Web Service:
```bash
# Link to web service
railway service

# When prompted, select: web

# Set builder
railway variables set RAILWAY_BUILDER=NIXPACKS

# Redeploy
railway up
```

## 🔍 Alternative: Add Start Command Override

If Nixpacks still doesn't work, **manually set start command in Railway Dashboard**:

### Strapi Service Start Command:
```bash
npm run start
```

### Web Service Start Command:
```bash
cd apps/web && pnpm run start
```

**How to set**:
1. Service → Settings → Deploy section
2. Find **Custom Start Command**
3. Enter the command above
4. Save and redeploy

## 📊 Why This Happened

**Timeline**:
1. ✅ You originally deployed Strapi with Nixpacks → Worked
2. ⚠️ Railway updated to Railpack as default (recent change)
3. ❌ New deployments/services default to Railpack
4. ❌ Railpack doesn't read `railway.json` the same way
5. ❌ Both services now using wrong builder

**The fix**: Explicitly set builder to Nixpacks in Dashboard settings.

## 🎯 Action Checklist

### For Both Services:
- [ ] Open Railway Dashboard
- [ ] Click service → Settings
- [ ] Find **Build** section
- [ ] Change **Builder** from Railpack → **Nixpacks**
- [ ] Wait for auto-redeploy
- [ ] Check deployment logs

### Verify Success:
- [ ] Strapi: Logs show "Using Nixpacks" and "Started Strapi"
- [ ] Web: Logs show "Using Nixpacks" and "Server listening"
- [ ] Strapi URL works: https://handywriterz-production-production.up.railway.app/admin
- [ ] Web URL works: https://web-production-YOUR-ID.up.railway.app

## 🆘 If Still Failing After Nixpacks

**Check these**:

1. **Strapi Service**:
   - Root Directory: Should be `/` or empty (NOT `apps/strapi`)
   - package.json has `"start": "strapi start"` ✅ (verified)
   - DATABASE_URL variable is set

2. **Web Service**:
   - Root Directory: `/` or empty ✅
   - `railway.json` exists at `apps/web/railway.json` ✅
   - `nixpacks.toml` exists at `apps/web/nixpacks.toml` ✅
   - package.json has `"start": "node scripts/server.mjs"` (check this)

## 📱 What to Screenshot Next

After changing builder to Nixpacks:
1. Screenshot of deployment logs showing "Using Nixpacks"
2. Screenshot if it still fails (with new error message)
3. Screenshot of successful deployment (if it works!)

---

**TL;DR**: Railway switched to Railpack as default, but your config requires Nixpacks. Go to each service → Settings → Build → Change Builder to **Nixpacks** → Save → Wait for redeploy. Both services should work after this!
