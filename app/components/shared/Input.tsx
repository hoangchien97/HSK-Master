import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, required, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white mb-2"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">
                {icon}
              </span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`block w-full rounded-lg ${
              icon ? "pl-10" : "pl-3"
            } py-2.5 pr-3 text-gray-900 shadow-sm border border-gray-300 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:bg-background-dark dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:border-red-500 sm:text-sm sm:leading-6 transition-all outline-none ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
