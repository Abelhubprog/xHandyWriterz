# Quick Railway Admin Password Reset Guide

## The Problem
You're seeing "You cannot register a new super admin" because an admin account already exists from previous attempts.

## Quick Fix - Use Railway Shell

### Step 1: Switch to Postgres Service
```bash
cd d:/HandyWriterzNEW/apps/strapi
railway service Postgres
```

### Step 2: Connect to Database
```bash
railway connect
```

### Step 3: Run This SQL
```sql
-- Reset password to: dunnyYOH#9
UPDATE admin_users 
SET 
  password = '$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy',
  is_active = true,
  blocked = false
WHERE email = 'abelngeno1@gmail.com';

-- Verify it worked
SELECT id, firstname, lastname, email, is_active 
FROM admin_users 
WHERE email = 'abelngeno1@gmail.com';
```

### Step 4: Type `\q` to exit psql

### Step 5: Login
Go to: https://handywriterz-production-production.up.railway.app/admin

- Email: `abelngeno1@gmail.com`
- Password: `dunnyYOH#9`

---

## Alternative: Manual Steps

If Railway connect doesn't work, here's the manual process:

1. Go to Railway Dashboard: https://railway.app
2. Open your project
3. Click on the **Postgres** service
4. Click **Connect** tab
5. Click **Open Console** (or use the CLI connection string)
6. Run the UPDATE command above

---

## After Login - IMPORTANT!

1. Click your profile (top right)
2. Go to **Settings → Profile**
3. **Change Password** immediately
4. Use a strong password you'll remember

---

## Then Generate API Token

1. Go to **Settings → API Tokens**
2. Click **Create new API Token**
3. Name it: "Web App Production"
4. Set permissions: **Full Access** (or per-collection as needed)
5. **Copy the token** - you'll need it for the web app `.env`

---

## Troubleshooting

**If email doesn't match:**
```sql
-- See all admin users
SELECT id, email, firstname, lastname FROM admin_users;

-- Update password for different email
UPDATE admin_users 
SET password = '$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy'
WHERE email = 'your-actual-email@example.com';
```

**Password hash explained:**
- The hash is for: `dunnyYOH#9`
- Algorithm: bcrypt with 10 rounds
- Generated via: `bcrypt.hash('dunnyYOH#9', 10)`
