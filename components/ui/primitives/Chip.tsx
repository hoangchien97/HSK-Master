import React from "react";
import { cn } from "@/lib/utils";

type ChipVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";
type ChipSize = "sm" | "md" | "lg";

interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
}

const variantClasses: Record<ChipVariant, string> = {
  default: "bg-(--color-smoke) text-(--color-ink)",
  primary: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

const sizeClasses: Record<ChipSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1",
};

export function Chip({
  children,
  variant = "default",
  size = "md",
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
export default Chip;
