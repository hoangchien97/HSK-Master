"use client"

import { cn } from "@/lib/utils"
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/constants/roles"

interface RoleBadgeProps {
  role: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RoleBadge({ role, size = "md", className }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role as UserRole] || { bg: "bg-gray-100", text: "text-gray-700" }
  const label = ROLE_LABELS[role as UserRole] || role

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        colors.bg,
        colors.text,
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  )
}
