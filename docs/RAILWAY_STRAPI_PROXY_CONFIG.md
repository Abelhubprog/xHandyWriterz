# Strapi 5 Railway HTTPS/Proxy Configuration - Quick Reference

## Problem
```
Cannot send secure cookie over unencrypted connection
POST /admin/login → 500 error
```

## Root Cause
Simple `proxy: true` doesn't configure Koa to trust Railway's `X-Forwarded-Proto: https` header.

## Solution

### 1. Environment Variables (Railway)
```bash
URL=https://your-app.up.railway.app
ENABLE_PROXY=true
NODE_ENV=production
```

### 2. apps/strapi/config/server.ts
```typescript
const serverConfig: Record<string, unknown> = {
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
};

// CRITICAL: Explicit Koa proxy configuration for Railway
const enableProxy = env.bool('ENABLE_PROXY', isProduction);

if (enableProxy) {
  serverConfig.proxy = {
    enabled: true,
    koa: {
      proxy: true,                      // Trust proxy headers
      proxyIpHeader: 'X-Forwarded-For',
      maxIpsCount: 1,
    },
  };
} else {
  serverConfig.proxy = false;
}
```

### 3. apps/strapi/config/middlewares.ts
```typescript
// Use default middleware - no overrides
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',  // No custom config
  'strapi::favicon',
  'strapi::public',
];
```

### 4. apps/strapi/config/admin.ts
```typescript
// Keep minimal - no auth.options
export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
});
```

## Why This Works

Railway's architecture:
```
Internet (HTTPS) → Railway Proxy → Container (HTTP)
                        ↓
                 X-Forwarded-Proto: https
                 X-Forwarded-For: client-ip
```

- **Without `koa.proxy = true`**: Koa sees HTTP, refuses secure cookies
- **With `koa.proxy = true`**: Koa trusts X-Forwarded-Proto, allows secure cookies

## Create Admin User
```bash
railway ssh "npx strapi admin:create-user \
  --email=admin@example.com \
  --password=TempPass123! \
  --firstname=Admin \
  --lastname=User"
```

## Deploy
```bash
cd apps/strapi
railway up --detach
railway logs -n 30  # Verify "Strapi started successfully"
```

## Test
1. Navigate to `https://your-app.up.railway.app/admin`
2. Login with created credentials
3. Should see admin dashboard (not 500 error)

## Key Takeaway
For Strapi 5 on Railway: **Explicit Koa proxy configuration is required**, not just Strapi-level `proxy: true`.

---
**Date:** October 3, 2025  
**Strapi Version:** 5.25.0  
**Deployment:** Railway  
**Status:** ✅ Working
