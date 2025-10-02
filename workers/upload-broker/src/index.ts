const encoder = new TextEncoder();

async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    buffer = encoder.encode(data).buffer;
  } else {
    buffer = data;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data).buffer);
}

async function getSigningKey(secret: string, date: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmac(encoder.encode(`AWS4${secret}`).buffer, date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function encodePath(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildCanonicalQuery(query: Record<string, string>): string {
  const pairs = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [encodeURIComponent(key), encodeURIComponent(value)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return pairs.map(([key, value]) => `${key}=${value}`).join('&');
}

function defaultHeaders(): Headers {
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'POST, OPTIONS');
  headers.set('access-control-allow-headers', 'content-type, authorization');
  return headers;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = defaultHeaders();
  if (init.headers) {
    const extra = new Headers(init.headers);
    extra.forEach((value, key) => headers.set(key, value));
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}

export interface Env {
  S3_ENDPOINT: string;
  S3_REGION?: string;
  S3_BUCKET: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  FORCE_PATH_STYLE?: string;
  DOWNLOAD_TTL_SECONDS?: string;
  RATE_LIMIT_KV?: KVNamespace;
  RATE_LIMIT_REQUESTS_PER_MINUTE?: string;
  SENTRY_DSN?: string;
  MATTERMOST_WEBHOOK_URL?: string;
}

interface SignedRequestInput {
  method: string;
  key: string;
  query?: Record<string, string>;
  headers?: HeadersInit;
  body?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: defaultHeaders() });
    }

    const url = new URL(request.url);
    try {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Unsupported method' }, { status: 405 });
      }

      if (url.pathname === '/s3/create') {
        const data = await safeJson(request);
        const key = validateString(data.key, 'key');
        const contentType = typeof data.contentType === 'string' ? data.contentType : 'application/octet-stream';
        const acl = typeof data.acl === 'string' ? data.acl : undefined;
        const result = await createMultipartUpload(env, { key, contentType, acl });
        return jsonResponse(result);
      }

      if (url.pathname === '/s3/sign') {
        const data = await safeJson(request);
        const key = validateString(data.key, 'key');
        const uploadId = validateString(data.uploadId, 'uploadId');
        const partNumber = String(validatePositiveNumber(data.partNumber, 'partNumber'));
        const urlSigned = await presignPart(env, { key, uploadId, partNumber });
        return jsonResponse({ url: urlSigned });
      }

      if (url.pathname === '/s3/complete') {
        const data = await safeJson(request);
        const key = validateString(data.key, 'key');
        const uploadId = validateString(data.uploadId, 'uploadId');
        const parts = parseParts(data.parts);
        await completeMultipartUpload(env, { key, uploadId, parts });
        return jsonResponse({ ok: true });
      }

      if (url.pathname === '/s3/presign') {
        const data = await safeJson(request);
        const key = validateString(data.key, 'key');
        const expires = typeof data.expires === 'number' ? data.expires : Number(env.DOWNLOAD_TTL_SECONDS ?? 300);
        
        // Check rate limiting
        const clientId = request.headers.get('x-client-id') || request.headers.get('cf-connecting-ip') || 'unknown';
        const allowed = await checkRateLimit(env, clientId);
        if (!allowed) {
          return jsonResponse({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        
        // Check AV scan status before allowing download
        const scanStatus = await checkAVStatus(env, key);
        if (scanStatus === 'infected') {
          return jsonResponse({ error: 'File failed security scan' }, { status: 403 });
        }
        if (scanStatus === 'pending') {
          return jsonResponse({ error: 'File scan in progress, please try again shortly' }, { status: 202 });
        }
        
        const presigned = await presignGet(env, { key, expires });
        return jsonResponse({ url: presigned });
      }

      if (url.pathname === '/s3/presign-put') {
        const data = await safeJson(request);
        const key = validateString(data.key, 'key');
        const contentType = typeof data.contentType === 'string' ? data.contentType : 'application/octet-stream';
        const expires = typeof data.expires === 'number' ? data.expires : 900;
        const presigned = await presignPut(env, { key, contentType, expires });
        return jsonResponse({ url: presigned, key, bucket: env.S3_BUCKET, contentType });
      }

      return jsonResponse({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return jsonResponse({ error: message }, { status: 400 });
    }
  },
};

async function safeJson(request: Request): Promise<any> {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

function validateString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value;
}

function validatePositiveNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number`);
  }
  return value;
}

function parseParts(parts: unknown): Array<{ partNumber: number; etag: string }> {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error('parts must be a non-empty array');
  }
  return parts.map((part) => {
    const partNumber = validatePositiveNumber(part?.partNumber, 'partNumber');
    const etag = validateString(part?.etag, 'etag');
    return { partNumber, etag };
  });
}

async function createMultipartUpload(
  env: Env,
  options: { key: string; contentType: string; acl?: string },
): Promise<{ uploadId: string; key: string; bucket: string }> {
  const query = { uploads: '' };
  const headers: Record<string, string> = { 'Content-Type': options.contentType };
  if (options.acl) {
    headers['x-amz-acl'] = options.acl;
  }
  const response = await signedFetch(env, {
    method: 'POST',
    key: options.key,
    query,
    headers,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`R2 createMultipartUpload failed: ${response.status} ${text}`);
  }
  const match = text.match(/<UploadId>(.+)<\/UploadId>/);
  if (!match) {
    throw new Error('Unable to parse UploadId from R2 response');
  }
  return { uploadId: match[1], key: options.key, bucket: env.S3_BUCKET };
}

async function presignPart(env: Env, params: { key: string; uploadId: string; partNumber: string }): Promise<string> {
  const query: Record<string, string> = {
    partNumber: params.partNumber,
    uploadId: params.uploadId,
  };
  return presignUrl(env, { method: 'PUT', key: params.key, query, expires: 900 });
}

async function completeMultipartUpload(
  env: Env,
  params: { key: string; uploadId: string; parts: Array<{ partNumber: number; etag: string }> },
): Promise<void> {
  const bodyParts = params.parts
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((part) => `  <Part><PartNumber>${part.partNumber}</PartNumber><ETag>${part.etag}</ETag></Part>`)
    .join('\n');
  const payload = `<CompleteMultipartUpload>\n${bodyParts}\n</CompleteMultipartUpload>`;
  const response = await signedFetch(env, {
    method: 'POST',
    key: params.key,
    query: { uploadId: params.uploadId },
    headers: { 'Content-Type': 'application/xml' },
    body: payload,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Complete upload failed: ${response.status} ${text}`);
  }
}

async function presignGet(env: Env, params: { key: string; expires: number }): Promise<string> {
  const expires = Math.min(Math.max(params.expires, 60), 3600);
  return presignUrl(env, { method: 'GET', key: params.key, expires });
}

async function presignPut(env: Env, params: { key: string; contentType: string; expires: number }): Promise<string> {
  const expires = Math.min(Math.max(params.expires, 60), 900);
  const query: Record<string, string> = {};
  if (params.contentType) {
    query['response-content-type'] = params.contentType;
  }
  return presignUrl(env, { method: 'PUT', key: params.key, query, expires });
}

async function signedFetch(env: Env, input: SignedRequestInput): Promise<Response> {
  const { url, headers } = await signRequest(env, input);
  return fetch(url, {
    method: input.method,
    headers,
    body: input.body,
  });
}

async function signRequest(env: Env, input: SignedRequestInput): Promise<{ url: string; headers: HeadersInit }> {
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, '');
  const bucket = env.S3_BUCKET;
  const region = env.S3_REGION ?? 'auto';
  const forcePath = env.FORCE_PATH_STYLE !== 'false';
  const baseUrl = new URL(endpoint);
  const host = baseUrl.host;
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const canonicalKey = encodePath(input.key);
  const resourcePath = forcePath ? `/${bucket}/${canonicalKey}` : `/${canonicalKey}`;
  const requestUrl = new URL(endpoint + resourcePath);

  const query = input.query ?? {};
  const canonicalQuery = buildCanonicalQuery(query);
  if (canonicalQuery) {
    requestUrl.search = canonicalQuery;
  }

  const headers = new Headers(input.headers);
  headers.set('host', host);
  headers.set('x-amz-date', amzDate);
  const bodyHash = await sha256Hex(input.body ?? '');
  headers.set('x-amz-content-sha256', bodyHash);

  const signedHeaders = Array.from(headers.keys())
    .map((key) => key.toLowerCase())
    .sort();
  const canonicalHeaders = signedHeaders.map((key) => `${key}:${headers.get(key)!.trim()}`).join('\n');

  const canonicalRequest = [
    input.method,
    resourcePath,
    canonicalQuery,
    `${canonicalHeaders}\n`,
    signedHeaders.join(';'),
    bodyHash,
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = await getSigningKey(env.S3_SECRET_ACCESS_KEY, dateStamp, region, service);
  const signature = await sha256Hex(await hmac(signingKey, stringToSign));

  const authorization = `${algorithm} Credential=${env.S3_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders.join(';')}, Signature=${signature}`;
  headers.set('Authorization', authorization);

  return { url: requestUrl.toString(), headers };
}

async function presignUrl(
  env: Env,
  input: { method: string; key: string; query?: Record<string, string>; expires: number },
): Promise<string> {
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, '');
  const bucket = env.S3_BUCKET;
  const region = env.S3_REGION ?? 'auto';
  const forcePath = env.FORCE_PATH_STYLE !== 'false';
  const baseUrl = new URL(endpoint);
  const host = baseUrl.host;
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalKey = encodePath(input.key);
  const resourcePath = forcePath ? `/${bucket}/${canonicalKey}` : `/${canonicalKey}`;

  const presignQuery: Record<string, string> = {
    ...(input.query ?? {}),
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${env.S3_ACCESS_KEY_ID}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(input.expires),
    'X-Amz-SignedHeaders': 'host',
  };

  const canonicalQuery = buildCanonicalQuery(presignQuery);
  const canonicalRequest = [
    input.method,
    resourcePath,
    canonicalQuery,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = await getSigningKey(env.S3_SECRET_ACCESS_KEY, dateStamp, region, service);
  const signature = await sha256Hex(await hmac(signingKey, stringToSign));
  const queryWithSignature = canonicalQuery
    ? `${canonicalQuery}&X-Amz-Signature=${signature}`
    : `X-Amz-Signature=${signature}`;

  return `${endpoint}${resourcePath}?${queryWithSignature}`;
}

/**
 * Rate limiting check using KV
 */
async function checkRateLimit(env: Env, clientId: string): Promise<boolean> {
  if (!env.RATE_LIMIT_KV) {
    return true; // No rate limiting configured
  }

  const limit = Number(env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? 60);
  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  try {
    const existing = await env.RATE_LIMIT_KV.get(key, 'json');
    if (existing && typeof existing === 'object' && 'count' in existing && 'reset' in existing) {
      const record = existing as { count: number; reset: number };
      if (now < record.reset) {
        if (record.count >= limit) {
          return false;
        }
        await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: record.count + 1, reset: record.reset }), {
          expirationTtl: 120,
        });
        return true;
      }
    }

    // Create new window
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, reset: now + windowMs }), {
      expirationTtl: 120,
    });
    return true;
  } catch (error) {
    console.error('Rate limit check failed', error);
    return true; // Allow on error
  }
}

/**
 * Check AV scan status from R2 object metadata
 */
async function checkAVStatus(env: Env, key: string): Promise<'clean' | 'infected' | 'pending'> {
  try {
    // HEAD request to get metadata without downloading
    const response = await signedFetch(env, {
      method: 'HEAD',
      key,
    });

    if (!response.ok) {
      // Object doesn't exist or error
      return 'pending';
    }

    const scanMeta = response.headers.get('x-amz-meta-scan-status') || response.headers.get('x-scan');
    if (scanMeta === 'clean') {
      return 'clean';
    }
    if (scanMeta === 'infected' || scanMeta === 'quarantine') {
      return 'infected';
    }

    // No metadata or unknown status
    return 'pending';
  } catch (error) {
    console.error('AV status check failed', error);
    return 'pending'; // Default to pending on error
  }
}

/**
 * Notify Mattermost when scan completes
 */
async function notifyMattermostScanComplete(env: Env, key: string, status: 'clean' | 'infected'): Promise<void> {
  if (!env.MATTERMOST_WEBHOOK_URL) {
    return;
  }

  try {
    const message = status === 'clean' 
      ? `✅ File scan complete: \`${key}\` is clean and ready for download.`
      : `⚠️ File scan complete: \`${key}\` failed security check and has been quarantined.`;

    await fetch(env.MATTERMOST_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error('Mattermost notification failed', error);
  }
}
