"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isDismissable={isDismissable}
      hideCloseButton={hideCloseButton}
      scrollBehavior={scrollBehavior}
      classNames={{
        header: "py-4 px-6 md:py-6 md:px-6 border-b-[1px] border-[#292f46]",
        footer: "py-4 px-6 md:py-6 md:px-6 border-t-[1px] border-[#292f46]",
        closeButton: "top-[14px] right-4",
        body: "max-h-[90vh] overflow-y-auto px-4 py-4 md:px-6 md:py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
      }}
    >
      <ModalContent>
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-[14px] right-4 z-50 p-1.5 rounded-lg hover:bg-default-100 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5 text-default-500" />
          </button>
        )}
        <ModalHeader className="flex items-center gap-2">
          {title}
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
