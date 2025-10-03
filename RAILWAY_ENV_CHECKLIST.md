# ✅ Railway Environment Variables Checklist

**Use this checklist to verify your Railway deployment has all required environment variables.**

---

## 🚨 CRITICAL - Must Have (Login Won't Work Without These)

Copy this checklist and check off as you verify each variable in Railway Dashboard:

### Core Server Variables

- [ ] `ENABLE_PROXY` = `true`
  - **Why**: Fixes "secure cookie over unencrypted connection" error
  - **Location**: Railway → Strapi service → Variables → Add manually
  - **Test**: After setting, login should work

- [ ] `URL` = `https://ahandywriterz-production.up.railway.app`
  - **Why**: Ensures Strapi generates correct absolute URLs
  - **Location**: Railway → Strapi service → Variables → Add manually
  - **Test**: Links in emails/redirects use correct domain

- [ ] `DATABASE_CLIENT` = `postgres`
  - **Why**: Tells Strapi to use PostgreSQL instead of SQLite
  - **Location**: Railway → Strapi service → Variables → Add manually
  - **Test**: Data persists across deployments

- [ ] `DATABASE_URL` = `postgresql://postgres:password@host:port/database`
  - **Why**: Connection string for Railway Postgres
  - **Location**: Railway → **Auto-injected** when Postgres service linked
  - **Test**: `railway run printenv | grep DATABASE_URL` shows connection string

### Security Keys (Railway Should Auto-Generate)

- [ ] `APP_KEYS` = `key1,key2,key3,key4`
  - **Why**: Session encryption keys
  - **Location**: Railway → Usually auto-generated on first deploy
  - **Verify**: Should have 4 comma-separated base64 strings

- [ ] `ADMIN_JWT_SECRET` = `random_base64_string`
  - **Why**: Signs admin JWT tokens
  - **Location**: Railway → Usually auto-generated

- [ ] `JWT_SECRET` = `random_base64_string`
  - **Why**: Signs general JWT tokens
  - **Location**: Railway → Usually auto-generated

- [ ] `API_TOKEN_SALT` = `random_base64_string`
  - **Why**: Salts API tokens
  - **Location**: Railway → Usually auto-generated

- [ ] `TRANSFER_TOKEN_SALT` = `random_base64_string`
  - **Why**: Salts transfer tokens
  - **Location**: Railway → Usually auto-generated

---

## 📧 HIGH PRIORITY - Email (Enables Forgot Password)

### Option 1: Resend (Recommended - FREE)

- [ ] `EMAIL_PROVIDER` = `resend`
- [ ] `RESEND_API_KEY` = `re_xxxxxxxxxxxxxxxxxxxx`
  - **Get from**: https://resend.com → Dashboard → API Keys
- [ ] `EMAIL_FROM` = `noreply@ahandywriterz-production.up.railway.app`
- [ ] `EMAIL_REPLY_TO` = `support@ahandywriterz-production.up.railway.app`
- [ ] **Package installed**: `@strapi/provider-email-resend`
  - Run: `cd apps/strapi && pnpm add @strapi/provider-email-resend && git push`

**DNS Already Configured** ✅:
- MX record for `send.admin.ahandywriterz-production.up`
- SPF TXT record
- DKIM TXT record
- DMARC policy

### Option 2: NodeMailer (SMTP)

- [ ] `EMAIL_PROVIDER` = `nodemailer`
- [ ] `SMTP_HOST` = `smtp.example.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USERNAME` = `your_username`
- [ ] `SMTP_PASSWORD` = `your_password`
- [ ] `SMTP_SECURE` = `false` (for port 587)
- [ ] `EMAIL_FROM` = `noreply@yourdomain.com`
- [ ] `EMAIL_REPLY_TO` = `support@yourdomain.com`

### Option 3: SendGrid

- [ ] `EMAIL_PROVIDER` = `sendgrid`
- [ ] `SENDGRID_API_KEY` = `SG.xxxxxxxxxxxxxxxxxxxx`
- [ ] `EMAIL_FROM` = `noreply@yourdomain.com`
- [ ] `EMAIL_REPLY_TO` = `support@yourdomain.com`

---

## 📦 OPTIONAL - Cloudflare R2 Storage (Persistent Files)

**Skip if**: You don't need file uploads or are just testing.

**Use if**: You want persistent file storage across Railway deployments.

- [ ] `R2_ACCESS_KEY_ID` = `your_r2_access_key`
- [ ] `R2_SECRET_ACCESS_KEY` = `your_r2_secret_key`
- [ ] `R2_ENDPOINT` = `https://xxxxxxxx.r2.cloudflarestorage.com`
- [ ] `R2_BUCKET` = `handywriterz-uploads`
- [ ] `R2_REGION` = `auto`

**Get credentials**:
1. Go to: https://dash.cloudflare.com/
2. Navigate: R2 → Create bucket → Manage API Tokens
3. Create API token with R2 permissions
4. Copy credentials to Railway Variables

---

## 🔍 How to Verify Variables Are Set

### Method 1: Railway Dashboard (Visual)

1. Go to: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click: **Strapi service**
3. Click: **Variables** tab
4. Scroll through list and check off items above

### Method 2: Railway CLI (Command Line)

```bash
# View all variables
railway run printenv | Sort-Object

# Check specific variables
railway run printenv | Select-String -Pattern "ENABLE_PROXY|URL|DATABASE"

# Expected output:
# DATABASE_CLIENT=postgres
# DATABASE_URL=postgresql://postgres:...
# ENABLE_PROXY=true
# URL=https://ahandywriterz-production.up.railway.app
```

---

## 🎯 Quick Setup Commands

### Set Critical Variables (Copy & Paste)

```bash
# Navigate to Strapi directory
cd d:/HandyWriterzNEW/apps/strapi

# Set critical variables
railway variables --set ENABLE_PROXY=true
railway variables --set URL=https://ahandywriterz-production.up.railway.app
railway variables --set DATABASE_CLIENT=postgres

# Optional: Set email provider (Resend)
railway variables --set EMAIL_PROVIDER=resend
railway variables --set RESEND_API_KEY=re_your_key_here
railway variables --set EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app
railway variables --set EMAIL_REPLY_TO=support@ahandywriterz-production.up.railway.app

# Verify
railway run printenv | grep -E "ENABLE_PROXY|URL|EMAIL|DATABASE"
```

### Generate Missing Security Keys (If Needed)

```bash
# Generate a single key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate all 5 keys at once (PowerShell)
1..5 | ForEach-Object {
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
}

# Then set in Railway:
railway variables --set APP_KEYS=key1,key2,key3,key4
railway variables --set ADMIN_JWT_SECRET=secret1
railway variables --set JWT_SECRET=secret2
railway variables --set API_TOKEN_SALT=salt1
railway variables --set TRANSFER_TOKEN_SALT=salt2
```

---

## ✅ Success Criteria

After setting variables, you should be able to:

- [ ] **Build succeeds** - No TypeError about undefined properties
- [ ] **Service starts** - Logs show "Server listening on 0.0.0.0:1337"
- [ ] **Login works** - Can access /admin without secure cookie error
- [ ] **Database persists** - Content survives Railway redeploy
- [ ] **Forgot password works** (if email configured) - Receive reset email
- [ ] **File uploads persist** (if R2 configured) - Files survive redeploy

---

## 🆘 Troubleshooting

### "Secure cookie over unencrypted connection"
**Missing**: `ENABLE_PROXY=true`

**Fix**:
```bash
railway variables --set ENABLE_PROXY=true
# Wait for redeploy, then retry login
```

### "Cannot connect to database"
**Missing**: `DATABASE_URL` or `DATABASE_CLIENT`

**Fix**:
1. Verify Postgres service is linked to Strapi service
2. Check: `railway run printenv | grep DATABASE_URL`
3. If missing URL, re-link Postgres service in Railway dashboard
4. Set client: `railway variables --set DATABASE_CLIENT=postgres`

### "Invalid APP_KEYS"
**Issue**: APP_KEYS not in correct format

**Fix**:
```bash
# Should be comma-separated, no spaces
# Wrong: "key1, key2, key3, key4"
# Right: "key1,key2,key3,key4"

# Generate correct format:
node -e "console.log([1,2,3,4].map(() => require('crypto').randomBytes(32).toString('base64')).join(','))"

# Set in Railway:
railway variables --set APP_KEYS="generated_keys_above"
```

### "Email sending failed"
**Missing**: Email provider configuration

**Fix** (Resend example):
```bash
# 1. Sign up at https://resend.com
# 2. Get API key from dashboard
# 3. Set variables:
railway variables --set EMAIL_PROVIDER=resend
railway variables --set RESEND_API_KEY=re_your_api_key
railway variables --set EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app

# 4. Install provider package:
cd d:/HandyWriterzNEW/apps/strapi
pnpm add @strapi/provider-email-resend
git add package.json pnpm-lock.yaml
git commit -m "Add Resend email provider"
git push
```

### "Build fails with undefined properties"
**Issue**: Old deployment, need latest code

**Fix**:
```bash
# Force redeploy with latest code (includes conditional plugin fix)
railway redeploy --service 86580b8f-90de-4205-b8b1-52ee9747da96
```

---

## 📚 Related Documentation

- **[RAILWAY_ENV_VARIABLES.md](./RAILWAY_ENV_VARIABLES.md)** ← **Complete reference guide**
- **[RAILWAY_QUICK_FIX.md](./RAILWAY_QUICK_FIX.md)** ← 60-second action plan
- **[RAILWAY_CRITICAL_FIX.md](./RAILWAY_CRITICAL_FIX.md)** ← Deep troubleshooting
- **[RAILWAY_FIX_SUMMARY.md](./RAILWAY_FIX_SUMMARY.md)** ← Status summary

---

## 📝 Printable Checklist (Copy This Section)

```
RAILWAY ENVIRONMENT VARIABLES - DEPLOYMENT CHECKLIST

CRITICAL (Must Have):
□ ENABLE_PROXY=true
□ URL=https://ahandywriterz-production.up.railway.app
□ DATABASE_CLIENT=postgres
□ DATABASE_URL=(auto-injected by Railway)
□ APP_KEYS=(4 comma-separated keys)
□ ADMIN_JWT_SECRET=(random string)
□ JWT_SECRET=(random string)
□ API_TOKEN_SALT=(random string)
□ TRANSFER_TOKEN_SALT=(random string)

EMAIL (Recommended):
□ EMAIL_PROVIDER=resend
□ RESEND_API_KEY=re_xxx
□ EMAIL_FROM=noreply@ahandywriterz-production.up.railway.app
□ EMAIL_REPLY_TO=support@ahandywriterz-production.up.railway.app
□ @strapi/provider-email-resend installed

R2 STORAGE (Optional):
□ R2_ACCESS_KEY_ID=xxx
□ R2_SECRET_ACCESS_KEY=xxx
□ R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
□ R2_BUCKET=bucket-name
□ R2_REGION=auto

VERIFICATION:
□ Build succeeds (no TypeError)
□ Service starts (logs show "Server listening")
□ Login works (no secure cookie error)
□ Password reset works
□ Database persists across redeploys
□ Email sends (if configured)
□ Files persist (if R2 configured)

NEXT STEPS:
□ Reset admin password
□ Login and change password
□ Test content creation
□ Test file uploads (if applicable)
□ Test forgot password (if email configured)
```

---

**Last Updated**: October 3, 2025
**Railway Project**: 9e62407b-8aae-4958-b87f-db206b359006
**Quick Start**: [RAILWAY_ENV_VARIABLES.md](./RAILWAY_ENV_VARIABLES.md)
