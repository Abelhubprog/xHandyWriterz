
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { SignUp as ClerkSignUp, useClerk, useUser } from '@clerk/clerk-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import React from "react";
import { Shield, User, ArrowRight, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
// Small runtime styles to ensure Clerk code input boxes are visible (white bg, dark text)
const clerkInputOverrides = `
/* Broad selectors to ensure Clerk OTP inputs are readable on dark backgrounds */
.clerk-otp-input, .clerk-verify-otp__input, input[data-testid="otp-input"],
.clerk-root input[type="text"], .clerk-root input[type="tel"], .clerk-root input[aria-label*="digit"] {
  background-color: #ffffff !important;
  color: #111827 !important;
  caret-color: #111827 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(0,0,0,0.12) !important;
  box-shadow: none !important;
}
.clerk-otp-input::placeholder, .clerk-verify-otp__input::placeholder, input[data-testid="otp-input"]::placeholder {
  color: rgba(0,0,0,0.45) !important;
}
.clerk-otp-input:focus, .clerk-verify-otp__input:focus, input[data-testid="otp-input"]:focus,
.clerk-root input[type="text"]:focus, .clerk-root input[type="tel"]:focus {
  outline: 2px solid rgba(99,102,241,0.18) !important;
  box-shadow: 0 0 0 6px rgba(99,102,241,0.04) !important;
}
/* Ensure the caret is visible inside circular inputs too */
.clerk-otp-input, .clerk-verify-otp__input { caret-color: #111827 !important; }
`;

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useClerk();
  const { isLoaded } = useUser();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  React.useEffect(() => {
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
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
  {/* Inject small style overrides for Clerk OTP inputs */}
  <style>{clerkInputOverrides}</style>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
              <HandyWriterzLogo className="text-white" size="md" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Sign up to start your writing journey
          </p>
        </motion.div>

        {/* Sign up form */}
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
                <h2 className="text-xl font-semibold text-white">Sign Up</h2>
              </div>
            </div>

            {/* Clerk SignUp component - passwordless, code, social, web3 */}
            <ClerkSignUp
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
              path="/sign-up"
              signInUrl="/sign-in"
              redirectUrl="/dashboard"
              // Passwordless, code, social, web3 enabled by Clerk config
            />

            {/* Debug helper: log Clerk events to console to help diagnose delivery */}
            <script dangerouslySetInnerHTML={{ __html: `
              (function(){
                try{
                  if(window && window.Clerk){
                    window.Clerk.on('message', function(e){
                      console.info('[Clerk message]', e);
                    });
                    window.Clerk.on('signInAttempt', function(e){
                      console.info('[Clerk signInAttempt]', e);
                    });
                  } else {
                    console.info('Clerk not available on window yet');
                  }
                } catch(err){ console.error('Clerk debug attach error', err); }
              })();
            ` }} />

            {/* Sign in link */}
            <div className="p-6 pt-2 border-t border-gray-700/50">
              <div className="text-center text-gray-300 text-sm">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200">
                  Sign in
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
            onClick={() => {
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

export default SignUp;
