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
import { USER_ROLE, type UserRole } from "@/constants/portal/roles"

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
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/hero-slides",
    label: "Hero Slides",
    icon: Image,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/courses",
    label: "Quản lý khóa học",
    icon: BookOpen,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/hsk-levels",
    label: "Cấp độ HSK",
    icon: GraduationCap,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/categories",
    label: "Danh mục",
    icon: Newspaper,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/albums",
    label: "Album ảnh",
    icon: Images,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/reviews",
    label: "Đánh giá",
    icon: Star,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/features",
    label: "Tính năng nổi bật",
    icon: Star,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/cta-stats",
    label: "CTA Stats",
    icon: BarChart3,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/users",
    label: "Quản lý người dùng",
    icon: Users,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/registrations",
    label: "Đăng ký khóa học",
    icon: ClipboardCheck,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
  {
    href: "/portal/admin/seo",
    label: "SEO & Metadata",
    icon: Settings,
    roles: [USER_ROLE.SYSTEM_ADMIN],
  },
]

// Teacher navigation items
const teacherNavItems: NavItem[] = [
  {
    href: "/portal/teacher",
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
    roles: [USER_ROLE.TEACHER],
  },
  {
    href: "/portal/teacher/classes",
    label: "Quản lý lớp học",
    icon: School,
    roles: [USER_ROLE.TEACHER],
  },
  {
    href: "/portal/teacher/students",
    label: "Học viên",
    icon: Users,
    roles: [USER_ROLE.TEACHER],
  },
  {
    href: "/portal/teacher/schedule",
    label: "Lịch giảng dạy",
    icon: Calendar,
    roles: [USER_ROLE.TEACHER],
  },
  {
    href: "/portal/teacher/attendance",
    label: "Điểm danh",
    icon: ClipboardCheck,
    roles: [USER_ROLE.TEACHER],
  },
  {
    href: "/portal/teacher/assignments",
    label: "Bài tập",
    icon: FileText,
    roles: [USER_ROLE.TEACHER],
  },
  {
    href: "/portal/teacher/quizzes",
    label: "Bài kiểm tra",
    icon: ClipboardCheck,
    roles: [USER_ROLE.TEACHER],
  },
]

// Student navigation items
const studentNavItems: NavItem[] = [
  {
    href: "/portal/student",
    label: "Trang chủ",
    icon: Home,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/schedule",
    label: "Lịch học",
    icon: Calendar,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/classes",
    label: "Lớp học của tôi",
    icon: School,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/assignments",
    label: "Bài tập",
    icon: FileText,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/vocabulary",
    label: "Từ vựng",
    icon: Languages,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/quizzes",
    label: "Bài kiểm tra",
    icon: ClipboardCheck,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/bookmarks",
    label: "Đã lưu",
    icon: Bookmark,
    roles: [USER_ROLE.STUDENT],
  },
  {
    href: "/portal/student/progress",
    label: "Tiến độ học tập",
    icon: BarChart3,
    roles: [USER_ROLE.STUDENT],
  },
]

// Get navigation items based on user role
export function getNavItemsByRole(role: string): NavItem[] {
  switch (role) {
    case USER_ROLE.SYSTEM_ADMIN:
      return adminNavItems
    case USER_ROLE.TEACHER:
      return teacherNavItems
    case USER_ROLE.STUDENT:
      return studentNavItems
    default:
      return studentNavItems
  }
}

// Export all nav items
export { adminNavItems, teacherNavItems, studentNavItems }
