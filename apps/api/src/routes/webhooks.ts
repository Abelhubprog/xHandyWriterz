import { Router, IRouter } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import {
  verifyStripeSignature,
  verifyPayPalSignature,
  verifyCoinbaseSignature,
  updatePaymentStatus,
  getPaymentSession,
} from '../services/payments.js';

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
      case 'stripe': {
        const stripeSignature = req.headers['stripe-signature'] as string;
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        if (!verifyStripeSignature(rawBody, stripeSignature)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
        await handleStripeWebhook(req.body);
        break;
      }

      case 'paypal': {
        const isValid = await verifyPayPalSignature(req);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
        await handlePayPalWebhook(req.body);
        break;
      }

      case 'stablelink': {
        // StableLink uses HMAC-SHA256 verification
        const signature = req.headers['x-stablelink-signature'] as string;
        const secret = process.env.STABLELINK_WEBHOOK_SECRET || '';
        if (secret && !verifyWebhookSignature(JSON.stringify(req.body), signature, secret)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
        await handleStableLinkWebhook(req.body);
        break;
      }

      case 'coinbase': {
        const coinbaseSignature = req.headers['x-cc-webhook-signature'] as string;
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        if (!verifyCoinbaseSignature(rawBody, coinbaseSignature)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
        await handleCoinbaseWebhook(req.body);
        break;
      }

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
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'completed');
        await notifyPaymentComplete(orderId, 'stripe', session.amount_total / 100);
      }
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'failed');
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      console.log(`[Payment] Stripe payment failed:`, intent.last_payment_error?.message);
      break;
    }
    default:
      console.log(`[Payment] Unhandled Stripe event: ${event.type}`);
  }
}

async function handlePayPalWebhook(event: any) {
  console.log(`[Payment] PayPal event:`, event.event_type);
  
  switch (event.event_type) {
    case 'CHECKOUT.ORDER.APPROVED': {
      const orderId = event.resource?.purchase_units?.[0]?.custom_id;
      if (orderId) {
        // Order approved, but payment not yet captured
        console.log(`[Payment] PayPal order approved for ${orderId}`);
      }
      break;
    }
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const orderId = event.resource?.custom_id || event.resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        await updatePaymentStatus(orderId, 'completed');
        const amount = parseFloat(event.resource?.amount?.value || '0');
        await notifyPaymentComplete(orderId, 'paypal', amount);
      }
      break;
    }
    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.REFUNDED': {
      const orderId = event.resource?.custom_id;
      if (orderId) {
        await updatePaymentStatus(orderId, event.event_type.includes('REFUNDED') ? 'cancelled' : 'failed');
      }
      break;
    }
    default:
      console.log(`[Payment] Unhandled PayPal event: ${event.event_type}`);
  }
}

async function handleStableLinkWebhook(event: any) {
  console.log(`[Payment] StableLink event:`, event.type);
  
  switch (event.type) {
    case 'payment.completed': {
      const orderId = event.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'completed');
        await notifyPaymentComplete(orderId, 'stablelink', event.amount);
      }
      break;
    }
    case 'payment.failed': {
      const orderId = event.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'failed');
      }
      break;
    }
    case 'payment.expired': {
      const orderId = event.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'cancelled');
      }
      break;
    }
    default:
      console.log(`[Payment] Unhandled StableLink event: ${event.type}`);
  }
}

async function handleCoinbaseWebhook(event: any) {
  console.log(`[Payment] Coinbase event:`, event.type);
  
  switch (event.type) {
    case 'charge:confirmed': {
      const orderId = event.data?.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'completed');
        const payments = event.data?.payments || [];
        const amount = payments.reduce((sum: number, p: any) => sum + parseFloat(p.value?.local?.amount || '0'), 0);
        await notifyPaymentComplete(orderId, 'coinbase', amount);
      }
      break;
    }
    case 'charge:failed': {
      const orderId = event.data?.metadata?.orderId;
      if (orderId) {
        await updatePaymentStatus(orderId, 'failed');
      }
      break;
    }
    case 'charge:pending': {
      const orderId = event.data?.metadata?.orderId;
      console.log(`[Payment] Coinbase payment pending for ${orderId}`);
      break;
    }
    default:
      console.log(`[Payment] Unhandled Coinbase event: ${event.type}`);
  }
}

/**
 * Send notification when payment completes
 */
async function notifyPaymentComplete(orderId: string, provider: string, amount: number) {
  const mmWebhookUrl = process.env.MATTERMOST_WEBHOOK_URL;
  if (!mmWebhookUrl) return;

  try {
    await fetch(mmWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `💰 **Payment Received**\n` +
              `- Order: \`${orderId}\`\n` +
              `- Provider: ${provider}\n` +
              `- Amount: $${amount.toFixed(2)}\n` +
              `- Time: ${new Date().toISOString()}`,
      }),
    });
  } catch (error) {
    console.error('[Notification] Failed to notify payment:', error);
  }
}

// Export scan results getter
export function getScanResult(key: string) {
  return scanResults.get(key);
}
