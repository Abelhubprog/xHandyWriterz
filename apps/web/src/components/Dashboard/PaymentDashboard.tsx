/**
 * Payment Dashboard Component
 * Displays user payments and billing information
 * 
 * @file src/components/Dashboard/PaymentDashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Plus,
  Receipt,
} from 'lucide-react';

// Import enhanced UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/enhanced-button';
import { Container, Stack, Grid, Inline } from '@/components/ui/enhanced-layout';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';

// Services
import { paymentService, Payment } from '@/services/paymentService';
import { formatDate, formatCurrency } from '@/lib/utils';

interface PaymentDashboardProps {
  className?: string;
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ className }) => {
  const { user } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPayments();
    }
  }, [user?.id]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const userPayments = await paymentService.getUserPayments(user?.id || '');
      setPayments(userPayments);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RotateCcw className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 29,
      description: 'Perfect for getting started',
      features: ['5 Documents per month', 'Basic support', 'Standard processing'],
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 59,
      description: 'For serious academic work',
      features: ['15 Documents per month', 'Priority support', 'Fast processing', 'Advanced features'],
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: 99,
      description: 'For institutions and heavy users',
      features: ['Unlimited documents', '24/7 support', 'Instant processing', 'All features', 'Custom integrations'],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan || !user?.id) return;

      // This would typically integrate with Stripe, PayPal, or another payment processor
      const payment = await paymentService.createPayment({
        amount: plan.price,
        currency: 'USD',
        user_id: user.id,
        method: 'stripe',
        metadata: {
          plan_id: planId,
          plan_name: plan.name,
        },
      });

      await loadPayments();
    } catch (error) {
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Container className={className}>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your subscriptions and view payment history
          </p>
        </div>

        {/* Subscription Plans */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Grid cols={1} gap="md" className="md:grid-cols-3">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    variant={selectedPlan === plan.id ? 'outline' : 'default'}
                    className="h-full cursor-pointer"
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="text-2xl font-bold text-blue-600">
                        ${plan.price}<span className="text-sm text-gray-500">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Stack gap="sm">
                        {plan.features.map((feature, index) => (
                          <Inline key={index} gap="sm" align="center">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </Inline>
                        ))}
                        <Button
                          variant="default"
                          fullWidth
                          className="mt-4"
                          onClick={() => handleSubscribe(plan.id)}
                          icon={<Plus size={16} />}
                        >
                          Subscribe
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>
              View your recent payments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payments yet
                </h3>
                <p className="text-gray-500">
                  Your payment history will appear here once you make a purchase.
                </p>
              </div>
            ) : (
              <Stack gap="md">
                {payments.map((payment) => (
                  <Card key={payment.id} variant="outline">
                    <CardContent className="pt-6">
                      <Inline justify="between" align="center">
                        <Stack gap="xs">
                          <Inline gap="sm" align="center">
                            {getStatusIcon(payment.status)}
                            <span className="font-medium">
                              {payment.metadata.plan_name || 'Payment'}
                            </span>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </Inline>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.created_at)}
                          </p>
                        </Stack>
                        
                        <Stack gap="xs" align="end">
                          <span className="text-lg font-semibold">
                            {formatCurrency(payment.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download size={14} />}
                          >
                            Receipt
                          </Button>
                        </Stack>
                      </Inline>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Grid cols={2} gap="md" className="md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </Stack>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <Receipt className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{payments.length}</p>
                  <p className="text-sm text-gray-500">Transactions</p>
                </div>
              </Stack>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {payments.filter(p => p.status === 'succeeded').length}
                  </p>
                  <p className="text-sm text-gray-500">Successful</p>
                </div>
              </Stack>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Stack gap="sm" align="center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {payments.length > 0 ? formatDate(payments[0].created_at).split(',')[0] : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">Last Payment</p>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </Container>
  );
};

export default PaymentDashboard;