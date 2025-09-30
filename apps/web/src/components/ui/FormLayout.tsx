import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PageTitle } from './PageTitle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from './LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

interface FormLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  errorMessage?: string;
  onErrorRetry?: () => void;
  submitButton?: {
    text: string;
    icon?: ReactNode;
    isLoading?: boolean;
    isDisabled?: boolean;
  };
  onSubmit?: (e: React.FormEvent) => void;
  footerContent?: ReactNode;
  className?: string;
}

export function FormLayout({
  title,
  description,
  children,
  isLoading,
  loadingMessage = 'Loading...',
  isError,
  errorMessage = 'Something went wrong. Please try again later.',
  onErrorRetry,
  submitButton,
  onSubmit,
  footerContent,
  className
}: FormLayoutProps) {
  if (isError) {
    return (
      <div className="space-y-6">
        <PageTitle title={title} description={description} />
        <ErrorState
          title="Error"
          message={errorMessage}
          onRetry={onErrorRetry}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <PageTitle title={title} description={description} />

      {isLoading ? (
        <LoadingState message={loadingMessage} className="min-h-[400px]" />
      ) : (
        <Card>
          <form onSubmit={onSubmit} className="flex flex-col min-h-[400px]">
            <div className="flex-grow p-6 space-y-6">{children}</div>

            {(submitButton || footerContent) && (
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50">
                {footerContent}
                {submitButton && (
                  <Button
                    type="submit"
                    loading={submitButton.isLoading}
                    disabled={submitButton.isDisabled}
                    startIcon={submitButton.icon}
                  >
                    {submitButton.text}
                  </Button>
                )}
              </div>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}

export function FormSection({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

export function FormActions({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      {children}
    </div>
  );
}
