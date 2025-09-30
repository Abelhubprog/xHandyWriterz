import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order_id') || undefined;
  const provider = params.get('provider') || undefined;
  const token = params.get('token') || params.get('paypal_order_id') || undefined; // PayPal returns token (order id)
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  const [emailed, setEmailed] = useState(false);

  useEffect(() => {
    // If this is a PayPal return, capture the order
    if (provider === 'paypal' && token && !captured) {
      fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, paypalOrderId: token })
      })
        .then(() => setCaptured(true))
        .catch(() => setCaptured(true));
    }

    // If this was a public Turnitin flow, we stored submission in localStorage.
    if (!orderId || emailed) return;
    const key = `turnitin:${orderId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const submission = JSON.parse(raw);
    const payload = { orderId, email: submission.email, attachments: submission.attachments || [] };
    // Notify admin via serverless email
    fetch('/api/turnitin/notify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {}).finally(() => {
      // best-effort cleanup to avoid dupes on refreshes
      try { localStorage.removeItem(key); } catch { /* noop */ }
      setEmailed(true);
    });
    // Send a receipt to the user
    fetch('/api/turnitin/receipt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }, [orderId, provider, token, captured, emailed]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>
            {orderId ? `Your order ${orderId} has been paid.` : 'Your payment was successful.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
