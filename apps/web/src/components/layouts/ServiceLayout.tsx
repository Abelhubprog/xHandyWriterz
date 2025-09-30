import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ServiceLayoutProps {
  className?: string;
}

const ServiceLayout: React.FC<ServiceLayoutProps> = ({ className }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export default ServiceLayout;