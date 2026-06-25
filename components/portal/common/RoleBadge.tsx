"use client"

import { Badge } from "@/components/ui/primitives/Badge"
import { type UserRole } from "@/constants/portal/roles"
import { ROLE_LABELS } from "@/constants/portal"

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info"

const ROLE_BADGE_VARIANT: Record<string, BadgeVariant> = {
  SYSTEM_ADMIN: "primary",
  TEACHER: "info",
  STUDENT: "default",
}

interface RoleBadgeProps {
  role: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RoleBadge({ role, size = "md", className }: RoleBadgeProps) {
  const label = ROLE_LABELS[role as UserRole] || role
  const variant = ROLE_BADGE_VARIANT[role] || "default"
  const badgeSize = size === "lg" ? "md" : "sm"

  return (
    <Badge variant={variant} size={badgeSize} className={className}>
      {label}
    </Badge>
  )
}
