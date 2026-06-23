"use client";
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

interface RadioOption {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    "orientation"
  > {
  items: RadioOption[];
  orientation?: "horizontal" | "vertical";
}

export function RadioGroup({
  items,
  orientation = "vertical",
  className,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={cn(
        orientation === "horizontal"
          ? "flex flex-row gap-4"
          : "flex flex-col gap-2",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const itemId = `radio-${props.name ?? "group"}-${item.value}`;
        return (
          <div key={item.value} className="flex items-start gap-2">
            <RadioGroupPrimitive.Item
              value={item.value}
              id={itemId}
              disabled={item.disabled}
              className={cn(
                "mt-0.5 aspect-square h-4 w-4 rounded-full border border-(--color-smoke) text-(--color-vermillion)",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-vermillion) focus-visible:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "data-[state=checked]:border-(--color-vermillion)"
              )}
            >
              <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 fill-current text-current" />
              </RadioGroupPrimitive.Indicator>
            </RadioGroupPrimitive.Item>
            {(item.label || item.description) && (
              <div>
                {item.label && (
                  <Label htmlFor={itemId} className="mb-0 cursor-pointer">
                    {item.label}
                  </Label>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}

export { RadioGroup as Radio };
export default RadioGroup;
