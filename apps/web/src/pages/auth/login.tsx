import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { SignIn as ClerkSignIn, useClerk, useUser } from '@clerk/clerk-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import { Shield, User, ArrowRight, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useClerk();
  const { isLoaded } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (isLoaded && session) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        toast.success('Already logged in');
        navigate(from);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [session, navigate, from, isLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col justify-center items-center p-4 relative overflow-hidden"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-slate-900/30" />

      {/* Floating subtle decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />

      {/* Main content container */}
      <div className="max-w-md w-full relative z-10">
        {/* Logo and branding header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
              <HandyWriterzLogo className="text-white" style={{ fontSize: 24 }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Sign in to continue your writing journey
          </p>
        </motion.div>

        {/* Sign in form */}
        {isRedirecting ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8 text-center"
          >
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent mb-4"></div>
            <p className="text-gray-200 font-medium">Redirecting to your dashboard...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden"
          >
            <div className="py-5 px-6 border-b border-gray-700/50">
              <div className="flex items-center gap-2 justify-center">
                <User className="h-5 w-5 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">Sign In</h2>
              </div>
            </div>

            {/* Clerk SignIn component */}
            <ClerkSignIn
              appearance={{
                variables: {
                  colorPrimary: '#6366f1',
                  colorBackground: 'transparent',
                  colorInputBackground: 'rgba(55, 65, 81, 0.8)',
                  colorInputText: '#f9fafb',
                  colorText: '#f9fafb',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  borderRadius: '12px'
                },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none p-6 bg-transparent",
                  header: "hidden",
                  formButtonPrimary:
                    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]",
                  formFieldLabel: "text-gray-200 font-medium text-sm mb-2",
                  formFieldInput:
                    "bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 rounded-xl py-3 px-4 text-white placeholder-gray-400 transition-all duration-200",
                  footer: "hidden",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold",
                  formFieldAction: "text-indigo-400 hover:text-indigo-300 font-medium text-sm",
                  dividerLine: "bg-gray-600/50",
                  dividerText: "text-gray-400 text-sm px-4 bg-gray-800/80",
                  identityPreview: "bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl",
                  socialButtonsBlockButton: "bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-600/80 hover:border-gray-500/50 rounded-xl py-3 px-4 transition-all duration-200 shadow-sm hover:shadow-md",
                  socialButtonsBlockButtonText: "text-gray-200 font-medium",
                  socialButtonsProviderIcon: "w-5 h-5"
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
            />

            {/* Sign up link */}
            <div className="p-6 pt-2 border-t border-gray-700/50">
              <div className="text-center text-gray-300 text-sm">
                Don't have an account yet?{' '}
                <Link to="/sign-up" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200">
                  Sign up
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Portal and Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-col items-center gap-6"
        >
          <Link
            to="/auth/admin-login"
            className="inline-flex items-center px-5 py-3 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Admin login"
            title="Admin login"
            onClick={(e) => {
              sessionStorage.removeItem('redirect_after_login');
              sessionStorage.removeItem('last_admin_redirect');
            }}
          >
            <Shield className="h-4 w-4 mr-2 text-indigo-400" />
            Admin Portal
            <ArrowRight className="h-4 w-4 ml-2 text-indigo-400" />
          </Link>

          <div className="flex gap-8 text-sm text-gray-400">
            <Link to="/terms" className="hover:text-gray-200 transition-colors duration-200 font-medium">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-200 transition-colors duration-200 font-medium">Privacy</Link>
            <Link to="/contact" className="hover:text-gray-200 transition-colors duration-200 font-medium">Help</Link>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 flex justify-center items-center gap-6 text-gray-500 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span className="font-medium">Secure</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-medium">Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            <span className="font-medium">Trusted</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
