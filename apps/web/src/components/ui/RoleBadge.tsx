import { cn } from '@/lib/utils';

type Role = 'admin' | 'writer' | 'user';

const roleStyles: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800',
  writer: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-800'
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        roleStyles[role],
        className
      )}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// Helper function to determine if a string is a valid role
export function isValidRole(role: string): role is Role {
  return ['admin', 'writer', 'user'].includes(role);
}

// Helper component for quick rendering in tables
export function RoleCell({ role }: { role: string }) {
  return <RoleBadge role={isValidRole(role) ? role : 'user'} />;
}
