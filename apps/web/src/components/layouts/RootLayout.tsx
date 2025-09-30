import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';

const serviceLinks = [
  { path: '/services', label: 'All Services' },
  { path: '/d/adult-health', label: 'Adult Health' },
  { path: '/d/mental-health', label: 'Mental Health' },
  { path: '/d/child-nursing', label: 'Child Nursing' },
  { path: '/d/social-work', label: 'Social Work' },
  { path: '/d/ai', label: 'Artificial Intelligence' },
  { path: '/d/crypto', label: 'Crypto & Web3' },
];

export default function RootLayout() {
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
