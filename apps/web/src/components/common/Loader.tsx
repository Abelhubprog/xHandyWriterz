/**
 * src/components/common/Loader.tsx
 * Loader wrapper around the design-system LoadingSpinner
 */

import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'white';
  label?: string;
  showText?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  className = '', 
  color = 'primary',
  label = 'Loading...',
  showText = false
}) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <LoadingSpinner
        size={size}
        color={color}
        label={label}
        showText={showText}
      />
    </div>
  );
};

export default Loader; 