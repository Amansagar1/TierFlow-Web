import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:brightness-110 text-white font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 active:scale-[0.98]',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
