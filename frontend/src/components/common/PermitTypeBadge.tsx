import React from 'react';
import { Flame, Box, ArrowUpRight, Zap } from 'lucide-react';
import { PermitType } from '../../types';
import { PERMIT_TYPE_CONFIG } from '../../constants';
import { cn } from '../../utils/cn';

interface PermitTypeBadgeProps {
  type: PermitType;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const PermitTypeBadge: React.FC<PermitTypeBadgeProps> = ({
  type,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const config = PERMIT_TYPE_CONFIG[type] || {
    label: type,
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (type) {
      case 'HOT_WORK':
        return <Flame size={iconSize} className="text-amber-400 flex-shrink-0" />;
      case 'CONFINED_SPACE':
        return <Box size={iconSize} className="text-purple-400 flex-shrink-0" />;
      case 'WORKING_AT_HEIGHT':
        return <ArrowUpRight size={iconSize} className="text-blue-400 flex-shrink-0" />;
      case 'ELECTRICAL_LOTO':
        return <Zap size={iconSize} className="text-yellow-400 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border tracking-wide select-none',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
