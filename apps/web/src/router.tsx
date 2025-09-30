import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import RootLayout from './components/layouts/RootLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
const Homepage = React.lazy(() => import('./pages/Homepage'));
const LearningHub = React.lazy(() => import('./pages/learning-hub'));
const NotFound = React.lazy(() => import('./pages/not-found'));
const AdminLogin = React.lazy(() => import('./pages/auth/admin-login'));
const Login = React.lazy(() => import('./pages/auth/login'));
const SignUp = React.lazy(() => import('./pages/auth/SignUp'));
const PaymentSuccess = React.lazy(() => import('./pages/payment/success'));
const PaymentCancel = React.lazy(() => import('./pages/payment/cancel'));
const PaymentFailure = React.lazy(() => import('./pages/payment/failure'));
const PaymentOptions = React.lazy(() => import('./pages/payment/options'));
const TurnitinCheck = React.lazy(() => import('./pages/turnitin-check'));
const ServicesPage = React.lazy(() => import('./pages/services/ServicesPage'));
const DomainLanding = React.lazy(() => import('./pages/domains/DomainLanding'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const Support = React.lazy(() => import('./pages/Support'));
// Dashboard pages
const DashboardWrapper = React.lazy(() => import('./components/Dashboard/DashboardWrapper'));
const Orders = React.lazy(() => import('./pages/dashboard/Orders'));
const Messages = React.lazy(() => import('./pages/dashboard/Messages'));
const Profile = React.lazy(() => import('./pages/dashboard/Profile'));
const Settings = React.lazy(() => import('./pages/dashboard/Settings'));
const DocumentsUpload = React.lazy(() => import('./pages/dashboard/DocumentsUpload'));

// Enterprise Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ArticleEditor = React.lazy(() => import('./pages/admin/ArticleEditor'));
const EnterpriseDomainPage = React.lazy(() => import('./pages/domains/EnterpriseDomainPage'));

// Route contract:
// - '/' homepage stays in apps/web
// - '/learning-hub' entry to the legacy content site (to be replaced).
// - '/services/*' now served by Strapi via the web app; worker proxy retired.

const childRoutes: RouteObject[] = [
  { index: true, element: <Homepage /> },
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
  { path: 'check-turnitin', element: <TurnitinCheck /> },
  { path: 'services', element: <ServicesPage /> },
  { path: 'services/:domain', element: <ServicesPage /> },
  { path: 'services/:domain/:slug', element: <ServicesPage /> },
  { path: 'd/:domain', element: <EnterpriseDomainPage /> },
  // Marketing & static routes
  { path: 'pricing', element: <Pricing /> },
  { path: 'about', element: <About /> },
  { path: 'contact', element: <Contact /> },
  { path: 'faq', element: <FAQ /> },
  { path: 'how-it-works', element: <HowItWorks /> },
  { path: 'support', element: <Support /> },
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
      { path: 'messages', element: <Messages /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'documents', element: <DocumentsUpload /> },
    ],
  },
  {
    path: '/admin',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'content', element: <AdminDashboard /> },
      { path: 'content/new', element: <ArticleEditor /> },
      { path: 'content/:id', element: <ArticleEditor /> },
      { path: 'domains/:domain/analytics', element: <AdminDashboard /> },
      { path: 'media/upload', element: <DocumentsUpload /> },
      { path: 'users', element: <AdminDashboard /> },
      { path: 'messages', element: <Messages /> },
      { path: 'analytics', element: <AdminDashboard /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
