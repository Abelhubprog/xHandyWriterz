/**
 * Payment Service
 * Handles payment processing, history, and refunds
 * Integrates with Stripe and other payment providers
 */

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'crypto';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export class PaymentService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/payments') {
    this.apiUrl = apiUrl;
  }

  /**
   * Process a payment
   */
  async processPayment(
    amount: number,
    method: string,
    metadata?: Record<string, any>
  ): Promise<Payment> {
    try {
      const response = await fetch(`${this.apiUrl}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, metadata }),
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Create payment intent (for Stripe)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd'
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.apiUrl}/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string): Promise<Payment[]> {
    try {
      const response = await fetch(`${this.apiUrl}/history?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch payment history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment history fetch error:', error);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    try {
      const response = await fetch(`${this.apiUrl}/${paymentId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch payment details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<Payment> {
    try {
      const response = await fetch(`${this.apiUrl}/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) {
        throw new Error(`Refund failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment methods for a user
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.apiUrl}/methods?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment methods fetch error:', error);
      return [];
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(
    userId: string,
    methodData: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${this.apiUrl}/methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...methodData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add payment method: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/methods/${methodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete payment method: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Delete payment method error:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/methods/${methodId}/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set default payment method: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Set default payment method error:', error);
      throw error;
    }
  }

  /**
   * Calculate payment total with fees
   */
  calculateTotal(
    subtotal: number,
    tax: number = 0,
    fees: number = 0
  ): number {
    return subtotal + tax + fees;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export for direct usage
export default paymentService;
