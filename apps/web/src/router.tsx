import React from 'react';
import { createBrowserRouter, Navigate, RouteObject, useParams } from 'react-router-dom';
import RootLayout from './components/layouts/RootLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Legacy /d/:domain redirect to /domains/:domain for backward compatibility
function LegacyDomainRedirect() {
  const { domain, '*': rest } = useParams();
  const newPath = rest ? `/domains/${domain}/${rest}` : `/domains/${domain}`;
  return <Navigate to={newPath} replace />;
}

// Pages - New CMS-integrated pages
const HomepageNew = React.lazy(() => import('./pages/HomepageNew'));
const ArticlePage = React.lazy(() => import('./pages/ArticlePage'));
const ArticlesPage = React.lazy(() => import('./pages/ArticlesPage'));
const AuthorsPage = React.lazy(() => import('./pages/AuthorsPage'));
const AuthorPage = React.lazy(() => import('./pages/AuthorPage'));
const ServicePageNew = React.lazy(() => import('./pages/ServicePage'));
const X402DocsPage = React.lazy(() => import('./pages/docs/X402DocsPage'));
const ApiDocsPage = React.lazy(() => import('./pages/docs/ApiDocsPage'));

// Domain pages - CMS-driven domain landing pages
const DomainsHub = React.lazy(() => import('./pages/domains/DomainsHub'));
const DomainPage = React.lazy(() => import('./pages/domains/DomainPage'));

// Legacy pages (keeping for fallback)
const HomepageLegacy = React.lazy(() => import('./pages/Homepage'));
const LearningHub = React.lazy(() => import('./pages/learning-hub'));
const NotFound = React.lazy(() => import('./pages/not-found'));
const AdminLogin = React.lazy(() => import('./pages/auth/admin-login'));
const Login = React.lazy(() => import('./pages/auth/login'));
const SignUp = React.lazy(() => import('./pages/auth/SignUp'));
const PaymentSuccess = React.lazy(() => import('./pages/payment/success'));
const PaymentCancel = React.lazy(() => import('./pages/payment/cancel'));
const PaymentFailure = React.lazy(() => import('./pages/payment/failure'));
const PaymentOptions = React.lazy(() => import('./pages/payment/options'));
const PaymentGateway = React.lazy(() => import('./pages/payment/PaymentGateway'));
const TurnitinCheck = React.lazy(() => import('./pages/turnitin-check'));
const TurnitinSubmission = React.lazy(() => import('./pages/TurnitinSubmission'));
const ServicesPage = React.lazy(() => import('./pages/services/ServicesPage'));
const ServicesHub = React.lazy(() => import('./pages/services/ServicesHub'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const Support = React.lazy(() => import('./pages/Support'));
// Dashboard pages
const DashboardWrapper = React.lazy(() => import('./components/Dashboard/DashboardWrapper'));
const Orders = React.lazy(() => import('./pages/dashboard/Orders'));
const NewOrder = React.lazy(() => import('./pages/dashboard/NewOrder'));
const Messages = React.lazy(() => import('./pages/dashboard/Messages'));
const EmailAdmin = React.lazy(() => import('./pages/dashboard/EmailAdmin'));
const UserMessaging = React.lazy(() => import('./pages/dashboard/UserMessaging'));
const Profile = React.lazy(() => import('./pages/dashboard/Profile'));
const Settings = React.lazy(() => import('./pages/dashboard/Settings'));
const DocumentsUpload = React.lazy(() => import('./pages/dashboard/DocumentsUpload'));

// Enterprise Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ArticleEditor = React.lazy(() => import('./pages/admin/ArticleEditor'));
const PreviewPage = React.lazy(() => import('./pages/admin/PreviewPage'));
const ContentPublisher = React.lazy(() => import('./pages/admin/ContentPublisher'));
const AdminMessaging = React.lazy(() => import('./pages/admin/AdminMessaging'));
const TurnitinReports = React.lazy(() => import('./pages/admin/TurnitinReports'));

// Route contract:
// - '/' homepage now uses new CMS-integrated HomepageNew
// - '/learning-hub' entry to the legacy content site (to be replaced)
// - '/services/*' served by Strapi via the web app
// - '/articles/*' new article pages with CMS integration
// - '/domains' hub listing all published domains
// - '/domains/:slug' CMS-driven domain landing pages (Adult Nursing, AI, Crypto, etc.)
// - '/domains/:slug/articles/:articleSlug' domain article
// - '/domains/:slug/services/:serviceSlug' domain service

const childRoutes: RouteObject[] = [
  { index: true, element: <HomepageNew /> },
  { path: 'legacy', element: <HomepageLegacy /> }, // Keep legacy homepage accessible
  { path: 'learning-hub', element: <LearningHub /> },
  { path: 'auth/admin-login', element: <AdminLogin /> },
  { path: 'sign-in', element: <Login /> },
  { path: 'sign-up', element: <SignUp /> },
  // Legacy aliases to avoid 404s
  { path: 'auth/login', element: <Login /> },
  { path: 'auth/register', element: <SignUp /> },
  { path: 'payment/success', element: <PaymentSuccess /> },
  { path: 'payment/cancel', element: <PaymentCancel /> },
  { path: 'payment/failure', element: <PaymentFailure /> },
  { path: 'payment', element: <PaymentOptions /> },
  { path: 'payment/gateway', element: <PaymentGateway /> },
  { path: 'check-turnitin', element: <TurnitinCheck /> },
  { path: 'turnitin/submit', element: <TurnitinSubmission /> },
  
  // NEW: CMS-integrated content routes
  { path: 'articles', element: <ArticlesPage /> },  // Article listing
  { path: 'articles/:slug', element: <ArticlePage /> },  // Single article
  { path: 'authors', element: <AuthorsPage /> },  // Authors listing
  { path: 'authors/:slug', element: <AuthorPage /> },  // Single author profile
  { path: 'services', element: <ServicesHub /> },  // Services Hub (domain directory + service CTAs)
  { path: 'services/:domain', element: <ServicesPage /> },  // Domain services listing
  { path: 'services/:domain/:slug', element: <ServicePageNew /> },  // Single service detail
  
  // Domain-based content routes (CMS-driven)
  { path: 'domains', element: <DomainsHub /> },  // All domains hub page
  { path: 'domains/:slug', element: <DomainPage /> },  // Domain landing page
  { path: 'domains/:slug/articles/:articleSlug', element: <ArticlePage /> },  // Domain article
  { path: 'domains/:slug/services/:serviceSlug', element: <ServicePageNew /> },  // Domain service
  
  // Legacy /d/* redirects → /domains/* for backward compatibility (SEO)
  { path: 'd/:domain/*', element: <LegacyDomainRedirect /> },
  { path: 'd/:domain', element: <LegacyDomainRedirect /> },
  
  // Marketing & static routes
  { path: 'pricing', element: <Pricing /> },
  { path: 'about', element: <About /> },
  { path: 'contact', element: <Contact /> },
  { path: 'faq', element: <FAQ /> },
  { path: 'how-it-works', element: <HowItWorks /> },
  { path: 'support', element: <Support /> },
  { path: 'preview', element: <PreviewPage /> },
  
  // Documentation routes
  { path: 'docs/x402', element: <X402DocsPage /> },
  { path: 'api', element: <ApiDocsPage /> },
  
  // Dashboard routes moved out of RootLayout to avoid duplicate site navbar in app shell
  { path: '*', element: <NotFound /> },
];

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: childRoutes,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardWrapper /> },
      { path: 'orders', element: <Orders /> },
      { path: 'new-order', element: <NewOrder /> },
      { path: 'messages', element: <Messages /> },
      { path: 'email-admin', element: <EmailAdmin /> },
      { path: 'support', element: <UserMessaging /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'documents', element: <DocumentsUpload /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'content', element: <AdminDashboard /> },
      { path: 'content/new', element: <ArticleEditor /> },
      { path: 'content/:id', element: <ArticleEditor /> },
      { path: 'publish', element: <ContentPublisher /> },
      { path: 'publish/:id', element: <ContentPublisher /> },
      { path: 'messaging', element: <AdminMessaging /> },
      { path: 'support', element: <AdminMessaging /> },
      { path: 'domains/:domain/analytics', element: <AdminDashboard /> },
      { path: 'media/upload', element: <DocumentsUpload /> },
      { path: 'users', element: <AdminDashboard /> },
      { path: 'messages', element: <Messages /> },
      { path: 'analytics', element: <AdminDashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'turnitin-reports', element: <TurnitinReports /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
