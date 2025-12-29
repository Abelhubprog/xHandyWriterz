import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The icon to display inside the button
   */
  icon: ReactNode;
  
  /**
   * Optional text to display alongside the icon
   */
  text?: string;
  
  /**
   * Accessible label for screen readers (required for icon-only buttons)
   */
  ariaLabel: string;
  
  /**
   * CSS classes to apply to the button
   */
  className?: string;
  
  /**
   * Whether the button should be rendered with a round shape (for icon buttons)
   */
  isRound?: boolean;
  
  /**
   * Optional onClick handler
   */
  onClick?: () => void;
}

/**
 * AccessibleButton Component
 * 
 * A reusable button component that ensures proper accessibility for both
 * icon-only and text+icon buttons.
 */
const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  icon,
  text,
  ariaLabel,
  className = '',
  isRound = false,
  onClick,
  ...props
}) => {
  // Default styling classes
  const baseClasses = "flex items-center justify-center transition-colors";
  const roundedClasses = isRound ? "rounded-full" : "rounded";
  const spacingClasses = text ? "gap-2 px-3 py-2" : "p-2";
  
  // Combine all classes
  const combinedClasses = `${baseClasses} ${roundedClasses} ${spacingClasses} ${className}`;
  
  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
      {...props}
    >
      {icon}
      {text && <span>{text}</span>}
    </button>
  );
};

export default AccessibleButton; 