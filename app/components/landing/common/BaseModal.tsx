"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useClickOutside } from "@/app/hooks/useClickOutside";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  
  // Header options
  header?: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  
  // Footer options
  footer?: React.ReactNode;
  
  // Behavior options
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  maxHeight?: string;
  
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
};

export default function BaseModal({
  isOpen,
  onClose,
  children,
  header,
  title,
  showCloseButton = true,
  footer,
  closeOnClickOutside = false,
  closeOnEscape = true,
  maxWidth = "2xl",
  maxHeight = "90vh",
  className,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useClickOutside(modalRef as React.RefObject<HTMLElement>, onClose, isOpen && closeOnClickOutside);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative bg-white rounded-xl shadow-2xl w-full flex flex-col",
          maxWidthClasses[maxWidth],
          className
        )}
        style={{ maxHeight }}
      >
        {/* Fixed Header */}
        {(header || title || showCloseButton) && (
          <div className="shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {header || (title && (
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                ))}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
