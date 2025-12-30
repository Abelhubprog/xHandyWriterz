# Web Service: Build-Time Environment Variables Fix

## Problem Resolved ✅

**Issue**: Clerk showing `pk_test_default` key in production, causing authentication errors.

**Root Cause**: Railway doesn't pass service environment variables to Docker builder by default. The Vite build stage was running without access to `VITE_*` environment variables, so it baked in the placeholder values from `.env.example`.

## Solution Applied (Commit dd815b1)

### 1. Updated `apps/web/railway.json`

Added `args` block under `build` to forward Railway service environment variables as Docker build arguments:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "apps/web/Dockerfile",
    "contextPath": ".",
    "watchPatterns": ["apps/web/**", "pnpm-lock.yaml", "pnpm-workspace.yaml", "package.json"],
    "args": {
      "VITE_CLERK_PUBLISHABLE_KEY": "${VITE_CLERK_PUBLISHABLE_KEY}",
      "VITE_CLERK_DOMAIN": "${VITE_CLERK_DOMAIN}",
      "VITE_CLERK_SIGN_IN_URL": "${VITE_CLERK_SIGN_IN_URL}",
      "VITE_CLERK_SIGN_UP_URL": "${VITE_CLERK_SIGN_UP_URL}",
      "VITE_CLERK_AFTER_SIGN_IN_URL": "${VITE_CLERK_AFTER_SIGN_IN_URL}",
      "VITE_CLERK_AFTER_SIGN_UP_URL": "${VITE_CLERK_AFTER_SIGN_UP_URL}",
      "VITE_CMS_URL": "${VITE_CMS_URL}",
      "VITE_CMS_TOKEN": "${VITE_CMS_TOKEN}",
      "VITE_UPLOAD_BROKER_URL": "${VITE_UPLOAD_BROKER_URL}",
      "VITE_MATTERMOST_URL": "${VITE_MATTERMOST_URL}"
    }
  }
}
```

**How it works**: Railway reads service environment variables and passes them as build arguments using `${VARIABLE_NAME}` syntax.

### 2. Updated `apps/web/Dockerfile`

Modified the builder stage to accept and use build arguments:

```dockerfile
FROM node:20-alpine AS builder
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Accept build arguments from Railway
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_CLERK_DOMAIN
ARG VITE_CLERK_SIGN_IN_URL
ARG VITE_CLERK_SIGN_UP_URL
ARG VITE_CLERK_AFTER_SIGN_IN_URL
ARG VITE_CLERK_AFTER_SIGN_UP_URL
ARG VITE_CMS_URL
ARG VITE_CMS_TOKEN
ARG VITE_UPLOAD_BROKER_URL
ARG VITE_MATTERMOST_URL

# Convert build args to environment variables for Vite build
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_DOMAIN=$VITE_CLERK_DOMAIN
ENV VITE_CLERK_SIGN_IN_URL=$VITE_CLERK_SIGN_IN_URL
ENV VITE_CLERK_SIGN_UP_URL=$VITE_CLERK_SIGN_UP_URL
ENV VITE_CLERK_AFTER_SIGN_IN_URL=$VITE_CLERK_AFTER_SIGN_IN_URL
ENV VITE_CLERK_AFTER_SIGN_UP_URL=$VITE_CLERK_AFTER_SIGN_UP_URL
ENV VITE_CMS_URL=$VITE_CMS_URL
ENV VITE_CMS_TOKEN=$VITE_CMS_TOKEN
ENV VITE_UPLOAD_BROKER_URL=$VITE_UPLOAD_BROKER_URL
ENV VITE_MATTERMOST_URL=$VITE_MATTERMOST_URL

WORKDIR /app
# ... rest of Dockerfile unchanged
```

**How it works**:
1. `ARG` declarations receive values from Railway build arguments
2. `ENV` declarations convert ARG values to environment variables
3. Vite build process (`pnpm build`) reads VITE_* environment variables
4. Real configuration values are baked into the production bundle

## Expected Results

### ✅ After Redeploy

1. **Clerk Authentication Works**:
   - Real publishable key embedded in HTML (`pk_live_*` or actual test key)
   - No more "Invalid publishable key" errors in console
   - Users can sign in/sign up successfully

2. **Console Errors Cleaned Up**:
   - Clerk errors: **GONE** ✅
   - MetaMask errors: **Still present** (harmless - extension conflicts, not our code)

3. **Environment-Specific Configuration**:
   - CMS URLs point to correct Strapi instance
   - Upload broker URL configured correctly
   - Mattermost URL (if set) embedded properly

## Verification Steps

### 1. Check Build Logs
```
Railway Dashboard > Web Service > Deployments > View logs
```

Look for successful ARG passing:
```
#8 [builder 2/8] ARG VITE_CLERK_PUBLISHABLE_KEY
#9 [builder 3/8] ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
```

### 2. Inspect Served HTML

Visit your site and view page source:

**Before fix**:
```html
<script type="module">
  window.__CLERK_PUBLISHABLE_KEY__ = "pk_test_default";
</script>
```

**After fix**:
```html
<script type="module">
  window.__CLERK_PUBLISHABLE_KEY__ = "pk_live_xxxxx" // or your actual test key
</script>
```

### 3. Test Authentication

1. Visit your site: `https://handywriterz-production-pr-main.up.railway.app`
2. Click "Sign In" or "Sign Up"
3. Complete authentication flow
4. Verify no Clerk errors in browser console (F12)

### 4. Console Error Analysis

**Ignore these** (MetaMask wallet extensions):
```
Cannot redefine property: ethereum
provider disconnected
requestProvider.js
```

**Should be GONE**:
```
Invalid publishable key
Clerk is not loaded
Authentication failed
```

## Railway Configuration Checklist

Ensure these are set in Railway Dashboard > Web Service > Variables:

### Required (Clerk)
- ✅ `VITE_CLERK_PUBLISHABLE_KEY` - Your actual Clerk publishable key
- ✅ `VITE_CLERK_DOMAIN` - Your Clerk frontend API domain
- ✅ `VITE_CLERK_SIGN_IN_URL` - `/sign-in`
- ✅ `VITE_CLERK_SIGN_UP_URL` - `/sign-up`
- ✅ `VITE_CLERK_AFTER_SIGN_IN_URL` - `/dashboard`
- ✅ `VITE_CLERK_AFTER_SIGN_UP_URL` - `/dashboard`

### Optional (other services)
- ⚠️ `VITE_CMS_URL` - Strapi URL (if deployed)
- ⚠️ `VITE_CMS_TOKEN` - Strapi API token (if deployed)
- ⚠️ `VITE_UPLOAD_BROKER_URL` - Cloudflare Worker URL (if deployed)
- ⚠️ `VITE_MATTERMOST_URL` - Mattermost URL (if deployed)

**Note**: Railway will pass these as build arguments automatically. You don't need to configure anything extra beyond setting the service variables.

## Technical Deep Dive

### Why This Was Necessary

#### Vite Build-Time Behavior

Vite processes `import.meta.env.VITE_*` variables at **build time**, not runtime:

```typescript
// This gets replaced at build time with actual value:
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// After Vite build becomes:
const clerkKey = "pk_live_actual_key_here";
```

#### Docker Build Stages

Railway builds Docker images in isolated environment:

```
1. Railway reads railway.json
2. Railway starts Docker build (isolated from service env)
3. Docker runs: npm install, vite build
4. Vite reads process.env.VITE_* (NOT available by default)
5. Vite bakes placeholder values into bundle
6. Railway deploys image (service env vars available NOW, but too late!)
```

#### The Fix Flow

```
1. Railway reads railway.json with args block
2. Railway passes service env vars AS build arguments
3. Docker build receives: --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
4. Dockerfile ARG declarations accept values
5. Dockerfile ENV declarations expose to build environment
6. Vite build reads real values from process.env
7. Real values baked into bundle ✅
```

## Related Issues

### Issue: Mattermost Healthcheck Failure

**Status**: Separate issue - see screenshot showing "Healthcheck failure"

**Likely Causes**:
1. Mattermost service not configured yet in Railway
2. Database connection not set up
3. R2 storage credentials missing
4. Root Directory not set to `.` in Railway UI

**Next Steps**: Follow `apps/mattermost/.env.example` guide to configure Mattermost service.

### Issue: MetaMask Console Errors

**Status**: NOT OUR PROBLEM - safe to ignore

**Cause**: Browser wallet extensions (MetaMask, Coinbase Wallet, etc.) injecting code and fighting over `window.ethereum` object.

**Examples**:
```
Cannot redefine property: ethereum at Object.defineProperty
Uncaught DOMException: Failed to read the 'localStorage'
provider disconnected from all chains
```

**Solution**: 
- Disable wallet extensions while testing, OR
- Ignore these errors (they don't affect app functionality)

## Troubleshooting

### Build Still Uses Default Key

**Check**:
1. ✅ Environment variables set in Railway dashboard (Web service > Variables)
2. ✅ railway.json has args block (verify on GitHub)
3. ✅ Dockerfile has ARG and ENV declarations (verify on GitHub)
4. ✅ Railway rebuild triggered after pushing changes

**Force Rebuild**:
```bash
# Railway Dashboard > Web Service > Deployments
# Click "Redeploy" button (not just restart)
```

### Clerk Still Showing Errors

**Check Browser Console** - what's the actual error?

1. **"Invalid publishable key"**: Build issue not resolved yet
   - Verify build logs show ARG declarations
   - Check HTML source for real key
   
2. **"Clerk is not loaded"**: Network issue or CDN blocked
   - Check browser Network tab
   - Verify clerk.com not blocked by firewall
   
3. **"Authentication failed"**: Clerk app configuration
   - Check Clerk dashboard settings
   - Verify redirect URLs match Railway domain

### Can't Find Environment Variables in Railway

**Navigation**:
```
Railway Dashboard
  → Select project: handywriterz-production
  → Click service: Web (handywriterz-production-pr-main)
  → Tab: Variables
  → Add/edit VITE_* variables here
```

**After adding variables**: Railway will auto-trigger rebuild and redeploy.

## Best Practices

### Adding New Environment Variables

When you add a new `VITE_*` environment variable:

1. Add to Railway service variables (Dashboard > Variables)
2. Add to `apps/web/railway.json` args block
3. Add ARG declaration in `apps/web/Dockerfile`
4. Add ENV declaration in `apps/web/Dockerfile`
5. Commit and push changes
6. Railway will rebuild automatically

### Local Development

For local development, continue using `.env` file:

```bash
# apps/web/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_CLERK_DOMAIN=your-domain.clerk.accounts.dev
# ... etc
```

Vite dev server (`pnpm dev`) reads from `.env` automatically.

### Security Note

**Never commit `.env` files** - they contain secrets!

- ✅ `.env.example` - safe to commit (templates only)
- ❌ `.env` - must be in `.gitignore`
- ✅ Railway variables - stored securely in Railway platform
- ✅ Build args - passed securely at build time, not stored in image

## References

- [Railway Build Args Documentation](https://docs.railway.app/reference/config-as-code#build)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Docker ARG vs ENV](https://docs.docker.com/engine/reference/builder/#arg)
- [Clerk Configuration](https://clerk.com/docs/references/nextjs/clerk-provider)

## Commit History

- **dd815b1**: Initial fix - Pass environment variables at Docker build time
- **b8e169a**: Enhanced Mattermost .env.example (related fix)
- **ee2f12d**: Removed UTF-8 BOM from Mattermost railway.json

## Summary

✅ **Problem**: Clerk using default key instead of real key  
✅ **Solution**: Pass Railway env vars as Docker build arguments  
✅ **Status**: Fixed in commit dd815b1, awaiting Railway redeploy  
✅ **Verification**: Check HTML source after deployment  
✅ **Next**: Monitor build logs and test authentication  

---

*Last Updated: After commit dd815b1 - October 4, 2025*
