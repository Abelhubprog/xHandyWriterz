/**
 * Enhanced Button Component with improved interactions and loading states
 * 
 * @file src/components/ui/enhanced-button.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md active:shadow-sm',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500 text-gray-700 hover:text-gray-900',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 text-gray-600',
        link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-purple-500 shadow-lg hover:shadow-xl',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    rounded,
    loading, 
    loadingText,
    icon,
    iconPosition = 'left',
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, rounded }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText && <span>{loadingText}</span>}
          </div>
        )}
        
        {/* Content */}
        <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          
          {children && <span>{children}</span>}
          
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

// Button group component for related actions
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, orientation = 'horizontal', children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex rounded-lg border border-gray-200 bg-white shadow-sm',
      orientation === 'horizontal' ? 'flex-row' : 'flex-col',
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          className: cn(
            child.props.className,
            'border-none shadow-none rounded-none first:rounded-l-lg last:rounded-r-lg',
            orientation === 'vertical' && 'first:rounded-t-lg last:rounded-b-lg first:rounded-l-none last:rounded-r-none',
            index > 0 && orientation === 'horizontal' && 'border-l border-gray-200',
            index > 0 && orientation === 'vertical' && 'border-t border-gray-200'
          ),
        });
      }
      return child;
    })}
  </div>
));

ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonGroup, buttonVariants };