# Railway Secure Cookie Fix - Complete Guide

## Problem
Railway Strapi shows error: `Failed to create admin refresh session Cannot send secure cookie over unencrypted connection`

This happens because Strapi tries to set secure cookies but doesn't trust Railway's HTTPS proxy headers.

---

## ✅ Solution (3 Steps)

### Step 1: Add Environment Variable in Railway

1. Go to Railway Dashboard: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click on your **Strapi service** (aHandyWriterz)
3. Navigate to **Variables** tab
4. Click **+ New Variable**
5. Add these variables:

```
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app
```

6. Click **Deploy** (Railway will auto-redeploy with new variables)

---

### Step 2: Verify the Deployment

Wait for the deployment to complete (2-3 minutes). Check logs:

```powershell
railway logs --project 9e62407b-8aae-4958-b87f-db206b359006 `
  --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d `
  --service 86580b8f-90de-4205-b8b1-52ee9747da96
```

Look for startup messages confirming Strapi is running on port 1337.

---

### Step 3: Reset Admin Password via Railway SSH

Once deployed, reset the password **inside the production container**:

```powershell
railway run --project 9e62407b-8aae-4958-b87f-db206b359006 `
  --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d `
  --service 86580b8f-90de-4205-b8b1-52ee9747da96 `
  npx strapi admin:reset-user-password `
    --email "abelngeno1@gmail.com" `
    --password "TempPassw0rd!2024"
```

**Expected output:**
```
✔ Successfully reset user's password
```

---

### Step 4: Login and Change Password

1. Visit: https://ahandywriterz-production.up.railway.app/admin
2. Login with:
   - **Email**: abelngeno1@gmail.com
   - **Password**: TempPassw0rd!2024
3. **Immediately change your password** in the admin profile settings

---

## 🔧 What Was Fixed

### Before (Broken):
- Strapi running behind Railway's HTTPS proxy
- Railway terminates SSL and forwards HTTP to container
- Strapi doesn't trust `X-Forwarded-Proto: https` header
- Tries to set `Secure` cookie over plain HTTP connection
- Cookie rejected, login fails

### After (Fixed):
```typescript
// apps/strapi/config/server.ts
export default ({ env }) => ({
  url: env('URL', 'http://localhost:1337'),        // ← Full public URL
  proxy: env.bool('ENABLE_PROXY', true),            // ← Trust proxy headers
  // ...
});
```

With `ENABLE_PROXY=true`, Strapi:
- Trusts `X-Forwarded-Proto` header from Railway
- Knows the external connection is HTTPS
- Issues secure cookies correctly
- Admin login works!

---

## 📧 Email Provider Setup (Optional but Recommended)

Currently, password reset emails won't work because Strapi uses default "sendmail" (not available in Railway).

### Option A: Resend (Recommended - Free Tier Available)

1. Sign up at https://resend.com
2. Create API key
3. Add to Railway Variables:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

4. Update `apps/strapi/config/plugins.ts`:

```typescript
export default ({ env }) => ({
  email: {
    config: {
      provider: 'resend',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'),
      },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'noreply@handywriterz.com'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'support@handywriterz.com'),
      },
    },
  },
  // ...existing graphql config
});
```

5. Install provider in `apps/strapi`:

```bash
cd apps/strapi
pnpm add @strapi/provider-email-resend
```

### Option B: SMTP (Gmail, SendGrid, etc.)

Add to Railway Variables:

```
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

Update `apps/strapi/config/plugins.ts`:

```typescript
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env.int('SMTP_PORT'),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('EMAIL_FROM'),
        defaultReplyTo: env('EMAIL_REPLY_TO'),
      },
    },
  },
  // ...existing graphql config
});
```

Install provider:

```bash
cd apps/strapi
pnpm add @strapi/provider-email-nodemailer
```

---

## 🚨 Troubleshooting

### Still Getting Cookie Error After Deploy?

1. **Verify environment variable is set:**
   ```powershell
   railway run --service 86580b8f-90de-4205-b8b1-52ee9747da96 printenv | grep ENABLE_PROXY
   ```
   Should show: `ENABLE_PROXY=true`

2. **Check the URL variable:**
   ```powershell
   railway run --service 86580b8f-90de-4205-b8b1-52ee9747da96 printenv | grep URL
   ```
   Should show: `URL=https://ahandywriterz-production.up.railway.app`

3. **Force a fresh deployment:**
   ```powershell
   railway redeploy --service 86580b8f-90de-4205-b8b1-52ee9747da96
   ```

### Password Reset Command Fails?

**Error: "User not found"**
- Check database for existing admin:
  ```powershell
  railway run psql $DATABASE_URL -c "SELECT id, email FROM admin_users;"
  ```
- Use the exact email from the database in the reset command

**Error: "ECONNREFUSED"**
- Strapi service isn't fully started yet
- Wait 30 seconds and try again
- Check logs: `railway logs --service 86580b8f-90de-4205-b8b1-52ee9747da96`

### Login Works But Redirects to HTTP?

Set the `URL` variable with the full HTTPS address:
```
URL=https://ahandywriterz-production.up.railway.app
```

---

## 📋 Quick Reference

### Railway Project IDs
- **Project**: `9e62407b-8aae-4958-b87f-db206b359006`
- **Environment**: `5f6fe7ed-b228-4253-9ef7-ca3fc068da1d`
- **Service**: `86580b8f-90de-4205-b8b1-52ee9747da96`

### Required Environment Variables
```bash
# Core Strapi
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security (generate with: node generate-secrets.js)
APP_KEYS=key1,key2,key3,key4
JWT_SECRET=xxxxxxxxxxxx
ADMIN_JWT_SECRET=xxxxxxxxxxxx
API_TOKEN_SALT=xxxxxxxxxxxx
TRANSFER_TOKEN_SALT=xxxxxxxxxxxx

# Proxy Fix (NEW)
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app

# Email (Optional)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@handywriterz.com
```

### Useful Commands

**View logs:**
```powershell
railway logs
```

**SSH into container:**
```powershell
railway run bash
```

**Check database:**
```powershell
railway run psql $DATABASE_URL
```

**Restart service:**
```powershell
railway redeploy
```

---

## ✅ Success Checklist

- [ ] `ENABLE_PROXY=true` set in Railway Variables
- [ ] `URL=https://...` set in Railway Variables
- [ ] Service redeployed successfully
- [ ] Password reset via `railway run npx strapi admin:reset-user-password`
- [ ] Successfully logged in at `/admin`
- [ ] Password changed via profile settings
- [ ] (Optional) Email provider configured for forgot-password flow

---

## 📚 Related Guides

- [RAILWAY_ADMIN_FIX_GUIDE.md](./RAILWAY_ADMIN_FIX_GUIDE.md) - Initial admin creation
- [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md) - Full deployment walkthrough
- [PRODUCTION_ADMIN_RESET.md](./PRODUCTION_ADMIN_RESET.md) - Manual SQL password reset

---

**Last Updated**: October 2025  
**Tested On**: Strapi v5.25.0, Railway.app
