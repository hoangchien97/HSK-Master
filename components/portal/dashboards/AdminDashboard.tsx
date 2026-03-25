"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  BookOpen,
  Users,
  Star,
  GraduationCap,
  ArrowRight,
  BarChart3,
  FileText,
  Images,
  ImageIcon,
  Sparkles,
  FolderTree,
  Globe,
} from "lucide-react"
import { toast } from "react-toastify"
import { PageHeader } from "@/components/portal/common/PageHeader"
import { StatCard } from "@/components/portal/common/StatCard"
import { DataCard } from "@/components/portal/common/DataCard"
import { fetchAdminDashboardStats, fetchRecentActivities } from "@/actions/admin.actions"
import type { IAdminDashboardStats, IRecentActivity } from "@/interfaces/portal"

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  registration: "bg-green-500",
  review: "bg-yellow-500",
  course: "bg-blue-500",
  user: "bg-purple-500",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<IAdminDashboardStats | null>(null)
  const [activities, setActivities] = useState<IRecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [statsResult, activitiesResult] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchRecentActivities(),
      ])
      if (statsResult.success && statsResult.data) setStats(statsResult.data)
      if (activitiesResult.success && activitiesResult.data) setActivities(activitiesResult.data)
    } catch {
      toast.error("Không thể tải dữ liệu dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const quickActions = [
    { title: "Quản lý Hero Slides", description: `${stats?.totalHeroSlides || 0} slides`, icon: ImageIcon, href: "/portal/admin/hero-slides", color: "bg-purple-100 text-purple-600" },
    { title: "Duyệt đánh giá", description: `${stats?.pendingReviews || 0} đánh giá chờ duyệt`, icon: Star, href: "/portal/admin/reviews", color: "bg-yellow-100 text-yellow-600" },
    { title: "Đăng ký khóa học", description: `${stats?.totalRegistrations || 0} đăng ký`, icon: FileText, href: "/portal/admin/registrations", color: "bg-green-100 text-green-600" },
    { title: "Quản lý người dùng", description: `${stats?.totalUsers || 0} người dùng`, icon: Users, href: "/portal/admin/users", color: "bg-blue-100 text-blue-600" },
  ]

  const quickStats = [
    { label: "Khóa học", count: stats?.totalCourses || 0, icon: BookOpen, color: "bg-blue-100 text-blue-600", href: "/portal/admin/courses" },
    { label: "Cấp độ HSK", count: stats?.totalHSKLevels || 0, icon: GraduationCap, color: "bg-indigo-100 text-indigo-600", href: "/portal/admin/hsk-levels" },
    { label: "Danh mục", count: stats?.totalCategories || 0, icon: FolderTree, color: "bg-teal-100 text-teal-600", href: "/portal/admin/categories" },
    { label: "Album ảnh", count: stats?.totalAlbums || 0, icon: Images, color: "bg-pink-100 text-pink-600", href: "/portal/admin/albums" },
    { label: "Tính năng", count: stats?.totalFeatures || 0, icon: Sparkles, color: "bg-amber-100 text-amber-600", href: "/portal/admin/features" },
    { label: "CTA Stats", count: stats?.totalCtaStats || 0, icon: BarChart3, color: "bg-orange-100 text-orange-600", href: "/portal/admin/cta-stats" },
  ]

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? "opacity-60" : ""}`}>
      <PageHeader
        title="Bảng điều khiển Admin"
        description="Quản lý nội dung landing page và hệ thống"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng khóa học"
          value={stats?.totalCourses || 0}
          icon={<BookOpen className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Đăng ký mới"
          value={stats?.totalRegistrations || 0}
          icon={<FileText className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Đánh giá"
          value={stats?.totalReviews || 0}
          description={`${stats?.pendingReviews || 0} chờ duyệt`}
          icon={<Star className="w-6 h-6" />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Người dùng"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <DataCard title="Thao tác nhanh">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </DataCard>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <DataCard title="Hoạt động gần đây">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${ACTIVITY_TYPE_COLORS[activity.type] || "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.target}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </DataCard>

        {/* Quick Stats */}
        <DataCard title="Quản lý nội dung">
          <div className="space-y-3">
            {quickStats.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.href} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.count} mục</p>
                    </div>
                  </div>
                  <Link href={item.href} className="text-red-600 hover:text-red-700">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </DataCard>
      </div>
    </div>
  )
}
