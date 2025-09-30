import { AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Error',
  message = 'Something went wrong. Please try again later.',
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn(
      'bg-red-50 border border-red-200 rounded-xl p-6',
      'flex flex-col items-center text-center',
      className
    )}>
      <AlertCircle className="h-8 w-8 text-red-600 mb-3" />
      <h3 className="text-lg font-medium text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-600 mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
  onClick?: () => void;
}

export function InlineError({ message, className, onClick }: InlineErrorProps) {
  return (
    <div 
      className={cn(
        'flex items-center gap-2 text-red-600',
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <ErrorState
        title="Unexpected Error"
        message={error.message}
        onRetry={resetErrorBoundary}
      />
    </div>
  );
}
