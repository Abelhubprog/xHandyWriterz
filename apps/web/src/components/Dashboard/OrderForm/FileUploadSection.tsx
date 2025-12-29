/**
 * File Upload Section
 * Handles file selection, validation, and display
 */

import React, { useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { UploadedFile } from './types';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES = 10;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface FileUploadSectionProps {
  files: File[];
  uploadedFiles: UploadedFile[];
  uploading: boolean;
  onFilesChange: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  className?: string;
}

export function FileUploadSection({
  files,
  uploadedFiles,
  uploading,
  onFilesChange,
  onRemoveFile,
  className,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      const fileList = Array.from(selectedFiles);
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      fileList.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          invalidFiles.push(`${file.name} (exceeds 100MB)`);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(`Rejected: ${invalidFiles.join(', ')}`);
      }

      if (validFiles.length > 0) {
        const combined = [...files, ...validFiles];

        // Deduplicate by name+size+lastModified
        const seen = new Set<string>();
        const deduped: File[] = [];
        for (const f of combined) {
          const key = `${f.name}-${f.size}-${f.lastModified}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(f);
          }
        }

        // Enforce max files
        if (deduped.length > MAX_FILES) {
          toast(`Only ${MAX_FILES} files allowed. Extra files removed.`, { icon: '⚠️' });
          onFilesChange(deduped.slice(0, MAX_FILES));
        } else {
          toast.success(`${validFiles.length} file(s) added`);
          onFilesChange(deduped);
        }
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [files, onFilesChange]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles.length > 0) {
        const fakeEvent = {
          target: { files: droppedFiles },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(fakeEvent);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
        Upload Files
      </label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          'hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
          uploading
            ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
            : 'border-gray-300 dark:border-gray-600'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
        />

        <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            browse
          </button>
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          Max {MAX_FILES} files, up to 100MB each
        </p>
      </div>

      {/* File List - Pending */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({files.length})
          </h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  disabled={uploading}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
            <span>✓</span> Uploaded Files ({uploadedFiles.length})
          </h4>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li
                key={`uploaded-${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
                  {file.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hint */}
      {files.length === 0 && uploadedFiles.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Upload your assignment brief, rubric, or any reference materials to get accurate quotes.
          </p>
        </div>
      )}
    </div>
  );
}

export default FileUploadSection;
