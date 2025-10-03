# 🚀 IMMEDIATE NEXT STEPS - Deploy Web App & Mattermost

## ✅ What's Done
1. All code committed to GitHub: https://github.com/Abelhubprog/xHandyWriterz
2. Strapi is LIVE: https://handywriterz-production-production.up.railway.app ✅
3. Web app code is ready with:
   - Production HTTP server (no xdg-open error)
   - Improved admin layout with Strapi/Mattermost quick links
   - Clerk authentication integration
   - Strapi content fetching
4. Mattermost configuration is prepared in `apps/mattermost/`

## 🎯 YOUR ACTION: Deploy Web App

### Step 1: Connect Railway to GitHub (5 minutes)

**The web app is currently failing because Railway is using cached builds from local uploads. It MUST deploy from GitHub instead.**

1. **Open Railway Dashboard**: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006

2. **Click on "web" service**

3. **Go to Settings → Source**:
   - Click "Connect Repo" or "Change Source"
   - Select: **Abelhubprog/xHandyWriterz**
   - Root Directory: **apps/web**
   - Branch: **main**
   - ✅ Enable "Deploy on Push"

4. **Click Save**

### Step 2: Set Environment Variables (3 minutes)

Still in Railway Dashboard → web service → **Variables** tab:

```bash
# Required - Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c29vdGhpbmctYmVhY29uLTMwLmNsZXJrLmFjY291bnRzLmRldiQ

# Required - Strapi CMS
VITE_CMS_URL=https://handywriterz-production-production.up.railway.app

# Required - Get this from Strapi (see below)
VITE_CMS_TOKEN=<PASTE_TOKEN_HERE>

# Optional - Server port
PORT=4173

# Optional - Environment
NODE_ENV=production
```

#### Get VITE_CMS_TOKEN:
1. Login to Strapi: https://handywriterz-production-production.up.railway.app/admin
   - Email: `abelngeno1@gmail.com`
   - Password: `dunnyYOH#9` (CHANGE THIS IMMEDIATELY!)
2. Settings → API Tokens → Create new API Token
3. Name: "Web App Production"
4. Type: "Full access"
5. Duration: "Unlimited"
6. **COPY THE TOKEN** (only shown once!)
7. Paste into Railway Variables

### Step 3: Deploy (1 minute)

After connecting GitHub and setting variables:
- Railway will automatically deploy
- OR click **Settings** → **Redeploy**

### Step 4: Verify (2 minutes)

Check Railway logs:
```bash
cd d:/HandyWriterzNEW/apps/web
railway logs -n 50
```

✅ Should see:
- `Starting server on port 4173`
- `Server is ready and listening`

❌ Should NOT see:
- `vite preview`
- `xdg-open ENOENT`

### Step 5: Test (5 minutes)

Visit your Railway web app domain:
1. Homepage loads ✓
2. Click "Sign In" → Clerk login works ✓
3. After login → Dashboard appears ✓
4. Navigate to "Services" → Content from Strapi loads ✓
5. If you have admin role → Admin panel accessible ✓

---

## 🚀 OPTIONAL: Deploy Mattermost

**Only do this after the web app is working!**

See detailed instructions in: **DEPLOY_WEB_AND_MATTERMOST.md**

Quick overview:
1. Create PostgreSQL database for Mattermost
2. Create Railway service for Mattermost
3. Create Dockerfile (template provided in docs)
4. Set environment variables (DB, R2, admin credentials)
5. Deploy with `railway up`
6. Update web app with `VITE_MATTERMOST_URL`

---

## 🐛 If Web App Still Fails

### Issue: Still seeing "xdg-open" error

**Cause**: Railway not deploying from GitHub

**Fix**:
1. Double-check GitHub is connected (Step 1)
2. Make sure Root Directory is set to `apps/web`
3. Click "Redeploy" button in Railway Dashboard
4. Wait 2-3 minutes for build to complete

### Issue: "Cannot connect to CMS"

**Cause**: Missing API token

**Fix**:
1. Generate API token in Strapi (see Step 2)
2. Add to Railway Variables as `VITE_CMS_TOKEN`
3. Redeploy web service

### Issue: Admin panel shows "Access Denied"

**Cause**: Your Clerk user doesn't have admin role

**Fix**:
1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Find your user
3. Edit Public Metadata:
   ```json
   {
     "role": "admin"
   }
   ```
4. Save and refresh web app

---

## 📋 SUCCESS CHECKLIST

Web App Deployment:
- [ ] Railway web service connected to GitHub (**CRITICAL**)
- [ ] Environment variables set (Clerk, Strapi URL, Strapi Token)
- [ ] Deployment successful (no xdg-open error)
- [ ] Homepage accessible
- [ ] Sign-in with Clerk works
- [ ] Dashboard loads after login
- [ ] Services page shows Strapi content
- [ ] Admin panel accessible (if admin role)

Strapi (Already Done):
- [x] Strapi deployed and running
- [x] Admin login works
- [x] API token generated for web app

Mattermost (Optional):
- [ ] PostgreSQL database created
- [ ] Mattermost service deployed
- [ ] Can access Mattermost URL
- [ ] Web app updated with Mattermost URL

---

## 📚 Documentation Reference

- **Full deployment guide**: `DEPLOY_WEB_AND_MATTERMOST.md`
- **Current web status**: `WEB_DEPLOYMENT_STATUS.md`
- **Strapi fix history**: `RAILWAY_PROXY_FIX_FINAL.md`
- **Post-login tasks**: `POST_LOGIN_CHECKLIST.md`

---

## ⏱️ Time Estimate

- Web app deployment: **15 minutes**
  - Connect GitHub: 5 min
  - Set variables: 3 min
  - Deploy & verify: 7 min

- Mattermost deployment: **30 minutes** (optional)
  - Setup database: 10 min
  - Configure & deploy: 15 min
  - Test & verify: 5 min

---

**START HERE**: Step 1 - Connect Railway to GitHub ⬆️

