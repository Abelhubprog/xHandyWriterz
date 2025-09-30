import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center w-full p-8', className)}>
      <LoadingSpinner size="lg" showText={true} label={message} />
    </div>
  );
}

export default LoadingState;
