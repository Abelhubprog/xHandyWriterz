#!/bin/bash
# Railway Database Setup & Deployment Script
# Run from repository root: ./railway-setup-database.sh

set -e

echo "🚀 HandyWriterz Railway Database Setup"
echo "======================================"
echo ""

cd apps/strapi

echo "📋 Step 1: Checking current Railway link..."
railway status || {
    echo "❌ Not linked to Railway. Run: railway link"
    exit 1
}

echo ""
echo "📊 Step 2: Checking existing services..."
railway service list

echo ""
echo "🔍 Step 3: Checking for DATABASE_URL..."
if railway variables | grep -q "DATABASE_URL"; then
    echo "✅ DATABASE_URL already exists!"
    echo ""
    read -p "Database appears linked. Redeploy? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Redeploying..."
        railway up
    fi
else
    echo "⚠️  No DATABASE_URL found."
    echo ""
    echo "Choose database option:"
    echo "  1) Add Railway Postgres (recommended)"
    echo "  2) Enter external DATABASE_URL manually"
    echo "  3) Cancel"
    echo ""
    read -p "Selection (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo "📦 Provisioning Railway Postgres..."
            railway add --database postgres
            echo ""
            echo "⏳ Waiting for Postgres to provision (10 seconds)..."
            sleep 10
            echo ""
            echo "🔗 Linking database to service..."
            echo "✅ Database should auto-link via Railway"
            echo ""
            echo "🚀 Deploying Strapi..."
            railway up
            ;;
        2)
            echo ""
            read -p "Enter DATABASE_URL: " db_url
            if [ -n "$db_url" ]; then
                echo "📝 Setting DATABASE_URL..."
                railway variables --set "DATABASE_URL=$db_url"
                echo ""
                echo "🚀 Deploying Strapi..."
                railway up
            else
                echo "❌ No DATABASE_URL provided. Exiting."
                exit 1
            fi
            ;;
        3)
            echo "Cancelled."
            exit 0
            ;;
        *)
            echo "Invalid selection."
            exit 1
            ;;
    esac
fi

echo ""
echo "📊 Step 4: Monitoring deployment..."
echo "Press Ctrl+C to stop watching logs"
echo ""
sleep 3
railway logs --follow
