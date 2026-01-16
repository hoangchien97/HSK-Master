import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "gradient"
  | "icon-only";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  badge?: string | number;
  "aria-label"?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "right",
      fullWidth = false,
      className = "",
      disabled = false,
      loading = false,
      badge,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    // Validate icon-only variant
    if (variant === "icon-only" && !ariaLabel) {
      console.warn(
        'Button with variant="icon-only" should have an aria-label for accessibility'
      );
    }

    // Base styles with focus ring support
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

    // Variant styles with all states
    const variantStyles = {
      primary:
        "bg-primary-500 text-white shadow-sm " +
        "hover:bg-primary-600 hover:shadow-md " +
        "active:bg-primary-700 " +
        "focus-visible:ring-primary-200",

      secondary:
        "bg-white border-2 border-gray-300 text-gray-700 shadow-sm " +
        "hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 " +
        "active:border-primary-600 active:bg-primary-100 " +
        "focus-visible:ring-primary-200",

      outline:
        "bg-transparent border-2 border-primary-500 text-primary-600 " +
        "hover:bg-primary-50 " +
        "active:bg-primary-100 " +
        "focus-visible:ring-primary-200",

      ghost:
        "bg-transparent text-gray-700 " +
        "hover:bg-gray-100 hover:text-gray-900 " +
        "active:bg-gray-200 " +
        "focus-visible:ring-gray-200",

      gradient:
        "bg-gradient-to-r from-yellow-400 to-primary-600 text-white shadow-md " +
        "hover:from-yellow-300 hover:to-primary-700 hover:shadow-lg hover:scale-[1.02] " +
        "active:from-yellow-500 active:to-primary-800 " +
        "focus-visible:ring-yellow-200",

      "icon-only":
        "bg-transparent text-gray-700 rounded-full " +
        "hover:bg-gray-100 hover:text-gray-900 " +
        "active:bg-gray-200 " +
        "focus-visible:ring-gray-200",
    };

    // Size styles
    const sizeStyles = {
      sm:
        variant === "icon-only"
          ? "p-1.5 text-sm"
          : "px-3 py-1.5 text-sm rounded-lg",
      md:
        variant === "icon-only"
          ? "p-2 text-base"
          : "px-6 py-2.5 text-base rounded-xl",
      lg:
        variant === "icon-only"
          ? "p-3 text-lg"
          : "px-8 py-3.5 text-lg rounded-xl",
    };

    // Width styles
    const widthStyles = fullWidth ? "w-full" : "w-auto";

    // Show loading spinner on left if loading, otherwise show icon if provided
    const leftContent =
      loading && iconPosition === "left" ? (
        <LoadingSpinner />
      ) : icon && iconPosition === "left" ? (
        <span className="flex items-center shrink-0">{icon}</span>
      ) : null;

    // For icon-only variant
    const iconOnlyContent = loading ? <LoadingSpinner /> : icon;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {variant === "icon-only" ? (
          iconOnlyContent
        ) : (
          <>
            {leftContent}
            {children && <span className="flex items-center">{children}</span>}
            {badge && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                {badge}
              </span>
            )}
            {icon && iconPosition === "right" && !loading && (
              <span className="flex items-center shrink-0">{icon}</span>
            )}
            {loading && iconPosition === "right" && <LoadingSpinner />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
