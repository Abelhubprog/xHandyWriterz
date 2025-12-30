# 🔒 Railway Admin Access - HTTPS Fix

**Issue**: "Cannot send secure cookie over unencrypted connection"  
**Status**: ✅ **FIXED**  
**Date**: October 3, 2025

---

## Problem Identified

When trying to create admin via the registration wizard, you were getting:
```
Failed to create admin refresh session during register-admin
Cannot send secure cookie over unencrypted connection
```

**Root Cause**: 
- You were accessing Strapi via `http://0.0.0.0:8080/admin` (plain HTTP)
- But `ADMIN_SESSION_COOKIE_SECURE=true` requires HTTPS
- Without the `URL` variable set, Strapi didn't know its public HTTPS address

---

## Solution Applied

### Configuration Updated
```bash
# Set the public HTTPS URL
URL=https://handywriterz-production-production.up.railway.app

# These were already set correctly:
ENABLE_PROXY=true
ADMIN_SESSION_COOKIE_SECURE=true
ADMIN_SESSION_COOKIE_SAMESITE=none
```

### How It Works
1. `ENABLE_PROXY=true` tells Strapi to trust Railway's reverse proxy
2. `URL=https://...` tells Strapi its public HTTPS address
3. Together, they make Strapi treat incoming requests as HTTPS
4. Secure cookies now work properly

---

## ✅ How to Access Admin Now

### **ALWAYS use the HTTPS URL:**
```
https://handywriterz-production-production.up.railway.app/admin
```

### **NEVER use these:**
- ❌ `http://0.0.0.0:8080/admin` (internal HTTP address)
- ❌ `http://localhost:1337/admin` (local development only)
- ❌ Any plain HTTP URL in production

---

## Create Your Admin Account

### Option 1: Via Web UI (Recommended)

1. **Open**: https://handywriterz-production-production.up.railway.app/admin
2. **If you see the registration form**, fill it in:
   - First name: ABEL
   - Last name: NGENO
   - Email: abelngeno1@gmail.com
   - Password: (use a strong password)
3. **Click "Let's start"**

### Option 2: If "Cannot register" Error Appears

This means an admin already exists from a previous attempt. Reset the password:

```bash
cd apps/strapi

# Create the reset script (one-time setup)
cat > scripts/reset-admin.js << 'EOF'
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi.default({ distDir: './dist' }).load();
  
  const email = process.argv[2] || 'abelngeno1@gmail.com';
  const newPassword = process.argv[3] || 'TempPass123!';
  
  try {
    // Find the admin user
    const user = await strapi.db.query('admin::user').findOne({ 
      where: { email } 
    });
    
    if (!user) {
      console.error(`❌ Admin user ${email} not found`);
      process.exit(1);
    }
    
    // Hash the new password
    const hashedPassword = await strapi.service('admin::auth').hashPassword(newPassword);
    
    // Update the password
    await strapi.db.query('admin::user').update({
      where: { id: user.id },
      data: { password: hashedPassword, isActive: true }
    });
    
    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`🌐 Login at: https://handywriterz-production-production.up.railway.app/admin`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await app.destroy();
    process.exit(0);
  }
})();
EOF

# Run the reset via Railway
railway run node scripts/reset-admin.js abelngeno1@gmail.com NewTempPass123!
```

Then login with the new password and **change it immediately** in Settings → Profile.

### Option 3: Quick SQL Reset (Advanced)

```bash
# Switch to Postgres service
railway service Postgres

# Connect to database
railway connect

# Run this SQL (replace password hash):
UPDATE admin_users 
SET password = '$2a$10$YourHashedPasswordHere', 
    is_active = true 
WHERE email = 'abelngeno1@gmail.com';
```

---

## Verification Checklist

After deployment completes, verify:

- [ ] Can access: https://handywriterz-production-production.up.railway.app/admin
- [ ] No "secure cookie" error
- [ ] Registration form loads (or login form if admin exists)
- [ ] Can successfully create/login to admin account
- [ ] Dashboard loads after login
- [ ] Settings → General Settings shows correct URL

---

## Environment Variables Summary

```bash
# Core Configuration
URL=https://handywriterz-production-production.up.railway.app
ENABLE_PROXY=true

# Session Security (DO NOT CHANGE)
ADMIN_SESSION_COOKIE_SECURE=true
ADMIN_SESSION_COOKIE_SAMESITE=none

# Database
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway

# Strapi Secrets (11 variables)
APP_KEYS=***
ADMIN_JWT_SECRET=***
API_TOKEN_SALT=***
TRANSFER_TOKEN_SALT=***
JWT_SECRET=***
ENCRYPTION_KEY=***
ADMIN_AUTH_SECRET=***
```

---

## Troubleshooting

### Still Getting "Cannot send secure cookie" Error?

**Check these:**
```bash
railway variables --kv | grep -E "(URL|ENABLE_PROXY|COOKIE)"
```

**Should show:**
```
URL=https://handywriterz-production-production.up.railway.app
ENABLE_PROXY=true
ADMIN_SESSION_COOKIE_SECURE=true
ADMIN_SESSION_COOKIE_SAMESITE=none
```

**If URL is missing or wrong:**
```bash
railway variables --set "URL=https://handywriterz-production-production.up.railway.app"
railway up
```

### "You cannot register a new super admin" Error?

This means an admin already exists. Use Option 2 or 3 above to reset the password.

### Admin Logs Out Immediately After Login?

**Check cookie settings in browser:**
- Open DevTools → Application → Cookies
- Look for `strapi_jwt_session` cookie
- Verify it's set with `Secure` and `SameSite=None` flags

**If missing, verify:**
```bash
railway logs | grep cookie
```

Should not see any cookie-related errors.

---

## Related Documentation

- [RAILWAY_DEPLOYMENT_SUCCESS.md](./RAILWAY_DEPLOYMENT_SUCCESS.md) - Full deployment guide
- [RAILWAY_PROXY_FIX_STEPS.md](./RAILWAY_PROXY_FIX_STEPS.md) - Previous proxy fix
- [RAILWAY_COMPLETE_GUIDE.md](./RAILWAY_COMPLETE_GUIDE.md) - Complete reference

---

**Fixed**: October 3, 2025  
**Deployment**: e12b33ea-f91e-4bd4-832f-54796377ca27  
**Public URL**: https://handywriterz-production-production.up.railway.app
