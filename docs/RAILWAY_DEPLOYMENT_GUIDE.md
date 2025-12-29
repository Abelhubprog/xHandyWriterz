# Railway Deployment Guide - HandyWriterz

## 🚂 Quick Railway Deployment

### Prerequisites
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
```

---

## 1️⃣ Deploy Web App (Main SPA)

```bash
# Create new project
cd apps/web
railway init

# Link to project
railway link

# Add environment variables
railway variables set VITE_CLERK_PUBLISHABLE_KEY="pk_test_your-key"
railway variables set VITE_APP_URL="https://your-app.railway.app"

# Optional: Disable features initially
railway variables set VITE_ENABLE_FILE_UPLOAD="false"
railway variables set VITE_ENABLE_MESSAGING="false"
railway variables set VITE_ENABLE_STRAPI_CONTENT="false"

# Deploy
railway up

# Get domain
railway domain
# Note: Save this URL!
```

**Build Configuration in Railway Dashboard:**
- Build Command: `pnpm install && pnpm run build`
- Start Command: `pnpm run preview`
- Root Directory: `/apps/web`

---

## 2️⃣ Deploy Strapi CMS (Optional but Recommended)

```bash
# Create new Railway project
cd apps/strapi
railway init

# Add PostgreSQL database
railway add postgresql

# Set environment variables
railway variables set NODE_ENV="production"
railway variables set HOST="0.0.0.0"
railway variables set PORT="1337"

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
API_TOKEN_SALT=$(openssl rand -base64 32)
APP_KEY1=$(openssl rand -base64 32)
APP_KEY2=$(openssl rand -base64 32)
APP_KEY3=$(openssl rand -base64 32)
APP_KEY4=$(openssl rand -base64 32)

railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set ADMIN_JWT_SECRET="$ADMIN_JWT_SECRET"
railway variables set API_TOKEN_SALT="$API_TOKEN_SALT"
railway variables set APP_KEYS="$APP_KEY1,$APP_KEY2,$APP_KEY3,$APP_KEY4"

# Database URL (automatic from Railway PostgreSQL)
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'

# R2 Configuration (after setting up Cloudflare R2)
railway variables set R2_ACCESS_KEY_ID="your-access-key"
railway variables set R2_SECRET_ACCESS_KEY="your-secret-key"
railway variables set R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
railway variables set R2_BUCKET_MEDIA="handywriterz-cms"
railway variables set R2_REGION="auto"
railway variables set R2_PUBLIC_BASE="https://your-r2-public-url"

# Deploy
railway up

# Get domain
railway domain
# Note: This is your STRAPI_URL
```

**After Deployment:**
1. Access Strapi admin: `https://your-strapi.railway.app/admin`
2. Create first admin account
3. Go to Settings → API Tokens → Create Token
4. Copy token and add to web app:
   ```bash
   cd ../../apps/web
   railway variables set VITE_CMS_URL="https://your-strapi.railway.app"
   railway variables set VITE_CMS_TOKEN="your-token-here"
   railway variables set VITE_ENABLE_STRAPI_CONTENT="true"
   ```

---

## 3️⃣ Deploy Mattermost (Optional)

```bash
cd apps/mattermost
railway init

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set MM_SERVICESETTINGS_SITEURL='https://${{RAILWAY_STATIC_URL}}'
railway variables set MM_SQLSETTINGS_DRIVERNAME="postgres"
railway variables set MM_SQLSETTINGS_DATASOURCE='${{Postgres.DATABASE_URL}}'

# R2 Storage for Mattermost
railway variables set MM_FILESETTINGS_DRIVERNAME="amazons3"
railway variables set MM_FILESETTINGS_AMAZONS3ACCESSKEYID="your-r2-access-key"
railway variables set MM_FILESETTINGS_AMAZONS3SECRETACCESSKEY="your-r2-secret"
railway variables set MM_FILESETTINGS_AMAZONS3BUCKET="handywriterz-chat"
railway variables set MM_FILESETTINGS_AMAZONS3ENDPOINT="your-account.r2.cloudflarestorage.com"
railway variables set MM_FILESETTINGS_AMAZONS3REGION="auto"
railway variables set MM_FILESETTINGS_AMAZONS3SSL="true"

# Deploy with Docker
railway up --dockerfile

# Get domain
railway domain
```

**Update Web App:**
```bash
cd ../../apps/web
railway variables set VITE_MATTERMOST_URL="https://your-mattermost.railway.app"
railway variables set VITE_ENABLE_MESSAGING="true"
```

---

## 4️⃣ Deploy Upload Broker (Cloudflare Worker)

```bash
cd workers/upload-broker

# Login to Cloudflare
wrangler login

# Create R2 bucket
wrangler r2 bucket create handywriterz-uploads

# Set secrets
wrangler secret put S3_ACCESS_KEY_ID
# Enter your R2 access key when prompted

wrangler secret put S3_SECRET_ACCESS_KEY
# Enter your R2 secret key when prompted

wrangler secret put S3_BUCKET
# Enter: handywriterz-uploads

wrangler secret put S3_ENDPOINT
# Enter: https://your-account.r2.cloudflarestorage.com

wrangler secret put S3_REGION
# Enter: auto

# Deploy worker
wrangler deploy

# Note the deployed URL (e.g., https://upload-broker.your-name.workers.dev)
```

**Update Web App:**
```bash
cd ../../apps/web
railway variables set VITE_UPLOAD_BROKER_URL="https://upload-broker.your-name.workers.dev"
railway variables set VITE_ENABLE_FILE_UPLOAD="true"
```

---

## 5️⃣ Configure Cloudflare R2 Storage

### Create R2 Buckets:
```bash
wrangler r2 bucket create handywriterz-cms        # For Strapi media
wrangler r2 bucket create handywriterz-uploads   # For user uploads
wrangler r2 bucket create handywriterz-chat      # For Mattermost attachments
```

### Create API Token:
1. Go to Cloudflare Dashboard
2. Navigate to R2 → Manage R2 API Tokens
3. Create new API token with Read & Write permissions
4. Copy Access Key ID and Secret Access Key
5. Use these in all service configurations above

### Configure Public Access (Optional):
```bash
# For CMS media to be publicly accessible
wrangler r2 bucket cors put handywriterz-cms \
  --allow-origin "*" \
  --allow-methods GET,HEAD \
  --max-age 3600

# Configure custom domain for public URLs (optional)
# Go to R2 bucket → Settings → Custom Domain
# Add: cdn.your-domain.com
```

---

## 6️⃣ Final Web App Configuration

```bash
cd apps/web

# Verify all variables are set
railway variables

# Should see:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
# VITE_APP_URL=https://your-app.railway.app
# VITE_CMS_URL=https://your-strapi.railway.app
# VITE_CMS_TOKEN=your-token
# VITE_UPLOAD_BROKER_URL=https://upload-broker.xxx.workers.dev
# VITE_MATTERMOST_URL=https://your-mattermost.railway.app
# VITE_ENABLE_FILE_UPLOAD=true
# VITE_ENABLE_MESSAGING=true
# VITE_ENABLE_STRAPI_CONTENT=true

# Redeploy with all services enabled
railway up
```

---

## 🎯 Verification Checklist

### After Deployment:

- [ ] **Web App is accessible**
  - Visit your Railway domain
  - Verify homepage loads
  - Check dark mode toggle works

- [ ] **Authentication works**
  - Sign up new user
  - Sign in
  - Access dashboard
  - Verify Clerk session persists

- [ ] **Admin access works**
  - Go to `/auth/admin-login`
  - Sign in with admin account
  - Verify redirect to `/admin`
  - Check admin dashboard loads

- [ ] **File uploads work** (if enabled)
  - Go to dashboard
  - Upload a test file
  - Verify success message
  - Check R2 bucket for file

- [ ] **Messaging works** (if enabled)
  - Access `/dashboard/messages`
  - Verify Mattermost iframe loads
  - Or use Email Admin at `/dashboard/email-admin`

- [ ] **Content pages work** (if enabled)
  - Visit `/services`
  - Check services load from Strapi
  - Verify images display
  - Test service detail pages

---

## 🔧 Troubleshooting

### Web App Won't Build:
```bash
# Check build logs
railway logs

# Common issues:
# 1. Missing Clerk key → Add VITE_CLERK_PUBLISHABLE_KEY
# 2. TypeScript errors → Run locally: pnpm run type-check
# 3. Missing dependencies → Ensure pnpm-workspace.yaml is correct
```

### Strapi Won't Start:
```bash
# Check Strapi logs
railway logs --service strapi

# Common issues:
# 1. Database not connected → Check DATABASE_URL
# 2. Missing secrets → Verify APP_KEYS, JWT_SECRET
# 3. R2 issues → Test credentials with Cloudflare CLI
```

### Upload Broker Fails:
```bash
# Check worker logs
wrangler tail upload-broker

# Common issues:
# 1. Wrong R2 credentials → Rotate and update secrets
# 2. Bucket doesn't exist → Create with wrangler r2 bucket create
# 3. CORS errors → Check worker CORS headers
```

### Mattermost Won't Connect:
```bash
# Check Mattermost logs
railway logs --service mattermost

# Common issues:
# 1. Database not connected → Check PostgreSQL URL
# 2. R2 storage failed → Verify S3 compatibility settings
# 3. SSL/TLS errors → Ensure AMAZONS3SSL=true
```

---

## 💰 Cost Breakdown

### Railway:
- Hobby Plan: $5/month (includes $5 usage credit)
- Web App: ~$5/month
- Strapi + PostgreSQL: ~$10/month
- Mattermost + PostgreSQL: ~$10/month
- **Total: ~$30/month**

### Cloudflare:
- Workers: 100,000 req/day FREE, then $0.50/million
- R2 Storage: First 10GB FREE, then $0.015/GB
- R2 Operations: Class A: $4.50/million, Class B: $0.36/million
- **Total: ~$0-5/month for small traffic**

### Clerk:
- Free Tier: 10,000 MAU
- Upgrade: $25/month for Pro
- **Total: $0 (free tier)**

**Grand Total: ~$30-40/month** for complete platform

---

## 📞 Support

### Railway Issues:
- Dashboard: https://railway.app/dashboard
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

### Cloudflare Issues:
- Dashboard: https://dash.cloudflare.com
- Community: https://community.cloudflare.com
- Docs: https://developers.cloudflare.com

### Clerk Issues:
- Dashboard: https://dashboard.clerk.com
- Support: https://clerk.com/support
- Docs: https://clerk.com/docs

---

## 🎉 Success!

Once all services are deployed:

1. **Set admin roles in Clerk**
2. **Test all user flows**
3. **Configure custom domains**
4. **Set up monitoring**
5. **Go live! 🚀**

Your platform is now fully deployed and ready for users!
