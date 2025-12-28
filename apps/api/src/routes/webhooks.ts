import { Router, IRouter } from 'express';
import { z } from 'zod';
import crypto from 'crypto';

export const webhooksRouter: IRouter = Router();

// Strapi webhook secret for verification
const STRAPI_WEBHOOK_SECRET = process.env.STRAPI_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/strapi/publish
 * Handle Strapi content publish events
 */
webhooksRouter.post('/strapi/publish', async (req, res) => {
  try {
    // Verify webhook signature
    if (STRAPI_WEBHOOK_SECRET) {
      const signature = req.headers['x-strapi-signature'] as string;
      if (!verifyWebhookSignature(JSON.stringify(req.body), signature, STRAPI_WEBHOOK_SECRET)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { event, model, entry } = req.body;
    console.log(`[Webhook] Strapi ${event} on ${model}:`, entry?.id);

    // Handle different content types
    switch (model) {
      case 'service':
        await handleServicePublish(entry);
        break;
      case 'article':
        await handleArticlePublish(entry);
        break;
      default:
        console.log(`[Webhook] Unhandled model: ${model}`);
    }

    // Trigger cache invalidation
    await invalidateCache(model, entry?.slug);

    res.json({ received: true, event, model, entryId: entry?.id });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/webhooks/strapi/unpublish
 * Handle Strapi content unpublish events
 */
webhooksRouter.post('/strapi/unpublish', async (req, res) => {
  try {
    const { event, model, entry } = req.body;
    console.log(`[Webhook] Strapi ${event} on ${model}:`, entry?.id);

    // Trigger cache invalidation for unpublished content
    await invalidateCache(model, entry?.slug);

    res.json({ received: true, event, model, entryId: entry?.id });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/webhooks/r2/scan-complete
 * Handle R2 antivirus scan completion
 */
webhooksRouter.post('/r2/scan-complete', async (req, res) => {
  try {
    const { key, result, bucket } = req.body;
    console.log(`[Webhook] R2 scan complete: ${key} - ${result}`);

    // Update metadata store
    const scanResult = {
      key,
      result, // 'clean' | 'infected' | 'error'
      scannedAt: new Date().toISOString(),
      bucket,
    };

    // Store scan result (in memory for now, should be DB)
    scanResults.set(key, scanResult);

    // If clean, notify any waiting clients
    if (result === 'clean') {
      // Could trigger WebSocket notification here
      console.log(`[Webhook] File ${key} is clean and available for download`);
    } else if (result === 'infected') {
      // Queue for deletion
      console.log(`[Webhook] File ${key} is infected, queuing for deletion`);
      // TODO: Add to deletion queue
    }

    res.json({ received: true, key, result });
  } catch (error) {
    console.error('Scan webhook error:', error);
    res.status(500).json({ error: 'Scan webhook failed' });
  }
});

/**
 * POST /api/webhooks/payment/:provider
 * Handle payment provider webhooks
 */
webhooksRouter.post('/payment/:provider', async (req, res) => {
  const { provider } = req.params;

  try {
    console.log(`[Webhook] Payment webhook from ${provider}`);

    // Verify webhook based on provider
    switch (provider) {
      case 'stripe':
        // Verify Stripe signature
        const stripeSignature = req.headers['stripe-signature'] as string;
        if (!verifyStripeSignature(req.body, stripeSignature)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
        await handleStripeWebhook(req.body);
        break;

      case 'paypal':
        await handlePayPalWebhook(req.body);
        break;

      case 'stablelink':
        await handleStableLinkWebhook(req.body);
        break;

      case 'coinbase':
        await handleCoinbaseWebhook(req.body);
        break;

      default:
        return res.status(400).json({ error: 'Unknown provider' });
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`Payment webhook error (${provider}):`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/webhooks/health
 * Health check for webhook endpoint
 */
webhooksRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/webhooks/strapi/publish',
      '/api/webhooks/strapi/unpublish',
      '/api/webhooks/r2/scan-complete',
      '/api/webhooks/payment/:provider',
    ],
  });
});

// In-memory stores (should migrate to database)
const scanResults = new Map<string, any>();

// Helper functions

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

function verifyStripeSignature(_payload: any, _signature: string): boolean {
  // TODO: Implement Stripe signature verification
  // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  return true; // Placeholder
}

async function handleServicePublish(entry: any) {
  console.log(`[Content] Service published: ${entry?.title} (${entry?.slug})`);
  
  // Could notify via Mattermost
  const mmNotifyUrl = `${process.env.API_URL || ''}/api/messaging/notify`;
  try {
    await fetch(mmNotifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: process.env.MATTERMOST_CONTENT_CHANNEL,
        message: `📝 New service published: **${entry?.title}**\n[View →](https://handywriterz.com/services/${entry?.domain}/${entry?.slug})`,
      }),
    });
  } catch {
    // Notification is best-effort
  }
}

async function handleArticlePublish(entry: any) {
  console.log(`[Content] Article published: ${entry?.title} (${entry?.slug})`);
  
  // Could trigger SEO tasks, social sharing, etc.
}

async function invalidateCache(model: string, slug?: string) {
  // Cloudflare cache purge
  const cfZoneId = process.env.CLOUDFLARE_ZONE_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!cfZoneId || !cfApiToken) {
    console.log('[Cache] Cloudflare not configured, skipping purge');
    return;
  }

  const urlsToPurge = [
    'https://handywriterz.com/',
    `https://handywriterz.com/services`,
  ];

  if (slug) {
    urlsToPurge.push(`https://handywriterz.com/services/*/${slug}`);
    if (model === 'article') {
      urlsToPurge.push(`https://handywriterz.com/articles/${slug}`);
    }
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urlsToPurge }),
      }
    );

    if (response.ok) {
      console.log(`[Cache] Purged ${urlsToPurge.length} URLs`);
    } else {
      console.error('[Cache] Purge failed:', await response.text());
    }
  } catch (error) {
    console.error('[Cache] Purge error:', error);
  }
}

async function handleStripeWebhook(event: any) {
  console.log(`[Payment] Stripe event: ${event.type}`);
  // TODO: Implement order status updates
}

async function handlePayPalWebhook(event: any) {
  console.log(`[Payment] PayPal event:`, event.event_type);
  // TODO: Implement PayPal handling
}

async function handleStableLinkWebhook(event: any) {
  console.log(`[Payment] StableLink event:`, event);
  // TODO: Implement StableLink handling
}

async function handleCoinbaseWebhook(event: any) {
  console.log(`[Payment] Coinbase event:`, event.type);
  // TODO: Implement Coinbase handling
}

// Export scan results getter
export function getScanResult(key: string) {
  return scanResults.get(key);
}
