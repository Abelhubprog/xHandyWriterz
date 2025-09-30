import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant = 
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'default';

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  pending: 'bg-orange-100 text-orange-800',
  default: 'bg-gray-100 text-gray-800'
};

interface StatusBadgeProps {
  variant?: StatusVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({
  variant = 'default',
  icon,
  children,
  className,
  size = 'md'
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// Predefined status configurations
interface StatusConfig {
  label: string;
  variant: StatusVariant;
  icon?: ReactNode;
}

export const orderStatuses: Record<string, StatusConfig> = {
  pending: { label: 'Pending', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' }
};

export const userStatuses: Record<string, StatusConfig> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'default' },
  suspended: { label: 'Suspended', variant: 'error' }
};

// Helper function to get status config
export function getStatusConfig(
  status: string,
  type: 'order' | 'user'
): StatusConfig {
  const statusMap = type === 'order' ? orderStatuses : userStatuses;
  return (
    statusMap[status] || {
      label: status,
      variant: 'default'
    }
  );
}
