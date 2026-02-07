"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CDrawerProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: ReactNode;
  children: ReactNode | ((onClose: () => void) => ReactNode);
  footer?: ReactNode | ((onClose: () => void) => ReactNode);
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
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
    onOpenChange?.(open);
    if (!open) {
      onClose?.();
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange || handleOpenChange}
      size={size}
      placement={placement}
      isDismissable={isDismissable}
      hideCloseButton={hideCloseButton}
      classNames={{
        header: "border-b-[1px] border-[#292f46] sticky top-0 z-10 bg-content1",
        body: "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
        footer: "sticky bottom-0 z-10 bg-content1",
      }}
    >
      <DrawerContent>
        {(drawerOnClose) => {
          const handleClose = onClose || drawerOnClose;
          const renderedChildren = typeof children === "function" ? children(handleClose) : children;
          const renderedFooter = typeof footer === "function" ? footer(handleClose) : footer;

          return (
            <>
              {!hideCloseButton && (
                <button
                  onClick={handleClose}
                  className="absolute top-[14px] right-4 z-50 p-1.5 rounded-lg hover:bg-default-100 transition-colors"
                  aria-label="Close"
                >
                  <CloseIcon className="w-5 h-5 text-default-500" />
                </button>
              )}
              <DrawerHeader className="flex items-center gap-2">
                {title}
              </DrawerHeader>
              <DrawerBody>
                {renderedChildren}
              </DrawerBody>
              {renderedFooter && (
                <DrawerFooter>
                  {renderedFooter}
                </DrawerFooter>
              )}
            </>
          );
        }}
      </DrawerContent>
    </Drawer>
  );
}
