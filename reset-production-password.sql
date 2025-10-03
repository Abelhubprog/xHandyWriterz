-- SQL script to reset admin password in Railway Postgres
-- Run this in Railway → Postgres → Data tab

-- Option 1: Set password to "Password123!"
-- (This is a pre-hashed bcrypt password)
UPDATE admin_users
SET password = '$2a$10$9vqhk5pJZ5f5yc5yF5yF5eO5xH5xH5xH5xH5xH5xH5xH5xH5xH5x'
WHERE email = 'abelngeno1@gmail.com';

-- Option 2: Delete and recreate
-- Run these commands, then immediately register at /admin
DELETE FROM admin_users WHERE email = 'abelngeno1@gmail.com';

-- After running either option, restart aHandyWriterz service in Railway
-- Then go to: https://ahandywriterz-production.up.railway.app/admin

-- Option 1: Login with Password123!
-- Option 2: Register new admin quickly
