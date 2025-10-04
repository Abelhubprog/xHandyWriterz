# Railway Root Directory Fix - CRITICAL ACTION

## 🚨 Current Problem
- ✅ Web service deployed successfully (commit c41be9f)
- ✅ Container is healthy and running
- ❌ Domain returns 404: "The train has not arrived at the station"
- ❌ **Root Cause**: Service Root Directory is set to `/apps/web` instead of `.`

## Why This Matters
Railway's **Root Directory** setting in the UI overrides the `contextPath` in railway.json. When set to `/apps/web`:
- BuildKit only sees the contents of `apps/web/`
- Dockerfile tries to `COPY apps/web/package.json` → not found (looking for `apps/web/apps/web/package.json`)
- Build fails before it even starts

## 🎯 Required Fix

### Step 1: Update Root Directory for Web Service
1. **Navigate to Service**:
   - Railway Dashboard → `handywriterz-production` → `xHandyWriterz` service
   - Click **Settings** tab

2. **Change Root Directory**:
   - Scroll to **Source** section
   - Find **Root Directory** field (currently shows: `/apps/web`)
   - **Change to**: `.` (just a dot, means repository root)
   - Click **Update** button

3. **Redeploy**:
   - Push a new commit (triggers auto-deploy), OR
   - Click **Deploy** → **Redeploy** in Railway dashboard

### Expected Result After Fix
```
Build Context = repository root (entire repo)
Dockerfile COPY apps/web/package.json → FOUND ✓
Builder stage completes → tsc + vite build ✓
Runner stage completes → minimal image with dist/ ✓
Health check passes ✓
Domain responds: https://xhandywriterz-production.up.railway.app/ ✓
```

## 📋 Next: Mattermost Service

Once web service is live, configure Mattermost:

### Step 2: Configure Mattermost Service
1. **Navigate to Mattermost Service** in Railway dashboard
2. **Settings → Source**:
   - Set **Root Directory** to: `.` (repo root)
3. **Settings → Config-as-code**:
   - Set path to: `apps/mattermost/railway.json`
   - Click **Apply changes**
4. **Redeploy** Mattermost service

### Mattermost Configuration Files
- ✅ Dockerfile exists: `apps/mattermost/Dockerfile`
- ✅ Railway config exists: `apps/mattermost/railway.json`
- ⏳ Root Directory: Needs to be set to `.`
- ⏳ Config-as-code: Needs to point to `apps/mattermost/railway.json`

## 🔍 Verification Checklist

### Web Service (xHandyWriterz)
- [ ] Root Directory changed from `/apps/web` to `.`
- [ ] Redeployed after root directory change
- [ ] Build logs show successful builder stage
- [ ] Build logs show successful runner stage
- [ ] Health check passes
- [ ] Domain loads: https://xhandywriterz-production.up.railway.app/
- [ ] Custom domain works: handywriterz.com

### Mattermost Service
- [ ] Root Directory set to `.`
- [ ] Config-as-code path: `apps/mattermost/railway.json`
- [ ] Service deploys successfully
- [ ] Health check passes
- [ ] Mattermost accessible via Railway URL

## 🎓 Lesson Learned
**Railway Service Settings Priority**:
1. **Root Directory** (UI setting) - HIGHEST priority
2. `contextPath` (railway.json) - Only works if Root Directory allows it
3. Dockerfile COPY paths - Relative to final build context

**Solution**: Always set Root Directory to `.` for monorepo services, then use `contextPath` and `dockerfilePath` in railway.json to specify locations.

---
**Status**: Web service deployed but not serving (Root Directory misconfigured)  
**Next Action**: Change Root Directory to `.` in Railway UI → Settings → Source  
**After Fix**: Web service live, then configure Mattermost service  
**Last Updated**: October 4, 2025 - Commit c41be9f
