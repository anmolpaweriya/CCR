import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'goodwill' | 'cash' | 'subtle';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = true,
  ...props
}) => {
  let variantClasses = 'glass-card';

  if (variant === 'goodwill') {
    variantClasses =
      'bg-emerald-50/70 border-emerald-200/80 backdrop-blur-md shadow-sm hover:border-emerald-300 hover:shadow-emerald-500/10';
  } else if (variant === 'cash') {
    variantClasses =
      'bg-blue-50/70 border-blue-200/80 backdrop-blur-md shadow-sm hover:border-blue-300 hover:shadow-blue-500/10';
  } else if (variant === 'subtle') {
    variantClasses = 'bg-white/40 border-slate-200/50 backdrop-blur-sm';
  }

  const hoverClass = hoverEffect
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
    : '';

  return (
    <div
      className={`rounded-2xl p-6 ${variantClasses} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
