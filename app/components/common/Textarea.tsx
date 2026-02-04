"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      disabled,
      readOnly,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;

    const baseClasses =
      "block w-full rounded-xl border-2 font-medium transition-all outline-none px-4 py-3 text-sm min-h-[120px] resize-y";

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
            htmlFor={textareaId}
            className="flex items-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-error-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(baseClasses, stateClasses, className)}
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
