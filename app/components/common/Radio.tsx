"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { useResponsive } from "@/app/hooks/useResponsive";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error,
      size,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const { isMobile } = useResponsive();
    const effectiveSize = isMobile ? "sm" : (size || "md");
    // Size classes
    const sizeClasses = {
      sm: "w-3.5 h-3.5 md:w-4 md:h-4",
      md: "w-4 h-4 md:w-5 md:h-5",
      lg: "w-5 h-5 md:w-6 md:h-6",
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
            type="radio"
            disabled={disabled}
            className={`
              ${sizeClasses[effectiveSize]}
              mt-0.5
              border-2
              transition-all
              accent-primary-500
              ${
                disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                  : error
                  ? "border-error-500 accent-error-600 focus:ring-4 focus:ring-error-100"
                  : "border-gray-300 hover:border-primary-400 focus:ring-4 focus:ring-primary-100"
              }
              ${className}
            `}
            style={{
              accentColor: error ? 'var(--error-500)' : disabled ? undefined : '#EC131E'
            }}
            {...props}
          />
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span
                  className={`text-xs md:text-sm font-medium ${
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
                <span className="text-[10px] md:text-xs text-gray-500 mt-0.5">
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

Radio.displayName = "Radio";
