import * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Field component with Label sub-component
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
);
FieldLabel.displayName = 'Field.Label';

interface FieldComponent extends React.FC<FieldProps> {
  Label: typeof FieldLabel;
}

const Field: FieldComponent = Object.assign(
  forwardRef<HTMLDivElement, FieldProps>(
    ({ className, children, ...props }, ref) => (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    )
  ) as React.FC<FieldProps>,
  { Label: FieldLabel }
);

// FormDescription component
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  )
);
FormDescription.displayName = 'FormDescription';

// FormMessage component
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    
    return (
      <p
        ref={ref}
        className={cn('text-sm font-medium text-red-500', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

// FormLabel component (alias for Field.Label for compatibility)
const FormLabel = FieldLabel;
FormLabel.displayName = 'FormLabel';

// Form component wrapper
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => (
    <form ref={ref} className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  )
);
Form.displayName = 'Form';

// FormItem component
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
);
FormItem.displayName = 'FormItem';

// FormControl component (wrapper for form inputs)
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
);
FormControl.displayName = 'FormControl';

export {
  Field,
  FieldLabel,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
