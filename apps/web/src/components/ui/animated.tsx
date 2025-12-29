import React, { ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export type AnimationVariant = 
  | 'fade-in'
  | 'bounce-in'
  | 'slide-up'
  | 'fade-up'
  | 'slide-in-right'
  | 'slide-in-left'
  | 'scale-in'
  | 'rotate-in';

type AnimatedOwnProps<T extends ElementType = 'div'> = {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
  as?: T;
  duration?: 'fast' | 'normal' | 'slow';
  onAnimationComplete?: () => void;
};

export type AnimatedProps<T extends ElementType = 'div'> = AnimatedOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof AnimatedOwnProps<T>>;

const durationClasses = {
  fast: 'duration-200',
  normal: 'duration-300',
  slow: 'duration-500'
};

/**
 * A component that wraps its children with Tailwind animations
 */
export function Animated<T extends ElementType = 'div'>({
  children,
  variant = 'fade-in',
  delay = 0,
  duration = 'normal',
  className,
  as,
  onAnimationComplete,
  ...props
}: AnimatedProps<T>): JSX.Element {
  const Component = as || 'div';
  
  const handleAnimationEnd = (event: React.AnimationEvent) => {
    if (event.target === event.currentTarget) {
      onAnimationComplete?.();
    }
  };

  return (
    <Component
      className={cn(
        `animate-${variant}`,
        durationClasses[duration],
        delay > 0 && `delay-[${delay}ms]`,
        'animate-ready',
        className
      )}
      onAnimationEnd={onAnimationComplete ? handleAnimationEnd : undefined}
      {...(props as any)}
    >
      {children}
    </Component>
  );
}

type StaggerContainerOwnProps<T extends ElementType = 'div'> = {
  children: React.ReactNode;
  staggerDelay?: number;
  as?: T;
  childClassName?: string;
  onComplete?: () => void;
  className?: string;
};

export type StaggerContainerProps<T extends ElementType = 'div'> = StaggerContainerOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof StaggerContainerOwnProps<T>>;

/**
 * A container that staggers the animation of its Animated children
 */
export function StaggerContainer<T extends ElementType = 'div'>({
  children,
  staggerDelay = 100,
  className,
  childClassName,
  as,
  onComplete,
  ...props
}: StaggerContainerProps<T>): JSX.Element {
  const Component = as || 'div';
  const childrenArray = React.Children.toArray(children);
  const [completedCount, setCompletedCount] = React.useState(0);

  React.useEffect(() => {
    if (completedCount === childrenArray.length) {
      onComplete?.();
    }
  }, [completedCount, childrenArray.length, onComplete]);

  const handleChildComplete = () => {
    setCompletedCount(prev => prev + 1);
  };
  
  return (
    <Component className={className} {...(props as any)}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child as React.ReactElement<any>, {
          delay: index * staggerDelay,
          className: cn((child as React.ReactElement<any>).props.className, childClassName),
          onAnimationComplete: () => {
            handleChildComplete();
            (child as React.ReactElement<any>).props.onAnimationComplete?.();
          },
          ...(child as React.ReactElement<any>).props
        });
      })}
    </Component>
  );
}

// Preset configurations for common animation patterns
export const presets = {
  slideFromLeft: { variant: 'slide-in-left' as const },
  slideFromRight: { variant: 'slide-in-right' as const },
  fadeUp: { variant: 'fade-up' as const },
  bounceIn: { variant: 'bounce-in' as const },
  scaleIn: { variant: 'scale-in' as const },
  rotateIn: { variant: 'rotate-in' as const },
  
  // Combined effects
  heroEntry: {
    variant: 'slide-up' as const,
    duration: 'slow' as const,
    className: 'opacity-0'
  },
  listItem: {
    variant: 'fade-up' as const,
    duration: 'fast' as const,
    className: 'opacity-0'
  },
  modalEntry: {
    variant: 'scale-in' as const,
    duration: 'normal' as const,
    className: 'opacity-0'
  }
} as const;
