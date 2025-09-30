// src/components/mdx/Callout.tsx
import { Card, CardContent } from '@/components/ui/card';

interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error';
}

export function Callout({ children, type = 'info' }: CalloutProps) {
  const bgColor = type === 'warning' ? 'bg-amber-100 border-amber-400' : type === 'error' ? 'bg-red-100 border-red-400' : 'bg-blue-100 border-blue-400';

  return (
    <Card className={`border-l-4 ${bgColor} p-4`}>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}
