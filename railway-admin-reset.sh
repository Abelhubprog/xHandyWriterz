#!/bin/bash
# Quick Railway Strapi Admin Reset Script
# This script connects to Railway PostgreSQL and creates/resets admin user

set -e

echo "🚂 Railway Strapi Admin Reset"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to Strapi directory
cd "$(dirname "$0")/apps/strapi"

echo "📍 Current directory: $(pwd)"
echo ""

# Link to Railway project
echo "🔗 Linking to Railway project..."
railway link || {
    echo "❌ Failed to link. Please run 'railway login' first."
    exit 1
}

echo ""
echo "🎯 Choose an action:"
echo "1. Create new admin user (Email: abelngeno1@gmail.com, Password: Admin123!)"
echo "2. Reset password for existing admin"
echo "3. Delete all admins and create fresh"
echo "4. Open PostgreSQL shell (manual SQL)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Creating new admin user..."
        railway run psql $DATABASE_URL << EOF
INSERT INTO admin_users (
  id,
  firstname,
  lastname,
  username,
  email,
  password,
  is_active,
  blocked,
  prefered_language,
  created_at,
  updated_at
) VALUES (
  1,
  'ABEL',
  'NGENO',
  NULL,
  'abelngeno1@gmail.com',
  '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu',
  true,
  false,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  password = EXCLUDED.password,
  updated_at = NOW();

SELECT id, firstname, lastname, email, is_active FROM admin_users;
EOF
        ;;
    2)
        echo ""
        read -p "Enter admin email to reset: " email
        echo "🔄 Resetting password for $email..."
        railway run psql $DATABASE_URL << EOF
UPDATE admin_users
SET password = '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu',
    updated_at = NOW()
WHERE email = '$email';

SELECT id, firstname, lastname, email, is_active FROM admin_users WHERE email = '$email';
EOF
        echo "✅ Password reset to: Admin123!"
        ;;
    3)
        echo ""
        echo "⚠️  WARNING: This will DELETE ALL admin users!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  Deleting all admins and creating fresh..."
            railway run psql $DATABASE_URL << EOF
DELETE FROM admin_users;

INSERT INTO admin_users (
  id,
  firstname,
  lastname,
  username,
  email,
  password,
  is_active,
  blocked,
  prefered_language,
  created_at,
  updated_at
) VALUES (
  1,
  'ABEL',
  'NGENO',
  NULL,
  'abelngeno1@gmail.com',
  '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIcwNZfGrhwe.Qhbqx6y.J.HqxqQ9tQu',
  true,
  false,
  NULL,
  NOW(),
  NOW()
);

SELECT id, firstname, lastname, email, is_active FROM admin_users;
EOF
        else
            echo "❌ Cancelled"
            exit 0
        fi
        ;;
    4)
        echo ""
        echo "🐘 Opening PostgreSQL shell..."
        echo "Tip: Type \dt to list tables, \q to quit"
        railway run psql $DATABASE_URL
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Database updated successfully!"
echo ""
echo "🔄 Now restarting Strapi service..."
railway restart || {
    echo "⚠️  Automatic restart failed. Please restart manually in Railway dashboard."
}

echo ""
echo "🎉 Done! Wait 60 seconds for service to restart, then login at:"
echo "📍 https://ahandywriterz-production.up.railway.app/admin/auth/login"
echo ""
echo "🔑 Credentials:"
echo "   Email: abelngeno1@gmail.com"
echo "   Password: Admin123!"
echo ""
echo "⚠️  IMPORTANT: Change your password immediately after logging in!"
