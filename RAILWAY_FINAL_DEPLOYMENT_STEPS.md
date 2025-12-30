# 🚀 Railway Deployment - Final Configuration Steps

## 📊 Current Status
- ✅ **Code**: All fixes committed and pushed (commit f18ba90)
- ✅ **Web Dockerfile**: Two-stage build ready
- ✅ **Mattermost Dockerfile**: Config ready for monorepo
- ✅ **Railway configs**: Both services have railway.json with contextPath
- ❌ **Railway UI**: Root Directory settings need manual update
- ❌ **Web service**: Returns 404 due to misconfigured Root Directory
- ❌ **Mattermost service**: Not yet configured in Railway

## 🎯 Required Actions in Railway Dashboard

### STEP 1: Fix Web Service (xHandyWriterz) - URGENT

#### 1.1 Navigate to Service
- Go to: https://railway.app
- Project: `handywriterz-production`
- Service: `xHandyWriterz` (the web service showing 404)
- Click **Settings** tab

#### 1.2 Update Root Directory
- Scroll to **Source** section
- Find **Root Directory** field
- **Current value**: `/apps/web` ❌
- **Change to**: `.` ✅ (just a single dot)
- Click **Update** button

#### 1.3 Verify Config-as-Code (should already be set)
- Scroll to **Config-as-code** section
- **Path should be**: `apps/web/railway.json`
- If not set, set it and click **Apply changes**

#### 1.4 Redeploy
- Option A: Automatic - Just wait, Railway will auto-deploy from commit f18ba90
- Option B: Manual - Click **Deploy** → **Redeploy**

#### 1.5 Verify Deployment
- Wait for build to complete (~2-3 minutes)
- Check build logs for:
  ```
  [builder 6/9] COPY apps/web/package.json  ✓
  [builder 7/9] RUN pnpm install            ✓
  [builder 9/9] RUN pnpm build              ✓
  [runner 3/4] COPY --from=builder .../dist ✓
  ```
- Health check should pass
- Visit: https://xhandywriterz-production.up.railway.app/
- Should see your React app (NOT "train has not arrived")

---

### STEP 2: Configure Mattermost Service

#### 2.1 Navigate to Mattermost Service
- Same project: `handywriterz-production`
- Service: Look for Mattermost service (might be named differently)
- Click **Settings** tab

#### 2.2 Set Root Directory
- Scroll to **Source** section
- Set **Root Directory** to: `.` (single dot)
- Click **Update**

#### 2.3 Set Config-as-Code Path
- Scroll to **Config-as-code** section
- Set path to: `apps/mattermost/railway.json`
- Click **Apply changes**

#### 2.4 Configure Environment Variables
Mattermost needs these env vars (check your config):
- `MM_SQLSETTINGS_DATASOURCE` - Postgres connection string
- `MM_SERVICESETTINGS_SITEURL` - Your Mattermost domain
- `MM_FILESETTINGS_DRIVERNAME` - Set to `amazons3` for R2
- `MM_FILESETTINGS_AMAZONS3ACCESSKEYID` - R2 access key
- `MM_FILESETTINGS_AMAZONS3SECRETACCESSKEY` - R2 secret
- `MM_FILESETTINGS_AMAZONS3BUCKET` - R2 bucket name
- `MM_FILESETTINGS_AMAZONS3ENDPOINT` - R2 endpoint URL

#### 2.5 Deploy Mattermost
- Push to trigger auto-deploy, OR
- Click **Deploy** → **Redeploy**

#### 2.6 Verify Mattermost Deployment
- Check build logs for successful image pull and config copy
- Health check endpoint: `/api/v4/system/ping`
- Visit Mattermost Railway URL
- Should see Mattermost login page

---

## 🔍 Why Root Directory Must Be `.` (Repo Root)

### The Problem with `/apps/web` or `/apps/mattermost`

When Root Directory is set to a subfolder:
```
Root Directory: /apps/web
Build Context sent to Docker: Only contents of apps/web/
Dockerfile: COPY apps/web/package.json
Docker looks for: apps/web/apps/web/package.json ❌ NOT FOUND
Result: Build fails before it starts
```

### The Solution with `.` (Repo Root)

When Root Directory is set to `.`:
```
Root Directory: .
Build Context sent to Docker: Entire repository
Dockerfile: COPY apps/web/package.json
Docker looks for: apps/web/package.json ✅ FOUND
Result: Build succeeds
```

### railway.json contextPath

The `contextPath: "."` in railway.json is **secondary** to Root Directory:
- Root Directory **MUST** be `.` to send full repo to Docker
- contextPath in railway.json confirms build context
- Both need to be `.` for monorepo builds

---

## 📝 Configuration Summary

### Web Service (xHandyWriterz)
```json
{
  "Root Directory": ".",              ← Set in Railway UI
  "Config-as-code": "apps/web/railway.json",
  "railway.json": {
    "dockerfilePath": "apps/web/Dockerfile",
    "contextPath": "."
  }
}
```

### Mattermost Service
```json
{
  "Root Directory": ".",              ← Set in Railway UI
  "Config-as-code": "apps/mattermost/railway.json",
  "railway.json": {
    "dockerfilePath": "apps/mattermost/Dockerfile",
    "contextPath": "."
  }
}
```

---

## ✅ Success Criteria

### Web Service Success
- [ ] Root Directory changed to `.`
- [ ] Service redeployed successfully
- [ ] Build logs show all stages complete
- [ ] Health check passes
- [ ] https://xhandywriterz-production.up.railway.app/ loads React app
- [ ] Custom domain handywriterz.com works (if DNS configured)

### Mattermost Service Success
- [ ] Root Directory set to `.`
- [ ] Config-as-code path set to `apps/mattermost/railway.json`
- [ ] Environment variables configured
- [ ] Service deploys successfully
- [ ] Health check at `/api/v4/system/ping` passes
- [ ] Mattermost login page accessible
- [ ] Can create admin account and login

---

## 🐛 Troubleshooting

### If Web Build Still Fails
1. Check Railway build logs for exact error
2. Verify Root Directory is exactly `.` (no spaces, no slash)
3. Confirm railway.json path is `apps/web/railway.json`
4. Try manual redeploy after confirming settings

### If Mattermost Fails
1. Check environment variables are set correctly
2. Verify Postgres database is connected
3. Check Mattermost logs for specific errors
4. Verify R2 credentials if using object storage

---

## 📚 Files Changed in Commit f18ba90

1. **apps/mattermost/Dockerfile**
   - Changed: `COPY config/` → `COPY apps/mattermost/config/`
   - Reason: Build from repo root needs full path

2. **apps/mattermost/railway.json**
   - Added: `"contextPath": "."`
   - Changed: `"dockerfilePath": "./Dockerfile"` → `"apps/mattermost/Dockerfile"`
   - Reason: Monorepo compatibility

3. **RAILWAY_ROOT_DIRECTORY_FIX_URGENT.md**
   - Added: Complete guide for fixing Root Directory setting

---

**🎯 Next Action**: Update Root Directory to `.` for BOTH services in Railway dashboard  
**⏱️ Expected Time**: 5 minutes per service  
**🚀 Result**: Both services deployed and accessible  
**📅 Last Updated**: October 4, 2025 - Commit f18ba90
