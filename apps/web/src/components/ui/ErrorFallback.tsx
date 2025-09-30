import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * ErrorFallback - A lightweight error boundary component
 * Handles both auth and content errors gracefully
 */
const ErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const navigate = useNavigate();

  const handleReset = () => {
    resetErrorBoundary();
    toast.success('Retrying...');
  };

  const handleGoHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  // Check if error is related to auth or content
  const isAuthError = error.message?.toLowerCase().includes('auth') || 
                     error.message?.toLowerCase().includes('permission') ||
                     error.message?.toLowerCase().includes('unauthorized');

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-center mb-4">
          <svg 
            className="h-12 w-12 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
          {isAuthError ? 'Authentication Error' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-600 text-sm text-center mb-4">
          {isAuthError 
            ? 'Please sign in again to continue' 
            : 'We encountered an error while loading the content'}
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;