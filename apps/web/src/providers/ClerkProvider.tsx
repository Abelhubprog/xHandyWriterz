import React from 'react';
import { ClerkProvider as Clerk, ClerkLoaded } from '@clerk/clerk-react';
import { env } from '@/env';
import { ClerkDisabledNotice } from '@/auth/clerk';

type Props = {
  children: React.ReactNode;
  routerPush?: (to: string) => void;
  routerReplace?: (to: string) => void;
};

export const ClerkProvider: React.FC<Props> = ({ children, routerPush, routerReplace }) => {
  const publishableKey = env.VITE_CLERK_PUBLISHABLE_KEY;

  // Check for production key in development
  if (import.meta.env.DEV && publishableKey?.startsWith('pk_live_')) {
    return (
      <ClerkDisabledNotice
        title="Development Configuration Error"
        description="You are using a Clerk Production Key (pk_live_...) in a development environment. Please use a Development Key (pk_test_...) for localhost."
      />
    );
  }

  return (
    <Clerk
      publishableKey={publishableKey}
      signInUrl={env.VITE_CLERK_SIGN_IN_URL}
      signUpUrl={env.VITE_CLERK_SIGN_UP_URL}
      signInFallbackRedirectUrl={env.VITE_CLERK_AFTER_SIGN_IN_URL}
      signUpFallbackRedirectUrl={env.VITE_CLERK_AFTER_SIGN_UP_URL}
      routerPush={routerPush}
      routerReplace={routerReplace}
    >
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </Clerk>
  );
};

export default ClerkProvider;
