"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PortalAuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: { [key: string]: string } = {
    Configuration: "Có lỗi cấu hình xảy ra.",
    AccessDenied: "Truy cập bị từ chối.",
    Verification: "Token xác thực không hợp lệ hoặc đã hết hạn.",
    OAuthSignin: "Lỗi khi đăng nhập với OAuth.",
    OAuthCallback: "Lỗi khi xử lý callback từ OAuth.",
    OAuthCreateAccount: "Không thể tạo tài khoản OAuth.",
    EmailCreateAccount: "Không thể tạo tài khoản với email.",
    Callback: "Lỗi callback.",
    OAuthAccountNotLinked: "Email này đã được sử dụng với phương thức đăng nhập khác.",
    EmailSignin: "Lỗi khi gửi email xác thực.",
    CredentialsSignin: "Email hoặc mật khẩu không đúng.",
    SessionRequired: "Vui lòng đăng nhập để tiếp tục.",
    Default: "Có lỗi xảy ra. Vui lòng thử lại.",
  }

  const errorMessage = errorMessages[error || "Default"] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lỗi xác thực</h1>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          {error && (
            <p className="mt-1 text-xs text-gray-400">Mã lỗi: {error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/portal/login"
            className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium transition"
          >
            Thử lại
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
