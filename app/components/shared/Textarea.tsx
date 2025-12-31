import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white mb-2"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          className={`block w-full rounded-lg py-2.5 px-3 text-gray-900 shadow-sm border border-gray-300 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:bg-background-dark dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:border-red-500 sm:text-sm sm:leading-6 transition-all outline-none resize-y ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
