import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { formatBytes } from '@/services/fileUploadService';

interface FileWithProgress extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface FileUploaderProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFileTypes?: string[];
  onFilesChange?: (files: FileWithProgress[]) => void;
  onUploadComplete?: (successfulFiles: FileWithProgress[]) => void;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  maxFiles = 10,
  maxSizeInMB = 50,
  acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.mp4', '.mov', '.avi', '.wmv',
    '.mp3', '.wav', '.ogg', '.aac',
    '.zip'
  ],
  onFilesChange,
  onUploadComplete,
  className = ''
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Handler for file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Check if adding these files would exceed the limit
      if (files.length + selectedFiles.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files total.`);
        return;
      }

      // Validate file types and sizes
      const validFiles: FileWithProgress[] = [];
      const invalidFiles: string[] = [];

      selectedFiles.forEach(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
        // Check file type
        const isValidType = acceptedFileTypes.some(type => 
          type === '*' || 
          type === fileExtension || 
          type === file.type
        );

        // Check file size
        const isValidSize = file.size <= maxSizeInBytes;

        if (isValidType && isValidSize) {
          validFiles.push({
            ...file,
            id: `${file.name}-${file.size}-${Date.now()}`,
            progress: 0,
            status: 'pending'
          });
        } else {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(
          `Invalid files: ${invalidFiles.join(', ')}. Accepted types: ${acceptedFileTypes.join(', ')}, Max size: ${maxSizeInMB}MB`
        );
      }

      if (validFiles.length > 0) {
        const newFiles = [...files, ...validFiles];
        setFiles(newFiles);
        onFilesChange?.(newFiles);
      }
    }
  }, [files, maxFiles, maxSizeInBytes, acceptedFileTypes, maxSizeInMB, onFilesChange]);

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

      // Check if adding these files would exceed the limit
      if (files.length + droppedFiles.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files total.`);
        return;
      }

      // Validate dropped files
      const validFiles: FileWithProgress[] = [];
      const invalidFiles: string[] = [];

      droppedFiles.forEach(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
        // Check file type
        const isValidType = acceptedFileTypes.some(type => 
          type === '*' || 
          type === fileExtension || 
          type === file.type
        );

        // Check file size
        const isValidSize = file.size <= maxSizeInBytes;

        if (isValidType && isValidSize) {
          validFiles.push({
            ...file,
            id: `${file.name}-${file.size}-${Date.now()}`,
            progress: 0,
            status: 'pending'
          });
        } else {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(
          `Invalid files: ${invalidFiles.join(', ')}. Accepted types: ${acceptedFileTypes.join(', ')}, Max size: ${maxSizeInMB}MB`
        );
      }

      if (validFiles.length > 0) {
        const newFiles = [...files, ...validFiles];
        setFiles(newFiles);
        onFilesChange?.(newFiles);
      }
    }
  }, [files, maxFiles, maxSizeInBytes, acceptedFileTypes, maxSizeInMB, onFilesChange]);

  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter(file => file.id !== id);
      onFilesChange?.(newFiles);
      return newFiles;
    });
  };

  // Upload all files
  const uploadFiles = async () => {
    // Import the upload service dynamically to avoid circular dependencies
    const { uploadMultipleFiles } = await import('@/services/fileUploadService');
    
    // Update all files to uploading status
    setFiles(prevFiles => {
      const newFiles = prevFiles.map(file => ({
        ...file,
        status: 'uploading',
        progress: 0
      }));
      onFilesChange?.(newFiles);
      return newFiles;
    });

    try {
      // Upload files with progress tracking
      const results = await uploadMultipleFiles(
        files.map(f => f as File),
        (progress) => {
          // Update progress for all files (simplified for now)
          setFiles(prevFiles => {
            const newFiles = prevFiles.map(file => ({
              ...file,
              progress: Math.min(100, progress),
              status: progress >= 100 ? 'success' : 'uploading'
            }));
            onFilesChange?.(newFiles);
            return newFiles;
          });
        },
        'orders'
      );

      // Update file statuses based on results
      const successfulFiles: FileWithProgress[] = [];
      setFiles(prevFiles => {
        const newFiles = prevFiles.map((file, index) => {
          const result = results[index];
          if (result.success && result.url) {
            successfulFiles.push({
              ...file,
              status: 'success',
              progress: 100,
              url: result.url
            });
            return {
              ...file,
              status: 'success',
              progress: 100,
              url: result.url
            };
          } else {
            return {
              ...file,
              status: 'error',
              error: result.error
            };
          }
        });
        onFilesChange?.(newFiles);
        return newFiles;
      });

      // Notify parent of successful uploads
      onUploadComplete?.(successfulFiles);

      // Show toast notification
      if (successfulFiles.length === files.length) {
        toast.success(`Successfully uploaded ${successfulFiles.length} files`);
      } else {
        toast.success(`Uploaded ${successfulFiles.length} of ${files.length} files`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
      
      // Update all files to error status
      setFiles(prevFiles => {
        const newFiles = prevFiles.map(file => ({
          ...file,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        }));
        onFilesChange?.(newFiles);
        return newFiles;
      });
    }
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    onFilesChange?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render file status icon
  const renderFileStatus = (file: FileWithProgress) => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

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
      {files.length === 0 && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleButtonClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Drag and drop files here</p>
          <p className="text-xs text-gray-400 mt-1">
            {`Max ${maxFiles} files, up to ${maxSizeInMB}MB each. Accepted formats: ${acceptedFileTypes.join(', ')}`}
          </p>
          <Button type="button" className="mt-2" variant="outline">
            Browse Files
          </Button>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
              >
                Add More
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFiles}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg max-h-60 overflow-y-auto">
            <ul className="divide-y">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {renderFileStatus(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatBytes(file.size)}
                        </p>
                        {file.status === 'uploading' && (
                          <p className="text-xs text-blue-500">
                            {file.progress}% uploaded
                          </p>
                        )}
                        {file.status === 'success' && (
                          <p className="text-xs text-green-500">
                            Uploaded
                          </p>
                        )}
                        {file.status === 'error' && (
                          <p className="text-xs text-red-500">
                            {file.error || 'Upload failed'}
                          </p>
                        )}
                      </div>
                      {file.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-500 hover:text-red-500 ml-2"
                    aria-label={`Remove file ${file.name}`}
                    disabled={file.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={uploadFiles}
              disabled={files.some(f => f.status === 'uploading') || files.length === 0}
            >
              Upload Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};