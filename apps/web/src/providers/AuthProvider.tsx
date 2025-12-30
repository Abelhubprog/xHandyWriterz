/**
 * Auth Provider - Re-exports Clerk's authentication context
 * 
 * This module provides a unified auth interface that wraps Clerk.
 * Components that need auth should use this provider for consistency.
 */

import React from 'react';
import { ClerkProvider, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

// Re-export Clerk hooks for convenience
export { useAuth as useClerkAuth, useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';

// Auth context types
export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null | undefined;
  user: ReturnType<typeof useUser>['user'];
  signOut: () => Promise<void>;
}

// Custom auth hook that wraps Clerk
export function useAuth(): AuthContextValue {
  const { isSignedIn, isLoaded, userId, signOut } = useClerkAuth();
  const { user } = useUser();

  return {
    isAuthenticated: isSignedIn ?? false,
    isLoading: !isLoaded,
    userId,
    user,
    signOut: async () => {
      await signOut();
    },
  };
}

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
}

/**
 * Auth Provider Component
 * Wraps the application with Clerk authentication context
 */
export function AuthProvider({ children, publishableKey }: AuthProviderProps): JSX.Element {
  const clerkKey = publishableKey || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkKey) {
    console.warn('[AuthProvider] Missing VITE_CLERK_PUBLISHABLE_KEY');
    // Return children without auth in development for easier testing
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {children}
    </ClerkProvider>
  );
}

export default AuthProvider;
