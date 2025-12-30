# 🚨 URGENT: Fix Railway Login Now (2 Minutes)

## ⚠️ Current Status

**Error**: "Internal Server Error" when logging in
**Root Cause**: `ENABLE_PROXY=true` **NOT SET** in Railway Variables
**Result**: Strapi refuses to set secure cookies, login fails with 500 error

**From Your Logs**:
```
Failed to create admin refresh session – Cannot send secure cookie over unencrypted connection
```

This confirms the proxy trust flag is missing.

---

## ✅ What's Already Done

- ✅ `config/server.ts` has correct proxy configuration (committed)
- ✅ `config/plugins.ts` fixed for build errors (committed)
- ✅ All changes pushed to GitHub (6a2a18a)
- ✅ Railway has auto-deployed latest code

**BUT**: The deployment **doesn't have** `ENABLE_PROXY=true` in environment variables!

---

## 🎯 Fix It Now (2 Minutes)

### Step 1: Add the Missing Environment Variable (30 seconds)

**Go to Railway Dashboard**:
```
https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
```

1. Click **"aHandyWriterz"** service (Strapi)
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. **Variable name**: `ENABLE_PROXY`
5. **Variable value**: `true`
6. Click **"Add"**

**CRITICAL**: Make sure it shows:
```
ENABLE_PROXY=true
```

Railway will **immediately redeploy** (takes ~1-2 minutes).

---

### Step 2: Wait for Redeploy (1-2 minutes)

**Watch the logs**:
```powershell
railway logs --tail
```

**Wait for**:
```
✓ Building...
✓ Deploying...
Server listening on 0.0.0.0:1337
```

**If you see build errors**: The plugins.ts fix should have resolved them, but if not, check that the latest commit (6a2a18a) is deployed.

---

### Step 3: Reset Password Again (30 seconds)

**After the redeploy finishes**, run this **exact command** (single line):

```powershell
railway ssh --project 9e62407b-8aae-4958-b87f-db206b359006 --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d --service 86580b8f-90de-4205-b8b1-52ee9747da96 -- npx strapi admin:reset-user-password --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024"
```

**Expected output**:
```
✔ Successfully reset user's password
```

If you see this, the password is set inside the **live production container**.

---

### Step 4: Login (30 seconds)

**URL**: https://ahandywriterz-production.up.railway.app/admin

**Credentials**:
- **Email**: `abelngeno1@gmail.com`
- **Password**: `TempPassw0rd!2024`

**Expected**: Should redirect to Strapi dashboard (no more 500 error!)

---

### Step 5: Change Password Immediately

1. Click **avatar icon** (top right)
2. Click **"Profile"**
3. Scroll to **"Change password"**
4. Enter:
   - **Current**: `TempPassw0rd!2024`
   - **New**: (your secure password)
   - **Confirm**: (same secure password)
5. Click **"Save"**

---

## 🔍 Why This Will Fix It

### Before (Current - Broken):
```typescript
// server.ts reads:
proxy: env.bool('ENABLE_PROXY', true),  // ← Default is true

// But Railway doesn't have ENABLE_PROXY set
// So env.bool('ENABLE_PROXY', true) returns... true! Wait, what?
```

**The Problem**: Even though the default is `true`, Strapi might not be reading it correctly, OR there's a caching issue where the old deployment without the proxy config is still running.

### After (With Variable Set):
```typescript
// Railway Variables:
ENABLE_PROXY=true

// server.ts reads:
proxy: env.bool('ENABLE_PROXY', true),  // ← Explicitly true from env

// Strapi now KNOWS to trust X-Forwarded-Proto: https
// Issues secure cookies successfully
// Login works! ✅
```

---

## 🆘 If It Still Fails After Step 4

### Error: "User not found"

**Database might be empty**. Create the admin user:

```powershell
railway ssh --project 9e62407b-8aae-4958-b87f-db206b359006 --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d --service 86580b8f-90de-4205-b8b1-52ee9747da96 -- npx strapi admin:create-user --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024" --firstname "Abel" --lastname "Ngeno"
```

Then retry password reset.

---

### Error: Still "Internal Server Error"

**Check what ENABLE_PROXY actually is**:

```powershell
railway run --service 86580b8f-90de-4205-b8b1-52ee9747da96 printenv | Select-String "ENABLE_PROXY"
```

**Should show**:
```
ENABLE_PROXY=true
```

**If empty or false**:
1. Double-check Railway Variables tab shows `ENABLE_PROXY=true`
2. Click "Deploy" button to force redeploy
3. Wait for completion
4. Retry password reset

---

### Error: Build fails with TypeError

**Should be fixed** by the plugins.ts changes (commit d6d8c67), but if you still see:
```
TypeError: Cannot read properties of undefined (reading 'enabled')
```

**Check deployed code**:
```powershell
railway ssh --project 9e62407b-8aae-4958-b87f-db206b359006 --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d --service 86580b8f-90de-4205-b8b1-52ee9747da96 -- head -30 config/plugins.js
```

**Should see** (around line 12-20):
```javascript
...(env('R2_ACCESS_KEY_ID') && env('R2_SECRET_ACCESS_KEY')
  ? { upload: { ... } }
  : {}),
```

**If it doesn't**, the old code is deployed. Force redeploy:
```powershell
railway redeploy --service 86580b8f-90de-4205-b8b1-52ee9747da96
```

---

## 📋 Quick Checklist

Before login attempt:

- [ ] Railway Variables tab shows `ENABLE_PROXY=true`
- [ ] Railway Variables tab shows `URL=https://ahandywriterz-production.up.railway.app`
- [ ] Latest deployment finished successfully (no build errors)
- [ ] Logs show "Server listening on 0.0.0.0:1337"
- [ ] Password reset command succeeded ("✔ Successfully reset user's password")

After successful login:

- [ ] Strapi dashboard loaded
- [ ] Can navigate to Content Manager
- [ ] Password changed to secure permanent password
- [ ] Browser DevTools shows secure cookies (Application → Cookies → `strapi_jwt` has Secure flag)

---

## 🎯 The Bottom Line

**The ONLY thing blocking you** is that `ENABLE_PROXY=true` isn't in Railway's environment variables yet.

**Action**: Go to Railway → Variables → Add `ENABLE_PROXY=true` → Wait for redeploy → Reset password → Login

**Time required**: 2 minutes total

**Expected result**: ✅ Successful login, no more "Internal Server Error"

---

## 📞 Support

If still stuck after adding `ENABLE_PROXY=true` and redeploying:

1. **Share fresh logs**:
   ```powershell
   railway logs --tail > logs.txt
   ```
   (Stop after you see the 500 error, attach logs.txt)

2. **Share environment variables** (remove sensitive values):
   ```powershell
   railway run printenv | Select-String "ENABLE_PROXY|URL|NODE_ENV|DATABASE_URL"
   ```

3. **Share Railway deployment ID**:
   From Railway dashboard, copy the deployment hash (looks like `abc123-deployment`)

---

**Last Updated**: Just now (after password reset attempt)
**Status**: ⏳ Waiting for `ENABLE_PROXY=true` to be set
**Next Action**: Add variable in Railway dashboard NOW ⚡
