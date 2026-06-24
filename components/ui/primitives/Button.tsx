"use client";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "gradient"
  | "white"
  | "outline-white"
  | "icon-only"
  | "gallery-control"
  | "outline";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  // Landing compat aliases
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  badge?: string | number;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-(--color-vermillion) text-white hover:bg-(--color-vermillion-hover) active:scale-[0.98]",
  secondary:
    "bg-transparent border border-(--color-smoke) text-(--color-ink) hover:bg-(--color-paper)",
  ghost: "bg-transparent text-(--color-ink) hover:bg-(--color-paper)",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
  gradient:
    "relative overflow-hidden bg-linear-to-r from-(--color-vermillion) to-orange-500 text-white shadow-lg " +
    "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] " +
    "before:absolute before:inset-0 before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent " +
    "before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
  white:
    "bg-white text-(--color-vermillion) shadow-md hover:bg-gray-50 hover:shadow-lg active:bg-gray-100",
  "outline-white":
    "bg-transparent border-2 border-white text-white hover:bg-white hover:text-(--color-vermillion) active:bg-white/90",
  "icon-only":
    "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
  "gallery-control":
    "bg-black/70 text-white border-2 border-white/30 shadow-2xl backdrop-blur-md " +
    "hover:bg-black/90 hover:border-white/50",
  outline:
    "bg-transparent border-2 border-(--color-vermillion) text-(--color-vermillion) " +
    "hover:bg-(--color-vermillion) hover:text-white active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      isDisabled,
      leftIcon,
      rightIcon,
      loading,
      icon,
      iconPosition = "right",
      fullWidth,
      badge,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const active = isLoading ?? loading ?? false;
    const iconOnly = variant === "icon-only";

    // Resolve icon placement from both API styles
    const resolvedLeft =
      leftIcon ?? (icon && iconPosition === "left" ? icon : null);
    const resolvedRight =
      rightIcon ?? (icon && iconPosition !== "left" && !leftIcon ? icon : null);

    return (
      <button
        ref={ref}
        disabled={isDisabled || active}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-vermillion)",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          iconOnly ? "rounded-full p-2" : cn("rounded-md", sizeClasses[size]),
          variantClasses[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {iconOnly ? (
          active ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            resolvedLeft ?? icon
          )
        ) : (
          <>
            {active ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              resolvedLeft
            )}
            {children && (
              <span className="relative z-10 flex items-center">{children}</span>
            )}
            {badge && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                {badge}
              </span>
            )}
            {!active && resolvedRight}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
