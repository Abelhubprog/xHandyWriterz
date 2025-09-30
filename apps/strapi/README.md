# HandyWriterz Strapi 5 Service

This Strapi 5 application replaces the legacy Microfeed content system. It ships with PostgreSQL + Cloudflare R2 integration, GraphQL enabled, and starter content types for **Service** and **Article**.

## Requirements
- Node.js >= 20.10 (matches monorepo requirement)
- pnpm 10.x (corepack enabled)
- PostgreSQL 14+

Optional but recommended:
- Docker (for running postgres locally)
- Cloudflare R2 account for uploads

## Getting Started

``````bash
pnpm install
pnpm --filter @handywriterz/strapi install
cd apps/strapi
cp .env.example .env
# fill in secrets, DB URL, and R2 credentials
pnpm develop
``````

The first run will bootstrap admin and database tables. Use the UI to create the root admin user, then head to **Content-Type Builder** to review the pre-defined schemas.

## Environment
Key variables live in `.env` (mirroring `.env.example`). By default the app reads `DATABASE_URL` for a single connection string. R2 uploads use the S3 provider and expect the Cloudflare endpoint with `forcePathStyle`.

## Scripts
- `pnpm develop`: start Strapi in watch mode
- `pnpm build`: build admin panel assets
- `pnpm start`: run production build

## Content Types
The repo ships two starter types under `src/api`:
- `service`: hero image, summary, structured SEO, type tags, `publishedAt`
- `article`: author reference, rich body, gallery, SEO metadata

Adjust or extend under `src/api/*` and regenerate types with `pnpm strapi generate` commands as needed.

## Database
Set `DATABASE_URL` to your Postgres instance. For local dev you can use Docker:

``````bash
docker run -d --name hwz-strapi-db -p 5432:5432 \
  -e POSTGRES_DB=handywriterz_cms \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi \
  postgres:14
``````

## Cloudflare R2 Uploads
The `config/plugins.ts` file enables the aws-s3 provider pointing to Cloudflare R2. Ensure the bucket exists and the access keys have write permissions. Public assets can be fronted by a Cloudflare R2 custom domain via `R2_PUBLIC_BASE`.

## Clerk Integration
For now Strapi still uses local admin auth. `CLERK_*` envs are placeholders for future SSO mapping.

## GraphQL
GraphQL plugin is enabled by default. Access the playground at `/graphql` when running locally.

---

See `docs/CHANGESET_PHASE_A.md` for the migration plan tying Strapi back into the front-end.
