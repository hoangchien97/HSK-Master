"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

type TabVariant = "underline" | "pill";

interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: TabVariant;
  className?: string;
  tabClassName?: string;
  panelClassName?: string;
}

export function Tabs({
  items,
  defaultIndex = 0,
  onChange,
  variant = "underline",
  className,
  tabClassName,
  panelClassName,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={String(defaultIndex)}
      onValueChange={(val) => onChange?.(Number(val))}
      className={cn("w-full", className)}
    >
      <TabsPrimitive.List
        className={cn(
          variant === "underline" &&
            "h-auto w-full justify-start rounded-none bg-transparent p-0 border-b border-(--color-smoke) flex",
          variant === "pill" &&
            "inline-flex h-auto items-center justify-center rounded-xl bg-muted p-1"
        )}
      >
        {items.map((item, i) => (
          <TabsPrimitive.Trigger
            key={i}
            value={String(i)}
            disabled={item.disabled}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-vermillion) focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-50",
              variant === "underline" && [
                "gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2 shadow-none",
                "data-[state=active]:border-(--color-vermillion) data-[state=active]:text-(--color-vermillion) data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "text-muted-foreground hover:text-(--color-ink)",
              ],
              variant === "pill" && [
                "rounded-md px-3 py-1.5",
                "data-[state=active]:bg-white data-[state=active]:text-(--color-ink) data-[state=active]:shadow-sm",
              ],
              tabClassName
            )}
          >
            {item.icon}
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item, i) => (
        <TabsPrimitive.Content
          key={i}
          value={String(i)}
          className={cn(
            "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-vermillion)",
            panelClassName
          )}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
export default Tabs;
