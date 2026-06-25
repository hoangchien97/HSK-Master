"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Label } from "./Label";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
  // Landing compat aliases
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: string;
}

const sizeClasses = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      helperText,
      leftIcon,
      rightIcon,
      icon,
      size = "md",
      variant: _variant, // consumed here — prevents spreading to native <input>
      type = "text",
      wrapperClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const [showPwd, setShowPwd] = useState(false);
    void _variant; // consumed to prevent leaking to native <input>
    const resolvedHint = hint ?? helperText;
    const isPassword = type === "password";
    const inputType = isPassword ? (showPwd ? "text" : "password") : type;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const resolvedLeft = leftIcon ?? icon;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div
          className={cn(
            "flex items-center w-full rounded-sm border bg-white px-3 transition-colors",
            sizeClasses[size],
            "border-(--color-smoke) focus-within:border-(--color-vermillion) focus-within:ring-1 focus-within:ring-(--color-vermillion)",
            error &&
              "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
          )}
        >
          {resolvedLeft && (
            <span className="mr-2 text-muted-foreground shrink-0">
              {resolvedLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            required={required}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-(--color-ink) min-w-0",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : resolvedHint
                  ? `${inputId}-hint`
                  : undefined
            }
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="ml-2 text-muted-foreground shrink-0"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : rightIcon ? (
            <span className="ml-2 text-muted-foreground shrink-0">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
        {!error && resolvedHint && (
          <p
            id={`${inputId}-hint`}
            className="mt-1 text-xs text-muted-foreground"
          >
            {resolvedHint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
