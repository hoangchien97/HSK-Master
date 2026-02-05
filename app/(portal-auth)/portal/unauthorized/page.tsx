import Link from "next/link"
import { ShieldX, ArrowLeft, Lock, AlertCircle } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ reason?: string }>
}

export default async function UnauthorizedPage({ searchParams }: PageProps) {
  const params = await searchParams
  const reason = params.reason

  const isLocked = reason === "locked"
  const isNoRole = reason === "no-role"

  const getIcon = () => {
    if (isLocked) {
      return <Lock className="w-10 h-10 text-red-600" />
    }
    if (isNoRole) {
      return <AlertCircle className="w-10 h-10 text-orange-600" />
    }
    return <ShieldX className="w-10 h-10 text-yellow-600" />
  }

  const getTitle = () => {
    if (isLocked) {
      return "Tài khoản bị khóa"
    }
    if (isNoRole) {
      return "Chưa được phân quyền"
    }
    return "Không có quyền truy cập"
  }

  const getDescription = () => {
    if (isLocked) {
      return "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ."
    }
    if (isNoRole) {
      return "Tài khoản của bạn chưa được phân quyền. Vui lòng liên hệ quản trị viên để được cấp quyền truy cập."
    }
    return "Bạn không có quyền truy cập vào trang này. Vui lòng quay lại trang chủ hoặc liên hệ quản trị viên."
  }

  const getIconBgColor = () => {
    if (isLocked) return "bg-red-100"
    if (isNoRole) return "bg-orange-100"
    return "bg-yellow-100"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${getIconBgColor()}`}>
            {getIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getTitle()}
          </h1>

          {/* Description */}
          <p className="text-gray-500 mb-6">
            {getDescription()}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/portal"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay về trang chủ
            </Link>

            <Link
              href="/portal/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Đăng nhập tài khoản khác
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-6 text-sm text-gray-400">
            Cần hỗ trợ?{" "}
            <a href="mailto:support@hskmaster.com" className="text-red-600 hover:text-red-700">
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
