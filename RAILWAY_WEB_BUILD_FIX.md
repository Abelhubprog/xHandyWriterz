# Railway Web Service Build Fix - Context Path Issue

## Problem Diagnosed

The Railway build was failing with this error:
```
ERROR: failed to build: failed to solve: failed to compute cache key: 
failed to calculate checksum of ref m43xdydx5p6ncfd7al57e95wt::ysvfg8dfcnrctow84ux1emdk3: 
"/apps/web/package.json": not found.
```

**Root Cause:** Railway's Dockerfile builder was using `apps/web` as the build context by default, but the Dockerfile contains commands like `COPY apps/web/package.json apps/web/package.json` which require the build context to be the repository root.

## Solution Implemented

The `apps/web/railway.json` file has been configured with:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "./apps/web/Dockerfile",
    "contextPath": "."
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Key Fix:** `"contextPath": "."` - This tells Railway to use the repository root as the build context, not the `apps/web` directory.

## Deployment Steps

### Step 1: Verify Configuration
✅ The `apps/web/railway.json` file is correctly configured with `contextPath: "."`
✅ The `apps/web/Dockerfile` uses paths relative to the repo root

### Step 2: Commit and Push Changes

```bash
# Ensure railway.json changes are committed
git add apps/web/railway.json
git commit -m "fix: Configure Railway build context for web service"
git push origin main
```

### Step 3: Redeploy on Railway

**Option A: Automatic Deployment (if GitHub integration is active)**
- Railway will automatically detect the push and start a new deployment
- Monitor the deployment in the Railway dashboard

**Option B: Manual Deployment via CLI**
```bash
# From the repository root
railway up --service web
```

**Option C: Manual Deployment via Railway Dashboard**
1. Go to Railway Dashboard → `handywriterz-production` project
2. Select the `web` service
3. Go to **Settings** tab
4. Under **Service**, verify "Config as Code" points to `apps/web/railway.json`
5. Click **Deploy** → **Redeploy Latest**

### Step 4: Monitor the Build

Watch the build logs in Railway. You should now see:

✅ `[ 1/10] FROM docker.io/library/node:20-alpine` - Base image load
✅ `[ 2/10] RUN corepack enable` - Enable pnpm
✅ `[ 3/10] WORKDIR /app` - Set working directory
✅ `[ 4/10] COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./` - Copy root files
✅ `[ 5/10] RUN mkdir -p apps/web` - Create directory
✅ `[ 6/10] COPY apps/web/package.json apps/web/package.json` - **This should now work**
✅ `[ 7/10] RUN pnpm install --filter @handywriterz/web... --frozen-lockfile` - Install deps
✅ `[ 8/10] COPY . .` - Copy all source files
✅ `[ 9/10] RUN pnpm --filter @handywriterz/web build` - Build the app
✅ `[10/10] WORKDIR /app/apps/web` - Final working directory

### Step 5: Verify Deployment

Once the build completes:

1. **Check Service Health:**
   - The service should show "Active" status
   - Healthcheck at `/` should return 200 OK

2. **Access the Application:**
   - Your web service URL: `https://handywriterz.com` (or Railway-provided URL)
   - Test key routes:
     - `/` - Homepage
     - `/dashboard` - Dashboard (requires auth)
     - `/services` - Services listing

3. **Check Logs:**
   - Deployment logs should show successful build
   - Application logs should show the server starting on port 4173

## Expected Build Output

```
✓ [ 1/10] FROM docker.io/library/node:20-alpine
✓ [ 2/10] RUN corepack enable
✓ [ 3/10] WORKDIR /app
✓ [ 4/10] COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
✓ [ 5/10] RUN mkdir -p apps/web
✓ [ 6/10] COPY apps/web/package.json apps/web/package.json
✓ [ 7/10] RUN pnpm install --filter @handywriterz/web... --frozen-lockfile
✓ [ 8/10] COPY . .
✓ [ 9/10] RUN pnpm --filter @handywriterz/web build
✓ [10/10] WORKDIR /app/apps/web
```

## Troubleshooting

### If Build Still Fails

1. **Verify railway.json is in the correct location:**
   ```bash
   cat apps/web/railway.json
   ```
   Should show `"contextPath": "."`

2. **Check Railway Service Settings:**
   - Settings → Service → Config as Code
   - Should point to: `apps/web/railway.json`
   - Root Directory should be: `/` (repository root) or empty

3. **Verify Dockerfile Path:**
   - The Dockerfile should be at: `apps/web/Dockerfile`
   - Railway should reference it as: `./apps/web/Dockerfile`

4. **Check for Root Directory Override:**
   - In Railway Settings → Service
   - If "Root Directory" is set to `apps/web`, remove it
   - The `contextPath` in railway.json handles this

### If Service Starts but Doesn't Respond

1. **Check Environment Variables:**
   - Ensure all required env vars are set in Railway
   - Key vars: `VITE_CLERK_PUBLISHABLE_KEY`, `DATABASE_URL`, etc.

2. **Check Port Configuration:**
   - Railway should detect port 4173 automatically
   - Verify in Settings → Networking

3. **Review Application Logs:**
   - Look for startup errors
   - Verify database connections
   - Check for missing dependencies

## What This Fix Enables

✅ **Correct Build Context:** Railway now builds from the repository root, allowing the Dockerfile to reference monorepo structure correctly

✅ **Monorepo Support:** The web service can properly access shared dependencies and workspace configuration

✅ **Consistent Builds:** Build behavior matches local Docker builds (`docker build -f apps/web/Dockerfile .`)

## Next Steps After Successful Deployment

1. ✅ Verify web service is accessible at your domain
2. ✅ Test authentication flow (Clerk integration)
3. ✅ Verify database connectivity (Strapi/Postgres)
4. ✅ Test file uploads (if using R2/upload broker)
5. ✅ Check Mattermost integration (if embedded)

## Related Files

- `apps/web/railway.json` - Railway service configuration ✅
- `apps/web/Dockerfile` - Multi-stage build for web service ✅
- `apps/web/scripts/server.mjs` - Production server script
- `pnpm-workspace.yaml` - Monorepo workspace definition
- `apps/web/package.json` - Web service dependencies

## References

- [Railway Dockerfile Documentation](https://docs.railway.app/deploy/dockerfiles)
- [Railway Config as Code](https://docs.railway.app/deploy/config-as-code)
- HandyWriterz Architecture: `docs/intel.md`
- Deployment Guide: `RAILWAY_DEPLOYMENT_GUIDE.md`

---

**Status:** ✅ Configuration Fixed - Ready for Deployment

**Last Updated:** October 4, 2025, 12:51 PM GMT+1
