import React from 'react';
import { cn } from '@/utils/cn';

// Instead of importing from local files, import from the barrel file
import { Input, InputProps } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Textarea } from '@/components/ui/index';

interface BaseFieldProps {
  id: string;
  label?: string;
  error?: string;
  success?: string;
  optional?: boolean;
  required?: boolean;
  className?: string;
  description?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  multiline?: false;
  size?: 'default' | 'sm' | 'lg';
}

interface TextareaFieldProps extends BaseFieldProps {
  type?: never;
  multiline: true;
  rows?: number;
}

type FormFieldProps = (InputFieldProps | TextareaFieldProps) &
  Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'type' | 'size'>;

export const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({
    id,
    label,
    error,
    success,
    optional,
    required,
    className,
    description,
    multiline,
    type = 'text',
    size = 'default',
    ...props
  }, ref) => {
    // Determine whether to show error styling
    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label
            htmlFor={id}
            required={required}
            optional={optional}
            error={hasError}
            success={hasSuccess}
          >
            {label}
          </Label>
        )}

        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        {multiline ? (
          <Textarea
            id={id}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            error={error}
            success={success}
            required={required}
            {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          />
        ) : (
          <Input
            id={id}
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            error={error}
            success={success}
            required={required}
            size={size}
            {...props as React.InputHTMLAttributes<HTMLInputElement>}
          />
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export type { FormFieldProps };
