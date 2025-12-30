# Strapi v5 Quick Start Script

## Step 1: Backup Current Strapi
```bash
cd D:/HandyWriterzNEW
mv apps/strapi apps/strapi-backup
```

## Step 2: Create New Strapi v5 Project
```bash
cd D:/HandyWriterzNEW/apps
npx create-strapi-app@latest strapi --quickstart --no-run
```

**When prompted:**
- Installation type: `Quickstart (recommended)`
- Database: `SQLite` (for now, we'll migrate to Postgres later)
- Start now: `No`

## Step 3: Copy Configuration
```bash
# Copy environment variables
cp strapi-backup/.env strapi/.env

# Copy any custom content types (if they exist)
cp -r strapi-backup/src/api/* strapi/src/api/
cp -r strapi-backup/src/components/* strapi/src/components/
```

## Step 4: Install Additional Plugins
```bash
cd strapi
pnpm add @strapi/plugin-graphql@5.0.0
pnpm add @strapi/provider-upload-aws-s3@5.0.0
pnpm add pg@^8.13.1
```

## Step 5: Update Database Config for Postgres
Edit `strapi/config/database.ts`:

```typescript
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: env.bool('DATABASE_SSL', false) ? {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true)
      } : false,
    },
    debug: false,
  },
});
```

## Step 6: Configure R2 Upload Provider
Edit `strapi/config/plugins.ts`:

```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('R2_ACCESS_KEY_ID'),
            secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
          },
          endpoint: env('R2_ENDPOINT'),
          region: env('R2_REGION', 'auto'),
          forcePathStyle: true,
        },
        params: {
          Bucket: env('R2_BUCKET'),
        },
        baseUrl: env('R2_PUBLIC_BASE'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  graphql: {
    enabled: true,
    config: {
      playgroundAlways: true,
      defaultLimit: 10,
      maxLimit: 20,
      apolloServer: {
        tracing: false,
      },
    },
  },
});
```

## Step 7: Start Strapi
```bash
cd D:/HandyWriterzNEW/apps/strapi
pnpm run develop
```

## Step 8: Access Admin Panel
Open browser: http://localhost:1337/admin

Create admin account:
- Email: admin@handywriterz.com
- Password: (choose strong password)

## Step 9: Generate API Token
1. Go to Settings → API Tokens
2. Create New API Token:
   - Name: "Web App Access"
   - Token type: Full access
   - Token duration: Unlimited
3. Copy the generated token

## Step 10: Update Web App Environment
Edit `apps/web/.env`:
```bash
VITE_CMS_TOKEN=<paste_token_here>
```

## Step 11: Restart Web App
```bash
cd D:/HandyWriterzNEW/apps/web
pnpm run dev
```

## Verification
Test connection in browser console (http://localhost:5173):
```javascript
fetch('http://localhost:1337/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    query: '{ __schema { types { name } } }'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Connected:', d))
.catch(e => console.error('❌ Failed:', e));
```

---

## Alternative: Use Docker Postgres

If you don't have Postgres installed locally:

```bash
# Start Postgres in Docker
docker run -d \
  --name strapi-postgres \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi \
  -e POSTGRES_DB=strapi \
  -p 5432:5432 \
  postgres:16

# Verify it's running
docker ps | grep strapi-postgres
```

Then use this DATABASE_URL in `.env`:
```
DATABASE_URL=postgresql://strapi:strapi@localhost:5432/strapi
```
