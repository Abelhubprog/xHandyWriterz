import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] p-5 bg-gray-50">
      <div className="flex space-x-2 animate-pulse">
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full ${className}`}></div>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full ${className}`}></div>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full ${className}`}></div>
      </div>
    </div>
  );
}
