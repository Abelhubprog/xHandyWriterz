/**
 * EmailAdmin Page - Send emails with attachments to admin
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import InAppEmail from '@/components/Email/InAppEmail';

const EmailAdmin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Email Admin - HandyWriterz</title>
        <meta name="description" content="Send email with attachments to admin support" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <InAppEmail
          onSuccess={() => navigate('/dashboard/messages')}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </ErrorBoundary>
  );
};

export default EmailAdmin;
