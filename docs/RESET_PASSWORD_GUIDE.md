# 🎯 Reset Production Admin Password - EASIEST METHOD

## What You Need to Copy

**New Password Hash** (this sets password to `Admin123!`):
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu
```

## Steps (No Terminal Commands!)

### 1. You're Already Here ✅
You're viewing: Railway → Postgres → Database → Data → admin_users table

You can see one row with:
- Email: `abelngeno1@gmail.com`
- Password: `$2a$10$CIyRu...` (old hash)

### 2. Click the Password Cell
- Click directly on the **password** column value (the long `$2a$10$CIyRu...` text)
- Railway will show an "Edit cell" dialog or inline editor

### 3. Replace the Password Hash
- **DELETE** the entire old password hash
- **PASTE** the new one (from top of this file):
  ```
  $2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu
  ```
- Click **"Save"** or press **Enter**

### 4. Restart Strapi Service
1. In Railway dashboard (left sidebar), click **"aHandyWriterz"**
2. Click **"Settings"** tab (top menu)
3. Scroll to bottom
4. Click **"Restart"** button
5. Wait for status to change: "Restarting..." → "Running" (about 60 seconds)

### 5. Login to Production Admin
Open in browser:
```
https://ahandywriterz-production.up.railway.app/admin/auth/login
```

**Login Credentials:**
- Email: `abelngeno1@gmail.com`
- Password: `Admin123!`

Click "Login" → You should see the Strapi dashboard! 🎉

---

## If Railway UI Doesn't Let You Edit

Some Railway plans might not allow direct cell editing. If that's the case:

### Alternative: Use Railway's psql Command

1. In Railway → Postgres → Database tab
2. Click purple **"Connect"** button (top right)
3. Click **"Public Network"** tab
4. Copy the **"Raw psql command"** (looks like):
   ```
   PGPASSWORD=******** psql -h interchange.proxy.rlwy.net -U postgres -p 45349 -d railway
   ```
5. Open a new terminal (here in VS Code or separate)
6. Paste and run that command
7. You'll see `railway=>` prompt
8. Run:
   ```sql
   UPDATE admin_users
   SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
   WHERE email = 'abelngeno1@gmail.com';
   ```
9. You should see: `UPDATE 1`
10. Type `\q` and press Enter to exit
11. Restart aHandyWriterz service (see step 4 above)
12. Login (see step 5 above)

---

## After Login Success

Once you're logged into production Strapi admin:

### ✅ Immediate Checks:
1. Go to **Content-Type Builder** (left sidebar)
2. Verify you see:
   - ✅ **Service** collection type
   - ✅ **Article** collection type
3. If missing, we'll need to rebuild content types

### ✅ Change Your Password:
1. Click your profile (top right corner)
2. Click **"Profile"**
3. Change password to something secure
4. **Save**

### ✅ Next Steps:
1. Create first Service entry (Nursing domain)
2. Create first Article entry
3. Generate API token for web app
4. Connect web app to production Strapi

---

## Troubleshooting

**If login still fails:**
- Check you copied the ENTIRE password hash (no spaces at start/end)
- Check the hash starts with `$2a$10$` and is very long
- Try using `id = 2` instead of email in UPDATE command:
  ```sql
  UPDATE admin_users
  SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
  WHERE id = 2;
  ```

**If you see "Invalid credentials":**
- Wait 2 full minutes after restart
- Try clearing browser cache/cookies for the production domain
- Try incognito/private window

**If password field won't update:**
- There might be database constraints
- Try deleting the user and re-creating:
  ```sql
  DELETE FROM admin_users WHERE id = 2;
  ```
  Then immediately go to `/admin` and register fresh

---

## Success Criteria

✅ You've succeeded when:
- Production login page accepts your credentials
- You see "Hello ABEL" at top of dashboard
- You can click Content-Type Builder and see collections
- You can navigate through admin panel

**Screenshot the dashboard and let me know when you're in!** 🚀
