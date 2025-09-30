import { useToast } from "./use-toast";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toast } from "./index";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-0 z-[100] flex flex-col gap-2 px-4 py-4 sm:top-4 sm:right-4 max-w-[420px]">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id}
          {...toast}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}
