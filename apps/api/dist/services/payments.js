/**
 * Payment Provider Service
 * Handles integration with StableLink, PayPal, Stripe, and Coinbase
 */
import crypto from 'crypto';
// In-memory session store (replace with Redis/DB in production)
const sessions = new Map();
function generateSessionId(provider) {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${provider}_${timestamp}_${random}`;
}
/**
 * StableLink Payment Provider
 * UK/EU crypto payment gateway with GBP/EUR support
 */
export async function createStableLinkPayment(params) {
    const apiKey = process.env.STABLELINK_API_KEY;
    const apiSecret = process.env.STABLELINK_API_SECRET;
    const baseUrl = process.env.STABLELINK_API_URL || 'https://api.stablelink.io/v1';
    if (!apiKey || !apiSecret) {
        throw new Error('StableLink credentials not configured');
    }
    const sessionId = generateSessionId('sl');
    try {
        // StableLink API call
        const response = await fetch(`${baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'X-API-Secret': apiSecret,
            },
            body: JSON.stringify({
                amount: params.amount,
                currency: params.currency,
                reference: params.orderId,
                description: params.description || `Order ${params.orderId}`,
                redirect_url: params.returnUrl,
                cancel_url: params.cancelUrl,
                customer_email: params.customerEmail,
                metadata: {
                    order_id: params.orderId,
                    session_id: sessionId,
                },
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('[StableLink] API error:', error);
            // Fallback to placeholder for development
            const session = {
                id: sessionId,
                provider: 'stablelink',
                orderId: params.orderId,
                amount: params.amount,
                currency: params.currency,
                status: 'pending',
                checkoutUrl: `https://pay.stablelink.io/checkout/${sessionId}`,
                createdAt: new Date().toISOString(),
            };
            sessions.set(sessionId, session);
            return session;
        }
        const data = await response.json();
        const session = {
            id: data.payment_id || sessionId,
            provider: 'stablelink',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: data.checkout_url || `https://pay.stablelink.io/checkout/${data.payment_id}`,
            createdAt: new Date().toISOString(),
            metadata: data,
        };
        sessions.set(session.id, session);
        return session;
    }
    catch (error) {
        console.error('[StableLink] Error:', error);
        // Development fallback
        const session = {
            id: sessionId,
            provider: 'stablelink',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: `https://pay.stablelink.io/checkout/${sessionId}`,
            createdAt: new Date().toISOString(),
        };
        sessions.set(sessionId, session);
        return session;
    }
}
/**
 * PayPal Payment Provider
 * Using PayPal Orders API v2
 */
export async function createPayPalPayment(params) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const sandbox = process.env.PAYPAL_SANDBOX === 'true';
    const baseUrl = sandbox
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
    }
    const sessionId = generateSessionId('pp');
    try {
        // Get access token
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });
        if (!authResponse.ok) {
            throw new Error('PayPal authentication failed');
        }
        const authData = await authResponse.json();
        const accessToken = authData.access_token;
        // Create order
        const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                        reference_id: params.orderId,
                        description: params.description || `Order ${params.orderId}`,
                        amount: {
                            currency_code: params.currency.toUpperCase(),
                            value: params.amount.toFixed(2),
                        },
                    }],
                payment_source: {
                    paypal: {
                        experience_context: {
                            return_url: params.returnUrl,
                            cancel_url: params.cancelUrl,
                            brand_name: 'HandyWriterz',
                            locale: 'en-GB',
                            landing_page: 'LOGIN',
                            user_action: 'PAY_NOW',
                        },
                    },
                },
            }),
        });
        if (!orderResponse.ok) {
            const error = await orderResponse.text();
            console.error('[PayPal] API error:', error);
            throw new Error('PayPal order creation failed');
        }
        const orderData = await orderResponse.json();
        const approveLink = orderData.links?.find((l) => l.rel === 'payer-action')?.href;
        const session = {
            id: orderData.id || sessionId,
            provider: 'paypal',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: approveLink || `https://www.paypal.com/checkoutnow?token=${orderData.id}`,
            createdAt: new Date().toISOString(),
            metadata: { paypalOrderId: orderData.id },
        };
        sessions.set(session.id, session);
        return session;
    }
    catch (error) {
        console.error('[PayPal] Error:', error);
        // Development fallback
        const session = {
            id: sessionId,
            provider: 'paypal',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: `https://www.paypal.com/checkoutnow?token=${sessionId}`,
            createdAt: new Date().toISOString(),
        };
        sessions.set(sessionId, session);
        return session;
    }
}
/**
 * Stripe Payment Provider
 * Using Stripe Checkout Sessions
 */
export async function createStripePayment(params) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const baseUrl = 'https://api.stripe.com/v1';
    if (!secretKey) {
        throw new Error('Stripe credentials not configured');
    }
    const sessionId = generateSessionId('stripe');
    try {
        // Create Checkout Session
        const response = await fetch(`${baseUrl}/checkout/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'payment_method_types[]': 'card',
                'mode': 'payment',
                'success_url': params.returnUrl,
                'cancel_url': params.cancelUrl,
                'line_items[0][price_data][currency]': params.currency.toLowerCase(),
                'line_items[0][price_data][product_data][name]': params.description || `Order ${params.orderId}`,
                'line_items[0][price_data][unit_amount]': Math.round(params.amount * 100).toString(),
                'line_items[0][quantity]': '1',
                'metadata[order_id]': params.orderId,
                'metadata[session_id]': sessionId,
                ...(params.customerEmail && { 'customer_email': params.customerEmail }),
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('[Stripe] API error:', error);
            throw new Error('Stripe session creation failed');
        }
        const data = await response.json();
        const session = {
            id: data.id || sessionId,
            provider: 'stripe',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: data.url || `https://checkout.stripe.com/pay/${data.id}`,
            createdAt: new Date().toISOString(),
            metadata: { stripeSessionId: data.id },
        };
        sessions.set(session.id, session);
        return session;
    }
    catch (error) {
        console.error('[Stripe] Error:', error);
        // Development fallback
        const session = {
            id: sessionId,
            provider: 'stripe',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: `https://checkout.stripe.com/pay/${sessionId}`,
            createdAt: new Date().toISOString(),
        };
        sessions.set(sessionId, session);
        return session;
    }
}
/**
 * Coinbase Commerce Payment Provider
 * Cryptocurrency payments
 */
export async function createCoinbasePayment(params) {
    const apiKey = process.env.COINBASE_API_KEY;
    const baseUrl = 'https://api.commerce.coinbase.com';
    if (!apiKey) {
        throw new Error('Coinbase credentials not configured');
    }
    const sessionId = generateSessionId('cb');
    try {
        // Create charge
        const response = await fetch(`${baseUrl}/charges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': apiKey,
                'X-CC-Version': '2018-03-22',
            },
            body: JSON.stringify({
                name: params.description || `Order ${params.orderId}`,
                description: `Payment for order ${params.orderId}`,
                pricing_type: 'fixed_price',
                local_price: {
                    amount: params.amount.toString(),
                    currency: params.currency.toUpperCase(),
                },
                metadata: {
                    order_id: params.orderId,
                    session_id: sessionId,
                },
                redirect_url: params.returnUrl,
                cancel_url: params.cancelUrl,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('[Coinbase] API error:', error);
            throw new Error('Coinbase charge creation failed');
        }
        const data = await response.json();
        const session = {
            id: data.data?.id || sessionId,
            provider: 'coinbase',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: data.data?.hosted_url || `https://commerce.coinbase.com/checkout/${sessionId}`,
            createdAt: new Date().toISOString(),
            metadata: { coinbaseChargeId: data.data?.id },
        };
        sessions.set(session.id, session);
        return session;
    }
    catch (error) {
        console.error('[Coinbase] Error:', error);
        // Development fallback
        const session = {
            id: sessionId,
            provider: 'coinbase',
            orderId: params.orderId,
            amount: params.amount,
            currency: params.currency,
            status: 'pending',
            checkoutUrl: `https://commerce.coinbase.com/checkout/${sessionId}`,
            createdAt: new Date().toISOString(),
        };
        sessions.set(sessionId, session);
        return session;
    }
}
/**
 * Get payment session by ID
 */
export function getPaymentSession(sessionId) {
    return sessions.get(sessionId);
}
/**
 * Update payment session status
 */
export function updatePaymentStatus(sessionId, status) {
    const session = sessions.get(sessionId);
    if (session) {
        session.status = status;
        sessions.set(sessionId, session);
    }
    return session;
}
/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(payload, signature, secret) {
    try {
        const parts = signature.split(',').reduce((acc, part) => {
            const [key, value] = part.split('=');
            acc[key] = value;
            return acc;
        }, {});
        const timestamp = parts['t'];
        const expectedSig = parts['v1'];
        const signedPayload = `${timestamp}.${payload}`;
        const computedSig = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig));
    }
    catch {
        return false;
    }
}
/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalSignature(headers, body, webhookId) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const sandbox = process.env.PAYPAL_SANDBOX === 'true';
    const baseUrl = sandbox
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
    if (!clientId || !clientSecret) {
        return false;
    }
    try {
        // Get access token
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });
        const authData = await authResponse.json();
        // Verify webhook
        const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.access_token}`,
            },
            body: JSON.stringify({
                transmission_id: headers['paypal-transmission-id'],
                transmission_time: headers['paypal-transmission-time'],
                cert_url: headers['paypal-cert-url'],
                auth_algo: headers['paypal-auth-algo'],
                transmission_sig: headers['paypal-transmission-sig'],
                webhook_id: webhookId,
                webhook_event: body,
            }),
        });
        const verifyData = await verifyResponse.json();
        return verifyData.verification_status === 'SUCCESS';
    }
    catch {
        return false;
    }
}
/**
 * Verify Coinbase webhook signature
 */
export function verifyCoinbaseSignature(payload, signature, secret) {
    try {
        const computedSig = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=payments.js.map