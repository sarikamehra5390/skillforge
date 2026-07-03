import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-xs font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <input 
        className={cn(
          "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all duration-200",
          className
        )}
        style={{ 
          backgroundColor: 'var(--surface)', 
          border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)', 
          color: 'var(--text)',
          '--placeholder-color': 'var(--text-secondary)'
        }}
        {...props}
      />
      {error && <p className="text-[10px] ml-1" style={{ color: 'rgba(239,68,68,1)' }}>{error}</p>}
    </div>
  );
};

export default Input;
