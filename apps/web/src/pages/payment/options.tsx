import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import stableLinkPaymentService from '@/services/stableLinkPaymentService';

const PaymentOptions: React.FC = () => {
  const location = useLocation();
  const paymentData = useMemo(() => (location.state as any)?.paymentData, [location.state]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">Missing payment data. Start from the order or Turnitin form.</CardContent>
        </Card>
      </div>
    );
  }

  const handleCard = async () => {
    try {
      const res = await stableLinkPaymentService.createPayment({
        amount: paymentData.amount,
        currency: paymentData.currency,
        orderId: paymentData.orderId,
        customerEmail: paymentData.customerEmail || 'guest@user.local',
        metadata: paymentData.metadata || paymentData.orderDetails,
        redirectUrls: {
          success: `${window.location.origin}/payment/success?order_id=${paymentData.orderId}`,
          cancel: `${window.location.origin}/payment/cancel?order_id=${paymentData.orderId}`,
          failure: `${window.location.origin}/payment/failure?order_id=${paymentData.orderId}`,
        },
      });
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
      else toast('Payment initiated', { icon: '💳' });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start card payment');
    }
  };

  const handlePayPal = async () => {
    try {
      const res = await fetch('/api/payments/paypal/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          customerEmail: paymentData.customerEmail || 'guest@user.local',
          metadata: paymentData.metadata || paymentData.orderDetails,
          redirectUrls: {
            success: `${window.location.origin}/payment/success`,
            cancel: `${window.location.origin}/payment/cancel`,
            failure: `${window.location.origin}/payment/failure`,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create PayPal order');
      if (json.checkoutUrl) window.location.href = json.checkoutUrl;
      else toast('PayPal order created', { icon: '🅿️' });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start PayPal payment');
    }
  };

  const handleCrypto = async () => {
    try {
      const base = (import.meta as any).env?.VITE_STABLELINK_BASE || 'https://www.stablelink.xyz';
      const url = `${base}/pay?amount=${encodeURIComponent(paymentData.amount)}&currency=${encodeURIComponent(paymentData.currency)}&ref=${encodeURIComponent(paymentData.orderId)}&email=${encodeURIComponent(paymentData.customerEmail || '')}`;
      window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start crypto payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>
            Order {paymentData.orderId}: {paymentData.amount} {paymentData.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button onClick={handleCard} className="w-full h-20 flex flex-col gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Card</span>
            </Button>
            <Button variant="outline" onClick={handlePayPal} className="w-full h-20 flex flex-col gap-2">
              <span className="text-lg font-semibold">PayPal</span>
              <span className="text-xs text-muted-foreground">Pay with your PayPal account</span>
            </Button>
            <Button variant="secondary" onClick={handleCrypto} className="w-full h-20 flex flex-col gap-2">
              <Coins className="h-5 w-5" />
              <span>Crypto</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentOptions;
