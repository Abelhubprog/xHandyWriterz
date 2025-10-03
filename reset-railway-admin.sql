-- Reset password for existing admin user
-- This SQL script directly updates the admin user's password hash
-- Password will be set to: dunnyYOH#9

UPDATE admin_users 
SET 
  password = '$2a$10$xQk5YhHopgE8Zrp5.vK8sOX4qJqK5X9YGz0JrP4vQ9K.vL6eF3Zai',
  reset_password_token = NULL,
  blocked = false
WHERE email = 'abelngeno1@gmail.com';

-- Verify the update
SELECT id, firstname, lastname, email, username, blocked, created_at
FROM admin_users 
WHERE email = 'abelngeno1@gmail.com';
