/**
 * src/components/common/Button.tsx
 * Re-exports the Button component from UI directory
 */

import React from 'react';
import { Button as UIButton, ButtonProps as UIButtonProps, buttonVariants } from '../ui/button';

interface ButtonProps extends UIButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'default', 
  size = 'default',
  type = 'button',
  disabled = false,
  loading = false,
  loadingText,
  onClick,
  children,
  ...props 
}) => {
  return (
    <UIButton
      className={className}
      variant={variant}
      size={size}
      type={type}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      onClick={onClick}
      {...props}
    >
      {children}
    </UIButton>
  );
};

export type { ButtonProps };
export { buttonVariants };
export default Button; 