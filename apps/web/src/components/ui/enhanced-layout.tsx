/**
 * Enhanced Layout Components for better responsive design and spacing
 * 
 * @file src/components/ui/enhanced-layout.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Container component with responsive max-widths
const containerVariants = cva(
  'mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      maxWidth: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-2 sm:px-4',
        default: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
      },
    },
    defaultVariants: {
      maxWidth: 'xl',
      padding: 'default',
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ maxWidth, padding }), className)}
      {...props}
    />
  )
);
Container.displayName = 'Container';

// Section component for page sections
const sectionVariants = cva(
  'relative',
  {
    variants: {
      spacing: {
        none: '',
        sm: 'py-8',
        default: 'py-12 sm:py-16',
        lg: 'py-16 sm:py-20',
        xl: 'py-20 sm:py-24',
      },
      background: {
        none: '',
        white: 'bg-white',
        gray: 'bg-gray-50',
        dark: 'bg-gray-900 text-white',
        gradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
      },
    },
    defaultVariants: {
      spacing: 'default',
      background: 'none',
    },
  }
);

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, background, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(sectionVariants({ spacing, background }), className)}
      {...props}
    />
  )
);
Section.displayName = 'Section';

// Stack component for vertical layouts
const stackVariants = cva(
  'flex flex-col',
  {
    variants: {
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        default: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
    },
    defaultVariants: {
      gap: 'default',
      align: 'stretch',
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap, align, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ gap, align }), className)}
      {...props}
    />
  )
);
Stack.displayName = 'Stack';

// Inline component for horizontal layouts
const inlineVariants = cva(
  'flex flex-row',
  {
    variants: {
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        default: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        true: 'flex-wrap',
        false: 'flex-nowrap',
      },
    },
    defaultVariants: {
      gap: 'default',
      align: 'center',
      justify: 'start',
      wrap: false,
    },
  }
);

export interface InlineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineVariants> {}

const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, gap, align, justify, wrap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(inlineVariants({ gap, align, justify, wrap }), className)}
      {...props}
    />
  )
);
Inline.displayName = 'Inline';

// Grid component for responsive grids
const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
        12: 'grid-cols-12',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        default: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12',
      },
    },
    defaultVariants: {
      cols: 1,
      gap: 'default',
    },
  }
);

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  )
);
Grid.displayName = 'Grid';

// Center component for centering content
const Center = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-center', className)}
    {...props}
  />
));
Center.displayName = 'Center';

export {
  Container,
  Section,
  Stack,
  Inline,
  Grid,
  Center,
  containerVariants,
  sectionVariants,
  stackVariants,
  inlineVariants,
  gridVariants,
};