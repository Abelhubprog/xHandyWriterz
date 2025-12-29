import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useDocumentSubmission, SubmissionStatus } from '@/hooks/useDocumentSubmission';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';

export interface DocumentUploaderProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFileTypes?: string[];
  buttonLabel?: string;
  dropzoneLabel?: string;
  metadata?: Record<string, any>;
  onSuccess?: (submissionId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  isCompact?: boolean;
  showStatusInfo?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  maxFiles = 10,
  maxSizeInMB = 10,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt', '.jpg', '.jpeg', '.png', '.mp4', '.mov', '.m4a', '.mp3', '.wav'],
  buttonLabel = 'Upload Documents',
  dropzoneLabel = 'Drag and drop documents here',
  metadata = {},
  onSuccess,
  onError,
  className = '',
  isCompact = false,
  showStatusInfo = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { canAccessFeature, getPageLimit, getCurrentPlan } = useSubscription();

  // Use our custom hook for document submission
  const {
    submitDocuments,
    cancelSubmission,
    resetSubmission,
    isSubmitting,
    status,
    error,
    submissionId
  } = useDocumentSubmission({
    onSuccess,
    onError
  });

  // Calculate max file size in bytes
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Handler for file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Validate file types and sizes on the newly selected files
      const invalidFiles = selectedFiles.filter(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return !acceptedFileTypes.includes(fileExtension) && !acceptedFileTypes.includes('*');
      });

      const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeInBytes);

      if (invalidFiles.length > 0) {
        toast.error(`Invalid file type(s). Accepted types: ${acceptedFileTypes.join(', ')}`);
        return;
      }

      if (oversizedFiles.length > 0) {
        toast.error(`Some files exceed the maximum size of ${maxSizeInMB}MB.`);
        return;
      }

      // Combine with existing files using functional update to avoid stale closures
      setFiles(prevFiles => {
        const combined = [...prevFiles, ...selectedFiles];
        if (combined.length > maxFiles) {
          toast.error(`You can only upload up to ${maxFiles} files total.`);
          return combined.slice(0, maxFiles);
        }
        return combined;
      });
    }
  }, [maxFiles, maxSizeInBytes, acceptedFileTypes, maxSizeInMB]);

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);

      // Validate dropped files first
      const invalidFiles = droppedFiles.filter(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return !acceptedFileTypes.includes(fileExtension) && !acceptedFileTypes.includes('*');
      });

      const oversizedFiles = droppedFiles.filter(file => file.size > maxSizeInBytes);

      if (invalidFiles.length > 0) {
        toast.error(`Invalid file type(s). Accepted types: ${acceptedFileTypes.join(', ')}`);
        return;
      }

      if (oversizedFiles.length > 0) {
        toast.error(`Some files exceed the maximum size of ${maxSizeInMB}MB.`);
        return;
      }

      // Combine with existing files using functional update
      setFiles(prevFiles => {
        const combined = [...prevFiles, ...droppedFiles];
        if (combined.length > maxFiles) {
          toast.error(`You can only upload up to ${maxFiles} files total.`);
          return combined.slice(0, maxFiles);
        }
        return combined;
      });
    }
  }, [maxFiles, maxSizeInBytes, acceptedFileTypes, maxSizeInMB]);

  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Submit documents to admin
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    // Include user information in metadata
    const enhancedMetadata = {
      ...metadata,
      userName: user?.fullName || user?.username,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      uploadTimestamp: new Date().toISOString(),
    };

    // Submit using our hook
    try {
      await submitDocuments(files, enhancedMetadata);

    } catch (err) {
      // bubble up
      throw err;
    }
  };

  // Cancel an ongoing submission
  const handleCancel = () => {
    cancelSubmission();
  };

  // Reset the uploader after successful or failed submission
  const handleReset = () => {
    resetSubmission();
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render status information based on current status
  const renderStatusInfo = () => {
    if (!showStatusInfo) return null;

    switch (status) {
      case 'uploading':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading documents...</span>
          </div>
        );
      case 'submitting':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending to admin...</span>
          </div>
        );
      case 'notifying':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Notifying admin...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Documents sent successfully!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error?.message || 'Failed to send documents'}</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <span>Documents uploaded but admin may not have been notified</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Check if user has access to document upload feature
  if (!canAccessFeature('basic_access')) {
    return (
      <div className={`w-full ${className}`}>
        <SubscriptionGuard
          requiredPlan="basic"
          fallback={
            <div className="text-center p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Document Upload Available for Subscribers
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your documents and receive professional assistance with a Basic plan or higher.
              </p>
            </div>
          }
        >
          {/* Fallback-only guard; no interactive children for non-subscribers */}
          <div />
        </SubscriptionGuard>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const pageLimit = getPageLimit();

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept={acceptedFileTypes.join(',')}
        className="hidden"
        aria-label="File upload input"
      />

      {/* Dropzone */}
      {files.length === 0 && !isSubmitting && status !== 'success' && !isCompact && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleButtonClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{dropzoneLabel}</p>
          <p className="text-xs text-gray-400 mt-1">
            {`Max ${maxFiles} files, up to ${maxSizeInMB}MB each. Accepted formats: ${acceptedFileTypes.join(', ')}. Your selection stays listed until you remove or submit.`}
          </p>
          {pageLimit > 0 && pageLimit !== Infinity && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan: Up to {pageLimit} pages per order
            </div>
          )}
          {pageLimit === Infinity && (
            <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan: Unlimited pages
            </div>
          )}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && !isSubmitting && status !== 'success' && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Selected Files ({files.length})</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                  aria-label={`Remove file ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        {status === 'idle' || status === 'error' ? (
          <>
            <Button
              type="button"
              onClick={files.length > 0 ? handleSubmit : handleButtonClick}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {files.length > 0 ? 'Send to Admin' : buttonLabel}
            </Button>
            {files.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFiles([])}
                className="ml-2"
              >
                Cancel
              </Button>
            )}
          </>
        ) : status === 'success' || status === 'partial' ? (
          <Button type="button" onClick={handleReset}>
            Upload More
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            Cancel Upload
          </Button>
        )}
      </div>

      {/* Status information */}
      <div className="mt-2">
        {renderStatusInfo()}
      </div>
    </div>
  );
};
