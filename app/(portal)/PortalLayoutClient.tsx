"use client"

import { useState } from "react"
import { ToastContainer } from "react-toastify"
import { Spinner } from "@heroui/react"
import PortalSidebar from "@/app/components/portal/PortalSidebar"
import PortalHeader from "@/app/components/portal/PortalHeader"
import { useLoading, LoadingProvider } from "@/app/providers"
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

/** Inner layout that can access LoadingContext */
function PortalLayoutInner({ user, children }: PortalLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoading } = useLoading()

  return (
    <div className="min-h-screen bg-gray-50">
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
          userName={user.fullName || user.name}
          userEmail={user.email}
          userRole={user.role}
          userImage={user.image}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content - Scrollable */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto relative min-h-[calc(100vh-4rem)]">
          {/* Global loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-xs">
              <Spinner size="lg" color="danger" label="Đang tải..." />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

export default function PortalLayoutClient({ user, children }: PortalLayoutClientProps) {
  return (
    <LoadingProvider>
      <PortalLayoutInner user={user}>
        {children}
      </PortalLayoutInner>
    </LoadingProvider>
  )
}
