import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-xs font-medium text-slate-400 ml-1">{label}</label>}
      <input 
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200",
          error && "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50",
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-red-400 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
