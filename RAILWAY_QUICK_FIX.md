# ⚡ RAILWAY FIX - DO THIS NOW

## 🚨 Critical Issues Fixed

✅ **Build Error** - FIXED in commit `d6d8c67` (just pushed)
⏳ **Secure Cookie Error** - NEEDS your action (1 minute)

---

## 🎯 Action Required (Steps 1-3, ~3 min total)

### Step 1: Add Critical Environment Variables (1 minute)

**Railway Dashboard**: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006

1. Click **Strapi service** → **Variables** tab
2. **Add these critical variables** (if missing):
   ```
   ENABLE_PROXY=true
   URL=https://ahandywriterz-production.up.railway.app
   DATABASE_CLIENT=postgres
   ```
3. **Verify these exist** (Railway auto-generates):
   ```
   APP_KEYS=(comma-separated keys)
   ADMIN_JWT_SECRET=(random string)
   JWT_SECRET=(random string)
   DATABASE_URL=(postgresql://...)
   ```

📚 **Need help with env vars?** See [RAILWAY_ENV_VARIABLES.md](./RAILWAY_ENV_VARIABLES.md) for complete guide.

Railway will auto-deploy the fix we just pushed.

---

### Step 2: Wait for Deploy (~2 min)

Watch logs:
```powershell
railway logs --tail
```

Wait for:
```
Server listening on 0.0.0.0:1337
```

---

### Step 3: Reset Password (30 seconds)

```powershell
railway ssh --project 9e62407b-8aae-4958-b87f-db206b359006 \
  --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d \
  --service 86580b8f-90de-4205-b8b1-52ee9747da96 -- \
  npx strapi admin:reset-user-password \
    --email "abelngeno1@gmail.com" \
    --password "TempPassw0rd!2024"
```

Expected: `✔ Successfully reset user's password`

---

### Step 4: Login & Change Password

**Login**: https://ahandywriterz-production.up.railway.app/admin

- Email: `abelngeno1@gmail.com`
- Password: `TempPassw0rd!2024`

**Immediately**: Avatar → Profile → Change password

---

## 🔧 What Was Fixed

### Problem 1: Build Crash ✅
```
TypeError: Cannot read properties of undefined (reading 'enabled')
```

**Cause**: `plugins.ts` tried to configure R2 without checking if env vars exist.

**Fix**: Made R2/email plugins conditional on env vars being present.

### Problem 2: Secure Cookie Error ⏳
```
Cannot send secure cookie over unencrypted connection
```

**Cause**: Missing `ENABLE_PROXY=true` tells Strapi to trust Railway's proxy headers.

**Fix**: You need to add that variable (Step 1 above).

---

## ✅ Success Check

After Steps 1-4:

- [ ] Build succeeded (no TypeError)
- [ ] Login works
- [ ] Can stay logged in
- [ ] Password changed

---

## 🆘 Troubleshooting

### Build still failing?
```powershell
railway redeploy --service 86580b8f-90de-4205-b8b1-52ee9747da96
```

### Still can't login?
Verify variable:
```powershell
railway run printenv | grep ENABLE_PROXY
```
Should show: `ENABLE_PROXY=true`

### User not found?
Create admin:
```powershell
railway ssh --project 9e62407b-8aae-4958-b87f-db206b359006 \
  --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d \
  --service 86580b8f-90de-4205-b8b1-52ee9747da96 -- \
  npx strapi admin:create-user \
    --email "abelngeno1@gmail.com" \
    --password "TempPassw0rd!2024" \
    --firstname "Abel" \
    --lastname "Ngeno"
```

---

## 📧 Optional: Email Setup (Later)

After login works, add Resend:

1. Sign up: https://resend.com
2. Get API key
3. Add Railway variables:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxx
   EMAIL_FROM=noreply@ahandywriterz.com
   ```
4. Install:
   ```powershell
   cd D:\HandyWriterzNEW\apps\strapi
   pnpm add @strapi/provider-email-resend
   git commit -am "Add Resend" && git push
   ```

You already have DNS records configured ✅

---

## 📚 Full Documentation

- **[RAILWAY_CRITICAL_FIX.md](./RAILWAY_CRITICAL_FIX.md)** ← Full troubleshooting guide
- **[RAILWAY_PROXY_FIX_STEPS.md](./RAILWAY_PROXY_FIX_STEPS.md)** ← Detailed walkthrough
- **[EXECUTE_NOW.md](./EXECUTE_NOW.md)** ← Original quick start

---

**Commit**: `d6d8c67` (build fix pushed)
**Next**: Add `ENABLE_PROXY=true` in Railway, wait for deploy, login! ⚡
