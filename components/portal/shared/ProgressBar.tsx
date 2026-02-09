"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  color?: "red" | "blue" | "green" | "orange" | "purple" | "gray"
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  color = "red",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }

  const colorClasses = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  }

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showLabel && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
