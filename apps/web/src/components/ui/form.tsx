import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormControlProps {
  children: ReactNode;
  className?: string;
}

export function FormControl({ children, className }: FormControlProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {children}
    </div>
  );
}

interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, htmlFor, required, className }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium text-gray-700 flex items-center gap-1',
        className
      )}
    >
      {children}
      {required && (
        <span className="text-red-500">*</span>
      )}
    </label>
  );
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  className?: string;
}

export function FormDescription({ children, className, ...props }: FormDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  className?: string;
}

export function FormMessage({ children, className, ...props }: FormMessageProps) {
  return (
    <p className={cn('text-sm font-medium text-red-600', className)} {...props}>
      {children}
    </p>
  );
}

interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Composite Field wrapper used by form controls
export const Field = Object.assign(FormControl, { Label: FormLabel });

export { FormLabel as Label };

// Shadcn-like light shims to reduce type errors in forms
export const Form: React.FC<{ children?: ReactNode; className?: string } & React.FormHTMLAttributes<HTMLFormElement>> = ({ children, className, ...props }) => (
  <form className={cn('space-y-6', className)} {...props}>{children}</form>
);

export const FormItem: React.FC<{ children?: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('space-y-2', className)}>{children}</div>
);

export const FormField: React.FC<{ children?: ReactNode; className?: string; name?: string }> = ({ children, className }) => (
  <div className={cn('space-y-2', className)}>{children}</div>
);
