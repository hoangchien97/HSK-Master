import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      fullWidth = false,
      className = '',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Variant styles
    const variantStyles = {
      primary: disabled
        ? 'bg-primary text-white opacity-50 cursor-not-allowed'
        : 'bg-primary hover:bg-primary-hover text-white focus:ring-primary',
      secondary: disabled
        ? 'bg-white border border-gray-200 text-gray-300 cursor-not-allowed'
        : 'bg-white border border-gray-300 hover:border-primary hover:text-primary text-text-main focus:ring-primary',
      ghost: disabled
        ? 'text-gray-300 cursor-not-allowed'
        : 'text-text-main hover:text-primary hover:bg-primary/5 focus:ring-primary',
      gradient: disabled
        ? 'bg-gradient-to-r from-yellow-400 to-red-600 text-white opacity-50 cursor-not-allowed'
        : 'bg-gradient-to-r from-yellow-400 to-red-600 hover:opacity-90 hover:shadow-lg text-white focus:ring-primary',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : 'w-auto';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
