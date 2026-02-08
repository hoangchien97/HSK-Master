"use client";

import React from "react";
import { cn } from "@/app/lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import { useResponsive } from "@/app/hooks/useResponsive";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "gradient"
  | "danger"
  | "white"
  | "outline-white"
  | "icon-only"
  | "gallery-control";
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
    const { isMobile } = useResponsive();
    const effectiveSize = isMobile ? "md" : (size || "md");

    // Validate icon-only variant
    if (variant === "icon-only" && !ariaLabel) {
      console.warn(
        'Button with variant="icon-only" should have an aria-label for accessibility'
      );
    }

    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

    // Size styles
    const sizeStyles = {
      sm:
        variant === "icon-only"
          ? "p-1.5 text-sm min-h-[28px] min-w-[28px]"
          : variant === "gallery-control"
          ? "px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded-lg min-h-[28px] md:min-h-[32px]"
          : "px-3 py-1.5 text-sm rounded-lg min-h-[32px]",
      md:
        variant === "icon-only"
          ? "p-2 text-base min-h-[36px] min-w-[36px]"
          : variant === "gallery-control"
          ? "px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl min-h-[36px] md:min-h-[40px]"
          : "px-6 py-2.5 text-base rounded-xl min-h-[44px]",
      lg:
        variant === "icon-only"
          ? "p-3 text-lg min-h-[48px] min-w-[48px]"
          : variant === "gallery-control"
          ? "px-4 py-2.5 md:px-5 md:py-3 text-base md:text-lg rounded-xl min-h-[44px] md:min-h-[48px]"
          : "px-8 py-3.5 text-lg rounded-xl min-h-[52px]",
    };

    // Variant styles
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
        "bg-transparent border-2 border-primary-500 text-primary-500 " +
        "hover:bg-primary-500 hover:text-white hover:border-primary-500 " +
        "active:bg-primary-600 active:text-white active:border-primary-600 " +
        "focus-visible:ring-primary-200",

      ghost:
        "bg-transparent text-gray-700 " +
        "hover:bg-gray-100 hover:text-gray-900 " +
        "active:bg-gray-200 " +
        "focus-visible:ring-gray-200",

      gradient:
        "relative overflow-hidden bg-gradient-to-r from-primary-500 to-orange-500 text-white shadow-lg " +
        "hover:from-primary-600 hover:to-orange-600 hover:shadow-xl hover:scale-[1.02] " +
        "active:from-primary-700 active:to-orange-700 active:scale-[0.98] " +
        "focus-visible:ring-primary-200 " +
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent " +
        "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 before:ease-in-out",

      danger:
        "bg-error-500 text-white shadow-md " +
        "hover:bg-error-600 hover:shadow-lg " +
        "active:bg-error-700 " +
        "focus-visible:ring-error-200",

      white:
        "bg-white text-primary-600 shadow-md " +
        "hover:bg-gray-50 hover:shadow-lg " +
        "active:bg-gray-100 " +
        "focus-visible:ring-white/50",

      "outline-white":
        "bg-transparent border-2 border-white text-white " +
        "hover:bg-white hover:text-primary-600 hover:border-white " +
        "active:bg-white/90 active:text-primary-700 active:border-white " +
        "focus-visible:ring-white/50",

      "icon-only":
        "bg-transparent text-gray-700 rounded-full " +
        "hover:bg-gray-100 hover:text-gray-900 " +
        "active:bg-gray-200 " +
        "focus-visible:ring-gray-200",

      "gallery-control":
        "bg-black/70 text-white border-2 border-white/30 shadow-2xl backdrop-blur-md rounded-xl " +
        "hover:bg-black/90 hover:border-white/50 hover:shadow-3xl " +
        "active:bg-black " +
        "focus-visible:ring-white/50",
    };

    // Show loading spinner on left if loading, otherwise show icon if provided
    const leftContent =
      loading && iconPosition === "left" ? (
        <LoadingSpinner size="sm" />
      ) : icon && iconPosition === "left" ? (
        <span className="flex items-center shrink-0">{icon}</span>
      ) : null;

    // For icon-only variant
    const iconOnlyContent = loading ? <LoadingSpinner size="sm" /> : icon;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={cn(
          baseStyles,
          sizeStyles[effectiveSize],
          variantStyles[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {variant === "icon-only" ? (
          iconOnlyContent
        ) : (
          <>
            {leftContent}
            {children && <span className="relative z-10 flex items-center">{children}</span>}
            {badge && (
              <span className="relative z-10 ml-1 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                {badge}
              </span>
            )}
            {icon && iconPosition === "right" && !loading && (
              <span className="relative z-10 flex items-center shrink-0">{icon}</span>
            )}
            {loading && iconPosition === "right" && <LoadingSpinner size="sm" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
