"use client"

import { useState } from "react"
import { ToastContainer } from "react-toastify"
import PortalSidebar from "@/components/portal/PortalSidebar"
import PortalHeader from "@/components/portal/PortalHeader"
import PortalContent from "@/components/portal/PortalContent"
import { PortalUIProvider } from "@/providers/portal-ui-provider"
import "react-toastify/dist/ReactToastify.css"

interface User {
  name: string
  fullName?: string
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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Sidebar - Fixed left, full height */}
      <PortalSidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right area: Header (sticky) + Content (scrollable) */}
      <div className="flex-1 flex flex-col min-h-0 lg:pl-64">
        {/* Header - Sticky top */}
        <PortalHeader
          userName={user.fullName || user.name}
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
      <PortalLayoutInner user={user}>
        {children}
      </PortalLayoutInner>
    </PortalUIProvider>
  )
}
