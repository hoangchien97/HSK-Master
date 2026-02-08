"use client"

import { type ReactNode } from "react"
import { Spinner } from "@heroui/react"
import { usePortalUI } from "@/app/providers/portal-ui-provider"
import { PortalBreadcrumb } from "./PortalBreadcrumb"

interface PortalContentProps {
  children: ReactNode
}

/**
 * Main content area of the portal layout.
 * – Breadcrumb pinned at top (shrink-0)
 * – Children area fills remaining height (flex-1, overflow-y-auto)
 * – Loading overlay covers the entire area
 *
 * Management pages can use `h-full flex flex-col` to fill the
 * viewport and keep their table scrolling internally.
 */
export default function PortalContent({ children }: PortalContentProps) {
  const { isLoading } = usePortalUI()

  return (
    <main className="flex-1 flex flex-col relative min-h-0">
      {/* Loading overlay – covers only content area */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-xs pointer-events-auto">
          <Spinner size="lg" color="danger" label="Đang tải..." />
        </div>
      )}

      {/* Breadcrumb – always visible, never scrolled away */}
      <div className="shrink-0 px-4 pt-4 lg:px-6 lg:pt-6">
        <PortalBreadcrumb />
      </div>

      {/* Page content – scrollable, fills remaining height */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 lg:px-6 lg:pb-6">
        {children}
      </div>
    </main>
  )
}
