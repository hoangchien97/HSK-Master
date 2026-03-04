"use client"

import { type ReactNode } from "react"
import { PortalBreadcrumb } from "./PortalBreadcrumb"

interface PortalContentProps {
  children: ReactNode
}

/**
 * Main content area of the portal layout.
 *
 * Loading strategy (ui-loading-guideline):
 * - Route change → handled by Next.js loading.tsx (React Suspense)
 * - Data refetch → handled by CTable dim pattern (Option A)
 * - No global overlay — each component manages its own loading
 */
export default function PortalContent({ children }: PortalContentProps) {
  return (
    <main className="flex-1 flex flex-col relative min-h-0">
      {/* Breadcrumb – always visible, never scrolled away */}
      <div className="shrink-0 px-4 pt-4 lg:px-6 lg:pt-6">
        <PortalBreadcrumb />
      </div>

      {/* Page content – scrollable on desktop, natural flow on mobile */}
      <div className="flex-1 min-h-0 lg:overflow-y-auto px-4 pb-4 lg:px-6 lg:pb-6">
        {children}
      </div>
    </main>
  )
}
