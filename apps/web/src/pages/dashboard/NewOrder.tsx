/**
 * NewOrder Page - Entry point for placing orders
 * Uses the legacy Dashboard order form flow
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LegacyOrderForm from '@/components/Orders/LegacyOrderForm';

const NewOrder: React.FC = () => {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>Place Order - HandyWriterz</title>
        <meta name="description" content="Submit your academic writing order with file uploads and instant communication" />
      </Helmet>
      
      <LegacyOrderForm />
    </ErrorBoundary>
  );
};

export default NewOrder;
