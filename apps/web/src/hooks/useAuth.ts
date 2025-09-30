import { useUser, useClerk } from '@clerk/clerk-react';

/**
 * Minimal auth hook backed by Clerk to satisfy existing UI needs.
 * Returns the current user (or null) and a logout method.
 */
export function useAuth() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const logout = async () => {
    try {
      await clerk.signOut();
    } catch (err) {
      // no-op: allow UI to proceed even if signOut throws
      console.error('Logout failed', err);
    }
  };

  // Check user roles from public metadata
  const userRole = (user?.publicMetadata as any)?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor' || isAdmin;

  return {
    user: isLoaded ? user : null,
    isLoaded,
    logout,
    userRole,
    isAdmin,
    isEditor,
  } as const;
}

export default useAuth;
