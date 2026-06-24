"use client"

import { signOut } from "next-auth/react"
import { Avatar, Dropdown } from "@/components/ui"
import { Menu, User, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react"
import { ROLE_LABELS, PORTAL_ROUTES, HEADER_LABELS, MSG_AUTH } from "@/constants/portal"
import { type UserRole } from "@/constants/portal/roles"
import NotificationDropdown from "./NotificationDropdown"

interface PortalHeaderProps {
  userName: string
  userEmail: string
  userRole: string
  userImage?: string | null
  onMenuClick: () => void
}

export default function PortalHeader({
  userName,
  userEmail,
  userRole,
  userImage,
  onMenuClick
}: PortalHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: PORTAL_ROUTES.LOGIN })
  }

  const roleLabel = ROLE_LABELS[userRole as UserRole] || userRole

  return (
    <header className="shrink-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile menu button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right: Notifications & User menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User menu */}
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Avatar
                  src={userImage || undefined}
                  name={userName}
                  size="sm"
                  className="ring-2 ring-red-100"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
                  <span className="text-xs text-gray-500">{roleLabel}</span>
                </div>
                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
              </button>
            }
            items={[
              {
                label: HEADER_LABELS.PROFILE,
                icon: <User className="w-4 h-4 text-gray-400" />,
                onClick: () => { window.location.href = PORTAL_ROUTES.PROFILE },
              },
              {
                label: HEADER_LABELS.SETTINGS,
                icon: <Settings className="w-4 h-4 text-gray-400" />,
                onClick: () => { window.location.href = PORTAL_ROUTES.SETTINGS },
              },
              {
                label: HEADER_LABELS.HELP,
                icon: <HelpCircle className="w-4 h-4 text-gray-400" />,
                onClick: () => { window.location.href = PORTAL_ROUTES.HELP },
              },
              {
                label: MSG_AUTH.LOGOUT,
                icon: <LogOut className="w-4 h-4" />,
                onClick: handleSignOut,
                divider: true,
              },
            ]}
            align="end"
          />
        </div>
      </div>
    </header>
  )
}
