"use client"

import { useState } from "react"
import PortalSidebar from "@/app/components/portal/PortalSidebar"
import PortalHeader from "@/app/components/portal/PortalHeader"

interface User {
  name: string
  email: string
  role: string
  image?: string | null
}

interface PortalLayoutClientProps {
  user: User
  children: React.ReactNode
}

export default function PortalLayoutClient({ user, children }: PortalLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <PortalSidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header - Fixed */}
        <PortalHeader
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
          userImage={user.image}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content - Scrollable */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
