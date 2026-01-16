"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  switchSize?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      switchSize = "md",
      className = "",
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    // Size configurations
    const sizeConfig = {
      sm: {
        container: "w-8 h-4",
        thumb: "w-3 h-3",
        translate: "translate-x-4",
      },
      md: {
        container: "w-10 h-5",
        thumb: "w-4 h-4",
        translate: "translate-x-5",
      },
      lg: {
        container: "w-12 h-6",
        thumb: "w-5 h-5",
        translate: "translate-x-6",
      },
    };

    const config = sizeConfig[switchSize];

    return (
      <div className="flex flex-col gap-1">
        <label
          className={`flex items-center justify-between gap-4 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span
                  className={`text-sm font-medium ${
                    disabled ? "text-gray-400" : "text-gray-900"
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
          <div className="relative inline-flex items-center">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              checked={checked}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`
                ${config.container}
                rounded-full
                transition-all duration-200
                ${
                  disabled
                    ? "bg-gray-200 cursor-not-allowed"
                    : "peer-checked:bg-primary-500 peer-focus:ring-4 peer-focus:ring-primary-100 bg-gray-300"
                }
                ${className}
              `}
            >
              <div
                className={`
                  ${config.thumb}
                  bg-white
                  rounded-full
                  shadow-md
                  transition-transform duration-200
                  absolute
                  top-0.5
                  left-0.5
                  ${checked ? config.translate : ""}
                `}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }
);

Switch.displayName = "Switch";
