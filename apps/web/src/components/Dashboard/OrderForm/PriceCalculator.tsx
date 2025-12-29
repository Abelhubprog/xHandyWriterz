/**
 * Price Calculator Component
 * Extracted from Dashboard - handles price calculation logic and display
 */

import React from 'react';
import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PriceFactors {
  wordCount: number;
  serviceId: string;
  studyLevel: string;
  dueDate: string;
}

/**
 * Calculate the price based on word count, service type, study level, and due date
 */
export function calculatePrice(factors: PriceFactors): number | null {
  const { wordCount, serviceId, studyLevel, dueDate } = factors;
  
  if (wordCount < 100 || wordCount > 100000) {
    return null;
  }

  const daysUntilDue = Math.ceil(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Use higher rate for dissertations, masters level, or urgent orders
  const useHigherRate =
    serviceId === 'dissertation' ||
    studyLevel === 'Level 7' ||
    daysUntilDue < 2;

  const baseRate = useHigherRate ? 18 : 15;
  return (wordCount / 275) * baseRate;
}

interface PriceDisplayProps {
  price: number | null;
  showBreakdown?: boolean;
  onToggleBreakdown?: () => void;
  className?: string;
}

export function PriceDisplay({ 
  price, 
  showBreakdown = false, 
  onToggleBreakdown,
  className 
}: PriceDisplayProps) {
  if (price === null) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Estimated Price:
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          £{price.toFixed(2)}
        </span>
        {onToggleBreakdown && (
          <button
            type="button"
            onClick={onToggleBreakdown}
            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            title="Show price calculation"
          >
            <Calculator className="h-4 w-4" />
          </button>
        )}
      </div>

      {showBreakdown && <PriceBreakdown />}
    </div>
  );
}

export function PriceBreakdown() {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
        Price Calculation
      </h4>
      <ul className="space-y-2 text-gray-600 dark:text-gray-300">
        <li className="flex items-start gap-2">
          <span className="text-amber-500">•</span>
          <span>£18/275 words for dissertations</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500">•</span>
          <span>£18/275 words for Level 7 (Masters) work</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500">•</span>
          <span>£18/275 words for urgent orders (&lt;2 days)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500">•</span>
          <span>£15/275 words for all other cases</span>
        </li>
      </ul>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Final price may vary based on specific requirements.
      </p>
    </div>
  );
}

interface PriceCalculatorProps {
  wordCount: number;
  serviceId: string;
  studyLevel: string;
  dueDate: string;
  className?: string;
}

export function PriceCalculator({
  wordCount,
  serviceId,
  studyLevel,
  dueDate,
  className,
}: PriceCalculatorProps) {
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  const price = React.useMemo(() => {
    if (!wordCount || !studyLevel || !dueDate || !serviceId) {
      return null;
    }
    return calculatePrice({ wordCount, serviceId, studyLevel, dueDate });
  }, [wordCount, serviceId, studyLevel, dueDate]);

  return (
    <PriceDisplay
      price={price}
      showBreakdown={showBreakdown}
      onToggleBreakdown={() => setShowBreakdown(!showBreakdown)}
      className={className}
    />
  );
}

export default PriceCalculator;
