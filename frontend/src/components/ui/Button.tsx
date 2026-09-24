import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 shadow-sm shadow-blue-900/30 active:bg-blue-700',
    secondary:
      'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-600 border border-slate-700',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 shadow-sm shadow-emerald-900/30',
    danger:
      'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-sm shadow-red-900/30',
    warning:
      'bg-amber-600 text-white hover:bg-amber-500 focus:ring-amber-500 shadow-sm shadow-amber-900/30',
    outline:
      'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-600',
    ghost:
      'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:ring-slate-700',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
