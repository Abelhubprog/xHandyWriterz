/**
 * Orders Component
 * 
 * This is a simplified version of the Orders component to fix the import error.
 * 
 * @file src/pages/dashboard/Orders.tsx
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const Orders: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  // Show login prompt if not authenticated
  if (isLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Orders - HandyWriterz</title>
        </Helmet>
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-orange-800">Authentication required</h3>
              <p className="text-orange-700 mt-1">You need to be logged in to view your orders.</p>
              <div className="mt-3">
                <button 
                  onClick={() => navigate('/sign-in')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>My Orders - HandyWriterz</title>
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">
          Your orders will appear here. This is a simplified version of the Orders component.
        </p>
      </div>
    </div>
  );
};

export default Orders; 