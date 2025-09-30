import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldsetProps {
  children: ReactNode;
  legend?: string;
  description?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function Fieldset({
  children,
  legend,
  description,
  error,
  className,
  disabled,
}: FieldsetProps) {
  const legendId = legend?.toLowerCase().replace(/\s+/g, '-');
  const descriptionId = description ? `${legendId}-description` : undefined;
  const errorId = error ? `${legendId}-error` : undefined;

  return (
    <fieldset
      className={cn(
        'space-y-4',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
      disabled={disabled}
      aria-describedby={
        error ? errorId : 
        description ? descriptionId : 
        undefined
      }
    >
      {legend && (
        <legend
          id={legendId}
          className="text-base font-medium text-gray-900"
        >
          {legend}
        </legend>
      )}
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-500"
        >
          {description}
        </p>
      )}
      <div className="space-y-4">
        {children}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-2 text-sm font-medium text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
