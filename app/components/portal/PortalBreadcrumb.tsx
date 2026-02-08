"use client"

import { Breadcrumb } from "@/app/components/portal/common/Breadcrumb"
import { useBreadcrumb } from "@/app/lib/portal/useBreadcrumb"
import { usePortalUI } from "@/app/providers/portal-ui-provider"

interface PortalBreadcrumbProps {
  /** Extra dynamic labels (merged with context labels) */
  dynamicLabels?: Record<string, string>
}

/**
 * Auto-generates breadcrumb from the current pathname.
 * Merges dynamic labels from PortalUIProvider context + props.
 * Does not render on dashboard pages (no segments after role).
 */
export function PortalBreadcrumb({ dynamicLabels: propLabels }: PortalBreadcrumbProps) {
  const { dynamicLabels: ctxLabels } = usePortalUI()
  const merged = { ...ctxLabels, ...propLabels }
  const items = useBreadcrumb(Object.keys(merged).length > 0 ? merged : undefined)

  // Don't render breadcrumb on dashboard pages
  if (items.length === 0) return null

  return <Breadcrumb items={items} className="mb-4" />
}
