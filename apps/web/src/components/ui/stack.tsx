import React from 'react';
import { cn } from '@/lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number | string;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

function gapToClass(gap: StackProps['gap']) {
  if (gap === 1) return 'gap-1';
  if (gap === 2) return 'gap-2';
  if (gap === 3) return 'gap-3';
  if (gap === 4) return 'gap-4';
  if (gap === 6) return 'gap-6';
  if (gap === 8) return 'gap-8';
  return undefined;
}

function alignToClass(align: StackProps['align']) {
  if (align === 'start') return 'items-start';
  if (align === 'center') return 'items-center';
  if (align === 'end') return 'items-end';
  if (align === 'stretch') return 'items-stretch';
  return undefined;
}

function justifyToClass(justify: StackProps['justify']) {
  if (justify === 'start') return 'justify-start';
  if (justify === 'center') return 'justify-center';
  if (justify === 'end') return 'justify-end';
  if (justify === 'between') return 'justify-between';
  if (justify === 'around') return 'justify-around';
  if (justify === 'evenly') return 'justify-evenly';
  return undefined;
}

export function Stack({
  gap = 4,
  direction = 'column',
  align = 'start',
  justify,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gapToClass(gap),
        alignToClass(align),
        justifyToClass(justify),
        className
      )}
      {...props}
    />
  );
}

export function VStack({
  gap = 4,
  align = 'start',
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        gapToClass(gap),
        alignToClass(align),
        className
      )}
      {...props}
    />
  );
}

export function HStack({
  gap = 4,
  align = 'center',
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-row',
        gapToClass(gap),
        alignToClass(align),
        className
      )}
      {...props}
    />
  );
}
