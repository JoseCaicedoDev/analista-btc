import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={cn(
      "component card-bg flex flex-col overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-sm transition-all duration-200",
      "dark:bg-black dark:border-gray-800/60",
      className
    )}>
      {title && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60 bg-gray-900/30">
          {icon && <div className="text-primary-500">{icon}</div>}
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{title}</h3>
        </div>
      )}
      <div className="flex-1 p-4 min-h-0">
        {children}
      </div>
    </div>
  );
};
