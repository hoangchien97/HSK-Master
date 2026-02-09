"use client"

import { Chip } from "@heroui/react"
import { type UserRole } from "@/constants/portal/roles"
import { ROLE_LABELS } from "@/constants/portal"

const ROLE_CHIP_COLOR: Record<string, "secondary" | "primary" | "success" | "default"> = {
  SYSTEM_ADMIN: "secondary",
  TEACHER: "primary",
  STUDENT: "success",
}

interface RoleBadgeProps {
  role: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RoleBadge({ role, size = "md", className }: RoleBadgeProps) {
  const label = ROLE_LABELS[role as UserRole] || role
  const chipColor = ROLE_CHIP_COLOR[role] || "default"
  const chipSize = size === "lg" ? "md" : "sm"

  return (
    <Chip
      color={chipColor}
      variant="flat"
      size={chipSize}
      className={className}
    >
      {label}
    </Chip>
  )
}
