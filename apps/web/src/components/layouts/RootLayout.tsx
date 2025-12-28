import { Outlet } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import { fetchNavDomains } from '@/lib/cms';

const fallbackLinks = [{ path: '/domains', label: 'All Domains' }];

export default function RootLayout() {
  // Fetch only domains marked for navigation display
  const { data: navDomains } = useQuery({
    queryKey: ['domains-nav'],
    queryFn: fetchNavDomains,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const serviceLinks = useMemo(() => {
    const items = (navDomains || []).map((domain) => ({
      path: `/domains/${domain.slug}`,
      label: domain.name,
    }));
    return items.length ? [{ path: '/domains', label: 'All Domains' }, ...items] : fallbackLinks;
  }, [navDomains]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar serviceLinks={serviceLinks} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
