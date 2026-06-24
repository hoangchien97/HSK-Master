"use client";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
  error?: string;
  size?: string;
}

export function Checkbox({
  label,
  description,
  error,
  size: _size,
  className,
  id,
  ...props
}: CheckboxProps) {
  void _size;
  const inputId =
    id ?? `checkbox-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-start gap-2">
      <CheckboxPrimitive.Root
        id={inputId}
        className={cn(
          "mt-0.5 grid place-content-center h-4 w-4 shrink-0 rounded-sm border transition-colors",
          "border-(--color-smoke) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-vermillion) focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-(--color-vermillion) data-[state=checked]:border-(--color-vermillion) data-[state=checked]:text-white",
          error && "border-red-500",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
          <Check className="h-3 w-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {(label || description) && (
        <div>
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-(--color-ink) cursor-pointer leading-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
          {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
      )}
    </div>
  );
}
export default Checkbox;
