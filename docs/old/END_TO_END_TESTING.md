# End-to-End Testing Guide

## Overview
This document provides comprehensive testing procedures for verifying all production-ready features:
- Strapi 5 content publishing (ContentPublisher)
- Admin messaging with file sharing (AdminMessaging)
- User messaging with file sharing (UserMessaging)
- Bi-directional file sharing between users and admins
- Preview tokens and draft workflows
- Scheduled publishing
- Analytics and compliance checks

## Prerequisites

### Environment Setup
Ensure all required environment variables are set:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Strapi CMS
VITE_CMS_URL=https://your-strapi.railway.app
VITE_CMS_TOKEN=your_strapi_api_token

# Mattermost Messaging
VITE_MATTERMOST_URL=https://your-mattermost.railway.app
VITE_MATTERMOST_API_URL=https://your-mattermost.railway.app/api/v4
VITE_MATTERMOST_WS_URL=wss://your-mattermost.railway.app

# Cloudflare Workers
VITE_UPLOAD_BROKER_URL=https://upload-broker.your-workers.dev
VITE_MM_AUTH_WORKER_URL=https://mm-auth.your-workers.dev

# Preview & Cache
VITE_PREVIEW_SECRET=your_hmac_secret_key
VITE_CACHE_PURGE_WEBHOOK=https://cache-purge.your-workers.dev/purge
```

### Services Health Check
Verify all services are running:

```powershell
# Check Strapi
curl https://your-strapi.railway.app/api/services

# Check Mattermost
curl https://your-mattermost.railway.app/api/v4/system/ping

# Check Upload Broker
curl https://upload-broker.your-workers.dev/health

# Check MM Auth Worker
curl https://mm-auth.your-workers.dev/health
```

## Test Suite 1: Content Publishing (Admin)

### 1.1 Create New Service via ContentPublisher

**Route:** `/admin/publish?type=service`

**Steps:**
1. Sign in as admin user
2. Navigate to `/admin/publish?type=service`
3. Fill in form:
   - Title: "Test Service for E2E"
   - Slug: (auto-generated from title)
   - Summary: "This is a test service created during end-to-end testing"
   - Body: "Detailed description of the test service with multiple paragraphs."
   - Domain: Select "education" or "business"
   - Type Tags: Select 2-3 relevant tags
   - SEO Title: "Test Service SEO Title"
   - SEO Description: "Test service meta description for search engines"
   - Hero Image: Upload a test image (< 5MB)
4. Click "Save Draft"
5. Verify success toast appears
6. Verify redirect to admin dashboard

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Slug auto-generates with hyphens
- ✅ Hero image uploads to R2 and shows preview
- ✅ Draft saves successfully to Strapi
- ✅ Content appears in admin dashboard with "Draft" status

### 1.2 Generate Preview Token

**Steps:**
1. After saving draft, click "Generate Preview Link"
2. Copy the preview URL (contains `?token=...`)
3. Open preview URL in incognito window
4. Verify content displays correctly
5. Verify "Unpublished Preview" banner appears
6. Try accessing preview URL after 1 hour (should expire)

**Expected Results:**
- ✅ Preview token generates successfully
- ✅ Preview URL opens content in preview mode
- ✅ Banner indicates this is unpublished content
- ✅ Token expires after configured TTL
- ✅ Expired token shows error message

### 1.3 Publish Service

**Steps:**
1. Navigate back to `/admin/publish/:id` (edit mode)
2. Review all fields
3. Click "Publish"
4. Wait for success confirmation
5. Navigate to `/services` page
6. Search for published service
7. Click to view service detail

**Expected Results:**
- ✅ Publish updates status to "published"
- ✅ Cache purge webhook fires (check worker logs)
- ✅ Service appears in public services list immediately
- ✅ Service detail page renders correctly
- ✅ Hero image displays from R2 CDN
- ✅ SEO metadata appears in page head

### 1.4 Schedule Future Publish

**Steps:**
1. Create new service draft
2. Set "Publish At" to 5 minutes in future
3. Save draft
4. Wait 5+ minutes
5. Check if service auto-publishes
6. Verify cron job logs

**Expected Results:**
- ✅ Scheduled publish date saves correctly
- ✅ Service remains draft until scheduled time
- ✅ Service auto-publishes at scheduled time
- ✅ Cache purge webhook fires on auto-publish

## Test Suite 2: Admin Messaging & File Sharing

### 2.1 Admin Views User Conversations

**Route:** `/admin/messaging` or `/admin/support`

**Steps:**
1. Sign in as admin
2. Navigate to `/admin/messaging`
3. Review conversation list
4. Search for specific user by name/email
5. Filter by status (Open/Resolved/Archived)
6. Click on a conversation to view details

**Expected Results:**
- ✅ Conversation list loads from Mattermost
- ✅ Each conversation shows:
  - User name
  - Last message preview
  - Unread count
  - Attachment count
  - Status badge
- ✅ Search filters conversations in real-time
- ✅ Status filter works correctly
- ✅ Clicking conversation loads message timeline

### 2.2 Admin Sends Reply with File Attachment

**Steps:**
1. Select an open conversation
2. Type reply message: "Thanks for reaching out! I've attached the document you requested."
3. Click "Attach Files"
4. Select 2 files:
   - One PDF document (< 10MB)
   - One image (< 5MB)
5. Verify file previews appear
6. Click "Send Reply"
7. Wait for upload and send confirmation

**Expected Results:**
- ✅ File selection validates size and type
- ✅ Selected files show as badges with size
- ✅ Files upload to Mattermost via mm-client
- ✅ Upload progress displays
- ✅ Message sends with attached file IDs
- ✅ Message appears in timeline immediately
- ✅ Files show as downloadable attachments
- ✅ Image files show thumbnail preview

### 2.3 Admin Downloads User Attachment

**Steps:**
1. Find a message from user with attachments
2. Click on file attachment
3. Verify download starts
4. Check downloaded file integrity

**Expected Results:**
- ✅ Click triggers presigned download URL
- ✅ File downloads successfully
- ✅ File opens correctly (not corrupted)
- ✅ Image attachments show inline preview

### 2.4 Admin Marks Conversation Resolved

**Steps:**
1. Select a conversation
2. Click "Mark Resolved" button
3. Verify status changes
4. Filter by "Resolved" status
5. Verify conversation appears in resolved list

**Expected Results:**
- ✅ Status updates to "Resolved"
- ✅ Badge changes color
- ✅ Conversation moves to resolved filter
- ✅ Can re-open conversation if needed

## Test Suite 3: User Messaging & File Sharing

### 3.1 User Sends First Message

**Route:** `/dashboard/support`

**Steps:**
1. Sign in as regular user
2. Navigate to `/dashboard/support`
3. Type message: "I need help with my assignment submission"
4. Click "Send Message"
5. Verify support channel auto-creates

**Expected Results:**
- ✅ If no support channel exists, displays info alert
- ✅ First message creates support channel automatically
- ✅ Channel name format: `support-{userId}`
- ✅ Message sends successfully
- ✅ Message appears in timeline
- ✅ Admin sees new conversation in their messaging center

### 3.2 User Uploads File to Support

**Steps:**
1. Click "Attach Files" button
2. Select 3 files:
   - Assignment document (Word/PDF)
   - Screenshot (PNG/JPG)
   - Requirements file (TXT)
3. Verify file previews
4. Type message: "Here are my assignment files"
5. Click "Send Message"
6. Wait for upload completion

**Expected Results:**
- ✅ File validation checks size (max 50MB) and type
- ✅ Invalid files show error toast
- ✅ Valid files show as badges with size
- ✅ Can remove files before sending
- ✅ Files upload sequentially
- ✅ Upload progress displays
- ✅ Message sends with all file IDs
- ✅ Files appear as attachments in message
- ✅ Admin receives notification of new message

### 3.3 User Downloads Admin Reply Attachment

**Steps:**
1. Wait for admin reply with attachment
2. Refresh messages (or wait for auto-refresh)
3. Verify admin message appears
4. Click on attached file
5. Verify download starts

**Expected Results:**
- ✅ Admin messages appear with distinct styling
- ✅ Attachments show with file icon and name
- ✅ Click triggers download
- ✅ File downloads successfully

### 3.4 User Continues Conversation

**Steps:**
1. Send follow-up message
2. Attach additional file
3. Wait for admin response
4. Verify real-time updates work

**Expected Results:**
- ✅ Conversation continues in same channel
- ✅ Message history persists
- ✅ Auto-refresh pulls new messages every 30 seconds
- ✅ Manual refresh button works
- ✅ Timestamps show relative time

## Test Suite 4: File Upload via Documents Page

### 4.1 User Uploads Project Files

**Route:** `/dashboard/documents`

**Steps:**
1. Sign in as user
2. Navigate to `/dashboard/documents`
3. Drag and drop 5 files onto dropzone
4. Wait for presign and upload
5. Verify files appear in history

**Expected Results:**
- ✅ Drag-and-drop highlights dropzone
- ✅ File validation checks max files (10) and max size (200MB)
- ✅ Worker presigns upload URLs
- ✅ Files upload directly to R2
- ✅ Upload history displays with timestamps
- ✅ Can download files via presigned GET
- ✅ Can copy shareable link

### 4.2 Admin Reviews Uploaded Files

**Steps:**
1. Sign in as admin
2. Check admin file review dashboard (if implemented)
3. Verify uploaded files visible
4. Check AV scan status
5. Download file for review

**Expected Results:**
- ✅ Admin can see all user uploads
- ✅ AV scan status displays (if implemented)
- ✅ Can download for review
- ✅ Can track upload metadata

## Test Suite 5: Integration Verification

### 5.1 End-to-End User Journey

**Complete User Flow:**
1. User signs up via Clerk
2. User navigates to services, finds service
3. User goes to dashboard, uploads assignment files
4. User sends message to support with attachments
5. Admin receives notification
6. Admin reviews files via messaging
7. Admin replies with guidance document
8. User receives reply and downloads document
9. User submits final version
10. Admin marks conversation resolved

**Expected Results:**
- ✅ Complete flow works without errors
- ✅ Files transfer bi-directionally
- ✅ All notifications fire correctly
- ✅ Data persists across sessions

### 5.2 Cross-Service Data Flow

**Verify Integration Points:**
1. Strapi → Frontend (content delivery)
2. Mattermost → Frontend (real-time messaging)
3. R2 → Frontend (file downloads)
4. Frontend → Strapi (content publishing)
5. Frontend → Mattermost (message sending)
6. Frontend → R2 (file uploads)
7. Worker → R2 (presign operations)
8. Worker → Mattermost (auth bridging if implemented)

**Expected Results:**
- ✅ All API calls succeed with proper auth
- ✅ CORS configured correctly
- ✅ Tokens/secrets secure and working
- ✅ No HTTPS/mixed content errors

## Test Suite 6: Error Handling & Edge Cases

### 6.1 Network Failure Recovery

**Steps:**
1. Start file upload
2. Disable network mid-upload
3. Re-enable network
4. Verify recovery behavior

**Expected Results:**
- ✅ Upload shows error state
- ✅ Retry mechanism works
- ✅ User sees clear error message

### 6.2 Large File Upload

**Steps:**
1. Upload file close to 50MB limit
2. Monitor upload progress
3. Verify multipart upload if needed

**Expected Results:**
- ✅ Large files upload successfully
- ✅ Progress bar accurate
- ✅ No timeout errors

### 6.3 Invalid Token Handling

**Steps:**
1. Access preview URL with expired token
2. Access preview URL with malformed token
3. Access without token

**Expected Results:**
- ✅ Shows clear error message
- ✅ Redirects to appropriate page
- ✅ No server errors

### 6.4 Unauthorized Access

**Steps:**
1. Try accessing `/admin/publish` without admin role
2. Try accessing `/admin/messaging` as regular user
3. Try accessing other user's files

**Expected Results:**
- ✅ Shows access denied message
- ✅ Redirects to dashboard
- ✅ Prevents unauthorized operations

## Test Suite 7: Performance & Load

### 7.1 Content List Performance

**Steps:**
1. Publish 50+ services/articles
2. Navigate to services page
3. Measure load time
4. Test pagination/infinite scroll

**Expected Results:**
- ✅ Initial load < 2 seconds
- ✅ React Query caches effectively
- ✅ No memory leaks

### 7.2 Messaging Timeline Performance

**Steps:**
1. Create conversation with 100+ messages
2. Scroll through timeline
3. Measure render performance

**Expected Results:**
- ✅ Smooth scrolling
- ✅ Virtual scrolling works (if implemented)
- ✅ No UI freezing

### 7.3 Concurrent File Uploads

**Steps:**
1. Upload 10 files simultaneously
2. Monitor browser network tab
3. Verify all complete successfully

**Expected Results:**
- ✅ Uploads handled concurrently
- ✅ No rate limit errors
- ✅ Progress tracking accurate

## Automated Testing Checklist

### Unit Tests to Add
- [ ] Preview token generation/validation
- [ ] File upload presign workflow
- [ ] Message send with attachments
- [ ] Form validation in ContentPublisher
- [ ] Search/filter logic in AdminMessaging

### Integration Tests to Add
- [ ] Playwright: Complete publishing flow
- [ ] Playwright: Messaging with file upload
- [ ] Playwright: User document upload/download
- [ ] API: Strapi CRUD operations
- [ ] API: Mattermost message/file operations

### CI/CD Pipeline Tasks
- [ ] Add type-check to GitHub Actions
- [ ] Add lint to GitHub Actions
- [ ] Add unit tests to CI
- [ ] Add integration tests to CI
- [ ] Add build verification
- [ ] Add deployment staging step

## Monitoring & Observability

### Metrics to Track
- [ ] Content publish success rate
- [ ] Message delivery latency
- [ ] File upload success rate
- [ ] API response times
- [ ] Error rates by service

### Logs to Monitor
- [ ] Strapi API errors
- [ ] Mattermost WebSocket disconnects
- [ ] Worker presign failures
- [ ] Upload broker errors
- [ ] Frontend console errors

### Alerts to Configure
- [ ] High error rate (> 5% in 5 min)
- [ ] Slow API responses (> 2s p95)
- [ ] Upload failures spike
- [ ] Message delivery delays
- [ ] Service health check failures

## Production Readiness Checklist

### Security
- [x] Clerk authentication enforced
- [x] Admin role checks in UI
- [ ] Admin role checks in API (pending backend)
- [x] File type validation
- [x] File size limits
- [ ] AV scanning enforced (pending)
- [ ] Rate limiting on uploads (pending)
- [x] CORS configured correctly
- [x] Secrets in environment variables
- [ ] API tokens rotated regularly (process pending)

### Performance
- [x] React Query caching enabled
- [x] Lazy loading routes
- [x] Image optimization via R2
- [ ] CDN configured for static assets
- [ ] Service worker for offline support (optional)

### Reliability
- [x] Error boundaries in UI
- [x] Toast notifications for feedback
- [x] Loading states everywhere
- [x] Retry logic for network errors
- [ ] Database backups configured
- [ ] R2 bucket versioning enabled
- [ ] Disaster recovery documented

### Compliance
- [x] Compliance checklist in ContentPublisher
- [x] Version history tracking
- [ ] Data retention policies documented
- [ ] GDPR compliance verified
- [ ] Audit logging implemented (pending)

## Known Issues & Limitations

### Current Limitations
1. **Mark Resolved Button**: UI present but backend logic not implemented
2. **AV Scanning**: Plan documented but enforcement pending
3. **Rate Limiting**: Documentation exists but implementation pending
4. **Audit Logging**: Not yet implemented
5. **Automated Tests**: Manual tests documented but no Playwright suite yet

### Future Enhancements
1. Native Mattermost client to replace iframe
2. Real-time notifications via WebSocket
3. File preview in browser (PDF, images)
4. Drag-and-drop file upload in messaging
5. Voice/video call support
6. Mobile app integration
7. Analytics dashboard with charts
8. Content scheduling calendar view

## Support & Troubleshooting

### Common Issues

**Issue:** Preview token shows expired immediately
- **Solution:** Check `VITE_PREVIEW_SECRET` matches between token generation and validation

**Issue:** File upload fails with CORS error
- **Solution:** Verify upload broker worker has correct CORS headers

**Issue:** Mattermost connection fails
- **Solution:** Check `VITE_MATTERMOST_API_URL` and ensure service is running

**Issue:** Admin can't access publish page
- **Solution:** Verify Clerk `publicMetadata.role` is set to "admin" or "editor"

### Debug Commands

```powershell
# Check environment
pnpm --filter web run dev

# Type check
pnpm --filter web run type-check

# Build test
pnpm --filter web run build

# Check Strapi connection
curl -H "Authorization: Bearer $env:VITE_CMS_TOKEN" https://your-strapi.railway.app/api/services

# Check Mattermost connection
curl https://your-mattermost.railway.app/api/v4/system/ping
```

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0.0  
**Maintainer:** Platform Engineering Team
