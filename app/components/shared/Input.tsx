"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { Search, X } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode | string; // Support both Lucide icons and Material Icons (string)
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
      variant = "default",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    // Size classes
    const sizeClasses = {
      sm: "px-3 py-2 text-xs",
      md: "px-4 py-3 text-sm",
      lg: "px-5 py-3.5 text-base",
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
            className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-error-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              {typeof icon === 'string' ? (
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              ) : (
                icon
              )}
            </div>
          )}
          {variant === "search" && !icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`
              ${baseClasses}
              ${sizeClasses[size]}
              ${stateClasses}
              ${icon || variant === "search" ? "pl-12" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-error-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-error-600 rounded-full"></span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
