# 🎯 EXECUTE NOW: Railway Secure Cookie Fix

## ⚡ What You Need to Do (10 Minutes)

Railway will auto-deploy the proxy fix code we just pushed. While that deploys, follow these steps:

---

### Step 1: Add Environment Variables (3 minutes)

**Go to Railway Dashboard:**
https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006

1. Click your **Strapi service** (aHandyWriterz)
2. Click **Variables** tab
3. Click **+ New Variable** twice to add:

```
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
```

4. Click **Deploy** button

---

### Step 2: Wait for Deployment (2 minutes)

Watch the deployment in Railway dashboard or run:

```powershell
railway logs --tail
```

Wait for: `✓ Server listening on 0.0.0.0:1337`

---

### Step 3: Reset Password (2 minutes)

**Option A - Automated (Easiest):**

```powershell
cd D:\HandyWriterzNEW
.\railway-reset-password.ps1
```

Press Enter twice to use defaults (email + password)

**Option B - Manual:**

```powershell
cd D:\HandyWriterzNEW\apps\strapi
railway run npx strapi admin:reset-user-password --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024"
```

---

### Step 4: Login! (1 minute)

Visit: https://ahandywriterz-production.up.railway.app/admin

- **Email**: `abelngeno1@gmail.com`
- **Password**: `TempPassw0rd!2024`

**Immediately change your password** in profile settings!

---

## ✅ What We Fixed

### The Problem
```
Browser ──HTTPS──> Railway Proxy ──HTTP──> Strapi
                                          "I'm on HTTP, can't send secure cookie!"
                                          ❌ LOGIN FAILS
```

### The Solution
```typescript
// apps/strapi/config/server.ts (already pushed ✅)
export default ({ env }) => ({
  url: env('URL', 'http://localhost:1337'),        // ← Public HTTPS URL
  proxy: env.bool('ENABLE_PROXY', true),            // ← Trust proxy headers
  // ...
});
```

With `ENABLE_PROXY=true` in Railway Variables:
```
Browser ──HTTPS──> Railway Proxy ──HTTP + X-Forwarded-Proto: https──> Strapi
                                                                      "External is HTTPS!"
                                                                      ✅ SECURE COOKIE SENT
```

---

## 📚 New Documentation Created

All committed and pushed to GitHub:

1. **[RAILWAY_FIX_CHECKLIST.md](./RAILWAY_FIX_CHECKLIST.md)** ← **START HERE**
   Print this and check off each step

2. **[RAILWAY_PROXY_FIX_STEPS.md](./RAILWAY_PROXY_FIX_STEPS.md)**
   Detailed step-by-step walkthrough

3. **[RAILWAY_PROXY_FIX.md](./RAILWAY_PROXY_FIX.md)**
   Comprehensive reference with troubleshooting

4. **[RAILWAY_COMMANDS.md](./RAILWAY_COMMANDS.md)**
   Quick command reference (bookmark this!)

5. **[railway-reset-password.ps1](./railway-reset-password.ps1)**
   Automation script for password resets

---

## 🔧 Code Changes Deployed

✅ **apps/strapi/config/plugins.ts**
- Added email provider support (Resend, Nodemailer, SendGrid)
- Configure later for "Forgot Password" functionality

✅ **apps/strapi/config/server.ts** (already committed earlier)
- Added `proxy: env.bool('ENABLE_PROXY', true)`
- Added `url: env('URL', 'http://localhost:1337')`

✅ **README.md**
- Added quick links to new Railway fix guides

---

## 🆘 If Something Goes Wrong

### Password reset fails?

**Check if admin exists:**
```powershell
railway run psql $DATABASE_URL -c "SELECT email FROM admin_users;"
```

**If empty, create admin first:**
```powershell
railway run npx strapi admin:create-user --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024" --firstname "Abel" --lastname "Ngeno"
```

### Still getting cookie error?

**Verify variables are set:**
```powershell
railway run printenv | Select-String "ENABLE_PROXY|URL"
```

Both should show. If not, repeat Step 1.

### Need help?

Open the detailed guides:
- [RAILWAY_FIX_CHECKLIST.md](./RAILWAY_FIX_CHECKLIST.md) - Print and follow
- [RAILWAY_PROXY_FIX_STEPS.md](./RAILWAY_PROXY_FIX_STEPS.md) - Full walkthrough

---

## 📋 Quick Status Check

After you complete the steps, verify:

- [ ] Variables added in Railway: `ENABLE_PROXY=true`, `URL=https://...`
- [ ] Deployment complete (check logs)
- [ ] Password reset successful
- [ ] Login works at `/admin`
- [ ] Password changed to secure one
- [ ] DevTools shows `Secure` cookies ✅

**All checked?** 🎉 **You're done!**

---

## 🚀 Next Steps (Optional)

### Email Provider Setup

So "Forgot Password" works without CLI:

1. Sign up: https://resend.com (free tier)
2. Get API key: Dashboard → API Keys → Create
3. Add Railway variables:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@handywriterz.com
   ```
4. Install provider:
   ```powershell
   cd D:\HandyWriterzNEW\apps\strapi
   pnpm add @strapi/provider-email-resend
   git commit -am "Add Resend email provider"
   git push
   ```

See [RAILWAY_PROXY_FIX.md](./RAILWAY_PROXY_FIX.md) for full email setup guide.

---

## 🎓 What You Learned

Railway runs Strapi behind an HTTPS proxy but communicates internally via HTTP. Without telling Strapi to trust proxy headers, it refuses to send secure cookies, breaking authentication.

**The fix**: Set `ENABLE_PROXY=true` so Strapi knows the external connection is HTTPS even though the internal one is HTTP.

---

**Ready? Execute Steps 1-4 now!** ⚡

Print **[RAILWAY_FIX_CHECKLIST.md](./RAILWAY_FIX_CHECKLIST.md)** for a hands-on guide.
