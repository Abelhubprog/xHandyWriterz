import React from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import MessageCenter from '@/components/Messaging/MessageCenter';

const Messages: React.FC = () => (
  <ErrorBoundary>
    <div className="px-4 py-6 lg:px-8">
      <MessageCenter />
    </div>
  </ErrorBoundary>
);

export default Messages;
