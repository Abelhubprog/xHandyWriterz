# Upload Broker Worker

Cloudflare Worker that issues presigned URLs for Cloudflare R2 and manages multipart upload lifecycle. It replaces the in-app Microfeed upload proxy and is designed to be consumed by the web dashboard and Mattermost/Strapi pipelines.

## Features
- `POST /s3/create` – start a multipart upload (returns `uploadId`)
- `POST /s3/sign` – generate a presigned URL for an individual part
- `POST /s3/complete` – finalize the multipart upload given part ETags
- `POST /s3/presign` – issue a short-lived signed GET for downloading objects

All requests expect JSON and respond with JSON. Authentication/authorization is left to upstream Cloudflare Access or custom headers.

## Environment
Set these variables in `wrangler.toml` or via Cloudflare dashboard:

```
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=cms-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
DOWNLOAD_TTL_SECONDS=300
```

You can also set `FORCE_PATH_STYLE=true` (default) to ensure bucket is included in the path.

## Local development

```
cd workers/upload-broker
pnpm install # if you want type checking / lint in future
wrangler dev
```

Requests can be issued with cURL or the web app. Example:

```
curl -X POST http://127.0.0.1:8787/s3/create \
  -H "content-type: application/json" \
  -d '{"key":"uploads/demo.bin","contentType":"application/octet-stream"}'
```

## Security considerations
- This worker does not implement auth by itself. Place it behind Access or require caller tokens.
- Add antivirus integration by checking metadata (e.g., KV) before returning `/s3/presign` links.
- `S3_SECRET_ACCESS_KEY` should be stored securely (Workers secrets).

---

Next tasks: hook Mattermost file pipeline to this worker and enforce scan gating once the AV service is ready.
