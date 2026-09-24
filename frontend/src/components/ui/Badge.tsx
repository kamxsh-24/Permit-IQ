import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const base =
    'inline-flex items-center font-medium border rounded-full uppercase tracking-wider select-none';

  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    info: 'bg-sky-950/80 text-sky-300 border-sky-600/50',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
    danger: 'bg-red-950/80 text-red-300 border-red-600/50',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
