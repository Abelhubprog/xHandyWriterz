import { cn } from '@/lib/utils';
import { forwardRef, ElementType, ComponentPropsWithoutRef } from 'react';

type BoxProps<T extends ElementType = 'div'> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ as, className, ...props }, ref) => {
    const Component = as || 'div';
    return (
      <Component
        ref={ref}
        className={cn('', className)}
        {...(props as any)}
      />
    );
  }
);

Box.displayName = 'Box';
