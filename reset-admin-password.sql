-- Reset admin password for abelngeno1@gmail.com
-- Password will be: dunnyYOH#9
-- Generated hash: $2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy

UPDATE admin_users 
SET 
  password = '$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy',
  is_active = true,
  blocked = false
WHERE email = 'abelngeno1@gmail.com';

-- Show the updated user
SELECT id, firstname, lastname, email, is_active, blocked, created_at 
FROM admin_users 
WHERE email = 'abelngeno1@gmail.com';
