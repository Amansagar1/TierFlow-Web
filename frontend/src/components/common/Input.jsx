import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      rightAction,
      className = '',
      id,
      name,
      type = 'text',
      helperText,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`w-full rounded-xl border bg-white text-slate-800 text-sm transition-all duration-200 outline-none placeholder:text-slate-400
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightAction ? 'pr-11' : 'pr-3.5'}
              py-2.5
              ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-[#D97706] focus:ring-2 focus:ring-amber-100'
              }
              ${className}`}
            {...props}
          />
          {rightAction && <div className="absolute right-3.5 flex items-center">{rightAction}</div>}
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
