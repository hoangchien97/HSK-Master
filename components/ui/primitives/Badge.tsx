import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "active"
  | "gradient";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-(--color-smoke) text-(--color-ink)",
  primary: "bg-(--color-vermillion) text-white",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  active: "bg-linear-to-r from-yellow-400 to-red-500 text-white font-bold shadow-sm",
  gradient:
    "bg-linear-to-r from-yellow-400 via-red-500 to-red-600 text-white font-bold shadow-lg " +
    "hover:shadow-xl hover:scale-105 uppercase tracking-wider",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  onClick,
}: BadgeProps) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap transition-all",
        variantClasses[variant],
        sizeClasses[size],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </Comp>
  );
}
export default Badge;
