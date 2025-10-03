@echo off
echo ================================================
echo Railway Admin Password Reset
echo ================================================
echo.
echo Switching to Postgres service...
cd /d d:\HandyWriterzNEW\apps\strapi
railway service Postgres

echo.
echo Connecting to database...
echo.
echo Once connected, paste this SQL command:
echo.
echo UPDATE admin_users SET password = '$2b$10$GWbEGx4edLkt1enf03WwZOZPVqilSrS2Eg7KxxVxjjgnouStrfMQy', is_active = true, blocked = false WHERE email = 'abelngeno1@gmail.com';
echo.
echo Then run: SELECT id, email, is_active FROM admin_users WHERE email = 'abelngeno1@gmail.com';
echo.
echo Type \q to exit when done.
echo.
pause
railway connect
