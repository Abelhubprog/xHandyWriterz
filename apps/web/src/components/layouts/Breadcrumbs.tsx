import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Skip dynamic route parameters
      if (path.startsWith(':')) {
        return;
      }

      items.push({
        label,
        href: currentPath
      });
    });

    // Remove href from last item to show it as text
    if (items.length > 0) {
      items[items.length - 1] = {
        label: items[items.length - 1].label
      };
    }

    return items;
  }, [location.pathname]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              {isLast ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <Link
                  to={item.href || '/'}
                  className={cn(
                    "text-gray-500 hover:text-gray-700 transition-colors",
                    "flex items-center gap-1"
                  )}
                >
                  {isFirst && <Home className="h-4 w-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}