# Railway Strapi - Quick Command Reference

## 🎯 Most Common Commands

### Login Issues - Secure Cookie Error
```powershell
# 1. Add these Railway Variables:
ENABLE_PROXY=true
URL=https://ahandywriterz-production.up.railway.app

# 2. Reset password (automated):
.\railway-reset-password.ps1

# 3. Or manual reset:
railway run npx strapi admin:reset-user-password \
  --email "abelngeno1@gmail.com" \
  --password "TempPassw0rd!2024"
```

### Create First Admin
```powershell
railway run npx strapi admin:create-user \
  --email "admin@handywriterz.com" \
  --password "StrongP@ssw0rd" \
  --firstname "Admin" \
  --lastname "User"
```

### Check Database
```powershell
# View all admins
railway run psql $DATABASE_URL -c "SELECT id, email, firstname, lastname, is_active FROM admin_users;"

# Count admins
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM admin_users;"

# Delete specific admin (by ID)
railway run psql $DATABASE_URL -c "DELETE FROM admin_users WHERE id = 1;"
```

### View Logs
```powershell
# Live tail
railway logs --tail

# Last 100 lines
railway logs

# Filter errors
railway logs | Select-String "error"
```

### Environment Variables
```powershell
# View all
railway run printenv

# View specific
railway run printenv | Select-String "ENABLE_PROXY|URL|DATABASE"

# Set variable
railway variables --set ENABLE_PROXY=true
railway variables --set URL=https://ahandywriterz-production.up.railway.app
```

### Service Management
```powershell
# Restart service
railway redeploy

# SSH into container
railway ssh

# Check service status
railway status

# Link to project (first time)
railway link
```

### Database Operations
```powershell
# Connect to PostgreSQL
railway run psql $DATABASE_URL

# Run SQL file
railway run psql $DATABASE_URL < reset-admin.sql

# Export database
railway run pg_dump $DATABASE_URL > backup.sql

# Import database
railway run psql $DATABASE_URL < backup.sql
```

### Strapi CLI (Inside Railway Container)
```powershell
# List all commands
railway run npx strapi help

# Build Strapi
railway run npx strapi build

# List content types
railway run npx strapi content-types:list

# Export data
railway run npx strapi export --file backup.tar.gz

# Import data
railway run npx strapi import --file backup.tar.gz
```

## 🔑 Project IDs

Save these for quick commands:

```powershell
$PROJECT_ID = "9e62407b-8aae-4958-b87f-db206b359006"
$ENVIRONMENT_ID = "5f6fe7ed-b228-4253-9ef7-ca3fc068da1d"
$SERVICE_ID = "86580b8f-90de-4205-b8b1-52ee9747da96"

# Use in commands:
railway run --project $PROJECT_ID --environment $ENVIRONMENT_ID --service $SERVICE_ID <command>
```

## 🚀 Common Workflows

### Fresh Deploy Setup
```powershell
# 1. Link project
railway link

# 2. Set essential variables
railway variables --set DATABASE_CLIENT=postgres
railway variables --set HOST=0.0.0.0
railway variables --set PORT=1337
railway variables --set NODE_ENV=production
railway variables --set ENABLE_PROXY=true
railway variables --set URL=https://ahandywriterz-production.up.railway.app

# 3. Deploy
git push

# 4. Create admin
railway run npx strapi admin:create-user \
  --email "admin@handywriterz.com" \
  --password "TempP@ssw0rd!2024" \
  --firstname "Admin" \
  --lastname "User"
```

### Password Reset Flow
```powershell
# 1. Check admin exists
railway run psql $DATABASE_URL -c "SELECT email FROM admin_users;"

# 2. Reset password
railway run npx strapi admin:reset-user-password \
  --email "abelngeno1@gmail.com" \
  --password "NewP@ssw0rd!2024"

# 3. Verify login
# Visit: https://ahandywriterz-production.up.railway.app/admin
```

### Debug Login Issues
```powershell
# 1. Check logs for errors
railway logs --tail

# 2. Verify proxy settings
railway run printenv | Select-String "ENABLE_PROXY|URL"

# 3. Check database connection
railway run psql $DATABASE_URL -c "SELECT version();"

# 4. Verify admin exists
railway run psql $DATABASE_URL -c "SELECT * FROM admin_users;"

# 5. Check JWT secrets
railway run printenv | Select-String "JWT|APP_KEYS"
```

### Migrate Local Data to Railway
```powershell
# 1. Export from local
cd apps/strapi
pnpm strapi export --file backup.tar.gz --key "SecretKey123!"

# 2. Upload to Railway
railway run bash -c 'cat > backup.tar.gz' < backup.tar.gz

# 3. Import on Railway
railway run pnpm strapi import --file backup.tar.gz --key "SecretKey123!"

# 4. Cleanup
railway run rm backup.tar.gz
rm backup.tar.gz
```

## 📧 Email Provider Setup

### Resend (Recommended)
```powershell
# Add variables
railway variables --set EMAIL_PROVIDER=resend
railway variables --set RESEND_API_KEY=re_xxxxxxxxxxxx
railway variables --set EMAIL_FROM=noreply@handywriterz.com

# Install package locally
cd apps/strapi
pnpm add @strapi/provider-email-resend
git commit -am "Add Resend email provider"
git push
```

### Gmail SMTP
```powershell
# Add variables
railway variables --set EMAIL_PROVIDER=nodemailer
railway variables --set SMTP_HOST=smtp.gmail.com
railway variables --set SMTP_PORT=587
railway variables --set SMTP_USERNAME=your-email@gmail.com
railway variables --set SMTP_PASSWORD=your-app-password

# Install package locally
cd apps/strapi
pnpm add @strapi/provider-email-nodemailer
git commit -am "Add Nodemailer provider"
git push
```

## 🔍 Troubleshooting Quick Checks

### Service Won't Start
```powershell
# Check build logs
railway logs | Select-String "error|failed"

# Verify required variables
railway run printenv | Select-String "DATABASE_URL|APP_KEYS|JWT_SECRET"

# Test database connection
railway run psql $DATABASE_URL -c "SELECT 1;"
```

### Can't Login After Password Reset
```powershell
# Clear cookies in browser
# Open DevTools (F12) → Application → Cookies → Clear

# Verify password was set
railway run psql $DATABASE_URL -c "SELECT email, updated_at FROM admin_users;"

# Check for JWT errors in logs
railway logs | Select-String "jwt|token|auth"
```

### Database Connection Issues
```powershell
# Verify DATABASE_URL is set
railway run printenv | Select-String "DATABASE_URL"

# Test connection
railway run psql $DATABASE_URL -c "\dt"

# Check Postgres service status
railway status
```

## 📚 Documentation Quick Links

- [Step-by-Step Proxy Fix](./RAILWAY_PROXY_FIX_STEPS.md)
- [Comprehensive Proxy Guide](./RAILWAY_PROXY_FIX.md)
- [Admin Creation Guide](./RAILWAY_ADMIN_FIX_GUIDE.md)
- [Quick Admin Fix](./QUICK_FIX_RAILWAY_ADMIN.md)
- [Issue Explanation](./RAILWAY_ISSUE_EXPLAINED.md)

## 🎓 Pro Tips

### Use Aliases (PowerShell Profile)
Add to `$PROFILE`:

```powershell
# Railway shortcuts
function rlogs { railway logs --tail }
function rssh { railway ssh }
function rrun { railway run $args }
function rstatus { railway status }
function rdb { railway run psql $DATABASE_URL }

# Strapi shortcuts
function sadmin-reset {
    param($email, $pass)
    railway run npx strapi admin:reset-user-password --email $email --password $pass
}

function sadmin-create {
    param($email, $pass, $first, $last)
    railway run npx strapi admin:create-user --email $email --password $pass --firstname $first --lastname $last
}
```

### Save Credentials Securely
Never commit passwords. Use environment file:

```powershell
# .env.railway (gitignored)
ADMIN_EMAIL=admin@handywriterz.com
ADMIN_PASSWORD=your-secure-password
```

Load in scripts:
```powershell
Get-Content .env.railway | ForEach-Object {
    $name, $value = $_.split('=')
    Set-Variable -Name $name -Value $value
}
```

---

**Keep this handy!** Bookmark or print for quick reference during deployments.
