"use client"

import { signOut } from "next-auth/react"
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
} from "@heroui/react"
import { Menu, Search, User, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react"
import { ROLE_LABELS } from "@/constants/portal"
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
    await signOut({ callbackUrl: "/portal/login" })
  }

  const roleLabel = ROLE_LABELS[userRole as UserRole] || userRole

  return (
    <header className="shrink-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile menu button + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg">
            <Input
              type="text"
              placeholder="Tìm kiếm khóa học, học viên, từ vựng..."
              variant="bordered"
              size="sm"
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              classNames={{
                inputWrapper: "bg-gray-50 border-gray-200 rounded-xl",
              }}
            />
          </div>
        </div>

        {/* Right: Notifications & User menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User menu */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors">
                <Avatar
                  src={userImage || undefined}
                  name={userName.charAt(0).toUpperCase()}
                  size="sm"
                  classNames={{
                    base: "bg-gradient-to-br from-red-500 to-red-600 ring-2 ring-red-100",
                    name: "text-white font-semibold",
                  }}
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
                  <span className="text-xs text-gray-500">{roleLabel}</span>
                </div>

                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Menu người dùng" className="w-64">
              <DropdownSection showDivider>
                <DropdownItem
                  key="profile"
                  href="/portal/profile"
                  startContent={<User className="w-4 h-4 text-gray-400" />}
                >
                  Hồ sơ cá nhân
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  href="/portal/settings"
                  startContent={<Settings className="w-4 h-4 text-gray-400" />}
                >
                  Cài đặt
                </DropdownItem>
                <DropdownItem
                  key="help"
                  href="/portal/help"
                  startContent={<HelpCircle className="w-4 h-4 text-gray-400" />}
                >
                  Trung tâm trợ giúp
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="signout"
                  color="danger"
                  className="text-red-600"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleSignOut}
                >
                  Đăng xuất
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
