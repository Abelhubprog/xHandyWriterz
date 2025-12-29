import { Router } from 'express';
import { z } from 'zod';
import { createStableLinkPayment, createPayPalPayment, createStripePayment, createCoinbasePayment, getPaymentSession, updatePaymentStatus, verifyStripeSignature, verifyPayPalSignature, verifyCoinbaseSignature, } from '../services/payments.js';
export const paymentsRouter = Router();
// Schemas
const createPaymentSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().default('GBP'),
    orderId: z.string(),
    description: z.string().optional(),
    provider: z.enum(['stablelink', 'paypal', 'stripe', 'coinbase']),
    returnUrl: z.string().url(),
    cancelUrl: z.string().url(),
    customerEmail: z.string().email().optional(),
});
const webhookSchema = z.object({
    event: z.string(),
    data: z.record(z.unknown()),
});
/**
 * POST /api/payments/create
 * Create a payment session with the specified provider
 */
paymentsRouter.post('/create', async (req, res) => {
    try {
        const parsed = createPaymentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
        }
        const { amount, currency, orderId, description, provider, returnUrl, cancelUrl, customerEmail } = parsed.data;
        const params = {
            orderId,
            amount,
            currency,
            description,
            returnUrl,
            cancelUrl,
            customerEmail,
        };
        let session;
        switch (provider) {
            case 'stablelink':
                session = await createStableLinkPayment(params);
                break;
            case 'paypal':
                session = await createPayPalPayment(params);
                break;
            case 'stripe':
                session = await createStripePayment(params);
                break;
            case 'coinbase':
                session = await createCoinbasePayment(params);
                break;
            default:
                return res.status(400).json({ error: 'Invalid payment provider' });
        }
        console.log(`[Payments] Created ${provider} session ${session.id} for order ${orderId}`);
        res.json({
            sessionId: session.id,
            paymentUrl: session.checkoutUrl,
            provider,
            amount,
            currency,
            orderId,
        });
    }
    catch (error) {
        console.error('[Payments] Creation error:', error);
        res.status(500).json({ error: 'Failed to create payment session' });
    }
});
/**
 * POST /api/payments/webhook/:provider
 * Handle payment provider webhooks
 */
paymentsRouter.post('/webhook/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        switch (provider) {
            case 'stripe': {
                const signature = req.headers['stripe-signature'];
                const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
                if (!signature) {
                    return res.status(400).json({ error: 'Missing signature' });
                }
                if (webhookSecret) {
                    const rawBody = JSON.stringify(req.body);
                    const isValid = verifyStripeSignature(rawBody, signature, webhookSecret);
                    if (!isValid) {
                        return res.status(400).json({ error: 'Invalid signature' });
                    }
                }
                const event = req.body;
                if (event.type === 'checkout.session.completed') {
                    const sessionId = event.data.object.metadata?.session_id || event.data.object.id;
                    updatePaymentStatus(sessionId, 'completed');
                    await notifyPaymentComplete(event.data.object.metadata?.order_id, sessionId, 'stripe');
                }
                break;
            }
            case 'paypal': {
                const webhookId = process.env.PAYPAL_WEBHOOK_ID;
                if (webhookId) {
                    const headers = {
                        'paypal-transmission-id': req.headers['paypal-transmission-id'],
                        'paypal-transmission-time': req.headers['paypal-transmission-time'],
                        'paypal-cert-url': req.headers['paypal-cert-url'],
                        'paypal-auth-algo': req.headers['paypal-auth-algo'],
                        'paypal-transmission-sig': req.headers['paypal-transmission-sig'],
                    };
                    const isValid = await verifyPayPalSignature(headers, req.body, webhookId);
                    if (!isValid) {
                        return res.status(400).json({ error: 'Invalid signature' });
                    }
                }
                const event = req.body;
                if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                    const orderId = event.resource?.purchase_units?.[0]?.reference_id;
                    updatePaymentStatus(event.resource?.id, 'completed');
                    await notifyPaymentComplete(orderId, event.resource?.id, 'paypal');
                }
                break;
            }
            case 'coinbase': {
                const signature = req.headers['x-cc-webhook-signature'];
                const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
                if (webhookSecret && signature) {
                    const rawBody = JSON.stringify(req.body);
                    const isValid = verifyCoinbaseSignature(rawBody, signature, webhookSecret);
                    if (!isValid) {
                        return res.status(400).json({ error: 'Invalid signature' });
                    }
                }
                const event = req.body;
                if (event.event?.type === 'charge:confirmed') {
                    const sessionId = event.event.data.metadata?.session_id || event.event.data.id;
                    updatePaymentStatus(sessionId, 'completed');
                    await notifyPaymentComplete(event.event.data.metadata?.order_id, sessionId, 'coinbase');
                }
                break;
            }
            case 'stablelink': {
                const signature = req.headers['x-stablelink-signature'];
                const webhookSecret = process.env.STABLELINK_WEBHOOK_SECRET;
                if (webhookSecret && signature) {
                    const crypto = require('crypto');
                    const rawBody = JSON.stringify(req.body);
                    const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
                    if (signature !== expectedSig) {
                        return res.status(400).json({ error: 'Invalid signature' });
                    }
                }
                const { event, data } = req.body;
                if (event === 'payment.completed') {
                    const sessionId = data?.metadata?.session_id || data?.payment_id;
                    updatePaymentStatus(sessionId, 'completed');
                    await notifyPaymentComplete(data?.reference, sessionId, 'stablelink');
                }
                break;
            }
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }
        console.log(`[Webhook] Processed ${provider} webhook`);
        res.json({ received: true });
    }
    catch (error) {
        console.error('[Webhook] Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});
/**
 * GET /api/payments/status/:sessionId
 * Check payment session status
 */
paymentsRouter.get('/status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = getPaymentSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({
            sessionId: session.id,
            status: session.status,
            orderId: session.orderId,
            amount: session.amount,
            currency: session.currency,
            provider: session.provider,
            createdAt: session.createdAt,
        });
    }
    catch (error) {
        console.error('[Payments] Status check error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});
/**
 * GET /api/payments/providers
 * List available payment providers
 */
paymentsRouter.get('/providers', (_req, res) => {
    const providers = [];
    if (process.env.STRIPE_SECRET_KEY) {
        providers.push({
            id: 'stripe',
            name: 'Credit/Debit Card',
            icon: 'credit-card',
            currencies: ['GBP', 'EUR', 'USD'],
        });
    }
    if (process.env.PAYPAL_CLIENT_ID) {
        providers.push({
            id: 'paypal',
            name: 'PayPal',
            icon: 'paypal',
            currencies: ['GBP', 'EUR', 'USD'],
        });
    }
    if (process.env.STABLELINK_API_KEY) {
        providers.push({
            id: 'stablelink',
            name: 'Crypto (StableLink)',
            icon: 'bitcoin',
            currencies: ['GBP', 'EUR', 'USDC', 'USDT'],
        });
    }
    if (process.env.COINBASE_API_KEY) {
        providers.push({
            id: 'coinbase',
            name: 'Coinbase',
            icon: 'bitcoin',
            currencies: ['BTC', 'ETH', 'USDC'],
        });
    }
    // Default to all for development
    if (providers.length === 0) {
        providers.push({ id: 'stripe', name: 'Credit/Debit Card', icon: 'credit-card', currencies: ['GBP', 'EUR', 'USD'] }, { id: 'paypal', name: 'PayPal', icon: 'paypal', currencies: ['GBP', 'EUR', 'USD'] }, { id: 'stablelink', name: 'Crypto (StableLink)', icon: 'bitcoin', currencies: ['GBP', 'EUR'] }, { id: 'coinbase', name: 'Coinbase', icon: 'bitcoin', currencies: ['BTC', 'ETH', 'USDC'] });
    }
    res.json({ providers });
});
/**
 * Helper: Notify order service and admin of payment completion
 */
async function notifyPaymentComplete(orderId, paymentId, provider) {
    if (!orderId)
        return;
    console.log(`[Payments] Payment complete: order=${orderId}, payment=${paymentId}, provider=${provider}`);
    // Notify admin via Mattermost webhook
    const webhookUrl = process.env.MATTERMOST_WEBHOOK_URL;
    if (webhookUrl) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `💳 **Payment Received**\n\n**Order:** ${orderId}\n**Payment ID:** ${paymentId}\n**Provider:** ${provider}\n**Time:** ${new Date().toISOString()}`,
                    username: 'Payment Bot',
                    icon_emoji: ':moneybag:',
                }),
            });
        }
        catch (e) {
            console.error('[Mattermost] Notification error:', e);
        }
    }
}
//# sourceMappingURL=payments.js.map