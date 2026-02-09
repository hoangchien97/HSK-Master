"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";

type DrawerDirection = "top" | "right" | "bottom" | "left";

interface BaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  
  // Direction
  direction?: DrawerDirection;
  
  // Header options
  header?: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  
  // Footer options
  footer?: React.ReactNode;
  
  // Behavior options
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  
  // Size options
  size?: "sm" | "md" | "lg" | "xl" | "full";
  
  className?: string;
}

const sizeClasses = {
  top: {
    sm: "h-1/4",
    md: "h-1/3",
    lg: "h-1/2",
    xl: "h-2/3",
    full: "h-full",
  },
  bottom: {
    sm: "h-1/4",
    md: "h-1/3",
    lg: "h-1/2",
    xl: "h-2/3",
    full: "h-full",
  },
  left: {
    sm: "w-80",
    md: "w-96",
    lg: "w-[480px]",
    xl: "w-[600px]",
    full: "w-full",
  },
  right: {
    sm: "w-80",
    md: "w-96",
    lg: "w-[480px]",
    xl: "w-[600px]",
    full: "w-full",
  },
};

const positionClasses: Record<DrawerDirection, string> = {
  top: "top-0 left-0 right-0",
  bottom: "bottom-0 left-0 right-0",
  left: "top-0 bottom-0 left-0",
  right: "top-0 bottom-0 right-0",
};

const animationClasses: Record<DrawerDirection, { enter: string; exit: string }> = {
  top: {
    enter: "animate-slide-in-from-top",
    exit: "animate-slide-out-to-top",
  },
  bottom: {
    enter: "animate-slide-in-from-bottom",
    exit: "animate-slide-out-to-bottom",
  },
  left: {
    enter: "animate-slide-in-from-left",
    exit: "animate-slide-out-to-left",
  },
  right: {
    enter: "animate-slide-in-from-right",
    exit: "animate-slide-out-to-right",
  },
};

export default function BaseDrawer({
  isOpen,
  onClose,
  children,
  direction = "right",
  header,
  title,
  showCloseButton = true,
  footer,
  closeOnClickOutside = true,
  closeOnEscape = true,
  size = "lg",
  className,
}: BaseDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useClickOutside(drawerRef as React.RefObject<HTMLElement>, onClose, isOpen && closeOnClickOutside);

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

  const isHorizontal = direction === "left" || direction === "right";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed bg-white shadow-2xl flex flex-col",
          positionClasses[direction],
          sizeClasses[direction][size],
          isOpen ? animationClasses[direction].enter : animationClasses[direction].exit,
          isHorizontal && "border-l border-gray-200",
          !isHorizontal && "border-t border-gray-200",
          className
        )}
      >
        {/* Fixed Header */}
        {(header || title || showCloseButton) && (
          <div className="shrink-0 px-6 py-5 border-b border-gray-200 bg-white">
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
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
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
