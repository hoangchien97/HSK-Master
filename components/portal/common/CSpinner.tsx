"use client"

import { Spinner } from "@heroui/react"
import { cn } from "@/lib/utils"

interface CSpinnerProps {
  /** Loading message displayed below/beside spinner */
  message?: string
  /** Spinner size */
  size?: "sm" | "md" | "lg"
  /** Spinner color */
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default"
  /**
   * Visual variant:
   * - "default" — vertically stacked spinner + message (inline)
   * - "overlay" — full backdrop overlay, centers spinner over parent (parent must be `relative`)
   * - "pill"    — small horizontal pill floating over parent (parent must be `relative`)
   */
  variant?: "default" | "overlay" | "pill"
  /** @deprecated use variant="overlay" instead */
  overlay?: boolean
  /** Additional className for the container */
  className?: string
}

/**
 * CSpinner — unified reusable loading spinner.
 *
 * Usage:
 * - `<CSpinner />`                         — inline, vertically stacked
 * - `<CSpinner variant="overlay" />`       — full backdrop overlay
 * - `<CSpinner variant="pill" />`          — floating pill (absolute, z-20)
 * - `<CSpinner size="sm" message="" />`    — small spinner, no label
 *
 * Parents of "overlay" and "pill" variants must have `position: relative`.
 */
export function CSpinner({
  message = "Đang tải...",
  size = "lg",
  color = "danger",
  variant,
  overlay = false,
  className,
}: CSpinnerProps) {
  // Normalise: legacy `overlay` prop → variant="overlay"
  const resolvedVariant = variant ?? (overlay ? "overlay" : "default")

  /* ── Pill: small floating pill above content ── */
  if (resolvedVariant === "pill") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-default-200">
          <Spinner size="sm" color={color === "danger" ? "primary" : color} classNames={{ wrapper: "w-4 h-4" }} />
          {message && (
            <span className="text-xs text-default-500 font-medium">{message}</span>
          )}
        </div>
      </div>
    )
  }

  /* ── Shared inner content (default + overlay) ── */
  const content = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Spinner size={size} color={color} />
      {message && (
        <p className="text-sm text-default-500 font-medium">{message}</p>
      )}
    </div>
  )

  /* ── Overlay: full backdrop ── */
  if (resolvedVariant === "overlay") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
        {content}
      </div>
    )
  }

  /* ── Default: inline ── */
  return content
}
