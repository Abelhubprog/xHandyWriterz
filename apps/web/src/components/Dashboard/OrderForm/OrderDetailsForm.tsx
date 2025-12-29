/**
 * Order Details Form
 * Captures word count, study level, due date, module, and instructions
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceCalculator } from './PriceCalculator';
import { FileUploadSection } from './FileUploadSection';
import { STUDY_LEVELS, type ServiceType, type UploadedFile } from './types';

interface OrderDetailsFormProps {
  service: ServiceType;
  wordCount: number;
  studyLevel: string;
  dueDate: string;
  module: string;
  instructions: string;
  files: File[];
  uploadedFiles: UploadedFile[];
  uploading: boolean;
  adminNotified: boolean;
  onWordCountChange: (value: number) => void;
  onStudyLevelChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function OrderDetailsForm({
  service,
  wordCount,
  studyLevel,
  dueDate,
  module,
  instructions,
  files,
  uploadedFiles,
  uploading,
  adminNotified,
  onWordCountChange,
  onStudyLevelChange,
  onDueDateChange,
  onModuleChange,
  onInstructionsChange,
  onFilesChange,
  onRemoveFile,
  onBack,
  onSubmit,
  className,
}: OrderDetailsFormProps) {
  const minDate = new Date().toISOString().split('T')[0];

  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onWordCountChange(0);
      return;
    }
    const num = Number(value);
    if (num >= 0) {
      onWordCountChange(num);
    }
  };

  const canProceed =
    wordCount >= 100 &&
    studyLevel &&
    dueDate &&
    (files.length > 0 || uploadedFiles.length > 0);

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Order Details
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {service.title}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Word Count */}
        <div>
          <label
            htmlFor="wordCount"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Word Count <span className="text-red-500">*</span>
          </label>
          <input
            id="wordCount"
            type="number"
            value={wordCount === 0 ? '' : wordCount}
            onChange={handleWordCountChange}
            min={100}
            max={100000}
            required
            placeholder="e.g. 2000"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {wordCount > 0 && wordCount < 100 && (
            <p className="mt-1 text-sm text-red-500">Minimum 100 words required</p>
          )}
        </div>

        {/* Price Calculator */}
        {wordCount >= 100 && studyLevel && dueDate && (
          <PriceCalculator
            wordCount={wordCount}
            serviceId={service.id}
            studyLevel={studyLevel}
            dueDate={dueDate}
          />
        )}

        {/* Module */}
        <div>
          <label
            htmlFor="module"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Module / Course Name
          </label>
          <input
            id="module"
            type="text"
            value={module}
            onChange={(e) => onModuleChange(e.target.value)}
            placeholder="e.g. Advanced Clinical Practice"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Study Level */}
        <div>
          <label
            htmlFor="studyLevel"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Study Level <span className="text-red-500">*</span>
          </label>
          <select
            id="studyLevel"
            value={studyLevel}
            onChange={(e) => onStudyLevelChange(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select level</option>
            {STUDY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            min={minDate}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Instructions */}
        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            Special Instructions
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            rows={4}
            placeholder="Enter any specific requirements, formatting guidelines, or additional notes..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* File Upload */}
        <FileUploadSection
          files={files}
          uploadedFiles={uploadedFiles}
          uploading={uploading}
          onFilesChange={onFilesChange}
          onRemoveFile={onRemoveFile}
        />

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={!canProceed || uploading}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-medium text-white transition-all',
              canProceed && !uploading
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            )}
          >
            {uploading
              ? 'Uploading...'
              : adminNotified
              ? 'Proceed to Payment'
              : 'Submit & Upload Files'}
          </button>

          {!canProceed && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Complete all required fields and upload at least one file to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default OrderDetailsForm;
