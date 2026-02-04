"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantConfig = {
  success: {
    container: "bg-green-50 border-green-200 text-green-900",
    icon: CheckCircle,
    iconColor: "text-green-500",
    titleColor: "text-green-800",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-900",
    icon: XCircle,
    iconColor: "text-red-500",
    titleColor: "text-red-800",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-900",
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-800",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    icon: Info,
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
  },
};

export default function Alert({
  variant = "info",
  title,
  children,
  className = "",
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 flex gap-3",
        config.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1">
        {title && (
          <h4 className={cn("font-semibold mb-1", config.titleColor)}>
            {title}
          </h4>
        )}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

export { Alert };
