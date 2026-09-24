import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  statusBorder?: 'slate' | 'amber' | 'emerald' | 'sky' | 'red' | 'orange';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  footer,
  statusBorder,
  ...props
}) => {
  const statusBorderMap = {
    slate: 'border-l-4 border-l-slate-500',
    amber: 'border-l-4 border-l-amber-500',
    emerald: 'border-l-4 border-l-emerald-500',
    sky: 'border-l-4 border-l-sky-500',
    red: 'border-l-4 border-l-red-500',
    orange: 'border-l-4 border-l-orange-500',
  };

  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-lg shadow-sm',
        statusBorder && statusBorderMap[statusBorder],
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/80 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};
