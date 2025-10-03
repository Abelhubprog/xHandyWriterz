# Deploy Web App and Mattermost to Railway

## ✅ Completed: GitHub Commits
All code changes have been committed and pushed to: https://github.com/Abelhubprog/xHandyWriterz

Latest commits:
- `3c57824` - Refactor: Admin layout with improved navigation, dark mode, and quick links
- `0ce18ea` - Fix: Web app Railway deployment configuration
- `283b3c1` - Add nixpacks.toml for Railway deployment
- `37d872a` - Fix: Replace Vite preview with production HTTP server

---

## 🚀 DEPLOY WEB APP

### Step 1: Connect Railway Service to GitHub

**Important**: The Railway web service must deploy from GitHub, not from local file uploads, to ensure it uses the latest code.

#### Via Railway Dashboard (RECOMMENDED):
1. Open Railway Dashboard: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click on the **"web"** service
3. Go to **Settings** tab
4. Under **Source** section:
   - Click "Connect Repo" or "Change Source"
   - Select GitHub repository: **Abelhubprog/xHandyWriterz**
   - Set **Root Directory**: `apps/web`
   - Set **Branch**: `main`
   - Enable **Auto Deploy** on push
5. Click **Save**

#### Via Railway CLI (if available):
```bash
cd d:/HandyWriterzNEW/apps/web
railway link
# Select your project and web service
railway service --repo Abelhubprog/xHandyWriterz --root apps/web
```

### Step 2: Set Environment Variables

The web service needs these environment variables. Set them in Railway Dashboard → web service → Variables:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c29vdGhpbmctYmVhY29uLTMwLmNsZXJrLmFjY291bnRzLmRldiQ

# Strapi CMS Connection
VITE_CMS_URL=https://handywriterz-production-production.up.railway.app
VITE_CMS_TOKEN=<your-strapi-api-token-here>

# Optional: Mattermost (if available)
VITE_MATTERMOST_URL=<your-mattermost-url-when-deployed>

# Server Configuration
PORT=4173
NODE_ENV=production
```

**To get VITE_CMS_TOKEN**:
1. Login to Strapi: https://handywriterz-production-production.up.railway.app/admin
2. Go to Settings → API Tokens → Create new API Token
3. Name: "Web App Token"
4. Token type: "Full access"
5. Duration: "Unlimited"
6. Copy the token immediately (only shown once!)

### Step 3: Trigger Deployment

After connecting GitHub and setting variables:
1. Railway will automatically deploy from GitHub
2. Or manually trigger: **Settings** → **Redeploy**

### Step 4: Verify Deployment

```bash
# Check deployment logs
cd d:/HandyWriterzNEW/apps/web
railway logs -n 50
```

Look for:
- ✅ `Starting server on port 4173`
- ✅ `Server is ready and listening`
- ❌ No "xdg-open" or "vite preview" errors

### Step 5: Test the Web App

Visit your Railway domain (check Railway Dashboard → web service → Settings → Domains):
- Test homepage loads
- Test sign-in with Clerk
- Test dashboard access
- Test Strapi content loads (services/articles pages)
- Test admin panel (requires editor/admin role in Clerk)

---

## 🚀 DEPLOY MATTERMOST

Mattermost requires PostgreSQL database and R2 storage configuration.

### Architecture Decision Required

Before deploying Mattermost, you need to decide on the architecture:

#### Option A: Docker Compose on Railway
- Deploy Mattermost as a Docker service
- Requires: Railway Docker service + PostgreSQL database
- More control over configuration
- Better for custom integrations

#### Option B: Managed Mattermost
- Use Mattermost Cloud or third-party hosting
- Simpler to manage
- Less configuration required
- Monthly subscription cost

### Recommended: Option A - Railway Docker Deployment

#### Step 1: Prepare Mattermost Configuration

The Mattermost config is ready in: `apps/mattermost/config/mattermost.json`

Key settings already configured:
- PostgreSQL connection
- S3 (Cloudflare R2) file storage
- OIDC placeholders for Clerk SSO

#### Step 2: Create Railway Service for Mattermost

```bash
cd d:/HandyWriterzNEW/apps/mattermost
railway service create mattermost
railway link
# Select the mattermost service
```

#### Step 3: Create Dockerfile for Mattermost

Create `apps/mattermost/Dockerfile`:
```dockerfile
FROM mattermost/mattermost-team-edition:latest

# Copy custom configuration
COPY config/mattermost.json /mattermost/config/config.json

# Set environment variables
ENV MM_CONFIG=/mattermost/config/config.json
ENV MM_SQLSETTINGS_DATASOURCE=${DATABASE_URL}
ENV MM_FILESETTINGS_AMAZONS3ACCESSKEYID=${R2_ACCESS_KEY_ID}
ENV MM_FILESETTINGS_AMAZONS3SECRETACCESSKEY=${R2_SECRET_ACCESS_KEY}

# Expose port
EXPOSE 8065

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s \
  CMD wget -q --spider http://localhost:8065/api/v4/system/ping || exit 1

# Start Mattermost
CMD ["/mattermost/bin/mattermost"]
```

#### Step 4: Set Mattermost Environment Variables

In Railway Dashboard → mattermost service → Variables:

```bash
# Database (Create PostgreSQL service first)
DATABASE_URL=<postgresql-connection-string>

# Cloudflare R2 Storage
R2_ACCESS_KEY_ID=<your-r2-access-key>
R2_SECRET_ACCESS_KEY=<your-r2-secret-key>
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET=mattermost-uploads

# Mattermost Configuration
MM_SERVICESETTINGS_SITEURL=https://<your-mattermost-railway-domain>
MM_SERVICESETTINGS_ENABLEOAUTHSERVICEPROVIDER=true

# Clerk OIDC (for SSO) - To be configured
# MM_GITLABSETTINGS_ENABLE=false
# MM_OFFICE365SETTINGS_ENABLE=false

# Admin Account
MM_ADMIN_USERNAME=admin
MM_ADMIN_PASSWORD=<secure-password>
MM_ADMIN_EMAIL=admin@handywriterz.com
```

#### Step 5: Create PostgreSQL Database for Mattermost

Option 1: Use Railway PostgreSQL service
```bash
railway service create postgres-mattermost
```

Option 2: Use Strapi's existing PostgreSQL (NOT RECOMMENDED - separate concerns)

#### Step 6: Deploy Mattermost

```bash
cd d:/HandyWriterzNEW/apps/mattermost
railway up --detach
```

#### Step 7: Verify Mattermost Deployment

```bash
railway logs -n 50
```

Look for:
- ✅ `Server is listening on :8065`
- ✅ `Started Server`
- ✅ Database migrations completed

#### Step 8: Initial Mattermost Setup

1. Visit Mattermost URL (check Railway Dashboard → mattermost service → Settings → Domains)
2. Create admin account (if not auto-created)
3. Create team: "HandyWriterz"
4. Create channels:
   - General
   - Support
   - Orders
   - Notifications

#### Step 9: Connect Mattermost to Web App

After Mattermost is running:
1. Get the Mattermost URL from Railway
2. Update web service environment variable:
   ```
   VITE_MATTERMOST_URL=https://<mattermost-railway-domain>
   ```
3. Redeploy web service to pick up the new variable

---

## 🔗 INTEGRATION: Connect All Services

### Strapi ← Web App
✅ Already configured (VITE_CMS_URL + VITE_CMS_TOKEN)

### Mattermost ← Web App
1. Set `VITE_MATTERMOST_URL` in web service
2. Implement SSO bridge (Clerk → Mattermost OIDC)

### Strapi → Mattermost
1. Configure Strapi webhooks
2. Send publish notifications to Mattermost channels

### Upload Worker (if deploying file sharing)
1. Create Railway service for `workers/upload-broker`
2. Set R2 credentials
3. Set `VITE_UPLOAD_BROKER_URL` in web service

---

## 📋 POST-DEPLOYMENT CHECKLIST

### Web App
- [ ] Can access homepage
- [ ] Can sign in with Clerk
- [ ] Dashboard loads after sign-in
- [ ] Services page loads content from Strapi
- [ ] Admin panel accessible (for admin/editor roles)
- [ ] Admin panel shows Strapi quick link
- [ ] No console errors

### Strapi
- [ ] Admin login works
- [ ] Content types exist (Service, Article)
- [ ] API token generated for web app
- [ ] Media uploads to R2 working
- [ ] GraphQL endpoint accessible

### Mattermost
- [ ] Can access Mattermost URL
- [ ] Admin account works
- [ ] Team and channels created
- [ ] Can send messages
- [ ] File uploads working (to R2)

### Integration
- [ ] Web app loads Strapi content
- [ ] Admin panel links to Strapi admin
- [ ] Mattermost iframe (or native client) in web app
- [ ] Upload broker (if deployed) presigns R2 URLs

---

## 🐛 TROUBLESHOOTING

### Web App Still Shows "xdg-open" Error

**Cause**: Railway is using cached build or old code

**Solutions**:
1. Ensure service is connected to GitHub (not using `railway up`)
2. Check `package.json` has `"start": "node scripts/server.mjs"`
3. Force redeploy: Railway Dashboard → Settings → Redeploy
4. Check build logs for `pnpm run build` success

### Web App Shows "Cannot connect to CMS"

**Cause**: Missing or incorrect `VITE_CMS_URL` or `VITE_CMS_TOKEN`

**Solutions**:
1. Verify environment variables are set
2. Generate new API token in Strapi if needed
3. Check Strapi is running and accessible
4. Test Strapi API: `curl https://<strapi-url>/api/services`

### Mattermost Won't Start

**Cause**: Missing database or R2 credentials

**Solutions**:
1. Verify PostgreSQL database is running
2. Check `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
3. Verify R2 credentials are correct
4. Check Mattermost logs: `railway logs -n 100`

### Admin Panel Access Denied

**Cause**: User doesn't have admin/editor role in Clerk

**Solutions**:
1. Login to Clerk Dashboard
2. Go to Users → Select user
3. Edit public metadata:
   ```json
   {
     "role": "admin"
   }
   ```
4. Save and refresh web app

---

## 📚 RELATED DOCUMENTATION

- Web deployment status: `WEB_DEPLOYMENT_STATUS.md`
- Strapi proxy fix: `RAILWAY_PROXY_FIX_FINAL.md`
- Admin checklist: `POST_LOGIN_CHECKLIST.md`
- Architecture overview: `docs/intel.md`
- Data flows: `docs/dataflow.md`

---

## 🎯 SUCCESS CRITERIA

### Phase 1: Core Services Running
- ✅ Strapi deployed and accessible
- ⏳ Web app deployed from GitHub
- ⏳ Mattermost deployed (optional but recommended)

### Phase 2: Integration Working
- ⏳ Web app fetches content from Strapi
- ⏳ Admin panel provides quick links to Strapi
- ⏳ Messaging accessible via Mattermost embed

### Phase 3: Production Ready
- ⏳ All environment variables documented
- ⏳ SSL certificates configured
- ⏳ Custom domains configured (optional)
- ⏳ Backups configured for databases
- ⏳ Monitoring and logging set up

---

**Last Updated**: October 3, 2025
**Status**: Ready to deploy web app from GitHub; Mattermost configuration prepared
