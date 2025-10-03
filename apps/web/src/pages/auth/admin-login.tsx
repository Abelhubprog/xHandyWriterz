import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { SignIn } from '@clerk/clerk-react';

/**
 * Admin Login Page - Clerk-based Authentication with Role Verification
 *
 * This page authenticates administrators using Clerk and verifies they have
 * the required 'admin' or 'editor' role in their publicMetadata.
 *
 * Setup Instructions:
 * 1. Go to Clerk Dashboard → Users → Select a user
 * 2. Navigate to Metadata tab
 * 3. Add to Public Metadata: { "role": "admin" } or { "role": "editor" }
 * 4. Save - the user will now have admin access
 */

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isEditor, isLoaded, user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only check permissions after Clerk has loaded user data
    if (isLoaded && user) {
      if (isAdmin || isEditor) {
        // User has required permissions - redirect to admin dashboard
        setIsRedirecting(true);
        const adminUrl = '/admin';
        toast.success('Admin access verified. Redirecting to dashboard...', {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          duration: 2000,
        });

        setTimeout(() => {
          navigate(adminUrl);
        }, 800);
      } else {
        // User is authenticated but doesn't have admin privileges
        toast.error('Access denied: Admin or Editor privileges required', {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          duration: 3000,
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    }
  }, [isLoaded, user, isAdmin, isEditor, navigate]);

  // Show loading state while checking authentication
  if (!isLoaded || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <Shield className="h-16 w-16 mx-auto mb-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <Loader2 className="h-8 w-8 absolute top-4 left-1/2 -translate-x-1/2 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isRedirecting ? 'Redirecting to Admin Dashboard...' : 'Verifying admin access...'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we authenticate your credentials
          </p>
        </div>
      </div>
    );
  }

  // User is not authenticated - show Clerk sign-in
  if (!user) {

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Main content */}
        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 mb-6 shadow-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
              Admin Access
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Secure dashboard authentication via Clerk
            </p>
          </div>

          {/* Info banner */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">
                  Admin Authentication Required
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Sign in with a Clerk account that has admin or editor role privileges.
                </p>
              </div>
            </div>
          </div>

          {/* Clerk SignIn Component */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-gray-200 dark:border-gray-700">
            <SignIn
              redirectUrl="/auth/admin-login"
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-transparent shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
                  formButtonPrimary:
                    'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg',
                  formFieldInput:
                    'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-indigo-500',
                  formFieldLabel: 'text-gray-700 dark:text-gray-300',
                  footerActionLink: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
                  identityPreviewText: 'text-gray-900 dark:text-gray-100',
                  identityPreviewEditButton: 'text-indigo-600 dark:text-indigo-400',
                },
              }}
            />
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need admin access?{' '}
              <button
                onClick={() => navigate('/contact')}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium underline"
              >
                Contact support
              </button>
            </p>
          </div>

          {/* Technical info for developers */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                <strong className="text-gray-900 dark:text-gray-100">Dev Mode:</strong> To grant admin access, add{' '}
                <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                  {`{ "role": "admin" }`}
                </code>{' '}
                to user's publicMetadata in Clerk Dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Should never reach here due to useEffect redirect, but just in case
  return null;
};

export default AdminLogin;
