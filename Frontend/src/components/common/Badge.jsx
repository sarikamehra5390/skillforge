import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: "bg-white/5 text-slate-400 border-white/10",
    success: "bg-accent-green/10 text-accent-green border-accent-green/20",
    warning: "bg-accent-gold/10 text-accent-gold border-accent-gold/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    indigo: "bg-secondary-500/10 text-secondary-500 border-secondary-500/20",
    purple: "bg-primary-500/10 text-primary-500 border-primary-500/20",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
