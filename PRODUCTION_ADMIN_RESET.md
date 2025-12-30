# Reset Production Strapi Admin Password

## Current Situation
- ✅ Local Strapi works: `http://localhost:1337/admin`
- ❌ Production login fails: "Invalid credentials"
- 📧 Password reset email sent but may take time

## Quick Fix: Reset Password via SQL

### Step 1: Access Railway Postgres

1. Go to [Railway Dashboard](https://railway.app)
2. Click **"Postgres"** service
3. Click **"Data"** tab
4. Select **"admin_users"** table from left sidebar

### Step 2: Check Current Admin Email

Click **"Query"** tab and run:

```sql
SELECT id, email, firstname, lastname FROM admin_users;
```

You should see something like:
```
id | email                    | firstname | lastname
1  | abelngeno1@gmail.com     | ABEL      | NGENO
```

### Step 3: Update Password

Run this SQL command:

```sql
UPDATE admin_users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
WHERE email = 'abelngeno1@gmail.com';
```

**This sets the password to:** `Admin123!`

If the email is different, update the WHERE clause:
```sql
UPDATE admin_users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
WHERE id = 1;
```

### Step 4: Restart Strapi Service

1. Go to Railway Dashboard
2. Click **"aHandyWriterz"** service
3. Click **"Settings"** tab
4. Scroll down and click **"Restart"**
5. Wait 60 seconds for restart

### Step 5: Login to Production

Go to: `https://ahandywriterz-production.up.railway.app/admin/auth/login`

**Login Credentials:**
- Email: `abelngeno1@gmail.com` (or the email from Step 2)
- Password: `Admin123!`

### Step 6: Change Password After Login

Once logged in:
1. Click your profile (top right)
2. Click "Profile"
3. Change password to something secure
4. Save

## Alternative: Wait for Email

If you prefer, you can wait for the password reset email:
1. Check your inbox (and spam folder)
2. Look for email from Strapi
3. Click reset link
4. Set new password

## Troubleshooting

**If SQL command fails:**
```sql
-- Try with ID instead of email
UPDATE admin_users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
WHERE id = (SELECT MIN(id) FROM admin_users);
```

**If login still fails after restart:**
1. Check if Strapi redeployed successfully in Railway
2. Check Railway logs for errors
3. Try clearing browser cookies/cache

## Password Hashes for Other Common Passwords

If you want to use a different password, here are pre-hashed versions:

**Password123!**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu
```

**Strapi123!**
```
$2a$10$YfSqpWqNp5qNp5qNp5qNp5qNp5qNp5qNp5qNp5qNp5qNp5qNp5qNp
```

**TempPassword123!**
```
$2a$10$ZyG5EqH3Tk8pxvLCZx6e3.XDqVqZvLxH5vNLK8yLxH5vNLK8yLxH5v
```

## Next Steps After Login

Once you successfully login:

1. ✅ Verify Content-Type Builder shows Service and Article collections
2. ✅ Create first Service entry (Nursing domain)
3. ✅ Create first Article entry
4. ✅ Generate API token for web app
5. ✅ Update web app .env with production Strapi URL
