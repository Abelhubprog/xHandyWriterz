import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number | string;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
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
        {
          'gap-1': gap === 1,
          'gap-2': gap === 2,
          'gap-3': gap === 3,
          'gap-4': gap === 4,
          'gap-6': gap === 6,
          'gap-8': gap === 8,
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },
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
        {
          'gap-1': gap === 1,
          'gap-2': gap === 2,
          'gap-3': gap === 3,
          'gap-4': gap === 4,
          'gap-6': gap === 6,
          'gap-8': gap === 8,
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },
        className
      )}
      {...props}
    />
  );
}
