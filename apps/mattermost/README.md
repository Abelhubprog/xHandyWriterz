# HandyWriterz Mattermost Service

This directory defines the Mattermost deployment that replaces the bespoke messaging stack. It is configured for PostgreSQL storage and Cloudflare R2 (S3 compatible) file attachments so we can align with the Strapi/R2 pipeline.

## Layout

- `docker-compose.yml` – local orchestration for Mattermost + Postgres + optional MinIO for R2 emulation
- `config/mattermost.json` – baseline Mattermost configuration (OIDC placeholder, S3 driver pointed at R2)
- `.env.example` – environment variables consumed by docker compose and Mattermost
- `scripts/bootstrap.sql` – helper SQL to create the Mattermost database/user if running Postgres externally

## Getting Started (local dev)

1. Copy `.env.example` to `.env` and set secrets, bucket names, and Cloudflare credentials (or MinIO dev credentials).
2. Ensure the R2 bucket (`MM_R2_BUCKET`) exists. For local testing you can enable the bundled MinIO container and adjust the endpoint.
3. Launch the stack:

   ```bash
   cd apps/mattermost
   pnpm install --filter @handywriterz/mattermost --ignore-scripts # optional placeholder if we publish scripts later
   docker compose up -d
   ```

4. Visit `http://localhost:8065` to complete the initial admin wizard. The config mounts in `config/mattermost.json`; restart the server after editing.

## Cloudflare R2 wiring

The config sets `FileSettings.DriverName` to `amazons3` and reads `MM_R2_*` env vars. For production use Cloudflare R2 credentials with **access key ID / secret** from Workers KV. For local testing the compose file exposes MinIO so you can point the same S3 config at `http://minio:9000`.

## OIDC / Clerk

The OIDC section shows the settings we will use once Clerk OIDC is ready. Update the `MM_OIDC_*` env variables and re-run the provisioning script. Until then Mattermost local auth remains enabled.

## Database

We ship a Postgres container seeded with `mattermost` database and user. See `scripts/bootstrap.sql` if you need to create the schema manually on managed Postgres.

---

Future work: integrate antivirus events, webhooks, and Mattermost plugins (compliance exports, E2E). This scaffold just delivers the reliable messaging foundation that the web app can embed via REST + WebSockets.
