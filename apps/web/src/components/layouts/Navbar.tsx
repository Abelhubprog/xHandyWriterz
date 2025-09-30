import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Menu, X, ChevronDown, Shield } from 'lucide-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';

interface ServiceLink {
  path: string;
  label: string;
}

interface NavbarProps {
  serviceLinks: ServiceLink[];
}

const Navbar: React.FC<NavbarProps> = ({ serviceLinks }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const mainNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
            <HandyWriterzLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {/* Public Links */}
            {mainNavLinks.map((link) => (
              link.path === '/services' ? (
                <div key={link.path} className="relative group">
                  <button className={`text-gray-700 group-hover:text-indigo-600 px-3 py-2 text-sm font-medium flex items-center ${
                    location.pathname.startsWith(link.path) ? 'text-indigo-600' : ''
                  }`}>
                    {link.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.path}
                          to={service.path}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50/70 hover:text-indigo-700 rounded-md mx-1"
                        >
                          {service.label}
                        </Link>
                      ))}
                      <Link
                        to="/services"
                        className="block px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 rounded-md mx-1 border-t border-gray-100 mt-2"
                      >
                        View All Services
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium ${
                    location.pathname === link.path ? 'text-indigo-600' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Authenticated Links */}
            <SignedIn>
              <Link
                to="/dashboard"
                className={`text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium ${
                  location.pathname === '/dashboard' ? 'text-indigo-600' : ''
                }`}
              >
                Dashboard
              </Link>
            </SignedIn>

            {/* Auth Buttons */}
            <SignedOut>
              <div className="flex items-center space-x-2">
                <Link
                  to="/sign-in"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium border border-indigo-600"
                >
                  Sign Up
                </Link>
              </div>
            </SignedOut>

            {/* User Menu */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {/* Public Mobile Links */}
          {mainNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 text-base font-medium ${
                location.pathname === link.path
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <div className="px-3 py-2">
            <span className="block text-base font-medium text-gray-700">Services</span>
            <div className="mt-2 space-y-1">
              {serviceLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Authenticated Mobile Links */}
          <SignedIn>
            <Link
              to="/dashboard"
              className={`block px-3 py-2 text-base font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          </SignedIn>

          {/* Mobile Auth Buttons */}
          <SignedOut>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-2 px-3">
                <Link
                  to="/sign-in"
                  className="block bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-base font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="block bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-base font-medium border border-indigo-600 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
