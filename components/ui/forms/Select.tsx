"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  // Landing compat aliases
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Select({
  label,
  error,
  hint,
  helperText,
  options,
  value: controlledValue,
  onChange,
  placeholder = "Chọn...",
  className,
  required,
  disabled,
  size: _size,
  icon: _icon,
}: SelectProps) {
  void _size;
  void _icon;
  const id = useId();
  const resolvedHint = hint ?? helperText;

  // Support uncontrolled usage (no value prop)
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={handleChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-sm border bg-white px-3 py-2 text-sm transition-colors",
            "border-(--color-smoke) focus:outline-none focus:ring-1 focus:ring-(--color-vermillion) focus:border-(--color-vermillion)",
            "data-placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            error && "border-red-500 focus:ring-red-500"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            className={cn(
              "relative z-50 max-h-[--radix-select-content-available-height] min-w-32 overflow-y-auto overflow-x-hidden rounded-md border bg-white text-(--color-ink) shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1"
            )}
          >
            <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
              <ChevronUp className="h-4 w-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1 h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                    "focus:bg-(--color-paper) focus:text-(--color-ink)",
                    "data-disabled:pointer-events-none data-disabled:opacity-50"
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
              <ChevronDown className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && resolvedHint && (
        <p className="mt-1 text-xs text-muted-foreground">{resolvedHint}</p>
      )}
    </div>
  );
}
export default Select;
