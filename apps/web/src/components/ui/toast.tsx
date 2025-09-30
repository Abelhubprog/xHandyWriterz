import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastTypeStyles: Record<ToastType, { icon: ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    className: 'bg-green-50 border-green-200 text-green-800'
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    className: 'bg-red-50 border-red-200 text-red-800'
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5" />,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    className: 'bg-blue-50 border-blue-200 text-blue-800'
  }
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const { icon, className } = toastTypeStyles[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-sm',
        'animate-slide-in',
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  children?: ReactNode;
  className?: string;
}

export function ToastContainer({ children, className }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      aria-live="polite"
      className={cn(
        'fixed top-4 right-4 z-50',
        'flex flex-col gap-2 max-w-md w-full',
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}
