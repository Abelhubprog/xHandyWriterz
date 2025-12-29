import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { paymentService, Payment } from '@/services/paymentService';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { 
  Clock, 
  CheckCircle, 
  X, 
  CornerUpLeft,
  Lock,
  CreditCard,
  Shield,
  Check,
  Download,
  DollarSign,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: 'one-time' | 'monthly' | 'annual';
  description: string;
  features: string[];
  isPopular?: boolean;
}

interface CardDetails {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

// ============================================================================
// Constants
// ============================================================================

const paymentPlans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    interval: 'monthly',
    description: "Perfect for individuals",
    features: [
      '5 document uploads per month',
      'Basic support',
      'Access to essential services',
      '1 user account'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49.99,
    interval: 'monthly',
    description: "Ideal for professionals",
    isPopular: true,
    features: [
      'Unlimited document uploads',
      'Priority support',
      'Access to all services',
      'Up to 3 user accounts',
      'Advanced analytics'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    interval: 'monthly',
    description: "For large teams",
    features: [
      'Everything in Professional',
      'Unlimited user accounts',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee'
    ]
  }
];

// ============================================================================
// Sub-Components
// ============================================================================

interface PaymentStatusBadgeProps {
  status: Payment['status'];
}

function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const variants: Record<Payment['status'], { className: string; label: string }> = {
    pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    completed: { className: 'bg-green-100 text-green-800', label: 'Completed' },
    failed: { className: 'bg-red-100 text-red-800', label: 'Failed' },
    refunded: { className: 'bg-gray-100 text-gray-800', label: 'Refunded' },
  };
  
  const { className, label } = variants[status] || variants.pending;
  
  return (
    <Badge className={cn('font-medium', className)}>
      {label}
    </Badge>
  );
}

interface PlanCardProps {
  plan: PaymentPlan;
  isSelected: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg relative',
        isSelected && 'ring-2 ring-blue-500',
        plan.isPopular && 'border-blue-500'
      )}
      onClick={onSelect}
    >
      {plan.isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-gray-500">/{plan.interval === 'one-time' ? 'once' : 'mo'}</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant={isSelected ? 'default' : 'outline'} 
          className="w-full"
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const methods = [
    { id: 'credit', label: 'Credit Card', icon: CreditCard },
    { id: 'paypal', label: 'PayPal', icon: DollarSign },
    { id: 'bank', label: 'Bank Transfer', icon: Lock },
  ];

  return (
    <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
      <div className="grid grid-cols-3 gap-4">
        {methods.map(({ id, label, icon: Icon }) => (
          <Label
            key={id}
            className={cn(
              'flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors',
              selectedMethod === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            <RadioGroupItem value={id} className="sr-only" />
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{label}</span>
          </Label>
        ))}
      </div>
    </RadioGroup>
  );
}

interface CreditCardFormProps {
  cardDetails: CardDetails;
  onChange: (details: CardDetails) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

function CreditCardForm({ cardDetails, onChange, onSubmit, isProcessing }: CreditCardFormProps) {
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardName">Name on Card</Label>
        <Input
          id="cardName"
          placeholder="John Doe"
          value={cardDetails.cardName}
          onChange={(e) => onChange({ ...cardDetails, cardName: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={cardDetails.cardNumber}
          onChange={(e) => onChange({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
          maxLength={19}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardExpiry">Expiry Date</Label>
          <Input
            id="cardExpiry"
            placeholder="MM/YY"
            value={cardDetails.cardExpiry}
            onChange={(e) => onChange({ ...cardDetails, cardExpiry: formatExpiry(e.target.value) })}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardCvc">CVC</Label>
          <Input
            id="cardCvc"
            placeholder="123"
            value={cardDetails.cardCvc}
            onChange={(e) => onChange({ ...cardDetails, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            maxLength={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Your payment info is secure and encrypted</span>
      </div>

      <Button type="submit" className="w-full" disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay Securely
          </>
        )}
      </Button>
    </form>
  );
}

interface PaymentHistoryItemProps {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
}

function PaymentHistoryItem({ payment, onViewDetails }: PaymentHistoryItemProps) {
  const paymentLabel = payment.metadata?.description || payment.method || 'Payment';
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-100 rounded-full">
          <DollarSign className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium">{paymentLabel}</p>
          <p className="text-sm text-gray-500">
            {new Date(payment.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold">${payment.amount.toFixed(2)}</span>
        <PaymentStatusBadge status={payment.status} />
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(payment)}>
          View
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface PaymentProcessorProps {
  orderId?: string;
  defaultPlanId?: string;
  onPaymentComplete?: (payment: Payment) => void;
  onPaymentError?: (error: Error) => void;
}

export function PaymentProcessor({
  orderId,
  defaultPlanId,
  onPaymentComplete,
  onPaymentError,
}: PaymentProcessorProps) {
  const { user, isLoaded } = useUser();
  
  // State
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultPlanId || 'pro');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  });

  // Load payment history
  useEffect(() => {
    if (user && activeTab === 'history') {
      loadPaymentHistory();
    }
  }, [user, activeTab]);

  const loadPaymentHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await paymentService.getPaymentHistory(user.id);
      setPayments(history);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    const plan = paymentPlans.find(p => p.id === selectedPlan);
    if (!plan) {
      toast.error('Please select a plan');
      return;
    }

    // Validate card details
    if (paymentMethod === 'credit') {
      if (!cardDetails.cardNumber || !cardDetails.cardExpiry || !cardDetails.cardCvc || !cardDetails.cardName) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      const payment = await paymentService.processPayment(
        plan.price,
        paymentMethod,
        {
          planId: plan.id,
          orderId,
          description: `${plan.name} Plan - ${plan.interval}`,
        }
      );

      toast.success('Payment successful!');
      onPaymentComplete?.(payment);
      
      // Reset form
      setCardDetails({
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: '',
      });
      
      // Switch to history tab
      setActiveTab('history');
      await loadPaymentHistory();
      
    } catch (error) {
      console.error('Payment failed:', error);
      const err = error instanceof Error ? error : new Error('Payment failed');
      toast.error(err.message);
      onPaymentError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailDialog(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to access payment features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Center</h1>
        <p className="text-gray-600">Choose a plan and complete your payment securely</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid md:grid-cols-3 gap-6">
            {paymentPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              onClick={() => setActiveTab('checkout')}
              disabled={!selectedPlan}
            >
              Continue to Checkout
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="checkout">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPlan && (() => {
                  const plan = paymentPlans.find(p => p.id === selectedPlan);
                  if (!plan) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">{plan.name} Plan</span>
                        <span>${plan.price}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${plan.price}</span>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />

                {paymentMethod === 'credit' && (
                  <CreditCardForm
                    cardDetails={cardDetails}
                    onChange={setCardDetails}
                    onSubmit={handlePayment}
                    isProcessing={isProcessing}
                  />
                )}

                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You will be redirected to PayPal to complete your payment.</p>
                    <Button onClick={handlePayment} disabled={isProcessing}>
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Continue to PayPal
                    </Button>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Bank transfer instructions will be sent to your email.</p>
                    <Button onClick={handlePayment} disabled={isProcessing}>
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Generate Invoice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-start">
            <Button variant="ghost" onClick={() => setActiveTab('plans')}>
              <CornerUpLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No payment history yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <PaymentHistoryItem
                  key={payment.id}
                  payment={payment}
                  onViewDetails={handleViewPaymentDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Detail Dialog */}
      {showDetailDialog && selectedPayment && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Payment Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-sm">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold">${selectedPayment.amount.toFixed(2)} {selectedPayment.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <PaymentStatusBadge status={selectedPayment.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                </div>
                {selectedPayment.metadata?.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description</span>
                    <span>{selectedPayment.metadata.description}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
                {selectedPayment.status === 'completed' && (
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PaymentProcessor;
