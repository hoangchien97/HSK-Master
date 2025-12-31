import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, required, className = "", id, children, options, ...props },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white mb-2"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={`block w-full rounded-lg py-2.5 pl-3 pr-10 text-gray-900 shadow-sm border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:bg-background-dark dark:border-gray-600 dark:text-white dark:focus:border-red-500 sm:text-sm sm:leading-6 cursor-pointer transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:20px] bg-[right_0.5rem_center] bg-no-repeat ${className}`}
            {...props}
          >
            {options
              ? options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
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

Select.displayName = "Select";

export default Select;
