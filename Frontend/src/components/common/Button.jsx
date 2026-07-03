import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: "text-white border border-transparent",
    secondary: "backdrop-blur-md border",
    ghost: "bg-transparent hover:bg-white/5",
    danger: "border",
    outline: "bg-transparent border hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      style={{
        background: variant === 'primary' ? 'var(--button)' : variant === 'secondary' ? 'var(--surface)' : variant === 'danger' ? 'rgba(239,68,68,0.1)' : 'transparent',
        color: variant === 'primary' ? 'white' : variant === 'danger' ? 'rgb(248,113,113)' : 'var(--text)',
        borderColor: variant === 'primary' ? 'transparent' : variant === 'outline' ? 'var(--accent)' : 'var(--border)',
        boxShadow: variant === 'primary' ? '0 0 20px var(--shadow)' : 'none',
        '--hover-bg': variant === 'primary' ? 'var(--button-hover)' : variant === 'secondary' ? 'var(--card)' : variant === 'danger' ? 'rgba(239,68,68,0.2)' : 'var(--accent-light)'
      }}
      onMouseOver={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = 'var(--button-hover)';
          e.currentTarget.style.boxShadow = '0 0 25px var(--shadow)';
        }
      }}
      onMouseOut={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = 'var(--button)';
          e.currentTarget.style.boxShadow = '0 0 20px var(--shadow)';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
