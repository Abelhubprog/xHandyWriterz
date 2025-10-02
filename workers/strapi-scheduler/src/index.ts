/**
 * Strapi Scheduler Worker (F-033)
 * 
 * Cloudflare Worker that runs on a cron schedule to auto-publish
 * Strapi content entries when their scheduled publishedAt time arrives.
 * 
 * Features:
 * - Polls Strapi for entries with publishedAt in the past but status != published
 * - Publishes those entries by updating their status
 * - Sends notifications to Mattermost when content auto-publishes
 * - Logs all operations for observability
 * 
 * Environment Variables:
 * - STRAPI_URL: Strapi API base URL
 * - STRAPI_API_TOKEN: Admin API token with publish permissions
 * - MATTERMOST_WEBHOOK_URL: Webhook for notifications (optional)
 * - CRON_SCHEDULE: Cron expression (default: every 5 minutes)
 */

interface Env {
  STRAPI_URL: string;
  STRAPI_API_TOKEN: string;
  MATTERMOST_WEBHOOK_URL?: string;
}

interface StrapiEntry {
  id: number;
  attributes: {
    title: string;
    slug: string;
    publishedAt: string | null;
    status?: string;
    domain?: string;
  };
}

interface StrapiResponse {
  data: StrapiEntry[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Fetch entries that should be auto-published
 */
async function fetchPendingPublications(
  env: Env,
  contentType: 'service' | 'article'
): Promise<StrapiEntry[]> {
  const url = new URL(`/api/${contentType}s`, env.STRAPI_URL);
  
  // Query for entries with publishedAt <= now but status != published
  const now = new Date().toISOString();
  url.searchParams.set('filters[publishedAt][$lte]', now);
  url.searchParams.set('filters[status][$ne]', 'published');
  url.searchParams.set('pagination[pageSize]', '100');
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${env.STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pending publications: ${response.status} ${response.statusText}`);
  }

  const data: StrapiResponse = await response.json();
  return data.data;
}

/**
 * Publish a single Strapi entry
 */
async function publishEntry(
  env: Env,
  contentType: 'service' | 'article',
  entry: StrapiEntry
): Promise<boolean> {
  const url = `${env.STRAPI_URL}/api/${contentType}s/${entry.id}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        status: 'published',
      },
    }),
  });

  if (!response.ok) {
    console.error(`Failed to publish ${contentType} ${entry.id}: ${response.status} ${response.statusText}`);
    return false;
  }

  console.log(`✅ Published ${contentType} ${entry.id}: ${entry.attributes.title}`);
  return true;
}

/**
 * Send notification to Mattermost about auto-published content
 */
async function notifyMattermost(
  env: Env,
  contentType: 'service' | 'article',
  entries: StrapiEntry[]
): Promise<void> {
  if (!env.MATTERMOST_WEBHOOK_URL || entries.length === 0) {
    return;
  }

  const message = {
    text: `🤖 **Auto-Published Content**\n\n${entries.length} ${contentType}(s) automatically published:\n${entries
      .map((e) => `- **${e.attributes.title}** (/${contentType}s/${e.attributes.domain || 'general'}/${e.attributes.slug})`)
      .join('\n')}`,
  };

  try {
    await fetch(env.MATTERMOST_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Failed to send Mattermost notification:', error);
  }
}

/**
 * Main cron handler - runs on schedule to check for publishable content
 */
async function handleScheduled(env: Env): Promise<Response> {
  console.log('🕐 Strapi scheduler triggered at', new Date().toISOString());

  const results = {
    services: { processed: 0, published: 0, failed: 0 },
    articles: { processed: 0, published: 0, failed: 0 },
  };

  try {
    // Process services
    const pendingServices = await fetchPendingPublications(env, 'service');
    results.services.processed = pendingServices.length;

    const publishedServices: StrapiEntry[] = [];
    for (const service of pendingServices) {
      const success = await publishEntry(env, 'service', service);
      if (success) {
        results.services.published++;
        publishedServices.push(service);
      } else {
        results.services.failed++;
      }
    }

    await notifyMattermost(env, 'service', publishedServices);

    // Process articles
    const pendingArticles = await fetchPendingPublications(env, 'article');
    results.articles.processed = pendingArticles.length;

    const publishedArticles: StrapiEntry[] = [];
    for (const article of pendingArticles) {
      const success = await publishEntry(env, 'article', article);
      if (success) {
        results.articles.published++;
        publishedArticles.push(article);
      } else {
        results.articles.failed++;
      }
    }

    await notifyMattermost(env, 'article', publishedArticles);

    console.log('✅ Scheduler completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Scheduler error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * HTTP handler for manual triggering or health checks
 */
async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Health check
  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        service: 'strapi-scheduler',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Manual trigger (POST /trigger)
  if (url.pathname === '/trigger' && request.method === 'POST') {
    return handleScheduled(env);
  }

  return new Response('Strapi Scheduler Worker\n\nEndpoints:\n- GET /health\n- POST /trigger', {
    status: 200,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },

  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    await handleScheduled(env);
  },
};
