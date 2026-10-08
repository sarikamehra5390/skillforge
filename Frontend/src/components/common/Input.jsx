import React, { useId } from 'react';
import { cn } from '../../utils/cn';

const Input = ({ label, error, className, icon: Icon, id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium ml-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-hidden="true"
          />
        )}

        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all duration-200",
            Icon && "pl-10",
            className
          )}
          style={{
            backgroundColor: 'var(--surface)',
            border: error
              ? '1px solid rgba(239,68,68,0.5)'
              : '1px solid var(--border)',
            color: 'var(--text)',
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-[10px] ml-1"
          style={{ color: 'rgba(239,68,68,1)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;