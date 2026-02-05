"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNavItemsByRole } from "@/app/constants/navigation"
import { ROLE_LABELS } from "@/app/constants/portal"
import { type UserRole } from "@/lib/constants/roles"

interface PortalSidebarProps {
  userRole: string
  isOpen?: boolean
  onClose?: () => void
}

export default function PortalSidebar({ userRole, isOpen = true, onClose }: PortalSidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItemsByRole(userRole)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/portal/login" })
  }

  const isActiveLink = (href: string) => {
    if (href === "/portal/admin" || href === "/portal/teacher" || href === "/portal/student") {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo - Fixed at top */}
        <div className="flex items-center h-[65px] justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-white font-bold text-xl">漢</span>
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 block">HSK Master</span>
            </div>
          </Link>
          {/* Mobile close button */}
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 shrink-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {ROLE_LABELS[userRole as UserRole] || userRole}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = isActiveLink(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-red-50 text-red-600 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={onClose}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-red-500" : "text-gray-400")} />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom actions - Fixed at bottom */}
        <div className="border-t border-gray-100 p-3 shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  )
}
