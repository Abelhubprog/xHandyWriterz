/**
 * Enhanced Input Components with better UX and validation states
 * 
 * @file src/components/ui/enhanced-input.tsx
 */

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        error: 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-900 placeholder:text-red-400',
        success: 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-green-900 placeholder:text-green-400',
        warning: 'border-yellow-300 bg-yellow-50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-yellow-900 placeholder:text-yellow-400',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    hint,
    error,
    success,
    leftIcon,
    rightIcon,
    loading,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine variant based on validation state
    const inputVariant = error ? 'error' : success ? 'success' : variant;
    
    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="h-4 w-4 text-gray-400">{leftIcon}</div>
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || type === 'password' || loading) && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            {...props}
          />
          
          {/* Right side icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            )}
            
            {type === 'password' && !loading && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            
            {rightIcon && !loading && type !== 'password' && (
              <div className="h-4 w-4 text-gray-400">{rightIcon}</div>
            )}
            
            {error && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            
            {success && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
        
        {/* Help text or error message */}
        {(hint || error || success) && (
          <div className="text-sm">
            {error && (
              <p className="text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size,
    label,
    hint,
    error,
    success,
    resize = 'vertical',
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const inputVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <textarea
          className={cn(
            inputVariants({ variant: inputVariant, size }),
            'min-h-[80px]',
            {
              'resize-none': resize === 'none',
              'resize-y': resize === 'vertical',
              'resize-x': resize === 'horizontal',
              'resize': resize === 'both',
            },
            className
          )}
          ref={ref}
          id={textareaId}
          {...props}
        />
        
        {/* Help text or error message */}
        {(hint || error || success) && (
          <div className="text-sm">
            {error && (
              <p className="text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants };