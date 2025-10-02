import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Home, Search, ArrowLeft, HelpCircle, BookOpen } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const popularPages = [
    { label: 'Services Hub', path: '/services', icon: BookOpen },
    { label: 'Check Turnitin', path: '/check-turnitin', icon: Search },
    { label: 'Contact Support', path: '/contact', icon: HelpCircle },
  ];

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | HandyWriterz</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Animated 404 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <h1 className="text-[10rem] md:text-[12rem] font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none">
                404
              </h1>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-gray-500">
                Don't worry, let's get you back on track!
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-lg"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Home className="h-5 w-5" />
                Go to Homepage
              </Link>
            </motion.div>

            {/* Popular Pages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Popular Pages
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {popularPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Link
                      key={page.path}
                      to={page.path}
                      className="group flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {page.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Help Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-sm text-gray-500"
            >
              Still can't find what you're looking for?{' '}
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Contact our support team
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
