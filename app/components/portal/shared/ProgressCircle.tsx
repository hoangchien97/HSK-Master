"use client"

import { cn } from "@/lib/utils"

interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  color?: "red" | "green" | "blue" | "yellow" | "purple"
}

const colorMap = {
  red: {
    stroke: "stroke-red-500",
    text: "text-red-600",
  },
  green: {
    stroke: "stroke-green-500",
    text: "text-green-600",
  },
  blue: {
    stroke: "stroke-blue-500",
    text: "text-blue-600",
  },
  yellow: {
    stroke: "stroke-yellow-500",
    text: "text-yellow-600",
  },
  purple: {
    stroke: "stroke-purple-500",
    text: "text-purple-600",
  },
}

export function ProgressCircle({
  percentage,
  size = 64,
  strokeWidth = 4,
  className,
  showLabel = true,
  color = "red",
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colors = colorMap[color]

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-200 fill-none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-500", colors.stroke)}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            "absolute font-semibold text-xs",
            colors.text
          )}
        >
          {percentage}%
        </span>
      )}
    </div>
  )
}
