"use client"

import { Spinner } from "@heroui/react"
import { cn } from "@/app/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default"
}

export function LoadingSpinner({ size = "md", className, color = "danger" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Spinner size={size} color={color} />
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = "Đang tải..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 gap-4">
      <Spinner size="lg" color="danger" label={message} />
    </div>
  )
}
