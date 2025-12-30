import { cn } from '@/lib/utils';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'span' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav' | 'aside';
}

export function Box({ as: Component = 'div', className, ...props }: BoxProps) {
  return (
    <Component 
      className={cn('', className)}
      {...props}
    />
  );
}
