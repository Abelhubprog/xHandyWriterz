# Railway Context Path Fix - Action Required

## Problem
Railway build is failing with error: `"/apps/web/package.json": not found`

**Root Cause**: Railway is building from `apps/web/` as the build context instead of the repository root. When the Dockerfile tries to `COPY apps/web/package.json`, it's looking for `apps/web/apps/web/package.json` (doesn't exist).

## Solution
The `apps/web/railway.json` already has `"contextPath": "."` configured, but Railway needs to be told to use this config file.

## Required Steps in Railway Dashboard

### Step 1: Navigate to Service Settings
1. Open Railway dashboard: https://railway.app
2. Select project: **handywriterz-production**
3. Select service: **web** (xHandyWriterz)
4. Click **Settings** tab

### Step 2: Configure Config-as-Code
1. Scroll to **Config-as-code** section
2. Set the path to: `apps/web/railway.json`
3. Click **Apply changes** button (critical step!)
4. Wait for Railway to acknowledge the configuration

### Step 3: Verify Configuration Applied
Railway should now use these settings from `apps/web/railway.json`:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "apps/web/Dockerfile",
    "contextPath": ".",  ← This tells Railway to build from repo root!
    "watchPatterns": ["apps/web/**", "pnpm-lock.yaml", "pnpm-workspace.yaml", "package.json"]
  }
}
```

### Step 4: Trigger New Deployment
Option A (Automatic): Push any commit to `main` branch
Option B (Manual): In Railway dashboard, click **Deploy** → **Redeploy**

## What This Fixes

**Before** (contextPath = apps/web/):
```
Build Context = apps/web/
Dockerfile COPY apps/web/package.json → Looking for: apps/web/apps/web/package.json ❌
```

**After** (contextPath = .):
```
Build Context = repository root/
Dockerfile COPY apps/web/package.json → Looking for: apps/web/package.json ✅
```

## Expected Build Flow After Fix

1. **Builder Stage**:
   ```
   [builder 1/9] FROM docker.io/library/node:20-alpine  ✓
   [builder 2/9] RUN corepack enable                    ✓
   [builder 3/9] WORKDIR /app                           ✓
   [builder 4/9] COPY pnpm-lock.yaml ... package.json   ✓
   [builder 5/9] RUN mkdir -p apps/web                  ✓
   [builder 6/9] COPY apps/web/package.json             ✓ (Fixed!)
   [builder 7/9] RUN pnpm install (all deps)            ✓
   [builder 8/9] COPY . .                               ✓
   [builder 9/9] RUN pnpm build (tsc + vite)            ✓
   ```

2. **Runner Stage**:
   ```
   [runner 1/4] FROM docker.io/library/node:20-alpine   ✓
   [runner 2/4] WORKDIR /app                            ✓
   [runner 3/4] COPY --from=builder .../dist            ✓
   [runner 4/4] COPY --from=builder .../scripts         ✓
   ```

3. **Deployment**:
   ```
   Container starts → node scripts/server.mjs
   Server logs: "[web] Production server listening on http://0.0.0.0:PORT"
   Health check: GET / → 200 OK
   Deployment: SUCCESS ✓
   ```

## Current Status
- ✅ `apps/web/railway.json` has correct `contextPath: "."`
- ✅ JSON syntax is valid
- ✅ Two-stage Dockerfile is committed (commit 0795f73)
- ⏳ **ACTION REQUIRED**: Apply config-as-code in Railway dashboard
- ⏳ **PENDING**: Redeploy after config applied

## Next Steps
1. **You**: Follow Steps 1-4 above in Railway dashboard
2. **Railway**: Rebuilds with correct context path
3. **Result**: Build succeeds, service deploys, health checks pass

---
*Last Updated: October 4, 2025*
*Commit: 0795f73 (two-stage Docker build)*
