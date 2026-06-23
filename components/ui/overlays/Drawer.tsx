"use client";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerSide = "right" | "left" | "bottom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: DrawerSide;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sideContentClasses: Record<DrawerSide, string> = {
  bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl",
  right: "right-0 top-0 bottom-0 w-80 md:w-96 rounded-none",
  left: "left-0 top-0 bottom-0 w-80 md:w-96 rounded-none",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  side = "right",
  children,
  footer,
  className,
}: DrawerProps) {
  const isBottom = side === "bottom";

  return (
    <DrawerPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction={isBottom ? "bottom" : side}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <DrawerPrimitive.Content
          className={cn(
            "fixed z-50 bg-white flex flex-col shadow-xl",
            sideContentClasses[side],
            className
          )}
        >
          {isBottom && (
            <div className="mx-auto mt-3 mb-2 h-1.5 w-10 rounded-full bg-(--color-smoke)" />
          )}
          {(title || description) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-(--color-smoke)">
              <div>
                {title && (
                  <DrawerPrimitive.Title className="text-base font-semibold text-(--color-ink)">
                    {title}
                  </DrawerPrimitive.Title>
                )}
                {description && (
                  <DrawerPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </DrawerPrimitive.Description>
                )}
              </div>
              <DrawerPrimitive.Close
                onClick={onClose}
                className="ml-4 p-1 rounded-md hover:bg-(--color-smoke) text-muted-foreground"
              >
                <X size={18} />
              </DrawerPrimitive.Close>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-(--color-smoke) flex justify-end gap-2">
              {footer}
            </div>
          )}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
export default Drawer;
