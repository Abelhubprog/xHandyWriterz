import { cn } from "@/lib/utils"
import React from "react"

// Box component
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export function Box({ as: Component = 'div', className, ...props }: BoxProps) {
  return <Component className={cn("", className)} {...props} />
}

// Flex component
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  gap?: string | number
}

export function Flex({ 
  direction = 'row', 
  align = 'start', 
  justify = 'start', 
  wrap = 'nowrap',
  gap,
  className, 
  ...props 
}: FlexProps) {
  const flexClasses = cn(
    "flex",
    {
      'flex-row': direction === 'row',
      'flex-col': direction === 'column',
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
      'items-baseline': align === 'baseline',
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
      'flex-wrap': wrap === 'wrap',
      'flex-nowrap': wrap === 'nowrap',
      'flex-wrap-reverse': wrap === 'wrap-reverse',
    },
    gap && `gap-${gap}`,
    className
  )
  
  return <div className={flexClasses} {...props} />
}

// Stack components
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string | number
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export function VStack({ gap = 4, align = 'start', className, ...props }: StackProps) {
  return (
    <div 
      className={cn(
        "flex flex-col",
        `gap-${gap}`,
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },
        className
      )} 
      {...props} 
    />
  )
}

export function HStack({ gap = 4, align = 'center', className, ...props }: StackProps) {
  return (
    <div 
      className={cn(
        "flex flex-row",
        `gap-${gap}`,
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },
        className
      )} 
      {...props} 
    />
  )
}

// Grid component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  templateColumns?: string
  gap?: string | number
}

export function Grid({ templateColumns, gap, className, ...props }: GridProps) {
  return (
    <div 
      className={cn("grid", gap && `gap-${gap}`, className)} 
      style={{ gridTemplateColumns: templateColumns }}
      {...props} 
    />
  )
}

export function GridItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

// Text component
interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  fontWeight?: 'normal' | 'medium' | 'bold'
  color?: string
}

export function Text({ fontSize = 'base', fontWeight = 'normal', color, className, ...props }: TextProps) {
  const textClasses = cn(
    {
      'text-xs': fontSize === 'xs',
      'text-sm': fontSize === 'sm',
      'text-base': fontSize === 'base',
      'text-lg': fontSize === 'lg',
      'text-xl': fontSize === 'xl',
      'text-2xl': fontSize === '2xl',
      'text-3xl': fontSize === '3xl',
      'font-normal': fontWeight === 'normal',
      'font-medium': fontWeight === 'medium',
      'font-bold': fontWeight === 'bold',
      'text-gray-500': color === 'gray.500',
      'text-red-500': color === 'red.500',
      'text-blue-500': color === 'blue.500',
      'text-green-500': color === 'green.500',
      'text-white': color === 'white',
    },
    className
  )
  
  return <span className={textClasses} {...props} />
}

// Heading component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function Heading({ size = 'md', as: Component = 'h2', className, ...props }: HeadingProps) {
  const headingClasses = cn(
    "font-semibold",
    {
      'text-sm': size === 'sm',
      'text-lg': size === 'md',
      'text-xl': size === 'lg',
      'text-2xl': size === 'xl',
    },
    className
  )
  
  return <Component className={headingClasses} {...props} />
}

// Spinner component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  thickness?: string
}

export function Spinner({ size = 'md', color = 'blue.500', thickness }: SpinnerProps) {
  const sizeClasses = {
    'sm': 'w-4 h-4',
    'md': 'w-6 h-6',
    'lg': 'w-8 h-8',
    'xl': 'w-12 h-12'
  }
  
  const colorClasses = {
    'blue.500': 'text-blue-500',
    'gray.500': 'text-gray-500',
    'green.500': 'text-green-500'
  }
  
  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-current", sizeClasses[size], colorClasses[color as keyof typeof colorClasses] || 'text-blue-500')} />
  )
}
