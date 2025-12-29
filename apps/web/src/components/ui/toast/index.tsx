import React from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  onClose?: () => void;
}

const Toast = ({
  id,
  title,
  description,
  action,
  variant = "default",
  onClose,
}: ToastProps) => {
  let Icon = Info;
  let bgClass = "bg-blue-50 border-blue-200 text-blue-800";
  
  if (variant === "destructive") {
    Icon = AlertCircle;
    bgClass = "bg-red-50 border-red-200 text-red-800";
  } else if (variant === "success") {
    Icon = CheckCircle;
    bgClass = "bg-green-50 border-green-200 text-green-800";
  }

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border shadow-sm p-4",
        "animate-in fade-in slide-in-from-top-5 duration-300",
        bgClass
      )}
    >
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        {title && <h5 className="mb-1 font-medium">{title}</h5>}
        {description && (
          <p className="text-sm opacity-90">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-blue-100"
        aria-label="Close notification"
        title="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export { Toast };
