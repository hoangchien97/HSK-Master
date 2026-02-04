import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  FileText,
  Settings,
  Image,
  Newspaper,
  Star,
  BarChart3,
  School,
  Bookmark,
  Languages,
  Home,
  Images,
  type LucideIcon,
} from "lucide-react"
import { ROLES, type UserRole } from "@/lib/constants/roles"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
  badge?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// Admin navigation items - CRUD for landing page content
const adminNavItems: NavItem[] = [
  {
    href: "/portal/admin",
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/hero-slides",
    label: "Hero Slides",
    icon: Image,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/courses",
    label: "Quản lý khóa học",
    icon: BookOpen,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/hsk-levels",
    label: "Cấp độ HSK",
    icon: GraduationCap,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/categories",
    label: "Danh mục",
    icon: Newspaper,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/albums",
    label: "Album ảnh",
    icon: Images,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/reviews",
    label: "Đánh giá",
    icon: Star,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/features",
    label: "Tính năng nổi bật",
    icon: Star,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/cta-stats",
    label: "CTA Stats",
    icon: BarChart3,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/users",
    label: "Quản lý người dùng",
    icon: Users,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/registrations",
    label: "Đăng ký khóa học",
    icon: ClipboardCheck,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/seo",
    label: "SEO & Metadata",
    icon: Settings,
    roles: [ROLES.SYSTEM_ADMIN],
  },
]

// Teacher navigation items
const teacherNavItems: NavItem[] = [
  {
    href: "/portal/teacher",
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
    roles: [ROLES.TEACHER],
  },
  {
    href: "/portal/teacher/classes",
    label: "Quản lý lớp học",
    icon: School,
    roles: [ROLES.TEACHER],
  },
  {
    href: "/portal/teacher/students",
    label: "Học viên",
    icon: Users,
    roles: [ROLES.TEACHER],
  },
  {
    href: "/portal/teacher/schedule",
    label: "Lịch giảng dạy",
    icon: Calendar,
    roles: [ROLES.TEACHER],
  },
  {
    href: "/portal/teacher/attendance",
    label: "Điểm danh",
    icon: ClipboardCheck,
    roles: [ROLES.TEACHER],
  },
  {
    href: "/portal/teacher/assignments",
    label: "Bài tập",
    icon: FileText,
    roles: [ROLES.TEACHER],
  },
  {
    href: "/portal/teacher/quizzes",
    label: "Bài kiểm tra",
    icon: ClipboardCheck,
    roles: [ROLES.TEACHER],
  },
]

// Student navigation items
const studentNavItems: NavItem[] = [
  {
    href: "/portal/student",
    label: "Trang chủ",
    icon: Home,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/schedule",
    label: "Lịch học",
    icon: Calendar,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/classes",
    label: "Lớp học của tôi",
    icon: School,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/assignments",
    label: "Bài tập",
    icon: FileText,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/vocabulary",
    label: "Từ vựng",
    icon: Languages,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/quizzes",
    label: "Bài kiểm tra",
    icon: ClipboardCheck,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/bookmarks",
    label: "Đã lưu",
    icon: Bookmark,
    roles: [ROLES.STUDENT],
  },
  {
    href: "/portal/student/progress",
    label: "Tiến độ học tập",
    icon: BarChart3,
    roles: [ROLES.STUDENT],
  },
]

// Get navigation items based on user role
export function getNavItemsByRole(role: string): NavItem[] {
  switch (role) {
    case ROLES.SYSTEM_ADMIN:
      return adminNavItems
    case ROLES.TEACHER:
      return teacherNavItems
    case ROLES.STUDENT:
      return studentNavItems
    default:
      return studentNavItems
  }
}

// Export all nav items
export { adminNavItems, teacherNavItems, studentNavItems }
