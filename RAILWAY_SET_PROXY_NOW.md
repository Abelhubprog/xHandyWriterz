# 🚨 SET ENABLE_PROXY=true NOW

## The Problem

Your login is failing with **"Internal Server Error"** because:

```
Failed to create admin refresh session – Cannot send secure cookie over unencrypted connection
```

**Translation**: Strapi thinks the connection is HTTP (not HTTPS) so it refuses to set secure cookies.

**Why**: Railway's `ENABLE_PROXY` variable is **NOT SET**.

---

## The 30-Second Fix

### 1. Open Railway Dashboard

**Direct link**: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006

### 2. Go to Variables

1. Click **"aHandyWriterz"** (Strapi service)
2. Click **"Variables"** tab

### 3. Add This Exact Variable

**Click "+ New Variable"**

**Variable name**:
```
ENABLE_PROXY
```

**Variable value**:
```
true
```

**Click "Add"**

### 4. Verify It's There

You should see in the list:
```
ENABLE_PROXY = true
URL = https://ahandywriterz-production.up.railway.app
```

---

## What Happens Next

1. **Railway auto-redeploys** (1-2 minutes)
2. **Watch logs**: `railway logs --tail`
3. **Wait for**: "Server listening on 0.0.0.0:1337"
4. **Reset password again** (because the password is stored per deployment):

```powershell
railway ssh --project 9e62407b-8aae-4958-b87f-db206b359006 --environment 5f6fe7ed-b228-4253-9ef7-ca3fc068da1d --service 86580b8f-90de-4205-b8b1-52ee9747da96 -- npx strapi admin:reset-user-password --email "abelngeno1@gmail.com" --password "TempPassw0rd!2024"
```

5. **Login**: https://ahandywriterz-production.up.railway.app/admin

---

## Why This Works

### Before (Broken):
```
Railway: (no ENABLE_PROXY variable)
         ↓
Strapi: "I don't see proxy=true, so I won't trust X-Forwarded-Proto"
         ↓
Strapi: "Connection looks like HTTP, blocking secure cookies"
         ↓
Login: ❌ 500 Internal Server Error
```

### After (Fixed):
```
Railway: ENABLE_PROXY=true
         ↓
Strapi: "proxy=true, I'll trust X-Forwarded-Proto: https"
         ↓
Strapi: "Connection is HTTPS, setting secure cookies"
         ↓
Login: ✅ Success! Redirects to dashboard
```

---

## Visual Checklist

**Before login works, you need**:

```
Railway Variables:
├─ ✅ DATABASE_URL (Railway sets this)
├─ ✅ APP_KEYS (Railway sets this)
├─ ✅ URL = https://ahandywriterz-production.up.railway.app
└─ ⚠️ ENABLE_PROXY = true  ← YOU MUST ADD THIS
```

**After adding ENABLE_PROXY**:

```
1. Railway redeploys           [    ] ← Wait 1-2 min
2. Logs show "Server listening" [    ] ← Confirm ready
3. Password reset succeeds      [    ] ← Run command
4. Login works                  [    ] ← Test URL
5. Password changed             [    ] ← Profile → Change password
```

---

## 🎯 Action Required

**RIGHT NOW**: Go to Railway dashboard and add `ENABLE_PROXY=true`

**Time**: 30 seconds to add, 2 minutes total until working

**Result**: Login will work! ✅

---

**See full details**: [URGENT_FIX_NOW.md](./URGENT_FIX_NOW.md)
