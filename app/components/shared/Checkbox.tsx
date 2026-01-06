"use client";

import { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-600
              accent-red-600
              focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-900
              transition-all cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              checked:border-red-600 dark:checked:border-red-500
              checked:bg-red-600 dark:checked:bg-red-500
              hover:border-red-400 dark:hover:border-red-400
              ${className}
            `}
            {...props}
          />
          {label && (
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark group-hover:text-text-main-light dark:group-hover:text-text-main-dark transition-colors">
              {label}
            </span>
          )}
        </label>
        {error && (
          <span className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
