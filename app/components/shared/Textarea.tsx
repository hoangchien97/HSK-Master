import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;

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
          className={`block w-full rounded-lg md:rounded-xl border-2 border-gray-200 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all outline-none resize-y hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${
            error
              ? "border-error-500 bg-error-50/30 text-error-900 placeholder:text-error-400 focus:border-error-600 focus:ring-error-100"
              : ""
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
