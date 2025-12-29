import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DatabaseErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const DatabaseErrorMessage: React.FC<DatabaseErrorMessageProps> = ({
  message = 'Database connection error. The server may be temporarily unavailable.',
  onRetry
}) => {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Connection Issue
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>{message}</p>
            <p className="mt-2">
              This could be due to:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>The database server is paused or experiencing issues</li>
              <li>Your internet connection is unstable</li>
              <li>The service is undergoing maintenance</li>
            </ul>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 