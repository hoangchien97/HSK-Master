"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

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
  size = "md",
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Chọn...",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(controlledValue || defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : selectedValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-3.5 text-base",
  };

  // Option size classes
  const optionSizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-3.5 text-base",
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
        <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-2">
          {label}
          {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${stateClasses}
            ${icon ? "pl-12" : ""}
            pr-12
            ${className}
          `}
        >
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <span className={selectedOption ? "" : "text-gray-400"}>
            {selectedOption?.label || placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            {isOpen ? (
              <ChevronUp
                className={`w-5 h-5 transition-colors ${
                  error ? "text-error-500" : disabled ? "text-gray-300" : "text-primary-500"
                }`}
              />
            ) : (
              <ChevronDown
                className={`w-5 h-5 transition-colors ${
                  error ? "text-error-500" : disabled ? "text-gray-300" : "text-gray-400"
                }`}
              />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary-500 rounded-xl shadow-2xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => {
                const isSelected = option.value === currentValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full ${optionSizeClasses[size]} text-left font-medium transition-all flex items-center justify-between
                      ${
                        option.disabled
                          ? "text-gray-300 cursor-not-allowed bg-gray-50"
                          : isSelected
                          ? "bg-primary-50 text-primary-600 font-bold cursor-pointer"
                          : "text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer"
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-5 h-5 text-primary-500" />}
                  </button>
                );
              })}
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
