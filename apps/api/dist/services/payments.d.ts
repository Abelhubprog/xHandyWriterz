/**
 * Payment Provider Service
 * Handles integration with StableLink, PayPal, Stripe, and Coinbase
 */
export interface PaymentSession {
    id: string;
    provider: 'stablelink' | 'paypal' | 'stripe' | 'coinbase';
    orderId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    checkoutUrl: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}
export interface CreatePaymentParams {
    orderId: string;
    amount: number;
    currency: string;
    description?: string;
    returnUrl: string;
    cancelUrl: string;
    customerEmail?: string;
}
/**
 * StableLink Payment Provider
 * UK/EU crypto payment gateway with GBP/EUR support
 */
export declare function createStableLinkPayment(params: CreatePaymentParams): Promise<PaymentSession>;
/**
 * PayPal Payment Provider
 * Using PayPal Orders API v2
 */
export declare function createPayPalPayment(params: CreatePaymentParams): Promise<PaymentSession>;
/**
 * Stripe Payment Provider
 * Using Stripe Checkout Sessions
 */
export declare function createStripePayment(params: CreatePaymentParams): Promise<PaymentSession>;
/**
 * Coinbase Commerce Payment Provider
 * Cryptocurrency payments
 */
export declare function createCoinbasePayment(params: CreatePaymentParams): Promise<PaymentSession>;
/**
 * Get payment session by ID
 */
export declare function getPaymentSession(sessionId: string): PaymentSession | undefined;
/**
 * Update payment session status
 */
export declare function updatePaymentStatus(sessionId: string, status: PaymentSession['status']): PaymentSession | undefined;
/**
 * Verify Stripe webhook signature
 */
export declare function verifyStripeSignature(payload: string | Buffer, signature: string, secret: string): boolean;
/**
 * Verify PayPal webhook signature
 */
export declare function verifyPayPalSignature(headers: Record<string, string>, body: unknown, webhookId: string): Promise<boolean>;
/**
 * Verify Coinbase webhook signature
 */
export declare function verifyCoinbaseSignature(payload: string | Buffer, signature: string, secret: string): boolean;
//# sourceMappingURL=payments.d.ts.map