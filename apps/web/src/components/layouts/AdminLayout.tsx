import React, { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Send,
  MessageSquare,
  Upload,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import HandyWriterzLogo from "@/components/HandyWriterzLogo";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { performLogout } from "@/utils/authLogout";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Publish Queue", href: "/admin/publish", icon: Send },
  { label: "Messaging", href: "/admin/messaging", icon: MessageSquare },
  { label: "Documents", href: "/admin/media/upload", icon: Upload },
  { label: "Turnitin", href: "/admin/turnitin-reports", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const formatUrl = (base?: string, suffix?: string) => {
  if (!base) return null;
  const trimmed = base.replace(/\/$/, "");
  if (!suffix) return trimmed;
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${trimmed}${normalized}`;
};

const cmsAdminUrl = formatUrl(import.meta.env.VITE_CMS_URL, "/admin");
const mattermostUrl = formatUrl(import.meta.env.VITE_MATTERMOST_URL);

const quickLinks = [
  cmsAdminUrl && { label: "Open Strapi", href: cmsAdminUrl },
  mattermostUrl && { label: "Open Mattermost", href: mattermostUrl },
].filter(Boolean) as Array<{ label: string; href: string }>;

const AdminLayout: React.FC = () => {
  const { user, isLoaded, isEditor } = useAuth();
  const clerk = useClerk();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate("/sign-in", { replace: true, state: { from: location.pathname } });
      return;
    }
    if (!isEditor) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, user, isEditor, navigate, location.pathname]);

  const activePath = useMemo(() => location.pathname.replace(/\/$/, ""), [location.pathname]);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await performLogout(clerk.signOut);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950/60">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !isEditor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-16 lg:pb-0">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setSidebarOpen((value) => !value)}
          className="p-2 rounded-md bg-white shadow-md text-gray-500 focus:outline-none"
          aria-label={sidebarOpen ? "Close admin navigation" : "Open admin navigation"}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out border-r border-slate-200/40 dark:border-slate-800",
          sidebarCollapsed ? "w-16" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-2 border-b dark:border-slate-800">
            <Link to="/">
              <HandyWriterzLogo withText={!sidebarCollapsed} size="sm" className="py-2" />
            </Link>
          </div>

          <nav className={cn("flex-1 pt-6 pb-4 space-y-1 overflow-y-auto", sidebarCollapsed ? "px-2" : "px-4")}>
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = activePath === href || (href !== "/admin" && activePath.startsWith(href));
              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    sidebarCollapsed ? "px-2 justify-center py-3" : "px-4 py-3",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn("h-5 w-5", sidebarCollapsed ? "" : "mr-3")} />
                  {!sidebarCollapsed && <span className="flex-1 text-sm font-medium">{label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className={cn("h-5 w-5", sidebarCollapsed ? "mx-auto" : "mr-3")} />
              {!sidebarCollapsed && <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hidden lg:flex fixed top-20 left-0 z-50 h-8 w-8 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 hover:bg-gray-50"
        onClick={() => setSidebarCollapsed((value) => !value)}
        aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-16" : "lg:pl-72")}>    
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/80 backdrop-blur border-b dark:border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">HandyWriterz Admin</p>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {navItems.find((item) => activePath === item.href)?.label || "Overview"}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {quickLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
