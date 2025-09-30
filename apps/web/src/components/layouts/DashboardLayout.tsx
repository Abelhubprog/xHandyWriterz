import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Settings,
  LogOut,
  User,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import { toast } from 'react-hot-toast';
import { useUser, useClerk } from '@clerk/clerk-react';
import { performLogout } from '@/utils/authLogout';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: FileText },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await performLogout(signOut);
    } catch (err) {
      console.error('Logout failed', err);
      toast.error('Logout failed. Redirecting...');
      setTimeout(() => window.location.href = '/', 800);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-16 sm:pb-0">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-500 focus:outline-none"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 ${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-slate-900 shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-2 border-b dark:border-slate-800 overflow-hidden">
            <Link to="/">
              <HandyWriterzLogo className="py-2" withText={!isSidebarCollapsed} size="sm" />
            </Link>
          </div>

          <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'} pt-6 pb-4 space-y-1 overflow-y-auto`}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center ${isSidebarCollapsed ? 'px-2 justify-center' : 'px-4'} py-3 rounded-lg group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`${isSidebarCollapsed ? '' : 'mr-3'} h-5 w-5 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-600 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="flex-1">{item.name}</span>}
                  {!isSidebarCollapsed && isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col px-4 py-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}>
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70 border-b dark:border-slate-800">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              {(() => {
                const title = navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard';
                if (location.pathname === '/dashboard') return null;
                return (
                  <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h1>
                );
              })()}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=2563eb&color=fff`}
                  alt={user?.fullName || 'User'}
                />
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.fullName || user?.primaryEmailAddress?.emailAddress || user?.username || 'User'}</div>
                </div>
              </div>
              <div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 disabled:opacity-50"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto hw-shell">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Desktop collapse pill */}
      <button
        type="button"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
        className="hidden lg:flex fixed top-20 left-0 z-50 h-8 w-8 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 hover:bg-gray-50"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {/* Mobile bottom navigation + FAB */}
      <MobileBottomNav />
      <MobileFab />
    </div>
  );
};

// Mobile bottom navigation and floating actions could be extracted, but keep inline for minimal change
export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const items = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/orders', label: 'Orders', icon: FileText },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href;
          return (
            <li key={href} className="py-2">
              <Link
                to={href}
                className={`flex flex-col items-center gap-1 text-xs ${active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const MobileFab: React.FC = () => (
  <Link
    to="/dashboard/documents"
    className="lg:hidden fixed bottom-20 right-4 sm:right-6 z-40 h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700"
    aria-label="New Order"
  >
    <FileText className="h-5 w-5" />
  </Link>
);


export default DashboardLayout;





