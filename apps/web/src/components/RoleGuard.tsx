import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'editor' | 'contributor' | 'user';
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user } = useAuth();

  // Assuming Clerk user has a 'role' claim or metadata
  const userRole = user?.publicMetadata?.role || 'user';

  if (userRole !== requiredRole) {
    // Redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
