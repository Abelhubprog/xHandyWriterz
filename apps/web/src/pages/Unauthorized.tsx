import React from 'react';
import { Link } from 'react-router-dom';
import { UserX, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Unauthorized: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Unauthorized Access | HandyWriterz</title>
        <meta name="description" content="You do not have permission to access this page." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <div className="h-1 w-16 bg-red-500 mx-auto my-4"></div>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Homepage
            </Link>
            
            <p className="text-gray-500 text-sm mt-4">
              If you believe you should have access, please contact your administrator
              for assistance.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Contact <a href="mailto:support@handywriterz.com" className="text-blue-600 hover:underline">support@handywriterz.com</a></p>
        </div>
      </div>
    </>
  );
};

export default Unauthorized; 