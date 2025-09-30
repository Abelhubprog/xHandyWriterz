import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-gray-700',
        error: 'text-red-600',
        success: 'text-green-600',
      },
      required: {
        true: 'after:content-["*"] after:ml-0.5 after:text-red-500',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      required: false,
      size: 'default',
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  error?: boolean;
  success?: boolean;
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    variant, 
    required, 
    size,
    error, 
    success, 
    optional,
    children, 
    ...props 
  }, ref) => {
    // Determine variant based on error/success state
    const labelVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant: labelVariant, required, size, className }))}
        {...props}
      >
        {children}
        {optional && (
          <span className="ml-1 text-gray-400">(optional)</span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };
