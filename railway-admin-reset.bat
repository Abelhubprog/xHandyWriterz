@echo off
REM Quick Railway Strapi Admin Reset Script (Windows)
REM This script connects to Railway PostgreSQL and creates/resets admin user

echo.
echo ========================================
echo   Railway Strapi Admin Reset (Windows)
echo ========================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Railway CLI...
    npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Railway CLI
        echo Please run: npm install -g @railway/cli
        pause
        exit /b 1
    )
)

REM Navigate to Strapi directory
cd /d "%~dp0apps\strapi"
echo Current directory: %CD%
echo.

REM Link to Railway project
echo Linking to Railway project...
railway link
if %errorlevel% neq 0 (
    echo ERROR: Failed to link to Railway project
    echo Please run: railway login
    pause
    exit /b 1
)

echo.
echo Choose an action:
echo 1. Create new admin user (Email: abelngeno1@gmail.com, Password: Admin123!)
echo 2. Reset password for existing admin
echo 3. Delete all admins and create fresh
echo 4. Open PostgreSQL shell (manual SQL)
echo 5. View current admin users
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto create_admin
if "%choice%"=="2" goto reset_password
if "%choice%"=="3" goto delete_all
if "%choice%"=="4" goto open_shell
if "%choice%"=="5" goto view_admins
echo Invalid choice
pause
exit /b 1

:create_admin
echo.
echo Creating new admin user...
railway run psql %DATABASE_URL% -c "INSERT INTO admin_users (id, firstname, lastname, username, email, password, is_active, blocked, prefered_language, created_at, updated_at) VALUES (1, 'ABEL', 'NGENO', NULL, 'abelngeno1@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu', true, false, NULL, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, updated_at = NOW(); SELECT id, firstname, lastname, email, is_active FROM admin_users;"
goto restart_service

:reset_password
echo.
set /p email="Enter admin email to reset: "
echo Resetting password for %email%...
railway run psql %DATABASE_URL% -c "UPDATE admin_users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu', updated_at = NOW() WHERE email = '%email%'; SELECT id, firstname, lastname, email, is_active FROM admin_users WHERE email = '%email%';"
echo.
echo Password reset to: Admin123!
goto restart_service

:delete_all
echo.
echo WARNING: This will DELETE ALL admin users!
set /p confirm="Are you sure? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Cancelled
    pause
    exit /b 0
)
echo Deleting all admins and creating fresh...
railway run psql %DATABASE_URL% -c "DELETE FROM admin_users; INSERT INTO admin_users (id, firstname, lastname, username, email, password, is_active, blocked, prefered_language, created_at, updated_at) VALUES (1, 'ABEL', 'NGENO', NULL, 'abelngeno1@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu', true, false, NULL, NOW(), NOW()); SELECT id, firstname, lastname, email, is_active FROM admin_users;"
goto restart_service

:open_shell
echo.
echo Opening PostgreSQL shell...
echo Tip: Type \dt to list tables, \q to quit
railway run psql %DATABASE_URL%
pause
exit /b 0

:view_admins
echo.
echo Viewing current admin users...
railway run psql %DATABASE_URL% -c "SELECT id, firstname, lastname, email, is_active, blocked FROM admin_users;"
echo.
pause
exit /b 0

:restart_service
echo.
echo Database updated successfully!
echo.
echo Restarting Strapi service...
railway restart
if %errorlevel% neq 0 (
    echo WARNING: Automatic restart failed
    echo Please restart manually in Railway dashboard
)

echo.
echo ========================================
echo   Done! Wait 60 seconds, then login at:
echo   https://ahandywriterz-production.up.railway.app/admin/auth/login
echo.
echo   Credentials:
echo   Email: abelngeno1@gmail.com
echo   Password: Admin123!
echo.
echo   IMPORTANT: Change your password immediately after logging in!
echo ========================================
echo.
pause
