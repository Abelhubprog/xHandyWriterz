import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'editor' | 'contributor' | 'user';
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  // Get role from Clerk user's public metadata
  const userRole = (user?.publicMetadata?.role as string) || 'user';

  if (userRole !== requiredRole) {
    // Redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
