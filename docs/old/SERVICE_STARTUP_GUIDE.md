# Service Startup Guide

Quick reference for starting all services required for local development and testing.

---

## 🎯 Quick Start (All Services)

Open **4 separate terminals** and run these commands:

### Terminal 1: Strapi CMS
```bash
cd d:\HandyWriterzNEW\apps\strapi
pnpm install
pnpm develop
```
**Accessible at:** http://localhost:1337  
**Admin panel:** http://localhost:1337/admin  
**API:** http://localhost:1337/api

### Terminal 2: Upload Broker Worker
```bash
cd d:\HandyWriterzNEW\workers\upload-broker
pnpm install
wrangler dev --port 8787
```
**Accessible at:** http://127.0.0.1:8787  
**Health check:** http://127.0.0.1:8787/health (not implemented yet)

### Terminal 3: Mattermost Chat
```bash
cd d:\HandyWriterzNEW\apps\mattermost
docker-compose up
```
**Accessible at:** http://localhost:8065  
**API:** http://localhost:8065/api/v4  
**Note:** First startup takes ~2 minutes

### Terminal 4: Web Application
```bash
cd d:\HandyWriterzNEW\apps\web
pnpm install
pnpm dev
```
**Accessible at:** http://localhost:5173  
**Vite dev server with hot reload**

---

## 📋 Service Details

### 1. Strapi CMS (Port 1337)

**Purpose:** Content management system for services and articles

**Environment Variables Required:**
```bash
# apps/strapi/.env
DATABASE_URL=postgresql://user:password@localhost:5432/strapi
R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key
R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_REGION=auto
R2_BUCKET_MEDIA=handywriterz-cms
R2_PUBLIC_BASE=https://cdn.yourdomain.com
ADMIN_JWT_SECRET=generate_random_string
API_TOKEN_SALT=generate_random_string
APP_KEYS=generate_random_string
JWT_SECRET=generate_random_string
```

**First-Time Setup:**
```bash
cd apps/strapi

# Install dependencies
pnpm install

# Create .env file (copy from .env.example if exists)
# Set up PostgreSQL database (or use SQLite for dev)

# Start development server
pnpm develop

# Open http://localhost:1337/admin
# Create first admin user when prompted
# Username: admin
# Password: (set your own)

# Create content types:
# - Service (already in strapi-schemas/)
# - Article (already in strapi-schemas/)
```

**Common Issues:**
- **Port 1337 already in use:** Kill process with `npx kill-port 1337`
- **Database connection failed:** Verify `DATABASE_URL` in .env
- **Upload fails:** Check R2 credentials and bucket exists

### 2. Upload Broker Worker (Port 8787)

**Purpose:** Presigned URL generation for R2 uploads/downloads

**Environment Variables Required:**
```bash
# workers/upload-broker/.dev.vars
S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=handywriterz-uploads
S3_ACCESS_KEY_ID=your_cloudflare_r2_access_key
S3_SECRET_ACCESS_KEY=your_cloudflare_r2_secret
FORCE_PATH_STYLE=true
DOWNLOAD_TTL_SECONDS=300
```

**First-Time Setup:**
```bash
cd workers/upload-broker

# Install dependencies
pnpm install

# Install Wrangler CLI globally (if not installed)
npm install -g wrangler

# Create .dev.vars file (copy values from Cloudflare dashboard)

# Start local worker
wrangler dev --port 8787

# Test endpoints:
# POST http://127.0.0.1:8787/s3/presign-put
# POST http://127.0.0.1:8787/s3/presign
```

**Common Issues:**
- **Port 8787 already in use:** Change port with `wrangler dev --port 8788`
- **S3 signature mismatch:** Verify R2 credentials exact match
- **CORS errors:** Worker automatically adds CORS headers; check browser console

### 3. Mattermost Chat (Port 8065)

**Purpose:** Messaging platform for admin-user support conversations

**Environment Variables Required:**
```bash
# apps/mattermost/.env
POSTGRES_USER=mmuser
POSTGRES_PASSWORD=mmuser_password
POSTGRES_DB=mattermost
R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key
R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret
```

**First-Time Setup:**
```bash
cd apps/mattermost

# Ensure Docker Desktop is running

# Create .env file with PostgreSQL credentials

# Start services (Postgres + Mattermost)
docker-compose up -d

# Wait ~2 minutes for Mattermost to initialize
# Check logs: docker-compose logs -f mattermost

# Open http://localhost:8065
# Create first admin account when prompted
# Email: admin@yourdomain.com
# Password: (set your own)

# Create a team:
# Team Name: HandyWriterz
# Team URL: handywriterz

# Note the Team ID from URL:
# http://localhost:8065/handywriterz/channels/town-square
# Team ID is in the URL path

# Update apps/web/.env with:
VITE_MATTERMOST_URL=http://localhost:8065
VITE_MATTERMOST_TEAM_ID=<team-id-from-url>
```

**Post-Setup Configuration:**
1. **Enable API access:**
   - System Console → Web Server → Enable API v4: true
   - System Console → API → Enable Personal Access Tokens: true

2. **Configure S3 Storage:**
   - System Console → File Storage
   - File Storage System: Amazon S3
   - Amazon S3 Bucket: handywriterz-chat
   - Amazon S3 Endpoint: account-id.r2.cloudflarestorage.com
   - Amazon S3 Region: auto
   - (Credentials already set in config/mattermost.json)

3. **Create Bot Account (for notifications):**
   - System Console → Integrations → Bot Accounts: Enable
   - Integrations → Bot Accounts → Add Bot Account
   - Username: notification-bot
   - Save token for `MATTERMOST_BOT_TOKEN`

**Common Issues:**
- **Port 8065 already in use:** Stop containers with `docker-compose down`
- **Database connection failed:** Check PostgreSQL logs with `docker-compose logs db`
- **File uploads fail:** Verify R2 credentials in config/mattermost.json
- **Cannot create team:** Check license file or use free tier

### 4. Web Application (Port 5173)

**Purpose:** React SPA with Vite dev server

**Environment Variables Required:**
```bash
# apps/web/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_CMS_URL=http://localhost:1337
VITE_CMS_TOKEN=your_strapi_api_token
VITE_MATTERMOST_URL=http://localhost:8065
VITE_MATTERMOST_API_URL=http://localhost:8065/api/v4
VITE_MATTERMOST_TEAM_ID=team_id_from_mattermost
VITE_UPLOAD_BROKER_URL=http://127.0.0.1:8787
VITE_APP_URL=http://localhost:5173
ENABLE_ADMIN_DASHBOARD=true
ENABLE_CONTENT_MANAGEMENT=true
ENABLE_MESSAGING=true
```

**First-Time Setup:**
```bash
cd apps/web

# Install dependencies
pnpm install

# Copy .env.example to .env
cp .env.example .env

# Update .env with:
# - Clerk publishable key from dashboard
# - Strapi admin API token (generate in Strapi admin)
# - Mattermost team ID
# - Other service URLs

# Start dev server
pnpm dev

# Open http://localhost:5173
# Browser auto-opens with hot reload enabled
```

**Common Issues:**
- **Port 5173 already in use:** Vite auto-increments to 5174
- **Clerk not loading:** Check `VITE_CLERK_PUBLISHABLE_KEY` is set
- **CMS requests fail:** Verify Strapi is running on 1337
- **Mattermost iframe blank:** Check `VITE_MATTERMOST_URL` and team ID

---

## 🔍 Health Check Commands

After starting all services, verify they're accessible:

### Quick Health Check
```bash
# Strapi
curl http://localhost:1337/admin/health

# Upload Broker (returns 404 but confirms worker running)
curl http://127.0.0.1:8787/

# Mattermost
curl http://localhost:8065/api/v4/system/ping

# Web App (returns HTML)
curl http://localhost:5173
```

### Detailed Service Check
```powershell
# Check listening ports
netstat -ano | findstr ":1337 :8065 :8787 :5173"

# Expected output:
# TCP    0.0.0.0:1337    ... LISTENING    <PID>
# TCP    0.0.0.0:8065    ... LISTENING    <PID>
# TCP    127.0.0.1:8787  ... LISTENING    <PID>
# TCP    0.0.0.0:5173    ... LISTENING    <PID>
```

### Process Check
```powershell
# Find processes by port
Get-NetTCPConnection -LocalPort 1337,8065,8787,5173 | Select-Object LocalPort,State,OwningProcess
```

---

## 🧪 Testing Workflow

Once all services are running, follow this test sequence:

### Test 1: Content Publishing (5 minutes)
```bash
# 1. Open browser to http://localhost:5173
# 2. Sign in with Clerk (create account if first time)
# 3. Navigate to /admin/publish
# 4. Create test service:
#    - Title: "Test Academic Service"
#    - Slug: test-academic-service
#    - Domain: academic-writing
#    - Type Tags: essay, research
#    - Body: "This is a test service for validation"
# 5. Save as draft
# 6. Click "Generate Preview"
# 7. Open preview link in new tab
# 8. Return to editor, click "Publish"
# 9. Navigate to /services
# 10. Verify "Test Academic Service" appears in list
```

**Expected Result:** Content flows from draft → preview → published ✅

### Test 2: User File Upload (3 minutes)
```bash
# 1. Navigate to /dashboard/documents
# 2. Drag-drop a PDF file (or click to select)
# 3. Verify file appears in "Selected Files" list
# 4. Click "Upload Files"
# 5. Wait for upload to complete (toast notification)
# 6. Verify file appears in "Upload History"
# 7. Click "Download" button
# 8. Verify presigned URL opens file in new tab
# 9. Click "Copy Link" button
# 10. Paste URL in new tab, verify file downloads
```

**Expected Result:** Upload → R2 storage → presigned download ✅

### Test 3: User Messaging (5 minutes)
```bash
# 1. Navigate to /dashboard/support
# 2. Type message: "Hi, I need help with my order"
# 3. Click "Attach File"
# 4. Select an image or document
# 5. Click "Send Message"
# 6. Verify message appears in timeline
# 7. Verify "Creating support channel..." message (first time only)
# 8. Wait ~3 seconds for channel creation
# 9. Refresh page
# 10. Verify message and attachment visible
```

**Expected Result:** Channel auto-created, message + file sent ✅

### Test 4: Admin Messaging Response (5 minutes)
```bash
# 1. Open new browser window (or incognito)
# 2. Sign in as admin user (with admin role in Clerk metadata)
# 3. Navigate to /admin/messaging
# 4. Verify user's support channel appears in channel list
# 5. Click on channel
# 6. Verify user's message and attachment visible
# 7. Type reply: "I'll help you with that!"
# 8. Attach a PDF document
# 9. Click "Send Reply"
# 10. Switch to user browser window
# 11. Refresh /dashboard/support
# 12. Verify admin reply and attachment appear
```

**Expected Result:** Bi-directional messaging + file sharing ✅

### Test 5: End-to-End Integration (10 minutes)
Complete user journey from homepage to resolved support ticket:
1. Homepage → Sign Up (Clerk)
2. Dashboard → Browse Services (Strapi)
3. Select Service → View Detail
4. Dashboard → Upload Document
5. Dashboard → Send Support Message with file
6. Admin → View Message
7. Admin → Reply with attachment
8. User → Download Admin attachment
9. Admin → Mark conversation resolved
10. User → Verify resolution status

**Expected Result:** All systems working together seamlessly ✅

---

## 🛑 Shutdown Commands

### Graceful Shutdown (All Services)
```bash
# Web App (Terminal 4)
# Press Ctrl+C

# Upload Broker (Terminal 2)
# Press Ctrl+C

# Strapi (Terminal 1)
# Press Ctrl+C

# Mattermost (Terminal 3)
cd apps/mattermost
docker-compose down
```

### Force Kill Ports
```powershell
# If services won't stop gracefully
npx kill-port 1337 8787 8065 5173
```

### Clean Docker Volumes (Reset Mattermost)
```bash
cd apps/mattermost
docker-compose down -v  # WARNING: Deletes all data
```

---

## 📝 Troubleshooting

### "Port already in use" Error
```bash
# Find process using port
netstat -ano | findstr ":8787"

# Kill process by PID (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Mattermost Won't Start
```bash
# Check Docker Desktop is running
# Check logs
cd apps/mattermost
docker-compose logs -f

# Common issue: Database migration pending
# Solution: Wait 2-3 minutes for initialization
```

### Strapi Database Connection Failed
```bash
# For SQLite (dev only):
cd apps/strapi
# Edit config/database.ts to use SQLite instead of PostgreSQL

# For PostgreSQL:
# Install PostgreSQL locally or use Docker
docker run -d --name postgres-strapi -p 5432:5432 \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi \
  -e POSTGRES_DB=strapi \
  postgres:14
```

### Upload Broker S3 Errors
```bash
# Verify R2 credentials
cd workers/upload-broker
cat .dev.vars

# Test credentials with AWS CLI
aws s3 ls s3://your-bucket --endpoint-url https://your-account.r2.cloudflarestorage.com
```

### Web App Environment Not Loading
```bash
# Verify .env file exists
cd apps/web
cat .env

# Check Zod validation errors in browser console
# Open DevTools → Console → Look for validation errors

# Restart Vite server
# Press Ctrl+C, then pnpm dev
```

---

## 🎓 Development Tips

### Hot Reload Workflow
All services support hot reload for rapid development:
- **Web App:** Vite watches src files, instant browser reload
- **Strapi:** Watches API changes, auto-restarts server
- **Upload Broker:** Wrangler watches src, auto-reloads worker
- **Mattermost:** Requires container restart for config changes

### Recommended VSCode Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-azuretools.vscode-docker"
  ]
}
```

### Database GUI Tools
- **PostgreSQL:** pgAdmin, DBeaver, TablePlus
- **Strapi:** Built-in admin panel (http://localhost:1337/admin)
- **Mattermost:** Built-in web UI (http://localhost:8065)

### API Testing
```bash
# Strapi GraphQL Playground
http://localhost:1337/graphql

# Mattermost API Docs
http://localhost:8065/api/v4

# Upload Broker (use Postman/Insomnia)
POST http://127.0.0.1:8787/s3/presign-put
Content-Type: application/json
{
  "key": "test/file.pdf",
  "contentType": "application/pdf"
}
```

---

## 📚 Related Documentation

- **Architecture:** `docs/intel.md`
- **Data Flow:** `docs/dataflow.md`
- **Testing Guide:** `docs/END_TO_END_TESTING.md`
- **Pre-Deployment:** `docs/PRE_DEPLOYMENT_VALIDATION.md`
- **Error Resolution:** `docs/TYPESCRIPT_ERROR_RESOLUTION.md`

---

**Last Updated:** September 30, 2025  
**Maintained By:** Development Team
