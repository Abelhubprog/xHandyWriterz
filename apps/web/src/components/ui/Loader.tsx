import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';
type LoaderVariant = 'spinner' | 'dots' | 'border';
type LoaderColor = 'primary' | 'secondary' | 'white';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  color?: LoaderColor;
  className?: string;
  label?: string;
  showText?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className = '',
  label = 'Loading...',
  showText = false,
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  // Color mapping
  const colorClasses = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };
  
  // Spinner variant
  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <svg
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="loader"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {showText && <span className={`mt-2 text-sm ${colorClasses[color]}`}>{label}</span>}
      </div>
    );
  }
  
  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="flex space-x-2">
          <div className={`${sizeClasses[size] === 'h-4 w-4' ? 'h-1 w-1' : sizeClasses[size] === 'h-8 w-8' ? 'h-2 w-2' : 'h-3 w-3'} rounded-full ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`${sizeClasses[size] === 'h-4 w-4' ? 'h-1 w-1' : sizeClasses[size] === 'h-8 w-8' ? 'h-2 w-2' : 'h-3 w-3'} rounded-full ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`${sizeClasses[size] === 'h-4 w-4' ? 'h-1 w-1' : sizeClasses[size] === 'h-8 w-8' ? 'h-2 w-2' : 'h-3 w-3'} rounded-full ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
        {showText && <span className={`mt-2 text-sm ${colorClasses[color]}`}>{label}</span>}
      </div>
    );
  }
  
  // Border variant (default)
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 ${colorClasses[color]} border-t-current animate-spin`}
        data-testid="loader"
      ></div>
      {showText && <span className={`mt-2 text-sm ${colorClasses[color]}`}>{label}</span>}
    </div>
  );
};

export default Loader; 