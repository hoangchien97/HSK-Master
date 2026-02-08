"use client";

import { cn } from "@/app/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "white" | "gray";
}

const sizeClasses = {
  xs: "w-3 h-3 border-2",
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
  xl: "w-16 h-16 border-4",
};

const colorClasses = {
  primary: "border-primary-600 border-t-transparent",
  white: "border-white border-t-transparent",
  gray: "border-gray-400 border-t-transparent",
};

export default function LoadingSpinner({
  size = "md",
  className = "",
  color = "primary",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
