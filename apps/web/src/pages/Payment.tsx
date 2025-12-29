import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { stableLinkPaymentService } from '@/services/stableLinkPaymentService';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Clock, Wallet, CreditCard } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  serviceType: string;
  metadata: Record<string, any>;
}

interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  orderDetails: {
    serviceType: string;
    subjectArea: string;
    wordCount: number;
    studyLevel: string;
    dueDate: string;
    module: string;
    instructions: string;
  };
  files: Array<{ name: string; url: string; path: string }>;
}

const PaymentPage: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const [paymentState, setPaymentState] = useState<'init' | 'processing' | 'success' | 'error'>('init');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  // Extract payment data from location state
  useEffect(() => {
    const paymentData = location.state?.paymentData as PaymentData | undefined;

    if (paymentData) {
      setOrderDetails({
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: `Order for ${paymentData.orderDetails.serviceType}`,
        serviceType: paymentData.orderDetails.serviceType,
        metadata: {
          ...paymentData.orderDetails,
          files: paymentData.files
        }
      });
    } else {
      // Fallback for direct access or missing state
      toast.error('Payment data not found. Please initiate payment from the dashboard.');
    }
  }, [location.state]);

  const onSuccess = () => {
    setPaymentState('success');
    toast.success('Payment completed successfully!');
  };

  const onCancel = () => {
    setPaymentState('init');
    toast('Payment cancelled', { icon: 'ℹ️' });
  };

  const onError = (message: string) => {
    setPaymentState('error');
    toast.error(message || 'Payment failed');
  };

  // Mock wallet connection - in production, use wagmi or similar for real wallet integration
  const connectWallet = async () => {
    if (!user) {
      toast.error('Please sign in to connect wallet');
      return;
    }

    // Simulate wallet connection
    setIsWalletConnected(true);
    setWalletAddress('0x1234567890abcdef...'); // Mock address
    toast.success('Wallet connected successfully');
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    toast('Wallet disconnected', { icon: 'ℹ️' });
  };

  const createPayment = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('User email is required for payment processing');
      return;
    }

    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!orderDetails) {
      toast.error('Order details not found');
      return;
    }

    setPaymentState('processing');

    try {
      const paymentRequest = {
        amount: orderDetails.amount,
        currency: orderDetails.currency,
        orderId: orderDetails.orderId,
        customerEmail: user.primaryEmailAddress.emailAddress,
        metadata: {
          ...orderDetails.metadata,
          userId: user.id,
          walletAddress: walletAddress,
          serviceType: orderDetails.serviceType
        },
        redirectUrls: {
          success: `${window.location.origin}/payment/success?order_id=${orderDetails.orderId}`,
          cancel: `${window.location.origin}/payment/cancel?order_id=${orderDetails.orderId}`,
          failure: `${window.location.origin}/payment/failure?order_id=${orderDetails.orderId}`
        }
      };

      const paymentResponse = await stableLinkPaymentService.createPayment(paymentRequest);

      setPaymentId(paymentResponse.paymentId);

      // If a checkout URL is provided (e.g., Stripe), redirect the user
      if (paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl;
        return;
      }

      // Start polling for payment status
      const interval = setInterval(async () => {
        try {
          const status = await stableLinkPaymentService.checkPaymentStatus(paymentResponse.paymentId);

          if (status.status === 'completed') {
            setPaymentState('success');
            clearInterval(interval);
            setPollingInterval(null);
            onSuccess();
            generateReceipt(paymentResponse.paymentId);
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            setPaymentState('error');
            clearInterval(interval);
            setPollingInterval(null);
            onCancel();
            toast.error(`Payment ${status.status}`);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 2000); // Poll every 2 seconds

      setPollingInterval(interval);

      toast.success('Payment initiated. Monitoring status...');
    } catch (error) {
      console.error('Payment creation error:', error);
      setPaymentState('error');
      onError(error instanceof Error ? error.message : 'Failed to create payment');
    }
  };

  const generateReceipt = (paymentId: string) => {
    // Generate receipt - in production, send email or display PDF
    if (!orderDetails) return;

    const receipt = {
      id: paymentId,
      orderId: orderDetails.orderId,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      timestamp: new Date().toISOString(),
      status: 'completed',
      walletAddress: walletAddress
    };

    // For demo, show toast
    toast.success('Receipt generated. Check your email for details.');
    console.log('Receipt:', receipt);

    // In production, send via email or generate PDF
  };

  const cancelPayment = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setPollingInterval(null);
    setPaymentState('init');
    setPaymentId(null);
    setTransactionHash(null);
    onCancel();
    toast('Payment cancelled', { icon: 'ℹ️' });
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Data Missing</h3>
            <p className="text-gray-500 mb-4">Please initiate payment from the dashboard.</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">Secure Payment</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Complete your payment using cryptocurrency
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Wallet Connection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isWalletConnected ? (
                <Button onClick={connectWallet} className="w-full">
                  Connect Wallet
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Wallet Connected</p>
                  <p className="text-xs text-gray-600 truncate">{walletAddress}</p>
                  <Button variant="outline" onClick={disconnectWallet} className="w-full">
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order #{orderDetails.orderId}</CardTitle>
            <CardDescription>{orderDetails.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Service</Label>
                <p className="text-gray-900">{orderDetails.serviceType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p className="text-2xl font-bold text-green-600">{orderDetails.amount} {orderDetails.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        {paymentState === 'init' && (
          <Button
            onClick={createPayment}
            disabled={!isWalletConnected}
            className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Pay with Crypto
          </Button>
        )}

        {/* Payment Status */}
        {paymentState === 'processing' && (
          <Card className="mb-6">
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing payment...</p>
              <p className="text-sm text-gray-500 mt-2">Monitoring transaction status</p>
            </CardContent>
          </Card>
        )}

        {paymentState === 'success' && (
          <Card className="mb-6 bg-green-50 border border-green-200">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-green-900 mb-2">Payment Successful!</h4>
              <p className="text-green-700">Transaction ID: {paymentId}</p>
              {transactionHash && (
                <p className="text-sm text-green-600 mt-2">Hash: {transactionHash}</p>
              )}
              <Button onClick={onSuccess} className="mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {paymentState === 'error' && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-red-900 mb-2">Payment Failed</h4>
              <p className="text-red-700 mb-4">Please try again or contact support</p>
              <div className="space-x-3">
                <Button onClick={() => setPaymentState('init')} variant="outline">
                  Try Again
                </Button>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
