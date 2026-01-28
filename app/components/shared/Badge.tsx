import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "active" | "gradient";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  onClick,
  className = "",
}: BadgeProps) {
  const baseStyles =
    "whitespace-nowrap rounded-full font-medium transition-all inline-block";

  const sizeStyles = {
    sm: "px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[10px]",
    md: "px-2.5 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-1.5 text-[10px] md:text-xs lg:text-sm",
    lg: "px-3 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2 text-xs md:text-sm lg:text-base",
  };

  const variantStyles = {
    default:
      "bg-white dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 hover:ring-red-200 dark:hover:ring-red-800",
    active:
      "bg-brand-gradient text-[#fff] font-bold shadow-sm hover:shadow-md",
    gradient:
      "bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 uppercase tracking-wider",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Component>
  );
}
