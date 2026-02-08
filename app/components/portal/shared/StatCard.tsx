"use client"

import { ReactNode } from "react"
import { cn } from "@/app/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  iconBg?: string
  color?: "red" | "green" | "blue" | "yellow" | "purple" | "gray"
  trend?: {
    value: number
    label?: string
  }
  className?: string
}

const colorMap = {
  red: "bg-red-100 text-red-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  yellow: "bg-yellow-100 text-yellow-600",
  purple: "bg-purple-100 text-purple-600",
  gray: "bg-gray-100 text-gray-600",
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = "bg-gray-100",
  color,
  trend,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (!trend) return ""
    if (trend.value > 0) return "text-green-600 bg-green-50"
    if (trend.value < 0) return "text-red-600 bg-red-50"
    return "text-gray-600 bg-gray-50"
  }

  const iconBgClass = color ? colorMap[color] : iconBg

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl", iconBgClass)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
      {children}
    </div>
  )
}
