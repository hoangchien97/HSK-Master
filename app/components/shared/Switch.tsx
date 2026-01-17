"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      helperText,
      error,
      size = "md",
      required = false,
      disabled = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    // Size configurations for container and thumb
    const sizeConfig = {
      sm: {
        width: "w-8",
        height: "h-4",
        thumbSize: "w-3 h-3",
        thumbTranslate: "translate-x-4",
        thumbOffset: "left-0.5 top-0.5",
      },
      md: {
        width: "w-10",
        height: "h-5",
        thumbSize: "w-4 h-4",
        thumbTranslate: "translate-x-5",
        thumbOffset: "left-0.5 top-0.5",
      },
      lg: {
        width: "w-12",
        height: "h-6",
        thumbSize: "w-5 h-5",
        thumbTranslate: "translate-x-6",
        thumbOffset: "left-0.5 top-0.5",
      },
    };

    const config = sizeConfig[size];

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

        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            className={`relative inline-block ${config.width} ${config.height} ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />

            {/* Switch background */}
            <span
              className={`
                absolute inset-0 rounded-full transition-colors duration-200
                ${
                  disabled
                    ? "bg-gray-200"
                    : error
                    ? "bg-error-300 peer-checked:bg-error-500"
                    : "bg-gray-300 peer-checked:bg-primary-500"
                }
                ${!disabled && "peer-focus:ring-4 peer-focus:ring-primary-100"}
              `}
            />

            {/* Switch thumb */}
            <span
              className={`
                absolute ${config.thumbOffset} ${config.thumbSize}
                bg-white rounded-full shadow-md
                transition-transform duration-200 ease-in-out
                ${!disabled && `peer-checked:${config.thumbTranslate}`}
              `}
            />
          </label>
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

Switch.displayName = "Switch";
