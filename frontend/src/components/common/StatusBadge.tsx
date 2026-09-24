import React from 'react';
import { PermitStatus } from '../../types';
import { PERMIT_STATUS_CONFIG } from '../../constants';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: PermitStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className,
}) => {
  const config = PERMIT_STATUS_CONFIG[status] || {
    label: status,
    description: '',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    dotClass: 'bg-slate-400',
    borderClass: '',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      title={config.description}
      className={cn(
        'inline-flex items-center rounded-md border tracking-wide select-none',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full flex-shrink-0', dotSizes[size], config.dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
