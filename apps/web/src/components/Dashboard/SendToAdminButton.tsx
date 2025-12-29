import React from 'react';
import { Button } from '@/components/ui/button';
import { useDocumentSubmission } from '@/hooks/useDocumentSubmission';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { User } from '@clerk/clerk-react';

export interface SendToAdminButtonProps {
  files: File[];
  metadata?: Record<string, any>;
  user?: User | null;
  onSuccess?: (submissionId: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'outline' | 'text';
  showStatus?: boolean;
}

/**
 * SendToAdminButton - A robust component for sending documents to admin
 * 
 * Features:
 * - Multi-channel admin notification
 * - Queue with retries
 * - Status tracking
 * - Fallback mechanisms
 */
export const SendToAdminButton: React.FC<SendToAdminButtonProps> = ({
  files,
  metadata = {},
  onSuccess,
  onError,
  disabled = false,
  className = '',
  variant = 'primary',
  showStatus = true,
}) => {
  const {
    submitDocuments,
    isSubmitting,
    status,
    error
  } = useDocumentSubmission({
    onSuccess,
    onError
  });

  // Button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return 'border border-primary text-primary hover:bg-primary hover:text-white';
      case 'text':
        return 'bg-transparent text-primary hover:bg-primary/10';
      case 'primary':
      default:
        return 'bg-primary text-white hover:bg-primary/90';
    }
  };

  // Handle the submission
  const handleSubmit = async () => {
    if (files.length === 0) return;
    await submitDocuments(files, metadata);
  };

  // Render status
  const renderStatus = () => {
    if (!showStatus) return null;

    if (status === 'idle' || status === 'success' || status === 'error' || status === 'partial') {
      return null;
    }

    return (
      <div className="mt-2 text-sm flex items-center">
        {(status === 'uploading' || status === 'submitting' || status === 'notifying') && (
          <>
            <Loader2 className="h-3 w-3 mr-2 animate-spin text-blue-500" />
            <span className="text-blue-500">
              {status === 'uploading' ? 'Uploading...' : 
               status === 'submitting' ? 'Sending to admin...' : 
               'Notifying admin...'}
            </span>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
            <span className="text-green-500">Sent successfully</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-3 w-3 mr-2 text-red-500" />
            <span className="text-red-500">{error?.message || 'Failed to send'}</span>
          </>
        )}
        {status === 'partial' && (
          <>
            <AlertCircle className="h-3 w-3 mr-2 text-yellow-500" />
            <span className="text-yellow-500">Partially successful</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <Button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting || files.length === 0}
        className={getButtonStyle()}
        aria-label="Send documents to admin"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send to Admin'
        )}
      </Button>
      {renderStatus()}
    </div>
  );
}; 