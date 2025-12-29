# Architecture Update: No Cloudflare Workers

**Date**: Session Update  
**Status**: ✅ Implemented

## Summary

The application has been updated to remove all Cloudflare Workers dependencies. All functionality previously planned for Workers is now handled by the Railway-hosted Express API.

## What Changed

### Removed
- `VITE_UPLOAD_BROKER_URL` environment variable
- `VITE_CLOUDFLARE_DATABASE_URL` environment variable
- `VITE_CLOUDFLARE_API_TOKEN` environment variable
- `VITE_CLOUDFLARE_ACCOUNT_ID` environment variable
- `VITE_CLOUDFLARE_DATABASE_ID` environment variable
- `workers/*` from pnpm workspace packages

### Architecture Before (Deprecated)
```
┌──────────────┐     ┌───────────────────┐     ┌──────────┐
│   Web App    │────▶│ Cloudflare Workers │────▶│    R2    │
│  (Railway)   │     │  - upload-broker   │     │ Storage  │
│              │     │  - mm-auth         │     │          │
│              │     │  - webhooks        │     │          │
│              │     │  - scheduler       │     │          │
└──────────────┘     └───────────────────┘     └──────────┘
```

### Architecture After (Current)
```
┌──────────────┐     ┌───────────────────┐     ┌──────────┐
│   Web App    │────▶│    Express API     │────▶│    R2    │
│  (Railway)   │     │    (Railway)       │     │ Storage  │
│              │     │  - /api/uploads    │     │          │
│              │     │  - /api/messaging  │     │          │
│              │     │  - /api/webhooks   │     │          │
└──────────────┘     └───────────────────┘     └──────────┘
```

## New Upload Flow

1. **Client** requests presigned URL from `VITE_API_URL/api/uploads/presign-put`
2. **API** generates presigned URL using AWS SDK for R2
3. **Client** uploads directly to R2 using the presigned URL
4. **API** handles metadata storage and notifications

## Files Updated

### Environment Configuration
- `apps/web/src/env.ts` - Removed all UPLOAD_BROKER_URL and Cloudflare Database references

### Upload Services
- `apps/web/src/services/fileUploadService.ts` - Now uses API URL directly
- `apps/web/src/pages/dashboard/DocumentsUpload.tsx` - Simplified to use `resolveApiUrl()`
- `apps/web/src/pages/TurnitinSubmission.tsx` - Removed brokerUrl fallback
- `apps/web/src/pages/turnitin-check.tsx` - Simplified presign endpoint
- `apps/web/src/pages/admin/TurnitinReports.tsx` - Removed brokerUrl variable
- `apps/web/src/hooks/useDocumentSubmission.ts` - Simplified presign endpoint

### Admin Dashboard
- `apps/web/src/pages/admin/AdminDashboard.tsx` - Removed Upload Broker entry, now shows Upload API

### Workspace Configuration
- `pnpm-workspace.yaml` - Removed `workers/*` from packages

## API Endpoints (Railway Express)

All upload functionality is available at:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/uploads/presign-put` | POST | Generate presigned PUT URL for uploads |
| `/api/uploads/presign-get` | POST | Generate presigned GET URL for downloads |
| `/api/uploads/presign` | POST | Legacy endpoint (alias for presign-get) |
| `/api/uploads/complete` | POST | Mark upload as complete |
| `/api/uploads/list` | GET | List user uploads |

## Environment Variables Required

### Required for Web App
```env
VITE_API_URL=https://your-api.railway.app
VITE_CMS_URL=https://your-strapi.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_xxx
```

### Required for API (Railway)
```env
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=https://your-bucket.your-domain.com
```

## Deprecated Documentation

The following documentation files reference the old Workers architecture and should be considered outdated:
- `docs/SERVICE_STARTUP_GUIDE.md` (workers sections)
- `docs/TURNITIN_QUICK_REFERENCE.md` (upload-broker references)
- `docs/TURNITIN_SYSTEM_COMPLETE.md` (workers deployment)
- `docs/RELEASE_BLOCKERS_COMPLETE.md` (workers features)
- `docs/SESSION_SUMMARY.md` (workers commands)

## Benefits of New Architecture

1. **Simpler Deployment** - Only 3 services to deploy (Web, API, Strapi)
2. **Single Platform** - All services on Railway, easier monitoring
3. **Unified Logging** - All logs in Railway dashboard
4. **Cost Effective** - No separate Workers billing
5. **Easier Debugging** - Single codebase for API functionality

## Stack Rationale + Alternatives (No AWS)
The canonical stack needs analysis and non-AWS alternatives live in:
`docs/NEW/STACK_AND_PLATFORM_PLAN.md`
