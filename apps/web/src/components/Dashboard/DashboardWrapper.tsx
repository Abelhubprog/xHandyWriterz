import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const DashboardWrapper = () => {
  const { user, isLoaded } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState('Loading your dashboard...');
  const navigate = useNavigate();

  // No external dependency checks needed for now to avoid false negatives during dev

  // Handle user authentication and redirection
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // No user, redirect to login
        navigate('/sign-in', { replace: true, state: { from: '/dashboard' } });
      }
    }
  }, [user, isLoaded, navigate]);

  // Show optimized loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{loadingMessage}</p>
      </div>
    );
  }

  // Handle no user case (will redirect in useEffect)
  if (!user) {
    return null;
  }

  // Render dashboard for regular users
  return <Dashboard />;
};

export default DashboardWrapper; 
