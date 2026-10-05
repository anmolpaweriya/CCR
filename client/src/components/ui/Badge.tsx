import React from 'react';
import { Heart, Coins, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'cash' | 'goodwill' | 'ai' | 'status' | 'urgency' | 'neutral';
  status?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  urgency,
  size = 'md',
  className = '',
  icon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  if (variant === 'cash') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs ${sizeClasses} ${className}`}
      >
        {icon && <Coins className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
        <span>{children}</span>
      </span>
    );
  }

  if (variant === 'goodwill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses} ${className}`}
      >
        {icon && <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20 shrink-0" />}
        <span>{children}</span>
      </span>
    );
  }

  if (variant === 'ai') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses} ${className}`}
      >
        {icon && <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
        <span>{children}</span>
      </span>
    );
  }

  if (urgency) {
    const urgencyMap = {
      CRITICAL: 'bg-red-50 text-red-700 border-red-200',
      HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
      MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
      LOW: 'bg-slate-50 text-slate-600 border-slate-200',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium border ${
          urgencyMap[urgency] || urgencyMap.MEDIUM
        } ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{urgency}</span>
      </span>
    );
  }

  if (status) {
    let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
    let StatusIcon = Clock;

    if (['OPEN', 'AVAILABLE'].includes(status)) {
      statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      StatusIcon = CheckCircle2;
    } else if (['ACCEPTED', 'IN_PROGRESS', 'BORROWED'].includes(status)) {
      statusClass = 'bg-sky-50 text-sky-700 border-sky-200';
      StatusIcon = Clock;
    } else if (['VERIFIED', 'COMPLETED', 'RETURN_VERIFIED'].includes(status)) {
      statusClass = 'bg-teal-50 text-teal-800 border-teal-200';
      StatusIcon = CheckCircle2;
    } else if (['DISPUTED'].includes(status)) {
      statusClass = 'bg-rose-50 text-rose-700 border-rose-200';
      StatusIcon = AlertCircle;
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${statusClass} ${sizeClasses} ${className}`}
      >
        {icon && <StatusIcon className="w-3.5 h-3.5" />}
        <span>{status.replace(/_/g, ' ')}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
