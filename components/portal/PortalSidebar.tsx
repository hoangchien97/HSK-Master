"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui"
import { LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNavItemsByRole } from "@/constants/portal/navigation"
import { PORTAL_ROUTES, portalRoleRoute, MSG_AUTH } from "@/constants/portal"
import { type UserRole } from "@/constants/portal/roles"
import Image from "next/image"
import { BRAND_NAME } from "@/constants/brand"
import { Badge } from "@/components/ui"

interface PortalSidebarProps {
  userRole: string
  isOpen?: boolean
  onClose?: () => void
}

export default function PortalSidebar({ userRole, isOpen = true, onClose }: PortalSidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItemsByRole(userRole)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: PORTAL_ROUTES.LOGIN })
  }

  const isActiveLink = (href: string) => {
    const rolePaths = ["admin", "teacher", "student"].map((r) => portalRoleRoute(r))
    if (rolePaths.includes(href)) {
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
        <div className="flex items-center h-[64px] justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Link href={PORTAL_ROUTES.HOME} className="flex items-center">
            <Image src="/logo.svg" alt={BRAND_NAME} width={160} height={40} priority />
          </Link>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <hr className="border-t border-(--color-smoke)" />

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                      : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                  )}
                  onClick={onClose}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-red-500" : "text-gray-400")} />
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="danger" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        <hr className="border-t border-(--color-smoke)" />

        {/* Bottom actions - Fixed at bottom */}
        <div className="p-3 shrink-0">
          <Button
            variant="ghost"
            leftIcon={<LogOut className="w-5 h-5" />}
            onClick={handleSignOut}
            className="w-full justify-start hover:bg-red-50 text-red-600 hover:text-red-600"
          >
            {MSG_AUTH.LOGOUT}
          </Button>
        </div>
      </aside>
    </>
  )
}
