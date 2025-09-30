/**
 * src/components/common/Loader.tsx
 * Enhanced Loader component that uses the Spinner from UI directory
 */

import React from 'react';
import { Spinner } from '../ui/spinner';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'white';
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
      <Spinner size={size} color={color} />
      {showText && (
        <span className="ml-2 text-sm font-medium">{label}</span>
      )}
    </div>
  );
};

export default Loader; 