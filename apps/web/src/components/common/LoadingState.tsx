import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingStateProps) {
  const Container = fullScreen ? 'div' : motion.div;
  const containerProps = fullScreen ? {
    className: "fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
  } : {
    className: "w-full flex flex-col items-center justify-center p-8",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <Container {...containerProps}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-4 border-indigo-600"></div>
          </div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </Container>
  );
}
