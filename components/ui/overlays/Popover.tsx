"use client";
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function Popover({
  trigger,
  children,
  align = "center",
  side = "bottom",
  sideOffset = 6,
  isOpen,
  onOpenChange,
  defaultOpen,
  showCloseButton = false,
  className,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
    >
      <PopoverPrimitive.Trigger asChild>
        {React.isValidElement(trigger) ? (
          trigger
        ) : (
          <button type="button">{trigger}</button>
        )}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 rounded-xl border border-(--color-smoke) bg-white p-4 shadow-lg outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
        >
          {children}
          {showCloseButton && (
            <PopoverPrimitive.Close className="absolute right-3 top-3 rounded-md p-0.5 text-muted-foreground hover:bg-(--color-smoke) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-vermillion)">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </PopoverPrimitive.Close>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
export default Popover;
