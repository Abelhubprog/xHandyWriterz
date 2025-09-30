import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/toast/use-toast';
import { paymentService, Payment } from '@/services/paymentService';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';

import {
  Box,
  Flex,
  VStack,
  HStack,
  Grid,
  GridItem,
  Text,
  Heading,
  Spinner
} from '@/components/ui/layout';

// Icons
import { 
  FiClock, 
  FiCheckCircle, 
  FiX, 
  FiCornerUpLeft,
  FiLock,
  FiCreditCard,
  FiShield,
  FiCheck,
  FiDownload,
  FiDollarSign
} from 'react-icons/fi';

// Payment plan interface
interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: 'one-time' | 'monthly' | 'annual';
  description: string;
  features: string[];
  isPopular?: boolean;
}

// Payment method interface
interface PaymentMethod {
  id: string;
  type: 'credit' | 'paypal' | 'bank';
  last4?: string;
  expMonth?: number;
  expYear?: number;
  brand?: string;
  email?: string;
  bankName?: string;
  isDefault: boolean;
}

// Payment record interface types already imported from paymentService

// Credit card form state
interface CardDetails {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

// Payment plans data - would come from your database in a real app
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
    description: "For growing businesses",
    features: [
      'Unlimited everything',
      'Dedicated support',
      'Custom solutions',
      'Unlimited user accounts',
      'Advanced security features',
      'API access'
    ]
  }
];

// Mock saved payment methods - in a real app, these would be fetched from Stripe
const mockSavedPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'credit',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    brand: 'Visa',
    isDefault: true
  },
  {
    id: 'pm_2',
    type: 'paypal',
    email: 'user@example.com',
    isDefault: false
  }
];

// Format currency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Get payment status badge props
const getStatusBadgeProps = (status: Payment['status']) => {
  const statusMap = {
    pending: { variant: 'warning' as const, icon: FiClock, text: 'Pending' },
    processing: { variant: 'info' as const, icon: FiClock, text: 'Processing' },
    succeeded: { variant: 'success' as const, icon: FiCheckCircle, text: 'Succeeded' },
    failed: { variant: 'error' as const, icon: FiX, text: 'Failed' },
    refunded: { variant: 'default' as const, icon: FiCornerUpLeft, text: 'Refunded' }
  };
  
  return statusMap[status] || statusMap.pending;
};

// Status Badge component
const PaymentStatusBadge: React.FC<{ status: Payment['status'] }> = ({ status }) => {
  const { variant, icon: Icon, text } = getStatusBadgeProps(status);
  
  return (
    <StatusBadge variant={variant} icon={<Icon className="w-3 h-3" />}>
      {text}
    </StatusBadge>
  );
};

// Plan Selector Component
const PlanSelector: React.FC<{ 
  plans: PaymentPlan[];
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}> = ({ plans, selectedPlan, onSelectPlan }) => {
  const cardBgColor = "var(--chakra-colors-white)";
  const selectedCardBgColor = "var(--chakra-colors-blue.50)";
  const selectedCardBorderColor = "var(--chakra-colors-blue.500)";
  const popularBgColor = "var(--chakra-colors-blue.100)";
  
  return (
    <Grid 
      className="grid grid-cols-1 md:grid-cols-3" 
      gap={4}
      w="100%"
    >
      {plans.map(plan => (
        <Card 
          key={plan.id}
          className={`${selectedPlan === plan.id ? selectedCardBgColor : cardBgColor} border border-gray-200 cursor-pointer relative overflow-hidden transition-all hover:transform hover:-translate-y-1 hover:shadow-lg`}
          onClick={() => onSelectPlan(plan.id)}
        >
          {plan.isPopular && (
            <Box
              className="absolute top-0 right-0 bg-blue-100 px-3 py-1 rounded-bl-md font-bold text-sm"
            >
              Most Popular
            </Box>
          )}
          
          <CardHeader className="pb-0">
            <Heading size="md">{plan.name}</Heading>
            <HStack className="mt-2">
              <Text className="text-3xl font-bold">
                {formatCurrency(plan.price)}
              </Text>
              <Text className="text-sm text-gray-500">
                /{plan.interval}
              </Text>
            </HStack>
            <Text className="text-sm text-gray-500 mt-1">
              {plan.description}
            </Text>
          </CardHeader>
          
          <CardContent>
            <VStack align="start" gap="2">
              {plan.features.map((feature, index) => (
                <HStack key={index} gap="2" align="start">
                  <FiCheck className="text-green-500 mt-1" />
                  <Text>{feature}</Text>
                </HStack>
              ))}
            </VStack>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button 
              className={`w-full ${selectedPlan === plan.id ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 bg-white"}`}
              variant={selectedPlan === plan.id ? "default" : "outline"}
              startIcon={selectedPlan === plan.id ? <FiCheck /> : undefined}
            >
              {selectedPlan === plan.id ? "Selected" : "Select Plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </Grid>
  );
};

// Payment Method Selector Component
const PaymentMethodSelector: React.FC<{
  savedMethods: PaymentMethod[];
  selectedMethod: string | null;
  onSelectMethod: (methodId: string | null) => void;
}> = ({ savedMethods, selectedMethod, onSelectMethod }) => {
  const cardBgColor = "var(--chakra-colors-white)";
  
  return (
    <VStack className="gap-4 items-stretch w-full">
      <RadioGroup defaultValue={selectedMethod || ''}>
        <VStack className="flex-col gap-3">
          {savedMethods.map(method => (
            <Box
              key={method.id}
              className="border border-gray-300 rounded-md p-4 bg-white cursor-pointer"
              onClick={() => onSelectMethod(method.id)}
            >
              <label className="flex items-center cursor-pointer">
                <Box className="relative mr-3">
                  <Box
                    w="20px"
                    h="20px"
                    borderWidth="2px"
                    borderRadius="full"
                    borderColor={selectedMethod === method.id ? "blue.500" : "gray.300"}
                  />
                  {selectedMethod === method.id && (
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg="blue.500"
                    />
                  )}
                </Box>
                <Flex align="center">
                  {method.type === 'credit' && (
                    <HStack gap="2">
                      <Box as={FiCreditCard} />
                      <Text fontWeight="medium">
                        {method.brand} **** {method.last4}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Expires {method.expMonth}/{method.expYear}
                      </Text>
                      {method.isDefault && (
                        <Badge colorScheme="green" ml={2}>Default</Badge>
                      )}
                    </HStack>
                  )}
                  {method.type === 'paypal' && (
                    <HStack gap="2">
                      <Image src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" h="20px" alt="PayPal" />
                      <Text fontWeight="medium">
                        PayPal
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {method.email}
                      </Text>
                      {method.isDefault && (
                        <Badge colorScheme="green" ml={2}>Default</Badge>
                      )}
                    </HStack>
                  )}
                  {method.type === 'bank' && (
                    <HStack gap="2">
                      <Box as={FiDollarSign} />
                      <Text fontWeight="medium">
                        {method.bankName}
                      </Text>
                      {method.isDefault && (
                        <Badge colorScheme="green" ml={2}>Default</Badge>
                      )}
                    </HStack>
                  )}
                </Flex>
              </label>
            </Box>
          ))}
          
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={4}
            borderStyle="dashed"
            bg={cardBgColor}
            onClick={() => onSelectMethod('new')}
            cursor="pointer"
          >
            <Box as="label" display="flex" alignItems="center" cursor="pointer">
              <Box position="relative" mr={3}>
                <Box
                  w="20px"
                  h="20px"
                  borderWidth="2px"
                  borderRadius="full"
                  borderColor={selectedMethod === 'new' ? "blue.500" : "gray.300"}
                />
                {selectedMethod === 'new' && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg="blue.500"
                  />
                )}
              </Box>
              <HStack gap="2">
                <Box as={FiCreditCard} />
                <Text fontWeight="medium">
                  Use a new payment method
                </Text>
              </HStack>
            </Box>
          </Box>
        </VStack>
      </RadioGroup>
    </VStack>
  );
};

// Credit Card Form Component
const CreditCardForm: React.FC<{
  onSubmit: (cardDetails: CardDetails) => void;
}> = ({ onSubmit }) => {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
    }
    
    // Format expiry date with slash
    if (name === 'cardExpiry') {
      formattedValue = value
        .replace(/\//g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .slice(0, 5);
    }
    
    // Format CVC to only numbers
    if (name === 'cardCvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Clear error when user types
    if (errors[name as keyof CardDetails]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Validate card number (simple check: 16 digits without spaces)
    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    // Validate expiry (format: MM/YY where MM is 01-12 and YY is >= current year)
    const expiryMatch = cardDetails.cardExpiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!expiryMatch) {
      newErrors.cardExpiry = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const month = parseInt(expiryMatch[1], 10);
      const year = parseInt(`20${expiryMatch[2]}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.cardExpiry = 'Your card has expired';
      }
    }
    
    // Validate CVC (3-4 digits)
    if (!/^\d{3,4}$/.test(cardDetails.cardCvc)) {
      newErrors.cardCvc = 'Please enter a valid 3 or 4 digit CVC';
    }
    
    // Validate name
    if (!cardDetails.cardName.trim()) {
      newErrors.cardName = 'Please enter the name on your card';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(cardDetails);
    }
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      <VStack gap="4" align="stretch">
        <VStack align="stretch" gap="1">
          <Text fontSize="sm" fontWeight="medium">Name on Card</Text>
          <Input
            name="cardName"
            placeholder="John Smith"
            value={cardDetails.cardName}
            onChange={handleChange}
            borderColor={errors.cardName ? "red.500" : undefined}
          />
          {errors.cardName && (
            <Text fontSize="sm" color="red.500">{errors.cardName}</Text>
          )}
        </VStack>
        
        <VStack align="stretch" gap="1">
          <Text fontSize="sm" fontWeight="medium">Card Number</Text>
          <Input
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={handleChange}
            maxLength={19}
            borderColor={errors.cardNumber ? "red.500" : undefined}
          />
          {errors.cardNumber && (
            <Text fontSize="sm" color="red.500">{errors.cardNumber}</Text>
          )}
        </VStack>
        
        <Grid templateColumns="1fr 1fr" gap={4}>
          <VStack align="stretch" gap="1">
            <Text fontSize="sm" fontWeight="medium">Expiry Date</Text>
            <Input
              name="cardExpiry"
              placeholder="MM/YY"
              value={cardDetails.cardExpiry}
              onChange={handleChange}
              maxLength={5}
              borderColor={errors.cardExpiry ? "red.500" : undefined}
            />
            {errors.cardExpiry && (
              <Text fontSize="sm" color="red.500">{errors.cardExpiry}</Text>
            )}
          </VStack>
          
          <VStack align="stretch" gap="1">
            <Text fontSize="sm" fontWeight="medium">CVC</Text>
            <Input
              name="cardCvc"
              placeholder="123"
              value={cardDetails.cardCvc}
              onChange={handleChange}
              maxLength={4}
              borderColor={errors.cardCvc ? "red.500" : undefined}
            />
            {errors.cardCvc && (
              <Text fontSize="sm" color="red.500">{errors.cardCvc}</Text>
            )}
          </VStack>
        </Grid>
        
        <HStack mt={2} gap="1" fontSize="sm" color="gray.500">
          <Box as={FiLock} />
          <Text>Your payment is secured with SSL encryption</Text>
        </HStack>
        
        <Button mt={4} colorScheme="blue" type="submit" startIcon={<FiCreditCard />}>
          Pay with Credit Card
        </Button>
      </VStack>
    </Box>
  );
};

// Payment History Component
const PaymentHistory: React.FC<{
  payments: Payment[];
  loading: boolean;
}> = ({ payments, loading }) => {
  const cardBgColor = "var(--chakra-colors-white)";
  
  if (loading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }
  
  if (payments.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <Alert.Icon />
        <Text>You don't have any payment history yet.</Text>
      </Alert>
    );
  }
  
  return (
    <VStack gap="4" align="stretch">
      {payments.map(payment => (
        <Box
          key={payment.id}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          bg={cardBgColor}
        >
          <Grid 
            templateColumns={{ base: "1fr", md: "3fr 1fr 1fr 1fr" }} 
            gap={4}
            alignItems="center"
          >
            <GridItem>
              <VStack align="start" gap="1">
                <Text fontWeight="bold">
                  {payment.metadata.plan_name || 'Payment'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(payment.created_at)}
                </Text>
                {payment.metadata.invoice_id && (
                  <Text fontSize="sm" color="gray.500">
                    Invoice: {payment.metadata.invoice_id}
                  </Text>
                )}
              </VStack>
            </GridItem>
            
            <GridItem>
              <Text fontWeight="bold">
                {formatCurrency(payment.amount, payment.currency)}
              </Text>
            </GridItem>
            
            <GridItem>
              <StatusBadge status={payment.status} />
            </GridItem>
            
            <GridItem justifySelf={{ base: "start", md: "end" }}>
              <HStack>
                {payment.metadata.receipt_url && (
                  <Button
                    aria-label="Download receipt"
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(payment.metadata.receipt_url, '_blank')}
                  >
                    <FiDownload />
                  </Button>
                )}
              </HStack>
            </GridItem>
          </Grid>
        </Box>
      ))}
    </VStack>
  );
};

// Success Modal Component
const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: {
    planName: string;
    amount: number;
    date: string;
  } | null;
}> = ({ isOpen, onClose, paymentDetails }) => {
  if (!paymentDetails) return null;
  
  return (
    <Dialog open={isOpen} onClose={onClose} size="md">
      <DialogContent>
        <DialogHeader className="bg-green-500 text-white rounded-t-md">
          <Flex align="center">
            <Box as={FiCheckCircle} mr={2} />
            Payment Successful
          </Flex>
        </DialogHeader>
        
        <DialogBody className="py-6">
          <VStack gap="4" align="stretch">
            <Box textAlign="center">
              <Heading size="md" mb={2}>Thank You For Your Payment!</Heading>
              <Text>Your payment has been processed successfully.</Text>
            </Box>
            
            <Separator />
            
            <Grid templateColumns="1fr 1fr" gap={2}>
              <GridItem>
                <Text color="gray.500">Plan:</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">{paymentDetails.planName}</Text>
              </GridItem>
              
              <GridItem>
                <Text color="gray.500">Amount:</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">{formatCurrency(paymentDetails.amount)}</Text>
              </GridItem>
              
              <GridItem>
                <Text color="gray.500">Date:</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">{paymentDetails.date}</Text>
              </GridItem>
            </Grid>
            
            <Box p={4} borderRadius="md" bg="blue.50">
              <Flex gap={3}>
                <Box color="blue.500">
                  <FiClock size={20} />
                </Box>
                <Text fontSize="sm">
                  A receipt has been sent to your email address.
                </Text>
              </Flex>
            </Box>
          </VStack>
        </DialogBody>
        
        <DialogFooter>
          <Button colorScheme="green" onClick={onClose}>
            <Flex align="center">
              <Box as={FiCheck} mr={2} />
              Continue
            </Flex>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main PaymentProcessor Component
interface PaymentProcessorProps {
  onSuccess?: (paymentDetails: any) => void;
  onCancel?: () => void;
  preSelectedPlanId?: string;
  allowPlanChange?: boolean;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  onSuccess,
  onCancel,
  preSelectedPlanId,
  allowPlanChange = true
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(preSelectedPlanId || paymentPlans[0].id);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(
    mockSavedPaymentMethods.length > 0 ? mockSavedPaymentMethods[0].id : null
  );
  const [paymentStep, setPaymentStep] = useState<'plan' | 'method' | 'processing'>('plan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const onSuccessOpen = () => setIsSuccessOpen(true);
  const onSuccessClose = () => setIsSuccessOpen(false);
  const [successDetails, setSuccessDetails] = useState<{
    planName: string;
    amount: number;
    date: string;
  } | null>(null);
  
  // Get the selected plan object
  const plan = paymentPlans.find(p => p.id === selectedPlan);
  
  // Load payment history
  const loadPaymentHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    
    try {
      const payments = await paymentService.getUserPayments(user.id);
      setPaymentHistory(payments as Payment[]);
    } catch (err) {
      toast({
        title: "Error loading payment history",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Load payment history on component mount
  useEffect(() => {
    if (activeTab === 1) {
      loadPaymentHistory();
    }
  }, [activeTab, user]);
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  // Handle payment method selection
  const handleSelectPaymentMethod = (methodId: string | null) => {
    setSelectedPaymentMethod(methodId);
  };
  
  // Handle continue to payment method step
  const handleContinueToPayment = () => {
    if (!plan) return;
    setPaymentStep('method');
  };
  
  // Handle back to plan selection
  const handleBackToPlan = () => {
    setPaymentStep('plan');
    setPaymentError(null);
  };
  
  // Handle credit card submission
  const handleCardSubmit = async (cardDetails: CardDetails) => {
    if (!user || !plan) return;
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // In a real app, you would:
      // 1. Create a payment intent/setup with Stripe
      // 2. Confirm the payment with the card details
      // 3. Handle the payment result
      
      // For this demo, simulate a payment process
      setPaymentStep('processing');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment record in the database
      const paymentResult = await paymentService.createPayment({
        amount: plan.price,
        currency: 'USD',
        user_id: user.id,
        method: selectedPaymentMethod === 'new' 
          ? `${cardDetails.cardNumber?.slice(-4) || 'XXXX'}` 
          : selectedPaymentMethod || 'unknown',
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name
        }
      });
      
      // Show success message
      setSuccessDetails({
        planName: plan.name,
        amount: plan.price,
        date: new Date().toLocaleDateString()
      });
      
      onSuccessOpen();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess({
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          paymentId: paymentResult.id
        });
      }
      
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'An unknown error occurred during payment processing');
      setPaymentStep('method');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Box>
      <Tabs 
        variant="enclosed" 
        colorScheme="blue" 
        mb={6}
        value={activeTab}
        onChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value={0}>Make a Payment</TabsTrigger>
          <TabsTrigger value={1}>Payment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value={0}>
          {/* Payment Tab */}
          <Box p={0} pt={6}>
            <>
              {paymentStep === 'plan' && (
                <VStack gap="8" align="stretch">
                  <Heading size="lg" mb={2}>
                    {allowPlanChange ? 'Choose Your Plan' : 'Confirm Your Plan'}
                  </Heading>
                  
                  {allowPlanChange ? (
                    <PlanSelector 
                      plans={paymentPlans} 
                      selectedPlan={selectedPlan} 
                      onSelectPlan={handleSelectPlan} 
                    />
                  ) : (
                    <Box 
                      p={6} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      bg={'var(--chakra-colors-gray-50)'}
                    >
                      <Heading size="md" mb={4}>{plan?.name} Plan</Heading>
                      <HStack mb={4}>
                        <Text fontSize="2xl" fontWeight="bold">
                          {formatCurrency(plan?.price || 0)}
                        </Text>
                        <Text fontSize="md" color="gray.500">
                          /{plan?.interval}
                        </Text>
                      </HStack>
                      
                      <VStack align="start" gap="2">
                        {plan?.features.map((feature, index) => (
                          <HStack key={index} gap="2">
                            <Box as={FiCheck} color="green.500" />
                            <Text>{feature}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  <Button 
                    colorScheme="blue" 
                    size="lg" 
                    onClick={handleContinueToPayment}
                    alignSelf="center"
                    w={{ base: "100%", md: "auto" }}
                  >
                    Continue to Payment
                  </Button>
                </VStack>
              )}
              
              {paymentStep === 'method' && (
                <VStack gap="8" align="stretch">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading size="lg">Payment Method</Heading>
                    <Button 
                      variant="ghost" 
                      startIcon={<FiCornerUpLeft />}
                      onClick={handleBackToPlan}
                    >
                      Back
                    </Button>
                  </Flex>
                  
                  <Alert status="info" borderRadius="md">
                    <Alert.Icon />
                    <Box>
                      <Text fontWeight="bold">
                        {plan?.name} Plan - {formatCurrency(plan?.price || 0)}/{plan?.interval}
                      </Text>
                      <Text fontSize="sm">
                        You will be charged {formatCurrency(plan?.price || 0)} for your subscription.
                      </Text>
                    </Box>
                  </Alert>
                  
                  {paymentError && (
                    <Alert status="error" borderRadius="md">
                      <Alert.Icon />
                      <Box>
                        <Text fontWeight="bold">Payment Failed</Text>
                        <AlertDescription>{paymentError}</AlertDescription>
                      </Box>
                    </Alert>
                  )}
                  
                  {mockSavedPaymentMethods.length > 0 && (
                    <>
                      <Box>
                        <Text fontWeight="medium" mb={3}>Your Payment Methods</Text>
                        <PaymentMethodSelector 
                          savedMethods={mockSavedPaymentMethods}
                          selectedMethod={selectedPaymentMethod}
                          onSelectMethod={handleSelectPaymentMethod}
                        />
                      </Box>
                      
                      <Box h="1px" bg="gray.200" />
                    </>
                  )}
                  
                  {selectedPaymentMethod === 'new' && (
                    <Box>
                      <Text fontWeight="medium" mb={3}>Enter New Card Details</Text>
                      <CreditCardForm onSubmit={handleCardSubmit} />
                    </Box>
                  )}
                  
                  {selectedPaymentMethod && selectedPaymentMethod !== 'new' && (
                    <Button 
                      colorScheme="blue" 
                      size="lg"
                      loading={isProcessing}
                      loadingText="Processing Payment..."
                      onClick={() => handleCardSubmit({} as CardDetails)}
                    >
                      Complete Payment
                    </Button>
                  )}
                  
                  <HStack justify="center" gap="2" mt={4}>
                    <Box as={FiShield} />
                    <Text fontSize="sm" color="gray.500">
                      Secure payment processing powered by Stripe
                    </Text>
                  </HStack>
                </VStack>
              )}
              
              {paymentStep === 'processing' && (
                <VStack gap="8" py={10} align="center">
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text fontSize="lg">Processing your payment...</Text>
                  <Text color="gray.500">
                    Please do not close this window while your payment is being processed.
                  </Text>
                </VStack>
              )}
            </>
          </Box>
        </TabsContent>
          
        {/* History Tab */}
        <TabsContent value={1}>
          <Box p={0} pt={6}>
            <Heading size="lg" mb={6}>Payment History</Heading>
            <PaymentHistory payments={paymentHistory} loading={isLoadingHistory} />
          </Box>
        </TabsContent>
      </Tabs>
      
      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => {
          onSuccessClose();
          // Reset to first step after successful payment
          setPaymentStep('plan');
          // Refresh payment history if on that tab
          if (activeTab === 1) {
            loadPaymentHistory();
          } else {
            // Switch to history tab to show the new payment
            setActiveTab(1);
          }
        }} 
        paymentDetails={successDetails} 
      />
    </Box>
  );
};

export default PaymentProcessor;
