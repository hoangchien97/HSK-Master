"use client";
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "start" | "end" | "center";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "end",
  className,
}: DropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {React.isValidElement(trigger) ? (
          trigger
        ) : (
          <button type="button">{trigger}</button>
        )}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={4}
          className={cn(
            "z-50 min-w-44 overflow-hidden rounded-md border bg-white p-1 text-(--color-ink) shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
        >
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.divider && (
                <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-(--color-smoke)" />
              )}
              <DropdownMenuPrimitive.Item
                disabled={item.disabled}
                onSelect={() => item.onClick?.()}
                className={cn(
                  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "focus:bg-(--color-paper) focus:text-(--color-ink)",
                  "data-disabled:pointer-events-none data-disabled:opacity-50"
                )}
              >
                {item.icon && (
                  <span className="text-muted-foreground">{item.icon}</span>
                )}
                {item.label}
              </DropdownMenuPrimitive.Item>
            </React.Fragment>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
export default Dropdown;
