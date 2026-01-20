import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className, noPadding = false, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col no-drag", 
        !noPadding && "p-4",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, icon: Icon, action }: { title: string, icon?: React.ElementType, action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        {Icon && <Icon className="w-4 h-4 text-blue-500" />}
        <span>{title}</span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
