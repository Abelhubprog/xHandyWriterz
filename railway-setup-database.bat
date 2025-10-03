@echo off
REM Railway Database Setup & Deployment Script for Windows
REM Run from repository root: railway-setup-database.bat

echo.
echo ======================================
echo HandyWriterz Railway Database Setup
echo ======================================
echo.

cd apps\strapi

echo Step 1: Checking current Railway link...
railway status
if %errorlevel% neq 0 (
    echo Not linked to Railway. Run: railway link
    exit /b 1
)

echo.
echo Step 2: Checking existing services...
railway service list

echo.
echo Step 3: Checking for DATABASE_URL...
railway variables | findstr /C:"DATABASE_URL" >nul
if %errorlevel% equ 0 (
    echo DATABASE_URL already exists!
    echo.
    set /p redeploy="Database appears linked. Redeploy? (y/N): "
    if /i "%redeploy%"=="y" (
        echo Redeploying...
        railway up
    )
    exit /b 0
)

echo No DATABASE_URL found.
echo.
echo Choose database option:
echo   1) Add Railway Postgres (recommended)
echo   2) Enter external DATABASE_URL manually
echo   3) Cancel
echo.
set /p choice="Selection (1-3): "

if "%choice%"=="1" (
    echo.
    echo Provisioning Railway Postgres...
    railway add --database postgres
    echo.
    echo Waiting for Postgres to provision...
    timeout /t 10 /nobreak >nul
    echo.
    echo Deploying Strapi...
    railway up
    echo.
    echo Monitoring deployment...
    railway logs --follow
) else if "%choice%"=="2" (
    echo.
    set /p db_url="Enter DATABASE_URL: "
    if not "!db_url!"=="" (
        echo Setting DATABASE_URL...
        railway variables --set "DATABASE_URL=!db_url!"
        echo.
        echo Deploying Strapi...
        railway up
        echo.
        echo Monitoring deployment...
        railway logs --follow
    ) else (
        echo No DATABASE_URL provided. Exiting.
        exit /b 1
    )
) else if "%choice%"=="3" (
    echo Cancelled.
    exit /b 0
) else (
    echo Invalid selection.
    exit /b 1
)
