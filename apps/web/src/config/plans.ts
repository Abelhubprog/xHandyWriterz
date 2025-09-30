export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: 'one-time' | 'monthly' | 'annual';
  description: string;
  features: string[];
  isPopular?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    interval: 'monthly',
    description: 'Great for getting started',
    features: [
      '5 document uploads / month',
      'Essential features',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49.99,
    interval: 'monthly',
    description: 'Best for power users',
    isPopular: true,
    features: [
      'Unlimited uploads',
      'All services unlocked',
      'Priority support',
      'Advanced analytics',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    interval: 'monthly',
    description: 'Teams and institutions',
    features: [
      'Unlimited everything',
      'SLA + dedicated support',
      'Custom onboarding',
    ],
  },
];

