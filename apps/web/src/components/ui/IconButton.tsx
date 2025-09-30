import React, { ButtonHTMLAttributes } from 'react';
import AccessibleButton from './AccessibleButton';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /**
   * The icon to display
   */
  icon: React.ReactNode;
  
  /**
   * Accessible label for screen readers (required)
   */
  label: string;
  
  /**
   * Optional CSS variant
   */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  
  /**
   * Optional size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * IconButton Component
 * 
 * A specialized button component for icon-only buttons that ensures proper
 * accessibility with required labels.
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    primary: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    secondary: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    danger: 'bg-red-100 hover:bg-red-200 text-red-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700'
  };
  
  // Icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };
  
  // If icon is a Lucide icon, make sure it has the right size
  const iconWithSize = React.isValidElement(icon) 
    ? React.cloneElement(icon, { size: getIconSize() }) 
    : icon;
  
  return (
    <AccessibleButton
      icon={iconWithSize}
      ariaLabel={label}
      isRound={true}
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export default IconButton; 