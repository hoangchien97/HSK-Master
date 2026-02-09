"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "search";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      error,
      helperText,
      required,
      disabled,
      readOnly,
      size = "md",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    // Size classes
    const sizeClasses = {
      sm: "px-3 py-2 text-xs h-[36px]",
      md: "px-4 py-3 text-sm h-[44px]",
      lg: "px-5 py-3.5 text-base h-[48px]",
    };

    // Base classes
    const baseClasses =
      "block w-full rounded-xl border-2 font-medium transition-all outline-none";

    // State classes
    const stateClasses = error
      ? "border-error-500 bg-error-50/30 text-error-900 placeholder:text-error-400 focus:border-error-600 focus:ring-4 focus:ring-error-100"
      : disabled
      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
      : readOnly
      ? "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
      : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-error-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              baseClasses,
              sizeClasses[size],
              stateClasses,
              icon && "pl-12",
              className
            )}
            {...props}
          />
        </div>
        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-error-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-error-600 rounded-full"></span>
            {error}
          </p>
        )}
        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
