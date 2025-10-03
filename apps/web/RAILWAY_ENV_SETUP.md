# Web App Environment Variables for Railway

## Critical Variables (Required for Deployment)

### Already Set ✅
- `VITE_CMS_URL=https://handywriterz-production-production.up.railway.app` - Strapi CMS backend
- `VITE_APP_URL=https://web-production.up.railway.app` - Web app public URL
- `VITE_API_URL=https://web-production.up.railway.app/api` - API endpoint

### Required - Need to Set 🔴

#### Clerk Authentication (CRITICAL - App won't work without this)
```bash
railway variables --service web --set VITE_CLERK_PUBLISHABLE_KEY="pk_live_xxx_or_pk_test_xxx"
```
**Where to get**: https://dashboard.clerk.com → Your App → API Keys → Publishable key

#### Optional but Recommended
```bash
# Strapi API Token (for admin features)
railway variables --service web --set VITE_CMS_TOKEN="your_strapi_api_token"

# Mattermost Integration
railway variables --service web --set VITE_MATTERMOST_URL="https://mattermost.railway.app"

# Upload Broker Worker
railway variables --service web --set VITE_UPLOAD_BROKER_URL="https://upload-broker.workers.dev"
```

## Feature Flags (Optional - Have Defaults)
```bash
railway variables --service web --set VITE_ENABLE_PUBLIC_ACCESS=true
railway variables --service web --set VITE_ENABLE_ADMIN_DASHBOARD=true
railway variables --service web --set VITE_ENABLE_TURNITIN=true
```

## Current Status

### Working:
- ✅ Strapi CMS connectivity configured
- ✅ App URL configured
- ✅ Build configuration ready
- ✅ Preview script fixed (xdg-open error handled)

### Needs Configuration:
- ⛔ Clerk authentication keys (CRITICAL)
- ⛔ Strapi API token (for admin features)
- ⛔ Mattermost URL (for messaging)
- ⛔ Upload broker URL (for file uploads)

## Deployment Commands

### Deploy Now (with current config):
```bash
cd apps/web
railway up --service web --detach
```

### Check Logs:
```bash
railway logs --service web -n 50
```

### Check Status:
```bash
railway status --service web
```

## Next Steps

1. **Get Clerk Key**: Visit Clerk dashboard and copy publishable key
2. **Set Clerk Key**: Run the railway variables command above
3. **Generate Strapi Token**: Login to Strapi admin → Settings → API Tokens → Create
4. **Deploy**: Run `railway up --service web --detach`
5. **Verify**: Check logs and visit the web app URL
