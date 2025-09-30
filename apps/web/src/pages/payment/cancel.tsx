import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentCancel: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order_id') || undefined;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>
            {orderId ? `Payment for order ${orderId} was cancelled.` : 'The payment was cancelled.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => navigate(-1)}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;
