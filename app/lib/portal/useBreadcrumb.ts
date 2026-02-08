"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { buildBreadcrumbItems, type BreadcrumbItem } from "@/app/lib/portal/breadcrumb"

/**
 * Hook that returns breadcrumb items for the current portal page.
 *
 * @param dynamicLabels  Map of dynamic URL segments to display names.
 *                       e.g. `{ "abc123": "Lớp HSK3 – T7" }`
 *
 * @example
 * ```tsx
 * const items = useBreadcrumb({ [classId]: className })
 * ```
 */
export function useBreadcrumb(
  dynamicLabels?: Record<string, string>,
): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(
    () => buildBreadcrumbItems(pathname, dynamicLabels),
    [pathname, dynamicLabels],
  )
}
