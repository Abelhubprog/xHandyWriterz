import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

/**
 * Base skeleton pulse animation
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

/**
 * Skeleton for text lines
 */
export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

/**
 * Skeleton for service/article cards
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-lg border border-gray-100 p-8 ${className}`}>
    <div className="animate-pulse space-y-4">
      {/* Icon placeholder */}
      <Skeleton className="h-16 w-16 rounded-2xl" />
      {/* Title */}
      <Skeleton className="h-6 w-3/4" />
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {/* Meta info */}
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* CTA button */}
      <Skeleton className="h-12 w-40 rounded-xl" />
    </div>
  </div>
);

/**
 * Skeleton for article list item
 */
export const SkeletonArticle: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
    <div className="animate-pulse space-y-4">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <Skeleton className="h-24 w-32 flex-shrink-0 rounded-xl" />
        {/* Content */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton grid for services hub
 */
export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/**
 * Skeleton for domain hero section
 */
export const SkeletonHero: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse space-y-6">
        <Skeleton className="h-12 w-1/2 mx-auto bg-white/20" />
        <Skeleton className="h-6 w-3/4 mx-auto bg-white/20" />
        <Skeleton className="h-6 w-2/3 mx-auto bg-white/20" />
      </div>
    </div>
  </div>
);

// ============================================================================
// LOADING STATES
// ============================================================================

/**
 * Full-page spinner overlay
 */
export const LoadingOverlay: React.FC<{
  message?: string;
  transparent?: boolean;
}> = ({ message = 'Loading...', transparent = false }) => (
  <div 
    className={`fixed inset-0 z-50 flex items-center justify-center ${
      transparent ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'
    }`}
  >
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

/**
 * Spinner component with size variants
 */
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

/**
 * Inline loading indicator
 */
export const LoadingInline: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Loading...', className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <Spinner size="sm" />
    <span className="text-gray-600">{message}</span>
  </div>
);

/**
 * Button loading state
 */
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  loading = false, 
  children, 
  className = '', 
  onClick,
  disabled = false,
  type = 'button'
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`relative inline-flex items-center justify-center gap-2 ${className} ${
      loading ? 'cursor-not-allowed opacity-75' : ''
    }`}
  >
    {loading && (
      <Spinner size="sm" className="absolute left-4" />
    )}
    <span className={loading ? 'opacity-0' : ''}>{children}</span>
  </button>
);

/**
 * Pulsing dots loader
 */
export const DotsLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex gap-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-2 w-2 rounded-full bg-blue-600"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

/**
 * Progress bar loader
 */
export const ProgressBar: React.FC<{
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}> = ({ progress, className = '', showPercentage = true }) => (
  <div className={className}>
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
    {showPercentage && (
      <p className="text-sm text-gray-600 mt-2 text-center">
        {Math.round(progress)}%
      </p>
    )}
  </div>
);

/**
 * Content placeholder with fade-in animation
 */
export const ContentPlaceholder: React.FC<{
  type?: 'card' | 'list' | 'hero' | 'grid';
  count?: number;
}> = ({ type = 'card', count = 1 }) => {
  const renderPlaceholder = () => {
    switch (type) {
      case 'hero':
        return <SkeletonHero />;
      case 'grid':
        return <SkeletonGrid count={count} />;
      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonArticle key={i} />
            ))}
          </div>
        );
      case 'card':
      default:
        return (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderPlaceholder()}
    </motion.div>
  );
};

/**
 * Lazy loading wrapper with suspense fallback
 */
export const LazyLoadWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <React.Suspense
    fallback={
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        </div>
      )
    }
  >
    {children}
  </React.Suspense>
);

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonArticle,
  SkeletonGrid,
  SkeletonHero,
  LoadingOverlay,
  Spinner,
  LoadingInline,
  LoadingButton,
  DotsLoader,
  ProgressBar,
  ContentPlaceholder,
  LazyLoadWrapper,
};
