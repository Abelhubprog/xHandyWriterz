# 🔴 URGENT: Reset Admin Password Now

## The Situation
- ✅ HTTPS fix is deployed and working
- ❌ You see "You cannot register a new super admin" 
- 🎯 **Why?** An admin user already exists from previous failed attempts

## 🚀 QUICK FIX (3 Steps)

### Option 1: Use Railway Dashboard (EASIEST)

1. **Go to**: https://railway.app/project/9e62407b-8aae-4958-b87f-db206b359006
2. Click on **Postgres** service
3. Click **Data** tab (or **Connect** tab)
4. Look for **Query** or **Console** button
5. Paste and run:
```sql
UPDATE admin_users 
SET password = '$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy',
    is_active = true,
    blocked = false
WHERE email = 'abelngeno1@gmail.com';
```

6. **Login here**: https://handywriterz-production-production.up.railway.app/admin
   - Email: `abelngeno1@gmail.com`
   - Password: `dunnyYOH#9`

---

### Option 2: Use Terminal (if Option 1 doesn't work)

Run this batch file I created:
```batch
d:\HandyWriterzNEW\reset-admin-now.bat
```

Or manually:
```bash
cd d:/HandyWriterzNEW/apps/strapi
railway service Postgres
railway connect
```

Then paste this SQL:
```sql
UPDATE admin_users 
SET password = '$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy',
    is_active = true,
    blocked = false
WHERE email = 'abelngeno1@gmail.com';

-- Verify it worked
SELECT id, email, is_active FROM admin_users WHERE email = 'abelngeno1@gmail.com';
```

Type `\q` to exit psql.

---

## ✅ After Password Reset

### 1. Login
- URL: https://handywriterz-production-production.up.railway.app/admin
- Email: `abelngeno1@gmail.com`
- Password: `dunnyYOH#9`

### 2. Change Password IMMEDIATELY
1. Click your profile icon (top right)
2. Go to **Settings → Profile**
3. Click **Change Password**
4. Set a new secure password

### 3. Generate API Token
1. Go to **Settings → API Tokens**
2. Click **Create new API Token**
3. Name: "Web App Production"
4. Permissions: **Full Access**
5. **COPY THE TOKEN** (you'll need it later)

---

## 🔍 Troubleshooting

### "Email not found"
Run this to see all admin users:
```sql
SELECT id, email, firstname, lastname FROM admin_users;
```

Then use the correct email in the UPDATE command.

### "Still getting cookie error"
The HTTPS fix is deployed. Make sure you're using:
- ✅ https://handywriterz-production-production.up.railway.app/admin
- ❌ NOT http://0.0.0.0:8080/admin

### "Cannot connect to Railway"
Make sure you're logged in:
```bash
railway whoami
```

If not logged in:
```bash
railway login
```

---

## 📝 What Just Happened

1. **The Problem**: When you tried to register admin via HTTP, it created a partial admin record
2. **The Fix**: We're directly updating that admin record's password using bcrypt hash
3. **The Password**: `dunnyYOH#9` is hashed to `$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy`
4. **After Login**: Change this temporary password immediately!

---

## 🎯 Next Steps After Login

1. ✅ Change password
2. ✅ Generate API token
3. ✅ Test creating content (Service or Article)
4. ✅ Configure front-end with API token
5. ✅ Deploy web app

---

**Need help?** Let me know which option you're trying and I'll walk you through it step by step.
