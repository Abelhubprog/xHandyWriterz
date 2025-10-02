/**
 * Strapi webhook handler worker
 * Handles publish events and triggers cache purges
 */

interface Env {
  CLOUDFLARE_ZONE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  WEBHOOK_SECRET: string;
  MATTERMOST_WEBHOOK_URL?: string;
}

interface StrapiWebhookEvent {
  event: string;
  createdAt: string;
  model: string;
  entry: {
    id: number;
    slug?: string;
    domain?: string;
    publishedAt?: string | null;
    [key: string]: unknown;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type, x-webhook-signature',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/webhook/publish') {
        return await handlePublishWebhook(request, env);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
  },
};

async function handlePublishWebhook(request: Request, env: Env): Promise<Response> {
  // Verify webhook signature
  const signature = request.headers.get('x-webhook-signature');
  const body = await request.text();

  if (env.WEBHOOK_SECRET) {
    const expectedSignature = await generateSignature(body, env.WEBHOOK_SECRET);
    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }
  }

  const event: StrapiWebhookEvent = JSON.parse(body);

  // Only process entry.publish events
  if (!event.event.includes('publish')) {
    return new Response(JSON.stringify({ ok: true, message: 'Event ignored' }), { status: 200 });
  }

  const tasks: Promise<unknown>[] = [];

  // Purge Cloudflare cache for the published content
  if (event.entry.slug) {
    const paths = buildCachePurgePaths(event);
    tasks.push(purgeCloudflareCache(env, paths));
  }

  // Notify Mattermost
  if (env.MATTERMOST_WEBHOOK_URL) {
    tasks.push(notifyMattermost(env, event));
  }

  await Promise.allSettled(tasks);

  return new Response(JSON.stringify({ ok: true, purged: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function buildCachePurgePaths(event: StrapiWebhookEvent): string[] {
  const paths: string[] = [];
  const { model, entry } = event;

  if (model === 'service' && entry.slug) {
    if (entry.domain) {
      paths.push(`/services/${entry.domain}/${entry.slug}`);
      paths.push(`/d/${entry.domain}`);
    }
    paths.push(`/services/${entry.slug}`);
    paths.push('/services');
  }

  if (model === 'article' && entry.slug) {
    paths.push(`/articles/${entry.slug}`);
    paths.push('/articles');
  }

  // Always purge homepage for good measure
  paths.push('/');

  return paths;
}

async function purgeCloudflareCache(env: Env, paths: string[]): Promise<void> {
  if (!env.CLOUDFLARE_ZONE_ID || !env.CLOUDFLARE_API_TOKEN) {
    console.warn('Cloudflare credentials missing, skipping cache purge');
    return;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: paths.map((path) => `https://handywriterz.com${path}`),
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cache purge failed: ${response.status} ${text}`);
    }

    console.log('Cache purged for paths:', paths);
  } catch (error) {
    console.error('Cache purge error:', error);
    throw error;
  }
}

async function notifyMattermost(env: Env, event: StrapiWebhookEvent): Promise<void> {
  if (!env.MATTERMOST_WEBHOOK_URL) {
    return;
  }

  try {
    const { model, entry } = event;
    const title = (entry.title as string) || entry.slug || `${model} #${entry.id}`;
    const message = `📢 **Content Published**: ${title} (${model})`;

    await fetch(env.MATTERMOST_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error('Mattermost notification failed:', error);
  }
}

async function generateSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
