"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      size = "md",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex flex-col gap-1">
        <label
          className={`flex items-start gap-3 group ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`
              ${sizeClasses[size]}
              mt-0.5
              rounded-md border-2
              transition-all
              ${
                disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                  : error
                  ? "border-error-500 focus:ring-4 focus:ring-error-100 cursor-pointer"
                  : "border-gray-300 hover:border-primary-400 focus:ring-4 focus:ring-primary-100 cursor-pointer"
              }
              ${className}
            `}
            style={{
              accentColor: error ? '#DC2626' : disabled ? '#D1D5DB' : '#EC131E'
            }}
            {...props}
          />
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span
                  className={`text-sm font-medium ${
                    disabled
                      ? "text-gray-400"
                      : error
                      ? "text-error-700"
                      : "text-gray-900 group-hover:text-gray-700"
                  }`}
                >
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <span className="text-xs font-medium text-error-600 flex items-center gap-1 ml-8">
            <span className="w-1 h-1 bg-error-600 rounded-full"></span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
