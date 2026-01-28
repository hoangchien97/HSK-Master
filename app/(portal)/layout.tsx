"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import PortalSidebar from "@/app/components/portal/PortalSidebar"
import PortalHeader from "@/app/components/portal/PortalHeader"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth pages don't need redirect logic or portal layout
  const isAuthPage = pathname?.startsWith("/portal/login") || 
                     pathname?.startsWith("/portal/register") ||
                     pathname?.startsWith("/portal/error")

  useEffect(() => {
    // Only redirect if not on auth pages and not authenticated
    if (!isAuthPage && status === "unauthenticated") {
      router.push("/portal/login")
    }
    // Redirect to portal if already logged in and trying to access auth pages
    if (isAuthPage && status === "authenticated") {
      router.push("/portal")
    }
  }, [status, router, isAuthPage])

  // Show auth pages without portal layout
  if (isAuthPage) {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PortalSidebar
        userRole={session.user.role || "STUDENT"}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <PortalHeader
          userName={session.user.name || "User"}
          userEmail={session.user.email || ""}
          userRole={session.user.role || "STUDENT"}
          userImage={session.user.image}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
