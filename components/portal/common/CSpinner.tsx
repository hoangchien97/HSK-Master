"use client"

import { Spinner } from "@/components/ui/primitives/Spinner"
import { cn } from "@/lib/utils"

const COLOR_MAP: Record<string, string> = {
  primary: "var(--color-vermillion)",
  danger: "var(--color-vermillion)",
  secondary: "#0ea5e9",
  success: "var(--color-chinese-jade, #00a86b)",
  warning: "#f59e0b",
  default: "var(--color-muted)",
}

interface CSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default"
  variant?: "default" | "overlay" | "pill" | "pill-inline"
  /** @deprecated use variant="overlay" instead */
  overlay?: boolean
  className?: string
}

export function CSpinner({
  message = "Đang tải...",
  size = "lg",
  color = "danger",
  variant,
  overlay = false,
  className,
}: CSpinnerProps) {
  const resolvedVariant = variant ?? (overlay ? "overlay" : "default")
  const spinnerColor = COLOR_MAP[color] ?? COLOR_MAP.default

  if (resolvedVariant === "pill") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-[var(--color-smoke)]">
          <Spinner size="sm" color={spinnerColor} />
          {message && (
            <span className="text-xs text-[var(--color-muted)] font-medium">{message}</span>
          )}
        </div>
      </div>
    )
  }

  if (resolvedVariant === "pill-inline") {
    return (
      <div className={cn("flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-[var(--color-smoke)]", className)}>
        <Spinner size="sm" color={spinnerColor} />
        {message && (
          <span className="text-xs text-[var(--color-muted)] font-medium">{message}</span>
        )}
      </div>
    )
  }

  const content = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Spinner size={size} color={spinnerColor} />
      {message && (
        <p className="text-sm text-[var(--color-muted)] font-medium">{message}</p>
      )}
    </div>
  )

  if (resolvedVariant === "overlay") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
        {content}
      </div>
    )
  }

  return content
}
