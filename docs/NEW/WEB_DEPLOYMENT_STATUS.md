# Web App Deployment Status

## Current Issue
Railway is using cached build artifacts even after pushing new code to GitHub.

## What We've Done
1. ✅ Fixed `nixpacks.toml` - Changed `nodejs-20_x` to `nodejs_20`
2. ✅ Created production server (`apps/web/scripts/server.mjs`)
3. ✅ Updated `package.json` start script to use production server
4. ✅ Committed all changes to GitHub (xHandyWriterz repository)
5. ❌ Railway still using old `vite preview` command

## Root Cause
When running `railway up`, Railway uploads local files and builds them. However, the build process seems to be using cached dependencies or artifacts from previous builds, specifically:
- The `package.json` with `"start": "vite preview"` instead of `"start": "node scripts/server.mjs"`

## Solution Options

### Option 1: Connect Railway to GitHub (RECOMMENDED)
Instead of using `railway up` to upload files, configure the Railway service to deploy directly from the GitHub repository. This ensures every deployment uses the latest committed code.

**Steps:**
1. Go to Railway Dashboard: https://railway.com/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click on the "web" service
3. Go to Settings → Source
4. Connect to GitHub repository: `Abelhubprog/xHandyWriterz`
5. Set root directory: `apps/web`
6. Set branch: `main`
7. Enable automatic deployments on push

### Option 2: Clear Build Cache
Try to force Railway to rebuild from scratch by:
```bash
# Remove the service and recreate it
railway service delete web
railway service create web
railway link
```

### Option 3: Manual Dockerfile
Create a custom `Dockerfile` in `apps/web` that explicitly defines the build and start commands, bypassing Nixpacks caching.

## Current Configuration

### nixpacks.toml (apps/web)
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "pnpm run start"
```

### package.json scripts (apps/web)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0 --port ${PORT:-4173}",
    "start": "node scripts/server.mjs",
    "type-check": "tsc --noEmit"
  }
}
```

### Server (apps/web/scripts/server.mjs)
- Production HTTP server using Node.js http module
- Serves static files from `dist/` directory
- Handles SPA routing (all routes → index.html)
- No browser auto-open (fixes xdg-open error)

## Environment Variables Needed
```
VITE_CMS_URL=https://handywriterz-production-production.up.railway.app
VITE_CMS_TOKEN=<your-strapi-api-token>
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c29vdGhpbmctYmVhY29uLTMwLmNsZXJrLmFjY291bnRzLmRldiQ
PORT=4173
```

## Next Steps
1. **IMMEDIATE**: Configure Railway to deploy from GitHub repository (Option 1)
2. Test deployment after GitHub connection
3. Verify the production server starts correctly
4. Test that admin dashboard, Strapi integration, and Clerk auth all work

## Repository Info
- GitHub: https://github.com/Abelhubprog/xHandyWriterz
- Branch: main
- Latest commit: 3c57824 (Refactor: Admin layout with improved navigation)
- Web app directory: `apps/web/`
