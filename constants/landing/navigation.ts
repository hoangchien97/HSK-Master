import { Home, GraduationCap, Info, Mail, Book, type LucideIcon } from "lucide-react";

export interface LandingNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

/**
 * Landing page navigation items — single source of truth.
 * Used by Header (desktop nav) and MobileMenu (sidebar nav).
 */
export const LANDING_NAV_ITEMS: LandingNavItem[] = [
  { name: "Trang chủ", icon: Home, path: "/" },
  { name: "Khóa học", icon: GraduationCap, path: "/courses" },
  { name: "Giới thiệu", icon: Info, path: "/about" },
  { name: "Liên hệ", icon: Mail, path: "/contact" },
  // { name: "Tài liệu", icon: Book, path: "/vocabulary" },
];
