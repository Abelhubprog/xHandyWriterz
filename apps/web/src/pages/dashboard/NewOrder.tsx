/**
 * NewOrder Page - Entry point for placing orders
 * Uses the new modular OrderFormContainer with step-by-step flow
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { OrderFormContainer } from '@/components/Dashboard/OrderForm';

const NewOrder: React.FC = () => {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>Place Order - HandyWriterz</title>
        <meta name="description" content="Submit your academic writing order with file uploads and instant communication" />
      </Helmet>

      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create New Order
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Follow the steps below to submit your assignment request
          </p>
        </div>

        <OrderFormContainer />
      </div>
    </ErrorBoundary>
  );
};

export default NewOrder;
