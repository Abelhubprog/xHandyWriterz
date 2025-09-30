/**
 * Enhanced Loading Components for better user feedback
 * 
 * @file src/components/ui/enhanced-loading.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-blue-600',
        white: 'text-white',
        gray: 'text-gray-400',
        current: 'text-current',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size, variant }))} />
    </div>
  )
);
Spinner.displayName = 'Spinner';

// Loading overlay component
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  spinnerSize?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  backdrop?: 'light' | 'dark' | 'blur';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  spinnerSize = 'lg',
  backdrop = 'light',
}) => {
  const backdropClasses = {
    light: 'bg-white/80',
    dark: 'bg-black/50',
    blur: 'bg-white/80 backdrop-blur-sm',
  };

  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center z-50',
          backdropClasses[backdrop]
        )}>
          <Spinner size={spinnerSize} />
          {message && (
            <p className="mt-3 text-sm text-gray-600 font-medium">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Skeleton component for content loading
const skeletonVariants = cva(
  'animate-pulse bg-gray-200 rounded',
  {
    variants: {
      variant: {
        default: 'bg-gray-200',
        light: 'bg-gray-100',
        card: 'bg-gray-200 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  lines?: number;
  width?: string;
  height?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, lines = 1, width, height, style, ...props }, ref) => {
    if (lines === 1) {
      return (
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant }), className)}
          style={{
            width: width || '100%',
            height: height || '1rem',
            ...style,
          }}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(skeletonVariants({ variant }))}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              height: height || '1rem',
            }}
          />
        ))}
      </div>
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Page loading component
export interface PageLoadingProps {
  message?: string;
  description?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  description,
}) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
    <Spinner size="xl" />
    <div className="text-center space-y-2">
      <h3 className="text-lg font-medium text-gray-900">{message}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      )}
    </div>
  </div>
);

// Button loading state
export interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  spinnerSize?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText,
  spinnerSize = 'sm',
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="flex items-center gap-2">
      <Spinner size={spinnerSize} variant="current" />
      {loadingText && <span>{loadingText}</span>}
    </div>
  );
};

// Content skeleton for cards
const ContentSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-3">
    <Skeleton height="1.5rem" width="75%" />
    <Skeleton lines={lines} />
    <div className="flex gap-2 pt-2">
      <Skeleton height="2rem" width="5rem" />
      <Skeleton height="2rem" width="5rem" />
    </div>
  </div>
);

// List skeleton
const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <Skeleton height="3rem" width="3rem" variant="card" />
        <div className="flex-1 space-y-2">
          <Skeleton height="1rem" width="60%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export {
  Spinner,
  LoadingOverlay,
  Skeleton,
  PageLoading,
  ButtonLoading,
  ContentSkeleton,
  ListSkeleton,
  spinnerVariants,
  skeletonVariants,
};