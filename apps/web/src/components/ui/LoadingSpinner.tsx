import React from 'react';

// Define and export the LoadingState type
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'white';
  variant?: 'border' | 'dots' | 'grow' | 'pulse';
  thickness?: 'thin' | 'normal' | 'thick';
  speed?: 'slow' | 'normal' | 'fast';
  label?: string;
  showText?: boolean;
  fullscreen?: boolean;
  className?: string;
  textClassName?: string;
}

/**
 * LoadingSpinner - An enhanced loading spinner component
 * 
 * Features:
 * - Multiple variants (border spinner, growing dots, pulse)
 * - Configurable sizes, colors, thickness, and animation speed
 * - Accessibility improvements
 * - Optional loading text
 * - Fullscreen overlay option
 * 
 * @param props - Component props
 * @returns React component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'border',
  thickness = 'normal',
  speed = 'normal',
  label = 'Loading...',
  showText = false,
  fullscreen = false,
  className = '',
  textClassName = ''
}) => {
  // Size mappings
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-24 w-24'
  };
  
  // Color mappings
  const colorClasses = {
    primary: 'border-blue-600 border-t-blue-100',
    secondary: 'border-purple-600 border-t-purple-100',
    success: 'border-green-600 border-t-green-100',
    danger: 'border-red-600 border-t-red-100',
    warning: 'border-yellow-500 border-t-yellow-100',
    info: 'border-cyan-500 border-t-cyan-100',
    light: 'border-gray-300 border-t-gray-100',
    dark: 'border-gray-800 border-t-gray-300',
    white: 'border-white border-t-gray-400'
  };

  // Dot color mappings
  const dotColorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-purple-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-500',
    light: 'bg-gray-300',
    dark: 'bg-gray-800',
    white: 'bg-white'
  };
  
  // Thickness mappings
  const thicknessClasses = {
    thin: 'border-2',
    normal: 'border-3',
    thick: 'border-4'
  };

  // Speed mappings
  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast'
  };

  // Dot animation speed
  const dotSpeedClasses = {
    slow: 'animate-pulse-slow',
    normal: 'animate-pulse',
    fast: 'animate-pulse-fast'
  };

  // Grow animation speed
  const growSpeedClasses = {
    slow: 'animate-grow-slow',
    normal: 'animate-grow',
    fast: 'animate-grow-fast'
  };

  // Main spinner container class
  const containerClass = fullscreen 
    ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50' 
    : 'flex items-center justify-center';

  // Text size mapping based on spinner size
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  // Render the appropriate spinner based on variant
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`
                  ${dotColorClasses[color]} 
                  ${sizeClasses[size] === 'h-24 w-24' ? 'h-4 w-4' : 'h-2 w-2'}
                  rounded-full
                  ${dotSpeedClasses[speed]}
                  opacity-0
                `}
                style={{ animationDelay: `${(i - 1) * 0.15}s` }}
              />
            ))}
          </div>
        );

      case 'grow':
        return (
          <div 
            className={`
              ${sizeClasses[size]} 
              ${dotColorClasses[color]} 
              rounded-full
              ${growSpeedClasses[speed]}
            `}
          />
        );

      case 'pulse':
        return (
          <div 
            className={`
              ${sizeClasses[size]} 
              ${dotColorClasses[color]} 
              rounded-full
              animate-ping opacity-75
            `}
          />
        );

      case 'border':
      default:
        return (
          <div 
            className={`
              ${sizeClasses[size]} 
              ${thicknessClasses[thickness]} 
              ${colorClasses[color]} 
              rounded-full
              ${speedClasses[speed]}
            `}
          />
        );
    }
  };

  return (
    <div className={`${containerClass} ${className}`}>
      <div 
        className="flex flex-col items-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {renderSpinner()}
        
        {showText && (
          <span className={`mt-2 ${textSizeClasses[size]} ${textClassName}`} aria-hidden="true">
            {label}
          </span>
        )}
        
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
};

// Add these animations to your global CSS file
// @keyframes spin-slow {
//  to { transform: rotate(360deg); }
// }

// Ensure these are in your tailwind.config.js file
// extend: {
//   animation: {
//     'spin-slow': 'spin-slow 2s linear infinite',
//     'spin-fast': 'spin-fast 800ms linear infinite',
//     'grow': 'grow 1.5s ease-in-out infinite',
//     'grow-slow': 'grow-slow 2s ease-in-out infinite',
//     'grow-fast': 'grow-fast 1s ease-in-out infinite',
//   },
// }

// Also add custom border width if needed
// borderWidth: {
//   '3': '3px',
// },

// For compatibility with existing code
export default LoadingSpinner;