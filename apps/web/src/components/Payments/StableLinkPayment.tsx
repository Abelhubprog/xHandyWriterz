import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import stableLinkPaymentService from '@/services/stableLinkPaymentService';
import toast from 'react-hot-toast';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Clock, Wallet } from 'lucide-react';

interface StableLinkPaymentProps {
  orderDetails: {
    orderId: string;
    amount: number;
    currency: string;
    description?: string;
    serviceType?: string;
    metadata?: Record<string, any>;
  };
  onSuccess?: (res: any) => void;
  onCancel?: () => void;
  onError?: (err: string) => void;
}

const StableLinkPayment: React.FC<StableLinkPaymentProps> = ({ orderDetails, onSuccess, onCancel, onError }) => {
  const { user } = useUser();
  const [state, setState] = useState<'init'|'creating'|'pending'|'completed'|'failed'>('init');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60);

  useEffect(() => {
    if (state === 'pending' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setState('failed');
            onError?.('Payment session expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state, timeRemaining, onError]);

  useEffect(() => {
    let poll: any;
    if (state === 'pending' && paymentId) {
      poll = setInterval(async () => {
        try {
          const status = await stableLinkPaymentService.checkPaymentStatus(paymentId);
          if (status.status === 'completed') {
            setState('completed');
            clearInterval(poll);
            onSuccess?.(status);
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            setState('failed');
            clearInterval(poll);
            onError?.(`Payment ${status.status}`);
          }
        } catch (err) {
          // ignore transient errors
        }
      }, 5000);
    }

    return () => clearInterval(poll);
  }, [state, paymentId, onSuccess, onError]);

  const handleCreatePayment = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      onError?.('User email required');
      return;
    }

    setState('creating');

    try {
      const req = {
        amount: orderDetails.amount,
        currency: orderDetails.currency,
        orderId: orderDetails.orderId,
        customerEmail: user.primaryEmailAddress.emailAddress,
        metadata: {
          ...orderDetails.metadata,
          userId: user.id
        },
        redirectUrls: {
          success: `${window.location.origin}/payment/success?order_id=${orderDetails.orderId}`,
          cancel: `${window.location.origin}/payment/cancel?order_id=${orderDetails.orderId}`,
          failure: `${window.location.origin}/payment/failure?order_id=${orderDetails.orderId}`
        }
      };

      // Create payment server-side to avoid exposing API key
      const serverRes = await fetch('/api/payments/stablelink-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: req.amount,
          currency: req.currency,
          order_id: req.orderId,
          customer_email: req.customerEmail,
          metadata: req.metadata,
          redirect_urls: req.redirectUrls
        })
      });

      if (!serverRes.ok) {
        const errText = await serverRes.text();
        throw new Error(errText || 'Failed to create payment session');
      }

      const json = await serverRes.json();
      const res = json.data;
      setPaymentId(res.paymentId);
      setPaymentUrl(res.paymentUrl);
      setState('pending');
      // Persist payment record to backend DB
      try {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: res.paymentId,
            user_id: user.id,
            order_id: orderDetails.orderId,
            amount: res.amount,
            currency: res.currency,
            payment_method: 'stablelink',
            payment_provider: 'stablelink',
            status: 'pending',
            metadata: JSON.stringify({ paymentUrl: res.paymentUrl, createdAt: new Date().toISOString() }),
            created_at: new Date().toISOString()
          })
        });
      } catch (err) {
        console.warn('Failed to persist payment record', err);
      }
      toast.success('Payment session created');

      const w = window.open(res.paymentUrl, 'stablelink-payment', 'width=600,height=700');
      if (!w) {
        toast.error('Popup blocked. Please allow popups.');
        setState('init');
      }
    } catch (error: any) {
      setState('failed');
      onError?.(error?.message || 'Failed to create payment');
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white">Crypto Payment</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600">Service</div>
            <div className="font-medium">{orderDetails.serviceType || 'Order'}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Amount</div>
            <div className="text-xl font-bold text-green-600">${orderDetails.amount.toFixed(2)} {orderDetails.currency}</div>
          </div>
        </div>

        {state === 'init' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-sm text-blue-800">Pay securely with stablecoins or crypto.</div>
            </div>
            <button onClick={handleCreatePayment} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded">Pay with Crypto</button>
          </div>
        )}

        {state === 'creating' && (
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <div className="text-sm text-gray-600">Creating payment session...</div>
          </div>
        )}

        {state === 'pending' && (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="text-sm text-yellow-800">Payment pending. Complete in the opened window. Time remaining: <span className="font-mono">{formatTime(timeRemaining)}</span></div>
              </div>
            </div>
            {paymentUrl && (
              <div className="flex space-x-2">
                <button onClick={() => window.open(paymentUrl, 'stablelink-payment', 'width=600,height=700')} className="flex-1 bg-blue-600 text-white py-2 rounded flex items-center justify-center space-x-2"><ExternalLink className="h-4 w-4" /><span>Reopen Payment</span></button>
                <button onClick={() => { setState('failed'); onCancel?.(); }} className="flex-1 bg-gray-600 text-white py-2 rounded">Cancel</button>
              </div>
            )}
          </div>
        )}

        {state === 'completed' && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <div className="text-lg font-medium">Payment Successful</div>
          </div>
        )}

        {state === 'failed' && (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <div className="text-lg font-medium mb-2">Payment Failed</div>
            <div className="space-x-2">
              <button onClick={() => { setState('init'); setPaymentId(null); setPaymentUrl(null); setTimeRemaining(30*60); }} className="bg-blue-600 text-white py-2 px-4 rounded">Try Again</button>
              <button onClick={() => onCancel?.()} className="bg-gray-600 text-white py-2 px-4 rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StableLinkPayment;
