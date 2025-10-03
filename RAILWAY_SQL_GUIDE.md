# Visual Guide: Where to Run SQL in Railway

## Your Current Location ✅

Looking at your screenshot, you are here:
- Railway Dashboard
- Postgres service selected
- **Database** tab (top)
- **Data** sub-tab (selected)
- You can see tables: `admin_users`, `articles`, `services`, etc.

---

## Step 1: Click on "admin_users" Table

**WHERE TO LOOK:**
- In the middle section of your screen
- You see a grid of blue table icons
- Find **"admin_users"** (it's in the 3rd row, 4th column)
- It looks like: 📊 `admin_users`

**CLICK IT** → This will open the table

---

## Step 2: Find the Query/SQL Console

After clicking `admin_users`, you should see:

**Option A: Query Tab** (Top of page)
- Look for tabs: `Data` | `Extensions` | `Credentials`
- There might be a **Query** option
- Click it

**Option B: Three Dots Menu**
- Look for `⋮` (three vertical dots) near the table name
- Click it
- Select "Run Query" or "SQL Console"

**Option C: Direct SQL Input**
- Some Railway views have a SQL input box at the top
- It might say "Type SQL query here..." or similar
- You can type directly there

---

## Step 3: Paste the SQL Command

Copy this EXACT text:

```sql
UPDATE admin_users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
WHERE email = 'abelngeno1@gmail.com';
```

**Paste it into the SQL input box**

---

## Step 4: Execute the Query

Look for a button that says:
- **"Run"**
- **"Execute"**
- **"Submit"**
- Or press `Ctrl+Enter` (might work)

**CLICK IT**

You should see:
```
✅ Query executed successfully
✅ 1 row updated
```

---

## Step 5: Restart Strapi Service

1. Click **"aHandyWriterz"** in the left sidebar
2. Click **"Settings"** tab (top menu)
3. Scroll down to bottom
4. Find **"Restart"** button
5. Click it
6. Wait for "Restarting..." → "Running" (about 60 seconds)

---

## Step 6: Login to Production

Open this URL in new tab:
```
https://ahandywriterz-production.up.railway.app/admin/auth/login
```

**Login with:**
- Email: `abelngeno1@gmail.com`
- Password: `Admin123!`

**Click "Login"**

---

## Alternative: If You Can't Find SQL Console

### Use Railway CLI (Advanced)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link to project:
   ```bash
   railway link
   ```
   Select: `handywriterz-production`

4. Run SQL:
   ```bash
   railway run psql -c "UPDATE admin_users SET password = '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu' WHERE email = 'abelngeno1@gmail.com';"
   ```

---

## Troubleshooting

### "Can't find Query button"
Try these:
1. Look for **"Connect"** button (top right) → Opens SQL console
2. Click on the `admin_users` table name → Should show data + SQL option
3. Check if there's a **"Terminal"** or **"Console"** tab

### "SQL syntax error"
Make sure you copied the ENTIRE command including:
- The single quotes around the password hash
- The semicolon at the end
- No extra spaces or line breaks

### "No rows updated"
The email might be different. First run:
```sql
SELECT * FROM admin_users;
```
Check what email is actually in the database, then update your WHERE clause.

---

## Quick Copy Commands

**Check what's in the table:**
```sql
SELECT id, email, firstname, lastname FROM admin_users;
```

**Update password (safe - uses ID):**
```sql
UPDATE admin_users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu'
WHERE id = 1;
```

**Delete and let you re-register:**
```sql
DELETE FROM admin_users;
```
(Then immediately go to `/admin` and register)

---

## Success Checklist

- [ ] Found the `admin_users` table in Railway
- [ ] Ran the SQL UPDATE command
- [ ] Saw "1 row updated" success message
- [ ] Restarted aHandyWriterz service
- [ ] Logged in with `abelngeno1@gmail.com` / `Admin123!`
- [ ] Saw production Strapi dashboard

**When you see the production dashboard, screenshot it and tell me!** 🎉
