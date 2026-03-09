"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import PortalHeader from "@/components/portal/PortalHeader"
import PortalContent from "@/components/portal/PortalContent"
import { PortalUIProvider } from "@/providers/portal-ui-provider"
import { NotificationProvider } from "@/providers/notification-provider"
import { SIDEBAR } from "@/constants/portal/ui"

interface User {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
}

interface PortalLayoutClientProps {
  user: User
  children: React.ReactNode
}

/** Inner layout that can access PortalUIProvider context */
function PortalLayoutInner({ user, children }: PortalLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen md:h-screen flex flex-col lg:flex-row bg-gray-50 md:overflow-hidden font-[family-name:var(--font-noto-sans-sc),var(--font-noto-sans),sans-serif]">
      {/* Sidebar - Fixed left, full height */}
      <PortalSidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right area: Header (sticky) + Content (scrollable on mobile, flex on md+) */}
      <div className={`flex-1 flex flex-col min-h-0 ${SIDEBAR.CONTENT_OFFSET_CLASS} overflow-y-auto md:overflow-hidden`}>
        {/* Header - Sticky top */}
        <PortalHeader
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
          userImage={user.image}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content - Only this area scrolls */}
        <PortalContent>{children}</PortalContent>
      </div>
    </div>
  )
}

export default function PortalLayoutClient({ user, children }: PortalLayoutClientProps) {
  return (
    <PortalUIProvider>
      <NotificationProvider userId={user.id}>
        <PortalLayoutInner user={user}>
          {children}
        </PortalLayoutInner>
      </NotificationProvider>
    </PortalUIProvider>
  )
}
