import { cn } from '@/lib/utils';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export function Box({ as: Component = 'div', className, ...props }: BoxProps) {
  return (
    <Component 
      className={cn('', className)}
      {...props}
    />
  );
}
