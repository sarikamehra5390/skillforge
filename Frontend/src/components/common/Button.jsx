import { cn } from '../../utils/cn';

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  ...props
}) => {
  const variants = {
    primary: 'text-white border border-transparent',
    secondary: 'backdrop-blur-md border',
    ghost: 'bg-transparent hover:bg-white/5',
    danger: 'border',
    outline: 'bg-transparent border hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  const styles = {
    primary: {
      background: 'var(--button)',
      color: 'white',
      borderColor: 'transparent',
      boxShadow: '0 0 20px var(--shadow)',
    },
    secondary: {
      background: 'var(--surface)',
      color: 'var(--text)',
      borderColor: 'var(--border)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'rgb(248, 113, 113)',
      borderColor: 'var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text)',
      borderColor: 'transparent',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text)',
      borderColor: 'var(--accent)',
    },
  };

  const currentStyle = styles[variant] || styles.primary;

  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50',
        variantClass,
        sizeClass,
        className
      )}
      style={currentStyle}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = 'var(--button-hover)';
          e.currentTarget.style.boxShadow = '0 0 25px var(--shadow)';
        }
      }}
      onMouseLeave={(e) => {
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
