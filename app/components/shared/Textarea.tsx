"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { useResponsive } from "@/app/hooks/useResponsive";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, size, className = "", id, ...props }, ref) => {
    const { isMobile } = useResponsive();
    const textareaId = id || props.name;
    const effectiveSize = isMobile ? "sm" : (size || "md");

    // Size classes
    const sizeClasses = {
      sm: "px-2.5 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs min-h-[80px] md:min-h-[96px]",
      md: "px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm min-h-[100px] md:min-h-[120px]",
      lg: "px-4 py-2.5 md:px-5 md:py-3.5 text-sm md:text-base min-h-[120px] md:min-h-[144px]",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2"
          >
            {label}
            {required && <span className="text-error-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          className={`block w-full rounded-lg md:rounded-xl border-2 font-medium transition-all outline-none resize-y ${
            sizeClasses[effectiveSize]
          } ${
            error
              ? "border-error-500 bg-error-50/30 text-error-900 placeholder:text-error-400 focus:border-error-600 focus:ring-error-100"
              : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          } ${className}`}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export default Textarea;
