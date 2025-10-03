# Railway Deployment with Railpack (New Builder)

## ✅ Understanding Railpack

Railway has replaced Nixpacks with **Railpack** as the default builder. Railpack automatically detects your project type and configuration.

**What Railpack needs**:
1. A `start` script in your `package.json`
2. OR a `main` field pointing to your entry file
3. OR an `index.js`/`index.ts` in the root

## 🎯 Our Monorepo Challenge

**Problem**: We have a monorepo with 3 apps:
- `apps/strapi` (Strapi CMS)
- `apps/web` (React frontend)
- `apps/mattermost` (Messaging)

**Railpack's behavior**:
- Detects it's a workspace/monorepo ✅
- But doesn't know which app to start ❌
- Needs explicit start command ❌

## 🔧 Solution: Set Service-Specific Configurations

### Solution 1: Use Railway Dashboard Settings

This is the **EASIEST** way - no code changes needed!

#### For Strapi Service (handywriterz-production):

1. **Go to Railway Dashboard** → Click **handywriterz-production** service
2. **Settings** → **Deploy** section
3. Find **Custom Start Command** field
4. Enter:
   ```bash
   cd apps/strapi && npm run start
   ```
5. Find **Custom Build Command** field (if available)
6. Enter:
   ```bash
   cd apps/strapi && npm run build
   ```
7. **Root Directory**: Leave as `/` (empty or root)
8. Click **Save**

#### For Web Service:

1. **Go to Railway Dashboard** → Click **web** service
2. **Settings** → **Deploy** section
3. Find **Custom Start Command** field
4. Enter:
   ```bash
   cd apps/web && pnpm run start
   ```
5. Find **Custom Build Command** field (if available)
6. Enter:
   ```bash
   cd apps/web && pnpm run build
   ```
7. **Root Directory**: Leave as `/` (empty or root)
8. Click **Save**

### Solution 2: Use Railway Environment Variables

Set these in **Variables** section:

#### For Strapi:
```bash
RAILWAY_RUN_COMMAND=cd apps/strapi && npm run start
RAILWAY_BUILD_COMMAND=cd apps/strapi && npm run build
```

#### For Web:
```bash
RAILWAY_RUN_COMMAND=cd apps/web && pnpm run start
RAILWAY_BUILD_COMMAND=cd apps/web && pnpm run build
```

### Solution 3: Create Root-Level Package.json (Recommended for Monorepo)

This tells Railpack how to handle the workspace:

**Create/Update `package.json` at repository root**:
```json
{
  "name": "handywriterz-monorepo",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "start:strapi": "cd apps/strapi && npm run start",
    "start:web": "cd apps/web && pnpm run start",
    "start:mattermost": "cd apps/mattermost && npm run start",
    "build:strapi": "cd apps/strapi && npm run build",
    "build:web": "cd apps/web && pnpm run build"
  }
}
```

Then in Railway Dashboard:
- **Strapi service**: Start command = `npm run start:strapi`
- **Web service**: Start command = `npm run start:web`

## 🎯 Recommended Approach (Fastest Fix)

**Do this RIGHT NOW in Railway Dashboard**:

### Step 1: Fix Strapi Service
1. Open Railway → **handywriterz-production** service
2. **Settings** → **Deploy** → **Custom Start Command**:
   ```
   cd apps/strapi && npm run start
   ```
3. Save and wait for redeploy

### Step 2: Fix Web Service
1. Open Railway → **web** service
2. **Settings** → **Deploy** → **Custom Start Command**:
   ```
   cd apps/web && pnpm run start
   ```
3. **Also set Build Command**:
   ```
   cd apps/web && pnpm run build
   ```
4. Save and wait for redeploy

## 📊 What Will Happen

### Strapi Service Build:
```
✅ Railpack detects Node.js workspace
✅ Installs dependencies at root
✅ Runs custom build: cd apps/strapi && npm run build
✅ Runs custom start: cd apps/strapi && npm run start
✅ Strapi starts on port 1337
✅ Deploy successful!
```

### Web Service Build:
```
✅ Railpack detects Node.js workspace with pnpm
✅ Installs pnpm@9.15.1 with Corepack
✅ Installs dependencies at root
✅ Runs custom build: cd apps/web && pnpm run build
✅ Runs custom start: cd apps/web && pnpm run start
✅ Server starts on port 4173
✅ Deploy successful!
```

## 🔍 Verify Settings Applied

After setting start commands, check deployment logs:

**Look for**:
```
↳ Running custom start command: cd apps/strapi && npm run start
```

If you see this, it means Railway is using your custom command!

## 🚨 Common Pitfalls

### ❌ Don't set Root Directory to `apps/strapi` or `apps/web`
**Why**: Then Railway can't access the workspace `pnpm-lock.yaml` at root.

**Correct**: Root Directory = `/` (empty), use `cd apps/xxx` in commands.

### ❌ Don't mix package managers
- Strapi uses `npm` (has `package-lock.json`)
- Web uses `pnpm` (has `pnpm-lock.yaml`)
- Use correct manager in each start command!

### ❌ Don't forget to set both Build AND Start commands
Some services need explicit build step before start.

## 🎯 Quick Action Checklist

- [ ] Open Railway Dashboard
- [ ] Strapi service → Settings → Deploy → Custom Start Command = `cd apps/strapi && npm run start`
- [ ] Web service → Settings → Deploy → Custom Start Command = `cd apps/web && pnpm run start`
- [ ] Web service → Settings → Deploy → Custom Build Command = `cd apps/web && pnpm run build`
- [ ] Save and wait for automatic redeployment
- [ ] Check logs to verify custom commands are being used
- [ ] Test both URLs work

## 📱 Screenshot After Fix

Once redeployed, take a screenshot showing:
1. Deployment logs with "Running custom start command"
2. Success message or any new errors
3. The URLs of both services

---

**TL;DR**: Railpack (new builder) needs explicit start commands for monorepos. Go to Railway Dashboard → Each Service → Settings → Deploy → Set "Custom Start Command" to `cd apps/XXX && npm/pnpm run start`. No code changes needed, just Dashboard configuration!
