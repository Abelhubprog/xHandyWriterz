import React from 'react';

/**
 * LoadingScreen component provides a branded loading experience
 * Used during authentication checks and data loading states
 */
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md mb-4">
          <span className="text-xl">H</span>
        </div>
        
        {/* Loading spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        
        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-800">Loading</h2>
        <p className="text-gray-600 mt-2">Please wait while we prepare your experience...</p>
      </div>
    </div>
  );
};

// Make sure to export as default
export default LoadingScreen;
