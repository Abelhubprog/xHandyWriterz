/**
 * Avatar Upload Component
 * 
 * A component for uploading user avatars to the Appwrite storage.
 * 
 * @file src/components/ui/avatar-upload.tsx
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UserCircle, X, Camera } from 'lucide-react';
import { Button } from './button';
import { uploadAvatar, deleteAvatar } from '@/lib/appwriteStorage';

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  fileId?: string;
  onFileIdChange?: (fileId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  onError,
  className = '',
  fileId,
  onFileIdChange,
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setLoading(true);
      const file = acceptedFiles[0];
      const result = await uploadAvatar(file);
      
      onChange(result.url);
      
      // Save the file ID for later deletion
      if (onFileIdChange) {
        onFileIdChange(result.fileId);
      }
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [onChange, onError, onFileIdChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (value && fileId) {
        await deleteAvatar(fileId);
        onChange('');
        if (onFileIdChange) {
          onFileIdChange('');
        }
      }
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer
          bg-gray-100 flex items-center justify-center hover:opacity-90
          transition-opacity duration-200 ease-in-out
        `}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Avatar"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
              <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
            </div>
          </>
        ) : (
          <UserCircle className="h-full w-full text-gray-400" />
        )}
        
        {value && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        {value ? 'Click to change' : 'Click to upload'}
      </p>
    </div>
  );
}; 