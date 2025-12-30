import React from 'react';
import {
  ClerkProvider as ClerkProviderImpl,
  ClerkLoaded as ClerkLoadedImpl,
  SignIn as SignInImpl,
  SignUp as SignUpImpl,
  SignedIn as SignedInImpl,
  SignedOut as SignedOutImpl,
  UserButton as UserButtonImpl,
  UserProfile as UserProfileImpl,
  useAuth as useAuthImpl,
  useClerk as useClerkImpl,
  useSignIn as useSignInImpl,
  useSignUp as useSignUpImpl,
  useUser as useUserImpl,
} from '@clerk/clerk-react';
import { env } from '@/env';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function isValidPublishableKey(key: string | undefined | null): key is string {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed) return false;

  // Guard against common placeholders/defaults.
  if (/placeholder/i.test(trimmed)) return false;
  if (/pk_(test|live)_default/i.test(trimmed)) return false;

  // Real Clerk keys are long; keep this permissive but prevent obviously bogus values.
  if (!/^pk_(test|live)_[A-Za-z0-9]+$/.test(trimmed)) return false;
  if (trimmed.length < 30) return false;

  return true;
}

export function isClerkEnabled(): boolean {
  return isValidPublishableKey(env.VITE_CLERK_PUBLISHABLE_KEY);
}

export function ClerkDisabledNotice({ title, description }: { title: string; description: string }): JSX.Element {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> to a real Clerk publishable key to enable authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

type ClerkProviderProps = {
  children: React.ReactNode;
  routerPush?: (to: string) => void;
  routerReplace?: (to: string) => void;
};

export function ClerkProvider({ children }: ClerkProviderProps): JSX.Element {
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

  if (!isValidPublishableKey(publishableKey)) {
    if (import.meta.env.DEV) {
      // Avoid crashing local dev when env isn't wired yet.
      console.warn('[auth] Clerk disabled: invalid VITE_CLERK_PUBLISHABLE_KEY');
      return <>{children}</>;
    }

    // In prod, be explicit.
    return (
      <ClerkDisabledNotice
        title="Authentication misconfigured"
        description="Clerk is not configured for this deployment."
      />
    );
  }

  return (
    <ClerkProviderImpl
      publishableKey={publishableKey}
      signInUrl={env.VITE_CLERK_SIGN_IN_URL}
      signUpUrl={env.VITE_CLERK_SIGN_UP_URL}
      signInFallbackRedirectUrl={env.VITE_CLERK_AFTER_SIGN_IN_URL}
      signUpFallbackRedirectUrl={env.VITE_CLERK_AFTER_SIGN_UP_URL}
    >
      <ClerkLoadedImpl>{children}</ClerkLoadedImpl>
    </ClerkProviderImpl>
  );
}

export function SignedIn({ children }: { children: React.ReactNode }): JSX.Element | null {
  if (!isClerkEnabled()) return null;
  return <SignedInImpl>{children}</SignedInImpl>;
}

export function SignedOut({ children }: { children: React.ReactNode }): JSX.Element | null {
  if (!isClerkEnabled()) return <>{children}</>;
  return <SignedOutImpl>{children}</SignedOutImpl>;
}

// UserButton props are intentionally loose here to avoid leaking Clerk types across the app.
export function UserButton(props: any): JSX.Element | null {
  if (!isClerkEnabled()) return null;
  return <UserButtonImpl {...props} />;
}

export function SignIn(props: any): JSX.Element {
  if (!isClerkEnabled()) {
    return (
      <ClerkDisabledNotice
        title="Sign in unavailable"
        description="Clerk is disabled because the publishable key is not configured."
      />
    );
  }
  return <SignInImpl {...props} />;
}

export function SignUp(props: any): JSX.Element {
  if (!isClerkEnabled()) {
    return (
      <ClerkDisabledNotice
        title="Sign up unavailable"
        description="Clerk is disabled because the publishable key is not configured."
      />
    );
  }
  return <SignUpImpl {...props} />;
}

export function UserProfile(props: any): JSX.Element {
  if (!isClerkEnabled()) {
    return (
      <ClerkDisabledNotice
        title="Profile unavailable"
        description="Clerk is disabled because the publishable key is not configured."
      />
    );
  }
  return <UserProfileImpl {...props} />;
}

export function useAuth(): any {
  let auth: any;
  let authError: unknown;
  try {
    auth = useAuthImpl();
  } catch (error) {
    authError = error;
  }

  if (!isClerkEnabled() || authError) {
    return {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      has: () => false,
      getToken: async () => null,
      signOut: async () => {},
    };
  }

  return auth;
}

export function useUser(): any {
  let result: any;
  let userError: unknown;
  try {
    result = useUserImpl();
  } catch (error) {
    userError = error;
  }

  if (!isClerkEnabled() || userError) {
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }

  return result;
}

export function useClerk(): any {
  let clerk: any;
  let clerkError: unknown;
  try {
    clerk = useClerkImpl();
  } catch (error) {
    clerkError = error;
  }

  if (!isClerkEnabled() || clerkError) {
    return {
      loaded: true,
      signOut: async () => {},
      openSignIn: () => {},
      openSignUp: () => {},
    };
  }

  return clerk;
}

export function useSignIn(): any {
  let data: any;
  let error: unknown;
  try {
    data = useSignInImpl();
  } catch (err) {
    error = err;
  }
  if (!isClerkEnabled() || error) {
    return { isLoaded: true, signIn: null, setActive: async () => {} };
  }
  return data;
}

export function useSignUp(): any {
  let data: any;
  let error: unknown;
  try {
    data = useSignUpImpl();
  } catch (err) {
    error = err;
  }
  if (!isClerkEnabled() || error) {
    return { isLoaded: true, signUp: null, setActive: async () => {} };
  }
  return data;
}
