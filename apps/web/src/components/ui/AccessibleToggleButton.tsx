import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface AccessibleToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-expanded' | 'aria-pressed'> {
  /**
   * The content of the button
   */
  children: ReactNode;
  
  /**
   * Whether the controlled element is expanded (for dropdown menus)
   */
  isExpanded?: boolean;
  
  /**
   * Whether the button is in a pressed state (for toggles)
   */
  isPressed?: boolean;
  
  /**
   * Accessible label
   */
  label: string;
  
  /**
   * CSS classes
   */
  className?: string;
  
  /**
   * Optional onClick handler
   */
  onClick?: () => void;
  
  /**
   * ID of the element controlled by this button (for aria-controls)
   */
  controlsId?: string;
  
  /**
   * Whether the button controls a popup (for aria-haspopup)
   */
  hasPopup?: boolean;
}

/**
 * AccessibleToggleButton
 * 
 * A button component that correctly handles ARIA attributes for expandable/toggleable elements
 * like dropdown menus, accordions, and tab panels.
 */
const AccessibleToggleButton: React.FC<AccessibleToggleButtonProps> = ({
  children,
  isExpanded,
  isPressed,
  label,
  className = '',
  onClick,
  controlsId,
  hasPopup,
  ...props
}) => {
  // Create the button element with different attributes based on props
  let buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    className,
    onClick,
    'aria-label': label,
    type: "button",
    ...props
  };

  // Add aria-controls if controlsId is provided
  if (controlsId) {
    buttonProps['aria-controls'] = controlsId;
  }

  // Manually create buttons with different hardcoded ARIA attributes based on state
  if (isExpanded !== undefined) {
    if (isExpanded) {
      buttonProps['aria-expanded'] = "true";
    } else {
      buttonProps['aria-expanded'] = "false";
    }
  }

  if (isPressed !== undefined) {
    if (isPressed) {
      buttonProps['aria-pressed'] = "true";
    } else {
      buttonProps['aria-pressed'] = "false";
    }
  }

  if (hasPopup) {
    buttonProps['aria-haspopup'] = "true";
  }
  
  return <button {...buttonProps}>{children}</button>;
};

export default AccessibleToggleButton; 