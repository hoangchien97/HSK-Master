"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Label } from "./Label";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
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
    const isPassword = type === "password";
    const inputType = isPassword ? (showPwd ? "text" : "password") : type;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div
          className={cn(
            "flex items-center h-10 w-full rounded-sm border bg-white px-3 text-sm transition-colors",
            "border-(--color-smoke) focus-within:border-(--color-vermillion) focus-within:ring-1 focus-within:ring-(--color-vermillion)",
            error &&
              "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
          )}
        >
          {leftIcon && (
            <span className="mr-2 text-muted-foreground shrink-0">
              {leftIcon}
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
                : hint
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
        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className="mt-1 text-xs text-muted-foreground"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
