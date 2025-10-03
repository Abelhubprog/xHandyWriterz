# Railway Secure Cookie Fix - Step by Step

## 🎯 Goal
Fix the "Cannot send secure cookie over unencrypted connection" error preventing Railway Strapi admin login.

---

## ⚡ Quick Fix (5 Minutes)

### 1. Add Railway Variables

Go to Railway Dashboard → Your Project → Strapi Service → Variables:

```bash
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
```

Click **Deploy** button after adding variables.

### 2. Run Password Reset Script

**Option A: Automated (PowerShell)**
```powershell
cd D:\HandyWriterzNEW
.\railway-reset-password.ps1
```

**Option B: Manual Command**
```powershell
railway run --project 9e62407b-8aae-4958-b87f-db206b359006 `
  --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d `
  --service 86580b8f-90de-4205-b8b1-52ee9747da96 `
  npx strapi admin:reset-user-password `
    --email "abelngeno1@gmail.com" `
    --password "TempPassw0rd!2024"
```

### 3. Login

Visit: https://ahandywriterz-production.up.railway.app/admin

- Email: `abelngeno1@gmail.com`
- Password: `TempPassw0rd!2024`

**Change password immediately** in profile settings!

---

## 📋 Detailed Walkthrough

### Prerequisites
- Railway CLI installed: `npm install -g @railway/cli`
- Railway account logged in: `railway login`
- Project linked: `railway link` (or use project IDs)

### Step 1: Understanding the Problem

**What's happening:**
```
Browser → HTTPS → Railway Proxy → HTTP → Strapi Container
                                        ↑
                                  Strapi thinks: "I'm on HTTP, 
                                  can't send secure cookies!"
```

**Solution:**
Enable proxy mode so Strapi trusts the `X-Forwarded-Proto: https` header from Railway's proxy.

### Step 2: Update Code (Already Done ✅)

The file `apps/strapi/config/server.ts` already contains:

```typescript
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL', 'http://localhost:1337'),        // ← Full public URL
  proxy: env.bool('ENABLE_PROXY', true),            // ← Trust proxy headers
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

This code is already committed and deployed. ✅

### Step 3: Set Railway Environment Variables

#### Via Railway Dashboard (Recommended)

1. Open: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click **Strapi service** (aHandyWriterz)
3. Click **Variables** tab
4. Add these **New Variables**:

| Variable Name | Value |
|--------------|-------|
| `ENABLE_PROXY` | `true` |
| `URL` | `https://ahandywriterz-production.up.railway.app` |

5. Click **Deploy** (top right) or wait for auto-deploy

#### Via Railway CLI (Alternative)

```powershell
railway variables --set ENABLE_PROXY=true
railway variables --set URL=https://ahandywriterz-production.up.railway.app
```

### Step 4: Verify Deployment

**Wait for deployment to complete** (2-3 minutes). Check status:

```powershell
# View deployment status
railway status

# Watch logs
railway logs --tail
```

**Look for these in logs:**
```
[2024-10-03 12:34:56.789] info: Server listening on 0.0.0.0:1337
[2024-10-03 12:34:56.790] info: Strapi is running
```

**Verify variables are set:**
```powershell
railway run printenv | grep ENABLE_PROXY
railway run printenv | grep URL
```

Should show:
```
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
```

### Step 5: Reset Admin Password

**Why?** Even with proxy fixed, you need to reset the password to ensure the new session tokens are issued correctly.

#### Method A: PowerShell Script (Easiest)

```powershell
cd D:\HandyWriterzNEW
.\railway-reset-password.ps1
```

The script will:
- ✅ Check Railway CLI is installed
- ✅ Verify `ENABLE_PROXY` is set
- ✅ Prompt for email/password (or use defaults)
- ✅ Reset password on Railway production
- ✅ Show login URL and credentials

#### Method B: Manual Railway CLI

```powershell
railway run npx strapi admin:reset-user-password \
  --email "abelngeno1@gmail.com" \
  --password "TempPassw0rd!2024"
```

**Expected output:**
```
✔ Successfully reset user's password
```

#### Method C: Direct SSH

```powershell
railway ssh

# Inside the container:
npx strapi admin:reset-user-password \
  --email "abelngeno1@gmail.com" \
  --password "TempPassw0rd!2024"

exit
```

### Step 6: Test Login

1. **Open**: https://ahandywriterz-production.up.railway.app/admin
2. **Login**:
   - Email: `abelngeno1@gmail.com`
   - Password: `TempPassw0rd!2024`
3. **Success!** You should see the Strapi admin dashboard
4. **Navigate to Profile** (top right avatar) → **Change Password**
5. **Set a strong new password** and save

### Step 7: Verify Secure Cookies (Optional)

Open browser DevTools (F12) → Application/Storage → Cookies:

You should see cookies like:
- `strapi_jwt` with `Secure` ✅ and `HttpOnly` ✅
- Domain: `.up.railway.app`

---

## 🔧 Troubleshooting

### Problem: Still Getting "Cannot send secure cookie" Error

**Check 1: Verify variables are actually set**
```powershell
railway run printenv | Select-String "ENABLE_PROXY|URL"
```

Should show both variables with correct values.

**Check 2: Force redeploy**
```powershell
railway redeploy --service 86580b8f-90de-4205-b8b1-52ee9747da96
```

**Check 3: View detailed logs**
```powershell
railway logs --tail
```

Look for errors during startup.

**Check 4: Verify server.ts is deployed**
```powershell
railway run cat config/server.js
```

Should show the compiled JavaScript with `proxy:` configuration.

### Problem: Password Reset Says "User Not Found"

**Check database:**
```powershell
railway run psql $DATABASE_URL -c "SELECT id, email, firstname, lastname FROM admin_users;"
```

**If empty:** Create admin first:
```powershell
railway run npx strapi admin:create-user \
  --email "abelngeno1@gmail.com" \
  --password "TempPassw0rd!2024" \
  --firstname "Abel" \
  --lastname "Ngeno"
```

**If email is different:** Use the actual email from database in reset command.

### Problem: Can Login But Gets Logged Out Immediately

**Cause:** Cookie domain mismatch or JWT secret changed.

**Fix:** Ensure `URL` variable matches exactly:
```powershell
railway variables --set URL=https://ahandywriterz-production.up.railway.app
```

No trailing slash!

### Problem: Forgot Password Email Not Working

**Cause:** Email provider not configured (default "sendmail" doesn't work on Railway).

**Fix:** See "Email Provider Setup" section in [RAILWAY_PROXY_FIX.md](./RAILWAY_PROXY_FIX.md)

Quick fix: Use the CLI reset command instead of "Forgot Password" link.

---

## 📧 Email Provider Setup (Recommended)

### Why?
Without email configured, "Forgot Password" won't work. You'll need CLI access for password resets.

### Quick Setup: Resend (Free Tier)

1. **Sign up**: https://resend.com
2. **Create API Key**: Dashboard → API Keys → Create
3. **Add to Railway Variables**:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@handywriterz.com
   EMAIL_REPLY_TO=support@handywriterz.com
   ```
4. **Install provider** (already configured in code):
   ```powershell
   cd apps/strapi
   pnpm add @strapi/provider-email-resend
   git add package.json pnpm-lock.yaml
   git commit -m "Add Resend email provider"
   git push
   ```
5. **Verify**: Railway will auto-deploy. Test "Forgot Password" on admin login page.

### Alternative: Gmail SMTP

1. **Enable 2FA** on your Gmail account
2. **Create App Password**: Google Account → Security → 2-Step Verification → App passwords
3. **Add to Railway Variables**:
   ```
   EMAIL_PROVIDER=nodemailer
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```
4. **Install provider**:
   ```powershell
   cd apps/strapi
   pnpm add @strapi/provider-email-nodemailer
   git add package.json pnpm-lock.yaml
   git commit -m "Add Nodemailer email provider"
   git push
   ```

---

## ✅ Success Checklist

After completing all steps:

- [ ] `ENABLE_PROXY=true` set in Railway Variables
- [ ] `URL=https://...` set in Railway Variables  
- [ ] Service redeployed (check logs for startup success)
- [ ] Variables verified with `railway run printenv`
- [ ] Password reset via CLI succeeded
- [ ] Logged in successfully at `/admin`
- [ ] Password changed in profile settings
- [ ] Browser cookies show `Secure` flag ✅
- [ ] (Optional) Email provider configured
- [ ] (Optional) Tested "Forgot Password" flow

---

## 🎓 What You Learned

### Before (Broken)
```
Browser ──HTTPS──→ Railway Proxy ──HTTP──→ Strapi
                                           ↓
                                    "I'm on HTTP!"
                                    "Can't send Secure cookie"
                                    ❌ Login fails
```

### After (Fixed)
```
Browser ──HTTPS──→ Railway Proxy ──HTTP + Headers──→ Strapi
                                   X-Forwarded-Proto: https
                                   X-Forwarded-Host: ahandywriterz...
                                                      ↓
                                              proxy: true
                                              url: https://...
                                                      ↓
                                          "I trust the proxy!"
                                          "External is HTTPS"
                                          ✅ Secure cookie sent
```

---

## 📚 Related Files

- **Config**: `apps/strapi/config/server.ts` (proxy settings)
- **Config**: `apps/strapi/config/plugins.ts` (email provider)
- **Script**: `railway-reset-password.ps1` (automated reset)
- **Guide**: `RAILWAY_PROXY_FIX.md` (comprehensive reference)
- **Guide**: `RAILWAY_ADMIN_FIX_GUIDE.md` (initial admin creation)

---

## 🆘 Still Stuck?

1. **Check Railway status**: https://status.railway.app
2. **View full logs**: `railway logs --tail`
3. **SSH into container**: `railway ssh` then explore
4. **Check database**: `railway run psql $DATABASE_URL`
5. **Review Strapi docs**: https://docs.strapi.io/dev-docs/deployment/railway

---

**Last Updated**: October 2025  
**Tested**: Strapi v5.25.0 + Railway.app  
**Author**: HandyWriterz DevOps Team
