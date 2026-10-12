import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'brand'
  | 'success';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#ff6f32] hover:bg-[#ea580c] text-white shadow-md border border-transparent font-bold',
    brand:
      'bg-[#ff6f32] hover:bg-[#ea580c] text-white shadow-md border border-transparent font-bold',
    secondary:
      'bg-[#0a2736] hover:bg-[#0c2f42] text-white border border-[#14425b] hover:border-[#ff6f32]/50',
    outline:
      'bg-transparent hover:bg-white/5 text-slate-200 hover:text-white border border-[#14425b] hover:border-[#ff6f32]/50',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-xs border border-transparent',
    success:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs border border-transparent',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-[11px] px-2.5 py-1 rounded-lg gap-1 font-medium',
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-4 py-2 rounded-xl gap-2 font-semibold',
    lg: 'text-sm px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
