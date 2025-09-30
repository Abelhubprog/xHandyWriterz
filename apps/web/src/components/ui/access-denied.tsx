import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface AccessDeniedProps {
  message?: string;
  showBackButton?: boolean;
}

export function AccessDenied({ 
  message = 'You do not have permission to access this page.',
  showBackButton = true 
}: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-5 bg-gray-50">
      <div className="text-center space-y-4">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        
        <p className="text-gray-600">{message}</p>
        
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
