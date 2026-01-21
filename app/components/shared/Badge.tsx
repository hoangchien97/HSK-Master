import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "active";
  onClick?: () => void;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  onClick,
  className = "",
}: BadgeProps) {
  const baseStyles =
    "whitespace-nowrap rounded-full px-2.5 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-1.5 text-[10px] md:text-xs lg:text-sm font-medium transition-all";
  const variantStyles = {
    default:
      "bg-white dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 hover:ring-red-200 dark:hover:ring-red-800",
    active:
      "bg-brand-gradient text-[#fff] font-bold shadow-sm hover:shadow-md",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Component>
  );
}
