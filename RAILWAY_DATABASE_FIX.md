# Railway Database Fix

## Issue Summary
- Strapi 5 deployment on Railway failed with connect ECONNREFUSED and Knex: Timeout acquiring a connection errors.
- Root cause was conflicting database settings: both connectionString and discrete host credentials were provided.
- Railway Postgres exposes a single DATABASE_URL; providing extra fields caused Knex to ignore the URL and attempt to connect with invalid defaults.

## Resolution Implemented
1. Simplified pps/strapi/config/database.ts to use only the connection string when it is present.
2. Normalised pool settings (DATABASE_POOL_MIN, DATABASE_POOL_MAX, timeouts) so they can be overridden via Railway variables.
3. Documented local development defaults (SQLite) versus production (Postgres) inside pps/strapi/.env.example.
4. Added admin session cookie controls so Railway deployments can serve the Strapi admin UI behind ENABLE_PROXY=true with secure cookies.

## Operational Checklist
- Deploy latest code to Railway.
- Confirm Postgres service is healthy (eady to accept connections).
- Tail logs until you see Server listening on 0.0.0.0:1337.
- Reset admin password via Strapi CLI if required:
  `powershell
  railway run --service strapi "npx strapi admin:reset-user-password --email admin@example.com --password TempPassw0rd!2024"
  `
- Log in at /admin, change the temporary password immediately.

## Fallback Notes
- If logs still show ECONNREFUSED, allow 30 seconds for Railway to bring up Postgres before retrying.
- For persistent Timeout acquiring a connection, increase DATABASE_POOL_MAX or inspect slow queries.
- When switching to Strapi Cloud, remove the Railway specific variables and rely on managed Postgres provided by Strapi Cloud.

## Related Files
- pps/strapi/config/database.ts
- pps/strapi/config/middlewares.ts
- pps/strapi/.env.example
- pps/strapi/.env.production

