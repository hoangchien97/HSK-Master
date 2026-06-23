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
}

export function Accordion({ items, className }: AccordionProps) {
  const defaultValues = items
    .map((item, i) => (item.defaultOpen ? String(i) : null))
    .filter(Boolean) as string[];

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
          className="border-b border-(--color-smoke)"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              className={cn(
                "flex flex-1 items-center justify-between py-4 text-sm font-medium text-(--color-ink) transition-all hover:text-(--color-vermillion)",
                "[&[data-state=open]>svg]:rotate-180"
              )}
            >
              {item.title}
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pb-4 pt-0 text-muted-foreground">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
export default Accordion;
