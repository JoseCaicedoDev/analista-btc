import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  className = '',
  dot = false
}) => {
  const variants = {
    primary: "bg-primary-500/10 text-primary-400 border-primary-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    neutral: "bg-gray-800/50 text-gray-400 border-gray-700/50",
  };

  const dotColors = {
    primary: "bg-primary-500",
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    warning: "bg-amber-500",
    neutral: "bg-gray-500",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide",
      variants[variant],
      className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
};
