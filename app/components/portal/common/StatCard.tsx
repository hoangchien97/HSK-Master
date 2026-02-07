"use client"

import { cn } from "@/lib/utils"
import { Card, CardBody } from "@heroui/react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
  iconBg?: string
  iconColor?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  iconBg = "bg-red-100",
  iconColor = "text-red-600",
}: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardBody className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.value >= 0 ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={cn(
                "text-sm font-medium",
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <div className={cn("w-6 h-6", iconColor)}>{icon}</div>
        </div>
      </div>
      </CardBody>
    </Card>
  )
}
