"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
}

const Select = ({
  label,
  error,
  helperText,
  required,
  disabled,
  className = "",
  options = [],
  icon,
  size,
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Chọn...",
  name,
  id,
}: SelectProps) => {
  const { isMobile } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(controlledValue || defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : selectedValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);
  const effectiveSize = isMobile ? "sm" : (size || "md");
  const selectId = id || name;

  // Size classes
  const sizeClasses = {
    sm: "px-2.5 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs min-h-[28px] md:min-h-[32px]",
    md: "px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm min-h-[36px] md:min-h-[44px]",
    lg: "px-4 py-2.5 md:px-5 md:py-3.5 text-sm md:text-base min-h-[44px] md:min-h-[52px]",
  };

  // Option size classes
  const optionSizeClasses = {
    sm: "px-2.5 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs",
    md: "px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm",
    lg: "px-4 py-2.5 md:px-5 md:py-3.5 text-sm md:text-base",
  };

  // Base classes
  const baseClasses =
    "w-full rounded-xl border-2 font-medium transition-all outline-none flex items-center justify-between";

  // State classes
  const stateClasses = error
    ? "border-error-500 bg-error-50/30 text-error-900 focus:border-error-600 focus:ring-4 focus:ring-error-100 cursor-pointer"
    : disabled
    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
    : isOpen
    ? "border-primary-500 ring-4 ring-primary-100 cursor-pointer"
    : "border-gray-200 bg-white text-gray-900 hover:border-primary-300 cursor-pointer";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;

    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2"
        >
          {label}
          {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          id={selectId}
          onClick={handleToggle}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${sizeClasses[effectiveSize]}
            ${stateClasses}
            ${icon ? "pl-9 md:pl-12" : ""}
            pr-9 md:pr-12
            ${className}
          `}
        >
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4 pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <span className={selectedOption ? "" : "text-gray-400"}>
            {selectedOption?.label || placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 md:pr-4 pointer-events-none">
            {isOpen ? (
              <ChevronUp
                className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                  error ? "text-error-500" : disabled ? "text-gray-300" : "text-primary-500"
                }`}
              />
            ) : (
              <ChevronDown
                className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                  error ? "text-error-500" : disabled ? "text-gray-300" : "text-gray-400"
                }`}
              />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1.5 md:mt-2 bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-lg md:rounded-xl shadow-2xl overflow-hidden">
            <div className="max-h-44 md:max-h-48 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-3 py-6 md:px-4 md:py-8 text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                  Không có dữ liệu để hiển thị
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === currentValue;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={`
                        w-full ${optionSizeClasses[effectiveSize]} text-left font-medium transition-all flex items-center justify-between
                        ${
                          option.disabled
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-900"
                            : isSelected
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold cursor-pointer"
                            : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                        }
                      `}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
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
};

Select.displayName = "Select";

export default Select;
