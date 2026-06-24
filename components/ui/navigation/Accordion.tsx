"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemData {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  variant?: "light" | "dark";
}

export function Accordion({ items, className, variant = "light" }: AccordionProps) {
  const defaultValues = items
    .map((item, i) => (item.defaultOpen ? String(i) : null))
    .filter(Boolean) as string[];

  const variantClasses = {
    item: variant === "dark" ? "border-b border-white/20" : "border-b border-(--color-smoke)",
    trigger:
      variant === "dark"
        ? "flex flex-1 items-center justify-between py-4 text-sm font-medium text-white transition-all hover:text-white/80"
        : "flex flex-1 items-center justify-between py-4 text-sm font-medium text-(--color-ink) transition-all hover:text-(--color-vermillion)",
    chevron:
      variant === "dark"
        ? "h-4 w-4 shrink-0 transition-transform duration-200 text-white/60"
        : "h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground",
    content: variant === "dark" ? "pb-4 pt-0 text-white/70" : "pb-4 pt-0 text-muted-foreground",
  };

  return (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={defaultValues}
      className={cn("w-full", className)}
    >
      {items.map((item, i) => (
        <AccordionPrimitive.Item
          key={i}
          value={String(i)}
          className={variantClasses.item}
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              className={cn(variantClasses.trigger, "[&[data-state=open]>svg]:rotate-180")}
            >
              {item.title}
              <ChevronDown className={variantClasses.chevron} />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className={variantClasses.content}>{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
export default Accordion;
