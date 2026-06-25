"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useId } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    "onChange"
  > {
  label?: string;
  description?: string;
  helperText?: string;
  error?: string;
  size?: string;
  onChange?: (checked: boolean) => void;
}

export function Switch({
  label,
  description,
  helperText,
  error,
  size: _size,
  onChange,
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  void _size;
  const resolvedDescription = description ?? helperText;
  const autoId = useId();
  const id = props.id ?? autoId;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SwitchPrimitives.Root
        id={id}
        onCheckedChange={onCheckedChange ?? onChange}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-vermillion) focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-(--color-vermillion) data-[state=unchecked]:bg-(--color-smoke)"
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        />
      </SwitchPrimitives.Root>
      {(label || resolvedDescription || error) && (
        <div>
          {label && (
            <label
              htmlFor={id}
              className="cursor-pointer select-none text-sm font-medium text-(--color-ink)"
            >
              {label}
            </label>
          )}
          {resolvedDescription && (
            <p className="text-xs text-muted-foreground">{resolvedDescription}</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
export default Switch;
