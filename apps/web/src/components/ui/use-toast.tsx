import { useState, useCallback } from "react";
import { ToastType } from "./toast";

// Define the toast interface compatible with our existing toast component
interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface UseToastReturn {
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

// Create a unified useToast hook that works with our existing components
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ duration = 5000, ...props }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, duration, ...props };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
}
