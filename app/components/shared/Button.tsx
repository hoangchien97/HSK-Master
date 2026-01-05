import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient' | 'white' | 'outline-white' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
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
      white: disabled
        ? 'bg-white text-red-600 opacity-50 cursor-not-allowed'
        : 'bg-white text-red-600 hover:bg-gray-50 hover:shadow-xl shadow-lg focus:ring-white font-bold',
      'outline-white': disabled
        ? 'bg-transparent border-2 border-white/30 text-white/50 cursor-not-allowed'
        : 'bg-transparent border-2 border-white/50 text-white hover:bg-white/10 hover:border-white focus:ring-white font-bold',
      glass: disabled
        ? 'bg-black/30 text-white/50 cursor-not-allowed border border-white/10'
        : 'bg-black/50 hover:bg-black/70 border border-white/20 text-white backdrop-blur-sm hover:scale-105 active:scale-95 transform-gpu transition-all duration-300 focus:ring-primary',
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
        {icon && iconPosition === 'left' && <span className="flex items-center flex-shrink-0">{icon}</span>}
        {
          children && <span className={icon ? '' : 'flex items-center'}>{children}</span>
        }
        {icon && iconPosition === 'right' && <span className="flex items-center flex-shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
