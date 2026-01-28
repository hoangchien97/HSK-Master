import { auth } from "@/auth"
import Link from "next/link"

export default async function StudentDashboard() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Học sinh</h1>
        <p className="mt-2 text-gray-600">Xin chào, {session?.user?.name || "Học sinh"}!</p>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Bài học đã hoàn thành</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Từ vựng đã học</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Bài tập chờ nộp</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Điểm trung bình</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">-</div>
        </div>
      </div>

      {/* Learning Modules */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Học tập</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/portal/student/listening"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-3xl mb-2">🎧</div>
            <div className="font-medium">Nghe</div>
            <div className="text-sm text-gray-500 mt-1">Listening</div>
          </Link>
          <Link
            href="/portal/student/speaking"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-3xl mb-2">🗣️</div>
            <div className="font-medium">Nói</div>
            <div className="text-sm text-gray-500 mt-1">Speaking</div>
          </Link>
          <Link
            href="/portal/student/reading"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-3xl mb-2">📖</div>
            <div className="font-medium">Đọc</div>
            <div className="text-sm text-gray-500 mt-1">Reading</div>
          </Link>
          <Link
            href="/portal/student/writing"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-3xl mb-2">✍️</div>
            <div className="font-medium">Viết</div>
            <div className="text-sm text-gray-500 mt-1">Writing</div>
          </Link>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Công cụ học tập</h2>
          <div className="space-y-3">
            <Link
              href="/portal/student/vocabulary"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-medium">Từ vựng</div>
                <div className="text-sm text-gray-500">Học và ôn tập từ vựng</div>
              </div>
            </Link>
            <Link
              href="/portal/student/flashcards"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-2xl">🎴</span>
              <div>
                <div className="font-medium">Flashcards</div>
                <div className="text-sm text-gray-500">Luyện tập với thẻ từ</div>
              </div>
            </Link>
            <Link
              href="/portal/student/quiz"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-medium">Bài kiểm tra</div>
                <div className="text-sm text-gray-500">Làm bài kiểm tra</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bài tập gần đây</h2>
          <p className="text-gray-500 text-center py-8">Chưa có bài tập nào</p>
        </div>
      </div>
    </div>
  )
}
