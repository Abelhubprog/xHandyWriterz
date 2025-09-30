import React from 'react';
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

export interface AnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  duration?: 'fast' | 'normal' | 'slow';
  onAnimationComplete?: () => void;
}

const durationClasses = {
  fast: 'duration-200',
  normal: 'duration-300',
  slow: 'duration-500'
};

/**
 * A component that wraps its children with Tailwind animations
 */
export function Animated({
  children,
  variant = 'fade-in',
  delay = 0,
  duration = 'normal',
  className,
  as: Component = 'div',
  onAnimationComplete,
  ...props
}: AnimatedProps): JSX.Element {
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
      {...props}
    >
      {children}
    </Component>
  );
}

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number;
  as?: keyof JSX.IntrinsicElements;
  childClassName?: string;
  onComplete?: () => void;
}

/**
 * A container that staggers the animation of its Animated children
 */
export function StaggerContainer({
  children,
  staggerDelay = 100,
  className,
  childClassName,
  as: Component = 'div',
  onComplete,
  ...props
}: StaggerContainerProps): JSX.Element {
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
    <Component className={className} {...props}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          delay: index * staggerDelay,
          className: cn(child.props.className, childClassName),
          onAnimationComplete: () => {
            handleChildComplete();
            child.props.onAnimationComplete?.();
          },
          ...child.props
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
