import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs() {
  const router = useRouter();

  const breadcrumbs = useMemo(() => {
    const paths = router.asPath.split('/').filter(Boolean);
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
      if (path.startsWith('[') && path.endsWith(']')) {
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
  }, [router.asPath]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (isLast) {
          return (
            <Typography
              key={item.label}
              color="text.primary"
              sx={{ fontWeight: 'medium' }}
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={item.label}
            component={NextLink}
            href={item.href || '#'}
            underline="hover"
            color="inherit"
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
