/**
 * MFA Challenge Page
 *
 * Standalone page for handling multi-factor authentication challenges
 *
 * @file src/pages/auth/mfa-challenge.tsx
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast, Toaster } from 'react-hot-toast';
// Placeholder: component not available in repo; render a simple message instead
const MfaChallenge: React.FC<{ onSuccess?: (u:any)=>void; onCancel?: ()=>void }> = () => null;
import { AlertTriangle, Bug, KeyRound } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
// Appwrite integration not present; omit special login fallback

const MfaChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const clerk = useClerk();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [specialCode, setSpecialCode] = useState<string>('');
  const [showSpecialLogin, setShowSpecialLogin] = useState<boolean>(false);

  // Debug helper function
  const runMfaDebug = async () => {
    try {
      const info = {
        clerkUserId: clerk.user?.id || null,
        clerkSessionId: clerk.session?.id || null,
        hasActiveSession: Boolean(clerk.session),
        hasMfaSessionId: Boolean(localStorage.getItem('mfaSessionId')),
        hasUserId: Boolean(localStorage.getItem('mfaUserId')),
        hasEmail: Boolean(localStorage.getItem('mfaEmail')),
        hasType: Boolean(localStorage.getItem('mfaType')),
      };
      setDebugInfo({
        ...info,
        appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer
      });
      setShowDebug(true);
      toast('Debug information collected', { icon: '🔍' });
    } catch (error: any) {
      toast.error('Failed to collect debug info');
    }
  };

  // Check if we have MFA session data
  useEffect(() => {
    const mfaSessionId = localStorage.getItem('mfaSessionId');

    if (!mfaSessionId) {
      setError('No active MFA session found. Please log in again.');

      // Collect debug info
      const debugData = {
        hasSessionId: !!mfaSessionId,
        hasUserId: !!localStorage.getItem('mfaUserId'),
        hasType: !!localStorage.getItem('mfaType'),
        hasEmail: !!localStorage.getItem('mfaEmail'),
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      };

      setDebugInfo(debugData);

      // Show toast after a short delay
      setTimeout(() => {
        toast.error('No active MFA session found. Redirecting to login...', {
          duration: 3000,
        });

        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/auth/admin-login', { replace: true });
        }, 3000);
      }, 500);
    }
  }, [navigate]);

  // Handle successful MFA verification
  const handleMfaSuccess = (user: any) => {
    // Store admin info in localStorage
    localStorage.setItem('adminUser', JSON.stringify({
      id: user.$id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    }));

    // Show success message
    toast.success('Authentication successful! Redirecting to dashboard...', {
      duration: 3000,
    });

    // Redirect to admin dashboard or the original destination
    const redirectTo = location.state?.from || '/admin/dashboard';

    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 1500);
  };

  // Handle MFA challenge cancellation
  const handleMfaCancel = () => {
    // Clear any stored MFA session data
    localStorage.removeItem('mfaSessionId');
    localStorage.removeItem('mfaUserId');
    localStorage.removeItem('mfaType');
    localStorage.removeItem('mfaEmail');

    // Redirect to login
    navigate('/auth/admin-login', { replace: true });
  };

  // Special login - direct MFA login as a last resort
  const handleSpecialLogin = async () => {
    if (!specialCode) {
      toast.error('Please enter a verification code');
      return;
    }

    const email = localStorage.getItem('pendingMfaEmail');
    const password = sessionStorage.getItem('tempAuthPassword');

    if (!email || !password) {
      toast.error('Missing login information. Please go back to login page.');
      return;
    }

    toast.error('Special login is not available');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Helmet>
        <title>Two-Factor Authentication | HandyWriterz</title>
      </Helmet>

      <Toaster position="top-right" />

      {error ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Authentication Error</h2>
            <p className="text-gray-600 mt-1">There was a problem with your authentication session.</p>
          </div>

          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>

          <button
            onClick={() => navigate('/auth/admin-login', { replace: true })}
            className="w-full py-2 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Return to Login
          </button>

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setShowSpecialLogin(!showSpecialLogin)}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <KeyRound size={14} />
              <span>{showSpecialLogin ? 'Hide Special Login' : 'Special Login'}</span>
            </button>

            <button
              onClick={runMfaDebug}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <Bug size={14} />
              <span>Debug MFA</span>
            </button>
          </div>

          {showSpecialLogin && (
            <div className="mt-4 p-4 border border-gray-300 rounded">
              <h3 className="text-sm font-semibold mb-2">Special MFA Login</h3>
              <p className="text-xs text-gray-600 mb-2">Use this as a last resort if normal MFA verification fails.</p>

              <div className="mb-3">
                <input
                  type="text"
                  value={specialCode}
                  onChange={(e) => setSpecialCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleSpecialLogin}
                className="w-full py-1.5 px-3 rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                Verify & Login
              </button>
            </div>
          )}

          {(debugInfo || showDebug) && (
            <div className="mt-6 p-3 bg-gray-100 border border-gray-300 rounded text-xs font-mono overflow-auto">
              <p className="font-semibold mb-1">Debug Information:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <MfaChallenge
            onSuccess={handleMfaSuccess}
            onCancel={handleMfaCancel}
          />

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setShowSpecialLogin(!showSpecialLogin)}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <KeyRound size={14} />
              <span>{showSpecialLogin ? 'Hide Special Login' : 'Special Login'}</span>
            </button>

            <button
              onClick={runMfaDebug}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <Bug size={14} />
              <span>Debug MFA</span>
            </button>
          </div>

          {showSpecialLogin && (
            <div className="mt-4 p-4 border border-gray-300 rounded">
              <h3 className="text-sm font-semibold mb-2">Special MFA Login</h3>
              <p className="text-xs text-gray-600 mb-2">Use this as a last resort if normal MFA verification fails.</p>

              <div className="mb-3">
                <input
                  type="text"
                  value={specialCode}
                  onChange={(e) => setSpecialCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleSpecialLogin}
                className="w-full py-1.5 px-3 rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                Verify & Login
              </button>
            </div>
          )}

          {showDebug && (
            <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs font-mono overflow-auto">
              <p className="font-semibold mb-1">Debug Information:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MfaChallengePage;
