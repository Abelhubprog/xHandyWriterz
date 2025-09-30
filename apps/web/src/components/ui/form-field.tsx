import React from 'react';
import { cn } from '@/lib/utils';
import { Input, type InputProps } from './input';
import { Label } from './label';
import { Textarea, type TextareaProps } from './textarea';
import type { BaseFieldProps } from './types';

// Common props for both input and textarea fields
interface CommonFieldProps extends BaseFieldProps {
  id: string;
  label?: string;
  description?: string;
  className?: string;
}

// Props specific to input fields
interface InputConfig {
  multiline?: false;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: InputProps['size'];
}

// Props specific to textarea fields
interface TextareaConfig {
  multiline: true;
  rows?: number;
}

// Combined prop types for input and textarea
type InputFieldProps = CommonFieldProps & InputConfig & Omit<InputProps, keyof (CommonFieldProps & InputConfig)>;
type TextareaFieldProps = CommonFieldProps & TextareaConfig & Omit<TextareaProps, keyof (CommonFieldProps & TextareaConfig)>;

export type FormFieldProps = InputFieldProps | TextareaFieldProps;

// Type guard to check if props are for textarea
function isTextareaProps(props: FormFieldProps): props is TextareaFieldProps {
  return props.multiline === true;
}

export const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>((props, ref) => {
  const {
    id,
    label,
    error,
    success,
    optional,
    required,
    className,
    description,
    multiline,
    ...restProps
  } = props;

  // Common props for both input and textarea
  const commonProps = {
    id,
    error,
    success,
    required,
    'aria-describedby': error ? `${id}-error` : description ? `${id}-description` : undefined,
    'aria-invalid': !!error,
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label
          htmlFor={id}
          required={required}
          optional={optional}
          error={!!error}
          success={!!success}
        >
          {label}
        </Label>
      )}

      {description && (
        <p id={`${id}-description`} className="text-sm text-gray-500">
          {description}
        </p>
      )}

      {isTextareaProps(props) ? (
        <Textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...commonProps}
          rows={props.rows}
          {...(restProps as Omit<TextareaProps, keyof typeof commonProps | 'rows'>)}
        />
      ) : (
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          {...commonProps}
          type={props.type}
          size={props.size}
          {...(restProps as Omit<InputProps, keyof typeof commonProps | 'type' | 'size'>)}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
