/**
 * Order Summary
 * Displays final order details before payment
 */

import React from 'react';
import { FileText, Calendar, BookOpen, GraduationCap, PoundSterling } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderFormData, UploadedFile, ServiceType } from './types';
import { SUPPORT_AREAS } from './types';

interface OrderSummaryProps {
  formData: OrderFormData;
  uploadedFiles: UploadedFile[];
  calculatedPrice: number | null;
  onEdit: () => void;
  onProceed: () => void;
  className?: string;
}

export function OrderSummary({
  formData,
  uploadedFiles,
  calculatedPrice,
  onEdit,
  onProceed,
  className,
}: OrderSummaryProps) {
  const { selectedArea, selectedService, wordCount, studyLevel, dueDate, module, instructions } = formData;

  const areaTitle = SUPPORT_AREAS.find((a) => a.id === selectedArea)?.title || selectedArea;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Order Summary
        </h2>
        <button
          onClick={onEdit}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Edit Details
        </button>
      </div>

      <div className="space-y-4">
        {/* Service & Area */}
        <SummaryRow
          icon={<BookOpen className="h-5 w-5" />}
          label="Service"
          value={selectedService?.title || '—'}
        />
        <SummaryRow
          icon={<GraduationCap className="h-5 w-5" />}
          label="Subject Area"
          value={areaTitle || '—'}
        />

        {/* Word Count & Level */}
        <SummaryRow
          icon={<FileText className="h-5 w-5" />}
          label="Word Count"
          value={wordCount > 0 ? `${wordCount.toLocaleString()} words` : '—'}
        />
        <SummaryRow
          icon={<GraduationCap className="h-5 w-5" />}
          label="Study Level"
          value={studyLevel || '—'}
        />

        {/* Due Date */}
        <SummaryRow
          icon={<Calendar className="h-5 w-5" />}
          label="Due Date"
          value={dueDate ? new Date(dueDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : '—'}
        />

        {/* Module */}
        {module && (
          <SummaryRow
            icon={<BookOpen className="h-5 w-5" />}
            label="Module"
            value={module}
          />
        )}

        {/* Files */}
        {uploadedFiles.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attached Files ({uploadedFiles.length})
            </p>
            <ul className="space-y-1">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Instructions
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {instructions}
            </p>
          </div>
        )}

        {/* Price */}
        {calculatedPrice !== null && (
          <div className="pt-4 mt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <PoundSterling className="h-5 w-5" />
                <span className="font-medium">Estimated Total</span>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                £{calculatedPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onProceed}
          className="w-full py-3 px-6 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
        >
          Proceed to Payment
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          You'll be redirected to our secure payment gateway
        </p>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 dark:text-gray-500 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-900 dark:text-gray-100 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default OrderSummary;
