import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'brand'
  | 'neutral'
  | 'outline';

export type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default:
      'bg-[#0a2736] text-slate-300 border-[#14425b]',
    success:
      'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
    warning:
      'bg-amber-950/60 text-amber-400 border-amber-800/80',
    danger:
      'bg-rose-950/60 text-rose-400 border-rose-800/80',
    info:
      'bg-sky-950/60 text-sky-400 border-sky-800/80',
    brand:
      'bg-[#ff6f32]/15 text-[#ff6f32] border-[#ff6f32]/30',
    neutral:
      'bg-[#0a2736] text-slate-400 border-[#14425b]',
    outline:
      'bg-transparent text-slate-300 border-[#14425b]',
  };

  const dotStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
    brand: 'bg-[#ff6f32]',
    neutral: 'bg-slate-500',
    outline: 'bg-slate-400',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
