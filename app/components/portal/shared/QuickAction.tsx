"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/app/lib/utils"

interface QuickActionProps {
  href: string
  icon: ReactNode
  title: string
  subtitle?: string
  color?: "default" | "red" | "blue" | "green" | "orange" | "purple"
  className?: string
}

export function QuickAction({
  href,
  icon,
  title,
  subtitle,
  color = "default",
  className,
}: QuickActionProps) {
  const colorStyles = {
    default: "hover:border-gray-400 hover:bg-gray-50",
    red: "hover:border-red-500 hover:bg-red-50",
    blue: "hover:border-blue-500 hover:bg-blue-50",
    green: "hover:border-green-500 hover:bg-green-50",
    orange: "hover:border-orange-500 hover:bg-orange-50",
    purple: "hover:border-purple-500 hover:bg-purple-50",
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl transition-all duration-200 text-center group",
        colorStyles[color],
        className
      )}
    >
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="font-medium text-gray-900">{title}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      )}
    </Link>
  )
}

interface QuickActionGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4 | 6
  className?: string
}

export function QuickActionGrid({
  children,
  columns = 4,
  className,
}: QuickActionGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  )
}
