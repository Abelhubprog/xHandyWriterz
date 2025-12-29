/**
 * Document Upload Component
 *
 * A component for uploading documents to the Appwrite storage.
 *
 * @file src/components/ui/document-upload.tsx
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, File, Download, Trash2 } from 'lucide-react';
import { Button } from './button';
import { uploadFile as uploadToR2, deleteFile as deleteFromR2 } from '@/services/fileUploadService';

interface DocumentUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  fileId?: string;
  onFileIdChange?: (fileId: string) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  value,
  onChange,
  onError,
  className = '',
  fileId,
  onFileIdChange,
  fileName,
  onFileNameChange
}) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setLoading(true);
      const file = acceptedFiles[0];

      // Save the file name
      if (onFileNameChange) {
        onFileNameChange(file.name);
      }
      // Upload to R2 via our service
      const folder = 'uploads';
      const result = await uploadToR2(file, 'default', folder, undefined);

      if (!result.success || !result.url || !result.path) {
        throw new Error(result.error || 'Upload failed');
      }
      onChange(result.url);
      // Save the file key for deletion
      onFileIdChange?.(result.path);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [onChange, onError, onFileIdChange, onFileNameChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = async () => {
    try {
      if (fileId) {
        await deleteFromR2('default', fileId);
      }
      onChange('');
      onFileIdChange?.('');
      onFileNameChange?.('');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleDownload = () => {
    if (value) {
      const link = document.createElement('a');
      link.href = value;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = () => {
    if (!fileName) return <FileText className="h-10 w-10 text-blue-500" />;

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'txt':
        return <FileText className="h-10 w-10 text-gray-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="flex flex-col items-center justify-center py-4">
            {getFileIcon()}

            <p className="mt-2 text-sm font-medium text-gray-900 truncate max-w-full">
              {fileName || 'Document'}
            </p>

            <div className="flex space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? "Drop the document here"
                    : "Drag 'n' drop a document here, or click to select"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, TXT up to 49.9MB
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
