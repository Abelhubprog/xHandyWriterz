import { useUser } from '@clerk/clerk-react';

// Minimal-yet-useful subscription utilities to keep dashboard components stable.
// In the future, wire this to real billing/subscription data sourced from Clerk / billing provider.

const PLAN_ALIASES = {
  free: 'free',
  basic: 'basic',
  standard: 'standard',
  premium: 'premium',
  pro: 'premium',
  professional: 'premium',
  enterprise: 'enterprise',
} as const;

export type PlanTier = typeof PLAN_ALIASES[keyof typeof PLAN_ALIASES];

export type Plan = keyof typeof PLAN_ALIASES;

type PlanDefinition = {
  tier: PlanTier;
  name: string;
  description: string;
  features: string[];
  pageLimit: number | typeof Infinity;
  revisionLimit: number | 'unlimited';
  deliveryDays: number;
  supportLevel: string;
  capabilities: string[];
};

const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Free',
    description: 'Get started with the basics and explore the Learning Hub.',
    features: [
      'Learning Hub access',
      'Community newsletter',
      'Basic dashboard insights',
    ],
    pageLimit: 10,
    revisionLimit: 0,
    deliveryDays: 7,
    supportLevel: 'Community support',
    capabilities: ['basic_access'],
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    description: 'Unlock document uploads and faster turnaround times.',
    features: [
      'Document uploads',
      'Standard turnaround',
      'Email support',
    ],
    pageLimit: 40,
    revisionLimit: 1,
    deliveryDays: 5,
    supportLevel: 'Email support',
    capabilities: ['basic_access', 'document_upload'],
  },
  standard: {
    tier: 'standard',
    name: 'Standard',
    description: 'Great for frequent requests and collaboration.',
    features: [
      'Priority document queue',
      'Extended revisions',
      'Chat with specialists',
    ],
    pageLimit: 80,
    revisionLimit: 2,
    deliveryDays: 4,
    supportLevel: 'Priority email support',
    capabilities: ['basic_access', 'document_upload', 'priority_support'],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    description: 'Best for power users needing rapid feedback loops.',
    features: [
      'Unlimited revisions',
      'Fast-track delivery',
      'Strategy sessions',
    ],
    pageLimit: Infinity,
    revisionLimit: 'unlimited',
    deliveryDays: 2,
    supportLevel: 'Priority concierge',
    capabilities: ['basic_access', 'document_upload', 'priority_support', 'strategy_sessions'],
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Dedicated partnerships with custom workflows and SLAs.',
    features: [
      'Dedicated team',
      'Custom integrations',
      'SLA-backed delivery',
    ],
    pageLimit: Infinity,
    revisionLimit: 'unlimited',
    deliveryDays: 1,
    supportLevel: 'Dedicated success manager',
    capabilities: [
      'basic_access',
      'document_upload',
      'priority_support',
      'strategy_sessions',
      'enterprise_workflows',
    ],
  },
};

const FALLBACK_PLAN: Plan = 'free';
const FALLBACK_TIER: PlanTier = 'free';

const isPlan = (value: string): value is Plan => Object.prototype.hasOwnProperty.call(PLAN_ALIASES, value);

const sanitizePlanId = (value?: unknown): Plan => {
  if (typeof value !== 'string') {
    return FALLBACK_PLAN;
  }

  const candidate = value.trim().toLowerCase().replace(/\s+/g, '-');
  return isPlan(candidate) ? candidate : FALLBACK_PLAN;
};

const selectPlanDefinition = (plan: Plan): PlanDefinition => {
  const tier = PLAN_ALIASES[plan];
  return PLAN_DEFINITIONS[tier] ?? PLAN_DEFINITIONS[FALLBACK_TIER];
};

export function useSubscription() {
  const { user, isLoaded, isSignedIn } = useUser();

  const metadata = user?.publicMetadata as Record<string, unknown> | undefined;

  const rawPlan = [metadata?.plan, metadata?.subscriptionPlan, metadata?.subscription_plan].find(
    (value): value is string => typeof value === 'string'
  );

  const currentPlan = sanitizePlanId(rawPlan);
  const currentDefinition = selectPlanDefinition(currentPlan);

  const canAccessFeature = (feature: string) => {
    if (feature === 'basic_access') {
      return true; // Keep uploader available until billing is wired
    }
    return currentDefinition.capabilities.includes(feature);
  };

  const getCurrentPlan = () => currentPlan;

  const getPageLimit = () => currentDefinition.pageLimit;

  const getPlanFeatures = (plan: Plan = currentPlan) => selectPlanDefinition(plan);

  const getRevisionLimit = () => currentDefinition.revisionLimit;

  const getDeliveryDays = () => currentDefinition.deliveryDays;

  const getSupportLevel = () => currentDefinition.supportLevel;

  return {
    canAccessFeature,
    getPageLimit,
    getCurrentPlan,
    getPlanFeatures,
    getRevisionLimit,
    getDeliveryDays,
    getSupportLevel,
    isLoaded,
    isSignedIn,
  } as const;
}

export default useSubscription;
