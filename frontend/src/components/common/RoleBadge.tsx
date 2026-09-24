import React from 'react';
import { Shield } from 'lucide-react';
import { UserRole } from '../../types';
import { USER_ROLE_CONFIG } from '../../constants';
import { cn } from '../../utils/cn';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const config = USER_ROLE_CONFIG[role] || {
    label: role,
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      title={config.description}
      className={cn(
        'inline-flex items-center rounded border tracking-wide select-none',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Shield size={size === 'sm' ? 11 : 13} className="opacity-80 flex-shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
