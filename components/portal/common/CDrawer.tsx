"use client";

import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type DrawerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

const WIDTH_CLASSES: Record<DrawerSize, string> = {
  xs: "w-64",
  sm: "w-80",
  md: "w-96",
  lg: "w-[32rem]",
  xl: "w-[40rem]",
  "2xl": "w-[48rem]",
  "3xl": "w-[56rem]",
  "4xl": "w-[64rem]",
  "5xl": "w-[72rem]",
  full: "w-full",
};

interface CDrawerProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: ReactNode;
  children: ReactNode | ((onClose: () => void) => ReactNode);
  footer?: ReactNode | ((onClose: () => void) => ReactNode);
  size?: DrawerSize;
  closeIcon?: LucideIcon;
  placement?: "left" | "right" | "top" | "bottom";
  isDismissable?: boolean;
  hideCloseButton?: boolean;
}

export function CDrawer({
  isOpen,
  onOpenChange,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeIcon: CloseIcon = X,
  placement = "right",
  isDismissable = true,
  hideCloseButton = false,
}: CDrawerProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && !isDismissable) return;
    onOpenChange?.(open);
    if (!open) onClose?.();
  };

  const handleClose = () => {
    onOpenChange?.(false);
    onClose?.();
  };

  const isVertical = placement === "top" || placement === "bottom";
  const renderedChildren = typeof children === "function" ? children(handleClose) : children;
  const renderedFooter = typeof footer === "function" ? footer(handleClose) : footer;

  return (
    <VaulDrawer.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction={placement}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <VaulDrawer.Content
          className={cn(
            "fixed z-50 bg-[var(--color-surface)] flex flex-col shadow-xl",
            isVertical
              ? "inset-x-0 max-h-[85vh]"
              : cn("top-0 bottom-0", WIDTH_CLASSES[size]),
            placement === "right" && "right-0",
            placement === "left" && "left-0",
            placement === "bottom" && "bottom-0 rounded-t-2xl",
            placement === "top" && "top-0 rounded-b-2xl",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--color-smoke)] flex-shrink-0">
            <VaulDrawer.Title className="text-base font-semibold text-[var(--color-ink)] flex items-center gap-2">
              {title}
            </VaulDrawer.Title>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className="ml-4 p-1.5 rounded-md hover:bg-[var(--color-smoke)] text-[var(--color-muted)] transition-colors"
                aria-label="Đóng"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {renderedChildren}
          </div>

          {/* Footer */}
          {renderedFooter && (
            <div className="flex justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4 border-t border-[var(--color-smoke)] flex-shrink-0">
              {renderedFooter}
            </div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
