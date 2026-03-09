"use client"

import { CSpinner } from "./CSpinner"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default"
}

/** @deprecated Use CSpinner instead */
export function LoadingSpinner({ size = "md", className, color = "danger" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <CSpinner size={size} color={color} message="" />
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

/** @deprecated Use CSpinner instead */
export function PageLoading({ message = "Đang tải..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 gap-4">
      <CSpinner size="lg" color="danger" message={message} />
    </div>
  )
}
