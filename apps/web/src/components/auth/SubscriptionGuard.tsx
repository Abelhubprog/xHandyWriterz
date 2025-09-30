import React from 'react';

export interface SubscriptionGuardProps {
  requiredPlan?: 'basic' | 'pro' | 'enterprise';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Minimal guard that always allows access for now.
// Replace with real subscription checks later.
const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children, fallback }) => {
  const allowed = true;
  if (!allowed && fallback) return <>{fallback}</>;
  return <>{children}</>;
};

export default SubscriptionGuard;
