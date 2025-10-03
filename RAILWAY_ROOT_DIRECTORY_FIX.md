# Railway Root Directory Fix

## Problem
Railway deployment failing with:
```
ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
```

## Root Cause
- Railway Root Directory set to `apps/web/`
- Build context only includes `apps/web/*` files
- Missing `pnpm-lock.yaml` and `pnpm-workspace.yaml` from repo root
- Missing other workspace packages needed for dependencies

## Solution: Change Railway Root Directory to Repository Root

### Step 1: Update Railway Service Configuration

1. Open Railway Dashboard: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click on **web** service
3. Go to **Settings** → **Source**
4. In **Root Directory** field, **CLEAR IT** (leave blank or set to `/`)
5. Click **Save**

### Step 2: Verify Configuration Files

The following files have been created/updated to handle monorepo build from root:

**`apps/web/railway.json`** (NEW):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "apps/web/nixpacks.toml",
    "watchPatterns": [
      "apps/web/**"
    ]
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "cd apps/web && pnpm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**`apps/web/nixpacks.toml`** (UPDATED):
- Install runs at repo root: `pnpm install --frozen-lockfile`
- Build runs in web directory: `cd apps/web && pnpm run build`
- Start runs in web directory: `cd apps/web && pnpm run start`

### Step 3: Commit and Push

```bash
cd d:/HandyWriterzNEW
git add apps/web/railway.json apps/web/nixpacks.toml RAILWAY_ROOT_DIRECTORY_FIX.md
git commit -m "fix: Configure Railway for monorepo build from root

- Add railway.json to specify nixpacks config path
- Update nixpacks.toml to run commands from correct directories
- Install at root (access to pnpm-lock.yaml and workspace)
- Build and start in apps/web directory
- Fixes ERR_PNPM_NO_LOCKFILE error"
git push xhandy main
```

### Step 4: Verify Deployment

After Railway auto-deploys from GitHub:

1. Check Railway logs: `railway logs -n 50`
2. Look for success indicators:
   - ✅ `pnpm install --frozen-lockfile` succeeds
   - ✅ `pnpm run build` completes
   - ✅ `Starting server on port 4173`
   - ❌ No "pnpm-lock.yaml is absent" error

3. Test the deployed app:
   - Get URL from Railway Dashboard → web service → Settings → Domains
   - Visit URL and verify homepage loads
   - Test authentication and dashboard

## Why This Works

**Before (Root Directory = `apps/web/`):**
```
Railway Build Context:
/app/
├── src/
├── public/
├── package.json
├── nixpacks.toml
└── (no pnpm-lock.yaml!)  ❌
```

**After (Root Directory = `/` or blank):**
```
Railway Build Context:
/app/
├── pnpm-lock.yaml        ✅
├── pnpm-workspace.yaml   ✅
├── package.json
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── package.json
│   │   └── nixpacks.toml
│   ├── strapi/
│   └── mattermost/
└── workers/
```

## Alternative Solution (If You Must Keep Root Directory)

If you want to keep `apps/web` as root directory, you would need to:

1. Copy `pnpm-lock.yaml` into `apps/web/` (breaks monorepo pattern)
2. Remove workspace dependencies (major refactor)
3. Make web app standalone (loses shared code benefits)

**Not recommended** - defeats the purpose of monorepo structure.

## Next Steps

1. Clear Railway Root Directory (set to blank)
2. Commit the new configuration files
3. Push to GitHub
4. Railway will auto-deploy with correct build context
5. Verify deployment succeeds

## Troubleshooting

### If build still fails:
- Check Railway logs for specific error
- Verify `railway.json` is in `apps/web/` directory
- Verify `nixpacksConfigPath` points to correct location
- Check that all workspace dependencies are declared in root `package.json`

### If app starts but crashes:
- Verify `cd apps/web` command works in start script
- Check that `dist/` directory exists after build
- Verify environment variables are set (VITE_* vars)

## References

- Railway Nixpacks Documentation: https://nixpacks.com/docs
- Railway Monorepo Guide: https://docs.railway.app/guides/monorepo
- pnpm Workspace: https://pnpm.io/workspaces
