"use client";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-(--color-vermillion) text-white hover:bg-(--color-vermillion-hover) active:scale-[0.98]",
  secondary:
    "bg-transparent border border-(--color-smoke) text-(--color-ink) hover:bg-(--color-paper)",
  ghost: "bg-transparent text-(--color-ink) hover:bg-(--color-paper)",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
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
      children,
      className,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={isDisabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-vermillion)",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
