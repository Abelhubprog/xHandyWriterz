import React from 'react';
import { ClerkProvider as Clerk, ClerkLoaded } from '@clerk/clerk-react';
import { env } from '@/env';

type Props = {
  children: React.ReactNode;
  routerPush?: (to: string) => void;
  routerReplace?: (to: string) => void;
};

export const ClerkProvider: React.FC<Props> = ({ children, routerPush, routerReplace }) => {
  const publishableKey = env.VITE_CLERK_PUBLISHABLE_KEY;
  return (
    <Clerk
      publishableKey={publishableKey}
      signInUrl={env.VITE_CLERK_SIGN_IN_URL}
      signUpUrl={env.VITE_CLERK_SIGN_UP_URL}
      afterSignInUrl={env.VITE_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={env.VITE_CLERK_AFTER_SIGN_UP_URL}
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
