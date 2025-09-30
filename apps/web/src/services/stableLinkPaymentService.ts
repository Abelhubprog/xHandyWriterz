// StableLink payment service wrapper
// Provides createPayment and checkPaymentStatus via our serverless API proxy

export type CreatePaymentRequest = {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, any>;
  redirectUrls?: {
    success: string;
    cancel: string;
    failure: string;
  };
};

export type CreatePaymentResponse = {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  checkoutUrl?: string;
};

export type PaymentStatus = {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
};

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Payment API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const stableLinkPaymentService = {
  async createPayment(req: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    return postJSON<CreatePaymentResponse>('/api/payments/create', req);
  },
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    return postJSON<PaymentStatus>('/api/payments/status', { paymentId });
  },
};

export default stableLinkPaymentService;
