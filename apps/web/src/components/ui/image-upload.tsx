import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, X, Upload } from 'lucide-react';
import { Button } from './button';
import { uploadImage, deleteImage } from '@/lib/appwriteStorage';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  fileId?: string;
  onFileIdChange?: (fileId: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  className = '',
  fileId,
  onFileIdChange
}) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setLoading(true);
      const file = acceptedFiles[0];
      const result = await uploadImage(file);
      
      onChange(result.url);
      
      // Save the file ID for later deletion if needed
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
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = async () => {
    try {
      if (value && fileId) {
        await deleteImage(fileId);
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
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={value}
              alt="Upload preview"
              className="object-cover w-full h-full"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
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
                    ? "Drop the image here"
                    : "Drag 'n' drop an image here, or click to select"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF, WebP, SVG up to 45MB
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 