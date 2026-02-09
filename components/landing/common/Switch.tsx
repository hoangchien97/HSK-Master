"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { useResponsive } from "@/hooks/useResponsive";

interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  disabled?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      helperText,
      error,
      size,
      required = false,
      disabled = false,
      checked,
      onCheckedChange,
      className = "",
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const { isMobile } = useResponsive();
    const inputId = id || props.name;
    const effectiveSize = isMobile ? "sm" : (size || "md");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    // Size configurations for container and thumb
    const sizeConfig = {
      sm: {
        width: "w-7 md:w-8",
        height: "h-3.5 md:h-4",
        thumbSize: "w-2.5 h-2.5 md:w-3 md:h-3",
        thumbTranslate: "translate-x-3.5 md:translate-x-4",
        thumbOffset: "left-0.5 top-0.5",
      },
      md: {
        width: "w-9 md:w-10",
        height: "h-4.5 md:h-5",
        thumbSize: "w-3.5 h-3.5 md:w-4 md:h-4",
        thumbTranslate: "translate-x-4.5 md:translate-x-5",
        thumbOffset: "left-0.5 top-0.5",
      },
      lg: {
        width: "w-11 md:w-12",
        height: "h-5.5 md:h-6",
        thumbSize: "w-4.5 h-4.5 md:w-5 md:h-5",
        thumbTranslate: "translate-x-5.5 md:translate-x-6",
        thumbOffset: "left-0.5 top-0.5",
      },
    };

    const config = sizeConfig[effectiveSize];

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2"
          >
            {label}
            {required && <span className="text-error-500">*</span>}
          </label>
        )}

        <div className="flex items-center gap-2 md:gap-3">
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
              checked={checked}
              onChange={handleChange}
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
