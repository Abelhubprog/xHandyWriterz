import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Bitcoin, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import stableLinkPaymentService from '@/services/stableLinkPaymentService';

interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  orderDetails?: any;
  files?: any[];
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
  borderColor: string;
  features: string[];
  popular?: boolean;
}

const PaymentGateway: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const data = location.state?.paymentData;
    if (!data) {
      toast.error('No payment data found. Redirecting...');
      navigate('/');
      return;
    }
    setPaymentData(data);
  }, [location, navigate]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stablelink',
      name: 'Credit/Debit Card',
      description: 'Secure card payments via StableLink',
      badge: 'Most Popular',
      icon: <CreditCard className="w-8 h-8" />,
      gradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200 hover:border-blue-400',
      features: ['Instant processing', 'Visa, Mastercard, Amex', 'Secure 3D authentication'],
      popular: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with your PayPal account',
      badge: 'Trusted',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437a3.446 3.446 0 0 0-.859-.68z"/>
        </svg>
      ),
      gradient: 'from-[#0070ba] to-[#1546a0]',
      textColor: 'text-[#0070ba]',
      borderColor: 'border-blue-200 hover:border-blue-400',
      features: ['PayPal balance', 'Linked bank account', 'Buyer protection'],
    },
    {
      id: 'stripe',
      name: 'Stripe / Paystack',
      description: 'Fast and secure card processing',
      badge: 'Fast',
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200 hover:border-purple-400',
      features: ['Lightning fast', 'Global coverage', 'Multiple currencies'],
    },
    {
      id: 'coinbase',
      name: 'Cryptocurrency',
      description: 'Pay with Bitcoin, Ethereum, or USDC',
      badge: 'Crypto',
      icon: <Bitcoin className="w-8 h-8" />,
      gradient: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200 hover:border-orange-400',
      features: ['Bitcoin, Ethereum, USDC', 'Coinbase Commerce', 'No chargebacks'],
    },
  ];

  const handlePaymentMethod = async (methodId: string) => {
    if (!paymentData) {
      toast.error('Payment data not available');
      return;
    }

    setProcessing(true);
    
    try {
      switch (methodId) {
        case 'stablelink':
          await handleStableLink();
          break;
        case 'paypal':
          await handlePayPal();
          break;
        case 'stripe':
          await handleStripe();
          break;
        case 'coinbase':
          await handleCoinbase();
          break;
        default:
          toast.error('Payment method not implemented yet');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleStableLink = async () => {
    if (!paymentData) return;

    toast.loading('Redirecting to StableLink...', { id: 'payment' });
    
    const result = await stableLinkPaymentService.createPayment({
      amount: paymentData.amount,
      currency: paymentData.currency,
      orderId: paymentData.orderId,
      customerEmail: paymentData.customerEmail,
      metadata: {
        serviceType: paymentData.orderDetails?.serviceType || 'Turnitin Check',
        ...paymentData.orderDetails,
      },
    });

    if (result.success && result.data?.checkoutUrl) {
      toast.success('Redirecting...', { id: 'payment' });
      window.location.href = result.data.checkoutUrl;
    } else {
      throw new Error(result.error || 'Failed to create payment');
    }
  };

  const handlePayPal = async () => {
    if (!paymentData) return;

    toast.loading('Connecting to PayPal...', { id: 'payment' });
    
    const response = await fetch('/api/payments/paypal/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency,
        orderId: paymentData.orderId,
        email: paymentData.customerEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal payment');
    }

    const { approvalUrl } = await response.json();
    
    if (approvalUrl) {
      toast.success('Redirecting to PayPal...', { id: 'payment' });
      window.location.href = approvalUrl;
    } else {
      throw new Error('PayPal approval URL not received');
    }
  };

  const handleStripe = async () => {
    if (!paymentData) return;

    toast.loading('Initializing Stripe/Paystack...', { id: 'payment' });
    
    // TODO: Implement Stripe/Paystack integration
    // For now, fallback to StableLink
    toast.error('Stripe/Paystack coming soon. Using StableLink...', { id: 'payment' });
    await handleStableLink();
  };

  const handleCoinbase = async () => {
    if (!paymentData) return;

    toast.loading('Creating crypto payment...', { id: 'payment' });
    
    // TODO: Implement Coinbase Commerce API
    // For now, redirect to StableLink crypto option
    const cryptoUrl = `https://stablelink.xyz/pay?amount=${paymentData.amount}&currency=${paymentData.currency}&order=${paymentData.orderId}`;
    
    toast.success('Redirecting to crypto payment...', { id: 'payment' });
    window.location.href = cryptoUrl;
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Payment Method
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select your preferred way to pay securely
          </p>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 shadow-lg border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Order: {paymentData.orderId.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {paymentData.orderDetails?.serviceType || 'Turnitin Check'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Amount
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${paymentData.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {paymentData.currency}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Card
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${method.borderColor} border-2 ${
                  method.popular ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                }`}
                onClick={() => !processing && handlePaymentMethod(method.id)}
              >
                {/* Popular Badge */}
                {method.badge && (
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${method.gradient}`}
                  >
                    {method.badge}
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${method.gradient} text-white shadow-lg`}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {method.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle2 className={`w-4 h-4 ${method.textColor}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${method.gradient} hover:opacity-90 text-white`}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : `Pay with ${method.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-8 px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Lock className="w-5 h-5 text-green-600" />
              <span>Secure Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Instant Processing</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            All transactions are encrypted and secure. We never store your payment details.
          </p>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Your payment is safe with us
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We use industry-standard encryption and security measures to protect your
                    information. All payment processors are PCI DSS compliant. You'll receive
                    email confirmation once your payment is processed, and your reports will be
                    delivered within 24-48 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentGateway;
