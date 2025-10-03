#!/usr/bin/env pwsh
# Railway Admin Password Reset (After Proxy Fix)
# Run this AFTER setting ENABLE_PROXY=true in Railway Variables

$PROJECT_ID = "9e62407b-8aae-4958-b87f-db206b359006"
$ENVIRONMENT_ID = "5f6fe7ed-b228-4253-9ef7-ca3fc068da1d"
$SERVICE_ID = "86580b8f-90de-4205-b8b1-52ee9747da96"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Railway Admin Password Reset (Proxy Fix Applied)      " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "📦 Checking Railway CLI..." -ForegroundColor Yellow
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found!" -ForegroundColor Red
    Write-Host "Install it: npm install -g @railway/cli" -ForegroundColor White
    exit 1
}
Write-Host "✅ Railway CLI found" -ForegroundColor Green
Write-Host ""

# Check if ENABLE_PROXY is set
Write-Host "🔍 Checking ENABLE_PROXY variable..." -ForegroundColor Yellow
$proxyCheck = railway run --project $PROJECT_ID --environment $ENVIRONMENT_ID --service $SERVICE_ID printenv 2>&1 | Select-String "ENABLE_PROXY=true"

if (!$proxyCheck) {
    Write-Host "⚠️  WARNING: ENABLE_PROXY might not be set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add these variables in Railway Dashboard:" -ForegroundColor Yellow
    Write-Host "  ENABLE_PROXY=true" -ForegroundColor White
    Write-Host "  URL=https://ahandywriterz-production.up.railway.app" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Aborted. Please set variables first." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ ENABLE_PROXY is set" -ForegroundColor Green
}
Write-Host ""

# Get admin details
Write-Host "👤 Enter admin details:" -ForegroundColor Cyan
Write-Host ""
$email = Read-Host "Email address (default: abelngeno1@gmail.com)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "abelngeno1@gmail.com"
}

$password = Read-Host "New password (default: TempPassw0rd!2024)" -AsSecureString
if ($password.Length -eq 0) {
    $passwordPlain = "TempPassw0rd!2024"
} else {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Resetting Password on Railway Production             " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email: $email" -ForegroundColor White
Write-Host "Password: ********" -ForegroundColor White
Write-Host ""

# Reset password
Write-Host "🔐 Resetting password via Railway CLI..." -ForegroundColor Yellow
Write-Host ""

$resetCommand = "npx strapi admin:reset-user-password --email `"$email`" --password `"$passwordPlain`""
railway run --project $PROJECT_ID --environment $ENVIRONMENT_ID --service $SERVICE_ID $resetCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ SUCCESS - Password Reset Complete                 " -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Login URL: https://ahandywriterz-production.up.railway.app/admin" -ForegroundColor Cyan
    Write-Host "📧 Email: $email" -ForegroundColor White
    Write-Host "🔑 Password: $passwordPlain" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Change your password immediately after logging in!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Password reset failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if service is running: railway logs" -ForegroundColor White
    Write-Host "2. Verify database connection: railway run psql" -ForegroundColor White
    Write-Host "3. Check admin exists: railway run psql `$DATABASE_URL -c 'SELECT email FROM admin_users;'" -ForegroundColor White
    Write-Host ""
    Write-Host "See RAILWAY_PROXY_FIX.md for detailed troubleshooting" -ForegroundColor White
    Write-Host ""
    exit 1
}
