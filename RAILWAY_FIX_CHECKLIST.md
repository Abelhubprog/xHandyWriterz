# 🎯 Railway Strapi Fix - Action Checklist

**Date**: October 2, 2025
**Issue**: "Cannot send secure cookie over unencrypted connection"
**Status**: Ready to execute

---

## ✅ Pre-Flight Check

- [x] Railway CLI installed (`railway --version`)
- [x] Logged into Railway (`railway whoami`)
- [x] Code changes committed (server.ts, plugins.ts)
- [ ] Ready to set Railway variables
- [ ] Ready to reset password

---

## 🚀 Execute These Steps (In Order)

### Step 1: Set Railway Environment Variables (2 minutes)

**Via Railway Dashboard** (Recommended):

1. Open: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click **Strapi service** (aHandyWriterz)
3. Go to **Variables** tab
4. Click **+ New Variable** and add:

```
Variable: ENABLE_PROXY
Value: true
```

5. Click **+ New Variable** again and add:

```
Variable: URL
Value: https://ahandywriterz-production.up.railway.app
```

6. Click **Deploy** button (top right)

**Or via CLI**:
```powershell
cd D:\HandyWriterzNEW\apps\strapi
railway variables --set ENABLE_PROXY=true
railway variables --set URL=https://ahandywriterz-production.up.railway.app
```

- [ ] Variables added
- [ ] Deploy triggered

---

### Step 2: Wait for Deployment (2-3 minutes)

Watch deployment progress:

```powershell
railway logs --tail
```

Look for:
```
✓ Server listening on 0.0.0.0:1337
✓ Strapi is running
```

- [ ] Deployment completed
- [ ] No errors in logs

---

### Step 3: Verify Variables Are Set

```powershell
cd D:\HandyWriterzNEW\apps\strapi
railway run printenv | Select-String "ENABLE_PROXY|URL"
```

**Expected output:**
```
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
```

- [ ] Variables confirmed

---

### Step 4: Reset Admin Password (1 minute)

**Option A - Automated Script** (Easiest):

```powershell
cd D:\HandyWriterzNEW
.\railway-reset-password.ps1
```

Follow prompts:
- Email: `abelngeno1@gmail.com` (or press Enter for default)
- Password: `TempPassw0rd!2024` (or press Enter for default)

**Option B - Manual Command**:

```powershell
cd D:\HandyWriterzNEW\apps\strapi
railway run npx strapi admin:reset-user-password --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024"
```

**Expected output:**
```
✔ Successfully reset user's password
```

- [ ] Password reset successful

---

### Step 5: Test Login (1 minute)

1. Open browser: https://ahandywriterz-production.up.railway.app/admin

2. Enter credentials:
   - **Email**: `abelngeno1@gmail.com`
   - **Password**: `TempPassw0rd!2024`

3. Click **Sign in**

**Expected**: Successfully logged into Strapi admin dashboard

- [ ] Login successful
- [ ] Dashboard loads

---

### Step 6: Change Password (1 minute)

1. Click **avatar icon** (top right)
2. Click **Profile**
3. Scroll to **Change password**
4. Enter:
   - Current: `TempPassw0rd!2024`
   - New: `[Your secure password]`
   - Confirm: `[Your secure password]`
5. Click **Save**

- [ ] Password changed
- [ ] New password saved securely

---

### Step 7: Verify Secure Cookies (Optional)

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Cookies** → `https://ahandywriterz-production.up.railway.app`
4. Look for `strapi_jwt` cookie
5. Check flags:
   - ✅ `Secure`: Yes
   - ✅ `HttpOnly`: Yes
   - ✅ `SameSite`: Lax or Strict

- [ ] Cookies verified

---

## 🎉 Success Criteria

All of these should be ✅:

- [x] Code changes deployed (`server.ts` with proxy config)
- [ ] `ENABLE_PROXY=true` in Railway
- [ ] `URL=https://...` in Railway
- [ ] Service redeployed successfully
- [ ] Password reset succeeded
- [ ] Login works at `/admin`
- [ ] Password changed to secure one
- [ ] Secure cookies visible in DevTools

**If all checked**: ✅ **FIX COMPLETE!**

---

## 🔄 Next Steps (Optional)

### Email Provider Setup (Recommended)

So "Forgot Password" works without CLI access:

1. **Choose provider**: Resend (recommended) or Gmail SMTP
2. **Sign up**: https://resend.com (free tier available)
3. **Get API key**: Dashboard → API Keys → Create
4. **Add Railway variables**:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@handywriterz.com
   EMAIL_REPLY_TO=support@handywriterz.com
   ```
5. **Install provider**:
   ```powershell
   cd D:\HandyWriterzNEW\apps\strapi
   pnpm add @strapi/provider-email-resend
   git commit -am "Add Resend email provider"
   git push
   ```
6. **Test**: Use "Forgot Password" on login page

- [ ] Email provider configured
- [ ] Forgot password tested

### Content Migration (If Needed)

To move local Strapi data to Railway:

```powershell
# Export local
cd D:\HandyWriterzNEW\apps\strapi
pnpm strapi export --file backup.tar.gz --key "YourSecretKey123!"

# Import to Railway
railway run pnpm strapi import --file backup.tar.gz --key "YourSecretKey123!"
```

- [ ] Data exported
- [ ] Data imported to Railway

---

## 🆘 Troubleshooting

### Problem: Still getting cookie error after Step 5

**Check:**
```powershell
railway run printenv | Select-String "ENABLE_PROXY|URL"
```

Both should be present. If not, repeat Step 1 and wait for redeploy.

### Problem: Password reset fails with "User not found"

**Check database:**
```powershell
railway run psql $DATABASE_URL -c "SELECT email FROM admin_users;"
```

If empty, create admin first:
```powershell
railway run npx strapi admin:create-user --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024" --firstname "Abel" --lastname "Ngeno"
```

### Problem: Login works but logs out immediately

**Fix:** Ensure URL has no trailing slash:
```powershell
railway variables --set URL=https://ahandywriterz-production.up.railway.app
```

(No `/` at the end!)

### Need More Help?

See detailed guides:
- [RAILWAY_PROXY_FIX_STEPS.md](./RAILWAY_PROXY_FIX_STEPS.md) - Full walkthrough
- [RAILWAY_PROXY_FIX.md](./RAILWAY_PROXY_FIX.md) - Comprehensive reference
- [RAILWAY_COMMANDS.md](./RAILWAY_COMMANDS.md) - Command reference

---

## 📝 Notes

**Time required**: ~10 minutes total
**Difficulty**: Easy (mostly copy-paste commands)
**Risk**: Low (non-destructive, can rollback)

**Current Status**:
- Date: ________________
- Time: ________________
- Completed by: ________________
- Result: ☐ Success ☐ Issues (describe): ________________

---

**Print this page** and check off items as you complete them! ✅
