"use client"

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
} from "lucide-react"
import { Card, CardHeader, CardBody, Chip } from "@heroui/react"
import { PageHeader } from "@/app/components/portal/common/PageHeader"
import { StatCard } from "@/app/components/portal/common/StatCard"
import { DataCard } from "@/app/components/portal/common/DataCard"

interface AdminDashboardProps {
  stats?: {
    totalCourses: number
    totalHeroSlides: number
    totalReviews: number
    totalRegistrations: number
    pendingReviews: number
    totalUsers: number
  }
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  // Demo stats - replace with actual data
  const dashboardStats = stats || {
    totalCourses: 12,
    totalHeroSlides: 5,
    totalReviews: 48,
    totalRegistrations: 156,
    pendingReviews: 3,
    totalUsers: 89,
  }

  const quickActions = [
    {
      title: "Thêm khóa học mới",
      description: "Tạo và quản lý các khóa học HSK",
      icon: BookOpen,
      href: "/portal/admin/courses/new",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Quản lý Hero Slides",
      description: "Cập nhật banner trang chủ",
      icon: ImageIcon,
      href: "/portal/admin/hero-slides",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Duyệt đánh giá",
      description: `${dashboardStats.pendingReviews} đánh giá chờ duyệt`,
      icon: Star,
      href: "/portal/admin/reviews",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Quản lý người dùng",
      description: "Phân quyền và quản lý tài khoản",
      icon: Users,
      href: "/portal/admin/users",
      color: "bg-green-100 text-green-600",
    },
  ]

  const recentActivities = [
    { action: "Đăng ký mới", target: "Nguyễn Văn A đăng ký khóa HSK 3", time: "5 phút trước" },
    { action: "Đánh giá mới", target: "Trần Thị B đánh giá 5 sao cho HSK 1", time: "30 phút trước" },
    { action: "Cập nhật khóa học", target: "HSK 2 - Cập nhật bài giảng mới", time: "1 giờ trước" },
    { action: "Người dùng mới", target: "Lê Văn C đăng ký tài khoản", time: "2 giờ trước" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển Admin"
        description="Quản lý nội dung landing page và hệ thống"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng khóa học"
          value={dashboardStats.totalCourses}
          icon={<BookOpen className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend={{ value: 12, label: "so với tháng trước" }}
        />
        <StatCard
          title="Đăng ký mới"
          value={dashboardStats.totalRegistrations}
          icon={<FileText className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          trend={{ value: 8, label: "so với tháng trước" }}
        />
        <StatCard
          title="Đánh giá"
          value={dashboardStats.totalReviews}
          description={`${dashboardStats.pendingReviews} chờ duyệt`}
          icon={<Star className="w-6 h-6" />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Người dùng"
          value={dashboardStats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          trend={{ value: 5, label: "so với tuần trước" }}
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
        <DataCard
          title="Hoạt động gần đây"
          action={
            <Link href="/portal/admin/activities" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 bg-red-500 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.target}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DataCard>

        {/* Quick Stats */}
        <DataCard title="Thống kê nhanh">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Cấp độ HSK</p>
                  <p className="text-xs text-gray-500">6 cấp độ</p>
                </div>
              </div>
              <Link href="/portal/admin/hsk-levels" className="text-red-600 hover:text-red-700">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Images className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Album ảnh</p>
                  <p className="text-xs text-gray-500">4 albums</p>
                </div>
              </div>
              <Link href="/portal/admin/albums" className="text-red-600 hover:text-red-700">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Hero Slides</p>
                  <p className="text-xs text-gray-500">{dashboardStats.totalHeroSlides} slides</p>
                </div>
              </div>
              <Link href="/portal/admin/hero-slides" className="text-red-600 hover:text-red-700">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">CTA Stats</p>
                  <p className="text-xs text-gray-500">4 thống kê</p>
                </div>
              </div>
              <Link href="/portal/admin/cta-stats" className="text-red-600 hover:text-red-700">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </DataCard>
      </div>
    </div>
  )
}
