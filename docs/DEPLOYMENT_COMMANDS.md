# Deployment Commands Reference

**Quick Reference for HandyWriterz Production Deployment**

---

## 🚀 One-Command Deployment (After Configuration)

### Prerequisites Checklist

```bash
# ✅ Verify all environment files exist
ls apps/web/.env apps/strapi/.env workers/upload-broker/.dev.vars workers/mm-auth/.dev.vars

# ✅ Verify dependencies installed
pnpm install

# ✅ Verify type checking passes
pnpm type-check

# ✅ Verify build succeeds locally
pnpm build
```

---

## 📦 Local Development Commands

### Start All Services

```bash
# Terminal 1: Strapi CMS
cd apps/strapi
pnpm dev

# Terminal 2: Mattermost
cd apps/mattermost
docker-compose up

# Terminal 3: Upload Broker Worker
cd workers/upload-broker
wrangler dev

# Terminal 4: MM Auth Worker
cd workers/mm-auth
wrangler dev

# Terminal 5: Web App
cd apps/web
pnpm dev
```

### Health Checks

```bash
# Strapi
curl http://localhost:1337/_health

# Mattermost
curl http://localhost:8065/api/v4/system/ping

# Upload Broker
curl http://127.0.0.1:8787/health

# MM Auth
curl http://127.0.0.1:8788/health

# Web App
curl http://localhost:5173
```

---

## 🔧 Configuration Commands

### Environment Setup

```bash
# Copy environment templates
cp apps/web/.env.example apps/web/.env
cp apps/strapi/.env.example apps/strapi/.env
cp workers/upload-broker/.env.example workers/upload-broker/.dev.vars
cp workers/mm-auth/.env.example workers/mm-auth/.dev.vars

# Generate Strapi secrets
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))" # APP_KEYS (run 4 times)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))" # API_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))" # ADMIN_JWT_SECRET
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))" # TRANSFER_TOKEN_SALT
```

### Cloudflare KV Namespace

```bash
# Create KV namespace for rate limiting
wrangler kv:namespace create "RATE_LIMIT" --env production

# Add to wrangler.toml (copy the ID from output above)
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_NAMESPACE_ID"

# List all namespaces
wrangler kv:namespace list
```

### Cloudflare R2 Buckets

```bash
# Create buckets
wrangler r2 bucket create handywriterz-uploads --jurisdiction auto
wrangler r2 bucket create handywriterz-cms-media --jurisdiction auto
wrangler r2 bucket create handywriterz-chat-attachments --jurisdiction auto

# List buckets
wrangler r2 bucket list

# Generate R2 API token (do this in Cloudflare dashboard)
# Navigate to: R2 > Manage R2 API Tokens > Create API Token
# Save the Access Key ID and Secret Access Key
```

### Cloudflare Workers Secrets

```bash
# Upload Broker
cd workers/upload-broker
wrangler secret put S3_ACCESS_KEY_ID --env production
wrangler secret put S3_SECRET_ACCESS_KEY --env production
wrangler secret put VIRUSTOTAL_API_KEY --env production # Optional
wrangler secret put SENTRY_DSN --env production # Optional

# MM Auth
cd ../mm-auth
wrangler secret put MATTERMOST_ADMIN_TOKEN --env production
wrangler secret put CLERK_JWKS_URL --env production

# List all secrets
wrangler secret list --env production
```

---

## 🌐 Staging Deployment

### Deploy Workers (Staging)

```bash
# Upload Broker
cd workers/upload-broker
wrangler deploy --env staging
# Note the deployed URL

# MM Auth
cd ../mm-auth
wrangler deploy --env staging
# Note the deployed URL
```

### Deploy Strapi (Staging)

**Using Render.com:**

```bash
# 1. Connect GitHub repo to Render
# 2. Create new Web Service
# 3. Set build command: cd apps/strapi && pnpm install && pnpm build
# 4. Set start command: cd apps/strapi && pnpm start
# 5. Add environment variables from .env.example
# 6. Deploy
```

**Using Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Link to service
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set APP_KEYS="key1,key2,key3,key4"
# ... (set all variables from .env.example)

# Deploy
railway up
```

### Deploy Web App (Staging)

**Using Cloudflare Pages:**

```bash
cd apps/web

# Build
pnpm build

# Deploy
wrangler pages deploy dist --project-name=handywriterz-staging

# Or use direct upload
npx wrangler pages project create handywriterz-staging
npx wrangler pages deploy dist --project-name=handywriterz-staging

# Set environment variables
wrangler pages deployment env set VITE_CLERK_PUBLISHABLE_KEY "pk_test_..." --env production
wrangler pages deployment env set VITE_STRAPI_URL "https://cms-staging.yourdomain.com" --env production
# ... (set all VITE_* variables)
```

**Using Vercel:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel --env production

# Set environment variables via dashboard or CLI
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
vercel env add VITE_STRAPI_URL production
# ... (set all VITE_* variables)
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

```bash
# ✅ All staging tests passed
# ✅ No errors in Sentry for 24 hours
# ✅ Security review completed
# ✅ Database backups verified
# ✅ Rollback plan documented
# ✅ Team notified of deployment window
```

### Deploy Workers (Production)

```bash
# Upload Broker
cd workers/upload-broker
wrangler deploy --env production

# Verify
curl https://upload.yourdomain.com/health

# MM Auth
cd ../mm-auth
wrangler deploy --env production

# Verify
curl https://auth.yourdomain.com/health
```

### Deploy Strapi (Production)

```bash
# Same steps as staging but with production environment variables
# Use production database URL
# Use production R2 credentials
# Set NODE_ENV=production
```

### Deploy Web App (Production)

```bash
# Cloudflare Pages
cd apps/web
pnpm build
wrangler pages deploy dist --project-name=handywriterz-prod

# Or Vercel
vercel --prod

# Verify
curl https://yourdomain.com
```

### DNS Configuration

```bash
# Add custom domain to Cloudflare Pages
wrangler pages deployment create --project-name=handywriterz-prod --branch=main

# Add DNS records (in Cloudflare dashboard):
# Type: CNAME
# Name: yourdomain.com
# Target: handywriterz-prod.pages.dev
# Proxy: Enabled (orange cloud)

# Add DNS for workers:
# Type: CNAME
# Name: upload.yourdomain.com
# Target: upload-broker.YOUR_SUBDOMAIN.workers.dev
# Proxy: Enabled

# Repeat for auth.yourdomain.com
```

---

## 🔄 Post-Deployment Tasks

### Verify Deployment

```bash
# Health checks
curl https://yourdomain.com
curl https://cms.yourdomain.com/_health
curl https://chat.yourdomain.com/api/v4/system/ping
curl https://upload.yourdomain.com/health
curl https://auth.yourdomain.com/health

# Smoke tests
# 1. Login via Clerk
# 2. Navigate to /dashboard
# 3. Send test message
# 4. Upload test file
# 5. Publish test content
```

### Monitor Services

```bash
# Watch Cloudflare Workers logs
wrangler tail upload-broker --env production
wrangler tail mm-auth --env production

# Watch Sentry dashboard
# Navigate to: https://sentry.io/organizations/YOUR_ORG/projects/handywriterz/

# Watch Cloudflare Analytics
# Navigate to: Cloudflare Dashboard > Analytics & Logs > Workers Analytics
```

### Enable Monitoring

```bash
# Set up Uptime Robot monitors
# API endpoint: https://api.uptimerobot.com/v2/newMonitor
curl -X POST https://api.uptimerobot.com/v2/newMonitor \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "friendly_name": "HandyWriterz Web",
    "url": "https://yourdomain.com",
    "type": 1,
    "interval": 300
  }'

# Repeat for other services
```

---

## 🔧 Maintenance Commands

### Database Operations

```bash
# Backup Strapi database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_20250930_120000.sql

# Run migrations
cd apps/strapi
pnpm strapi migrate

# Rollback migration
pnpm strapi migrate:rollback
```

### Update Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update all packages (interactive)
pnpm update --interactive

# Update specific package
pnpm update package-name --filter @handywriterz/web

# Security audit
pnpm audit

# Fix security vulnerabilities
pnpm audit --fix
```

### Rotate Secrets

```bash
# Rotate Cloudflare Worker secrets
wrangler secret put S3_ACCESS_KEY_ID --env production
# (Enter new value)

# Rotate Strapi API token
# 1. Generate new token in Strapi admin
# 2. Update VITE_CMS_TOKEN in web app environment
# 3. Redeploy web app
# 4. Delete old token in Strapi admin

# Rotate Clerk keys
# 1. Generate new keys in Clerk dashboard
# 2. Update VITE_CLERK_PUBLISHABLE_KEY in web app
# 3. Redeploy web app
# 4. Revoke old keys after verification
```

### Scale Workers

```bash
# Check Worker usage
wrangler deployments list upload-broker --env production

# Increase Worker limits (requires paid plan)
# Navigate to: Cloudflare Dashboard > Workers & Pages > Settings > Usage Model
# Change from Bundled to Unbound

# Add custom domain for better performance
wrangler route add upload.yourdomain.com/* upload-broker --env production
```

---

## 🐛 Troubleshooting Commands

### Check Worker Logs

```bash
# Real-time logs
wrangler tail upload-broker --env production --format pretty

# Filter errors only
wrangler tail upload-broker --env production --status error

# Filter by header
wrangler tail upload-broker --env production --header "x-custom-header: value"
```

### Check Database Connections

```bash
# PostgreSQL connection test
psql $DATABASE_URL -c "SELECT version();"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql $DATABASE_URL -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"
```

### Debug Mattermost

```bash
# Check Mattermost logs
cd apps/mattermost
docker-compose logs -f --tail=100 mattermost

# Restart Mattermost
docker-compose restart mattermost

# Check database connection
docker-compose exec mattermost mattermost version
```

### Debug Strapi

```bash
# Check Strapi logs
cd apps/strapi
pm2 logs strapi # If using PM2

# Or direct logs
pnpm dev --debug

# Check database connection
node -e "const Strapi = require('@strapi/strapi'); Strapi().load().then(app => { console.log('Connected'); process.exit(0); });"
```

### Clear Caches

```bash
# Cloudflare cache purge
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'

# KV namespace clear (be careful!)
wrangler kv:key delete "ratelimit:*" --namespace-id YOUR_NAMESPACE_ID --env production

# Browser cache clear
# Instruct users: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## 🔙 Rollback Commands

### Emergency Rollback (< 5 minutes)

```bash
# Rollback Workers
wrangler rollback upload-broker --env production
wrangler rollback mm-auth --env production

# Rollback Web App (Cloudflare Pages)
wrangler pages deployment list --project-name=handywriterz-prod
wrangler pages deployment promote DEPLOYMENT_ID --env production

# Rollback Web App (Vercel)
vercel rollback https://yourdomain.com
```

### Rollback Database

```bash
# Restore from latest backup
psql $DATABASE_URL < /backups/strapi_latest.sql

# Or restore specific backup
psql $DATABASE_URL < /backups/strapi_20250930_120000.sql

# Verify restoration
psql $DATABASE_URL -c "SELECT count(*) FROM services;"
```

### Rollback via Git

```bash
# Identify commit to rollback to
git log --oneline -10

# Revert to specific commit
git revert COMMIT_SHA

# Force push (use with caution)
git push origin main --force

# Trigger CI/CD to redeploy old version
```

---

## 📊 Monitoring Commands

### Performance Metrics

```bash
# Lighthouse audit
npx lighthouse https://yourdomain.com --output html --output-path ./lighthouse-report.html

# Web Vitals check
npx @web3-storage/web3-vitals https://yourdomain.com

# Load testing with k6
k6 run --vus 100 --duration 5m tests/load/api-test.js
```

### Database Performance

```bash
# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Check table sizes
psql $DATABASE_URL -c "SELECT relname AS table_name, pg_size_pretty(pg_total_relation_size(relid)) AS size FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;"

# Check index usage
psql $DATABASE_URL -c "SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan ASC;"
```

### Worker Analytics

```bash
# Get Worker metrics via API
curl "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/workers/scripts/upload-broker/analytics" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Check rate limiting effectiveness
wrangler kv:key list --namespace-id YOUR_NAMESPACE_ID --prefix "ratelimit:"
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| **Local dev** | `pnpm dev` (in each service directory) |
| **Build all** | `pnpm build` (root directory) |
| **Type check** | `pnpm type-check` |
| **Lint** | `pnpm lint` |
| **Deploy worker** | `wrangler deploy --env production` |
| **Deploy web** | `wrangler pages deploy dist` or `vercel --prod` |
| **View logs** | `wrangler tail SERVICE_NAME --env production` |
| **Rollback** | `wrangler rollback SERVICE_NAME --env production` |
| **Health check** | `curl https://yourdomain.com/health` |
| **Create KV** | `wrangler kv:namespace create "NAME" --env production` |
| **Set secret** | `wrangler secret put SECRET_NAME --env production` |
| **Backup DB** | `pg_dump $DATABASE_URL > backup.sql` |

---

**📚 Additional Resources:**

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)
- [Mattermost Admin Guide](https://docs.mattermost.com/guides/administrator.html)

**🆘 Need Help?**

- Check `docs/PRODUCTION_DEPLOYMENT.md` for detailed instructions
- Review `docs/SERVICE_STARTUP_GUIDE.md` for service-specific setup
- Consult `docs/PRE_DEPLOYMENT_VALIDATION.md` for validation steps
