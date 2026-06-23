"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/overlays/Modal";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type ModalSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

const SIZE_CLASSES: Record<ModalSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full mx-4",
};

interface CModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeIcon?: LucideIcon;
  isDismissable?: boolean;
  hideCloseButton?: boolean;
  scrollBehavior?: "inside" | "outside";
}

export function CModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "2xl",
  closeIcon: CloseIcon = X,
  isDismissable = true,
  hideCloseButton = false,
  scrollBehavior = "inside",
}: CModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isDismissable) onClose();
      }}
    >
      <DialogContent
        onPointerDownOutside={
          isDismissable ? undefined : (e) => e.preventDefault()
        }
        onEscapeKeyDown={
          isDismissable ? undefined : (e) => e.preventDefault()
        }
        className={cn(
          "p-0 gap-0 flex flex-col overflow-hidden",
          "bg-(--color-surface) rounded-xl",
          "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]",
          // hide shadcn's built-in close button — we render our own below
          "[&>button:last-child]:hidden",
          SIZE_CLASSES[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-(--color-smoke) shrink-0">
          <DialogTitle className="text-base font-semibold text-(--color-ink) flex items-center gap-2">
            {title}
          </DialogTitle>
          {!hideCloseButton && (
            <DialogClose
              onClick={onClose}
              className="ml-4 p-1.5 rounded-md hover:bg-(--color-smoke) text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Đóng"
            >
              <CloseIcon className="w-5 h-5" />
            </DialogClose>
          )}
        </div>

        {/* Body */}
        <div
          className={cn(
            "px-4 py-3 sm:px-6 sm:py-5",
            scrollBehavior === "inside" &&
              "overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4 border-t border-(--color-smoke) shrink-0">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
