import Link from "next/link"

export default async function TeacherDashboard({ session }: { session: { user: { name?: string | null } } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Giáo viên</h1>
        <p className="mt-2 text-gray-600">Xin chào, {session?.user?.name || "Giáo viên"}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Tổng lớp học</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Học sinh</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Bài tập</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Lịch dạy hôm nay</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/portal/teacher/classes"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">Quản lý lớp học</div>
          </Link>
          <Link
            href="/portal/teacher/students"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium">Quản lý học sinh</div>
          </Link>
          <Link
            href="/portal/teacher/assignments"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Bài tập</div>
          </Link>
          <Link
            href="/portal/teacher/schedule"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium">Lịch dạy</div>
          </Link>
          <Link
            href="/portal/teacher/attendance"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">✅</div>
            <div className="font-medium">Điểm danh</div>
          </Link>
          <Link
            href="/portal/teacher/reports"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Báo cáo</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <p className="text-gray-500 text-center py-8">Chưa có hoạt động nào</p>
      </div>
    </div>
  )
}
