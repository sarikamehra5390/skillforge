import { useId } from 'react';
import { cn } from '../../utils/cn';

const Input = ({
  label,
  error,
  className,
  icon: Icon,
  endAdornment,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="ml-1 text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--text-secondary)' }}
            aria-hidden="true"
          />
        )}

        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus-visible:border-violet-300 focus-visible:ring-2 focus-visible:ring-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60',
            Icon && 'pl-10',
            endAdornment && 'pr-12',
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
          aria-describedby={
            error ? `${inputId}-error` : undefined
          }
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="ml-1 text-[10px]"
          style={{ color: 'rgba(239,68,68,1)' }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
