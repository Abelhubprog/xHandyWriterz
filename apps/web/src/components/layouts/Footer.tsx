import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, CheckCircle, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DOMAIN_TAGS } from '@/config/taxonomy';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import { fetchFooterDomains } from '@/lib/cms';

// Helper function to scroll to top of page
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Check Turnitin', path: '/check-turnitin' },
    { label: 'Domains', path: '/domains' },
    { label: 'Articles', path: '/articles' },
    { label: 'Payment', path: '/payment' },
  ];

  const supportLinks = [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact Us', path: '/contact' },
    { label: '24/7 Support', path: '/support' },
  ];

  const developerLinks = [
    { label: 'API Documentation', path: '/api' },
    { label: 'x402 Protocol', path: '/docs/x402' },
    { label: 'Our Authors', path: '/authors' },
  ];

  const companyLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
  ];

  // Fetch domains marked for footer display
  const { data: footerDomainsData } = useQuery({
    queryKey: ['footer-domains'],
    queryFn: fetchFooterDomains,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const serviceLinks = useMemo(() => {
    if (footerDomainsData && footerDomainsData.length > 0) {
      return footerDomainsData.map((domain) => ({
        label: domain.name,
        path: `/domains/${domain.slug}`,
      }));
    }
    // Fallback to static taxonomy if no domains from CMS
    return DOMAIN_TAGS.map((domain) => ({
      label: domain.label,
      path: `/domains/${domain.slug}`,
    }));
  }, [footerDomainsData]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section with Logo and Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-8 border-b border-gray-800">
          <div className="mb-8 md:mb-0">
            <HandyWriterzLogo className="text-white" />
            <p className="text-gray-400 mt-2 max-w-md">
              Your trusted partner in academic excellence. Professional writing services tailored to your needs.
            </p>

            {/* Trust Rating */}
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-yellow-400 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-300 text-sm">
                Trusted by 10,000+ students
              </span>
            </div>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://linkedin.com/in/handywriterz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/handywriterz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/handywriterz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-1.38-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Domains Column - Spans 2 columns on larger screens */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-primary-light">Domains</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    {link.label}
                  </span>
                </Link>
              ))}
              <div className="sm:col-span-2 mt-4">
                <Link
                  to="/domains"
                  onClick={scrollToTop}
                  className="inline-flex items-center text-primary-light hover:text-white transition-colors text-sm font-medium group"
                >
                  <span>View All Domains</span>
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-primary-light">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}

              {/* Add Admin Login Link here too */}
              <li>
                <Link
                  to="/auth/admin-login"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                >
                  <Shield className="h-4 w-4 mr-1 text-gray-400 group-hover:text-primary-light" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Admin Login
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Company Column */}
          <div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-6 text-primary-light">Support</h3>
              <ul className="space-y-4">
                {supportLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-6 text-primary-light">Developers</h3>
              <ul className="space-y-4">
                {developerLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 text-primary-light">Company</h3>
              <ul className="space-y-4">
                {companyLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={scrollToTop}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-gray-400">
                © {currentYear} HandyWriterz. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-6">
                <Link to="/terms" onClick={scrollToTop} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link to="/privacy" onClick={scrollToTop} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy
                </Link>
                <span className="text-sm text-gray-500">Cookies</span>
              </div>

              {/* Make Admin Link Stand Out */}
              <Link
                to="/auth/admin-login"
                className="text-sm px-3 py-1.5 bg-indigo-700/30 hover:bg-indigo-600/50 rounded-md text-white transition-colors flex items-center border border-indigo-600/30"
              >
                <Lock className="h-3 w-3 mr-1.5" />
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

