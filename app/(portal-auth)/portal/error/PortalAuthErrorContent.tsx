"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PortalAuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "Có lỗi cấu hình xảy ra.",
    AccessDenied: "Truy cập bị từ chối.",
    Verification: "Token xác thực không hợp lệ hoặc đã hết hạn.",
    OAuthSignin: "Lỗi khi đăng nhập với OAuth.",
    OAuthCallback: "Lỗi khi xử lý callback từ OAuth.",
    OAuthCreateAccount: "Không thể tạo tài khoản OAuth.",
    EmailCreateAccount: "Không thể tạo tài khoản với email.",
    Callback: "Lỗi callback.",
    OAuthAccountNotLinked:
      "Email này đã được sử dụng với phương thức đăng nhập khác.",
    EmailSignin: "Lỗi khi gửi email xác thực.",
    CredentialsSignin: "Email hoặc mật khẩu không đúng.",
    SessionRequired: "Vui lòng đăng nhập để tiếp tục.",
    Default: "Có lỗi xảy ra. Vui lòng thử lại.",
  }

  const errorMessage = errorMessages[error || "Default"] || errorMessages.Default

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-red-100 p-5 rounded-full">
          <svg
            className="w-14 h-14 text-red-600"
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

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lỗi xác thực</h1>
        <p className="mt-2 text-gray-600">{errorMessage}</p>
        {error && (
          <p className="mt-1 text-xs text-gray-400">Mã lỗi: {error}</p>
        )}
      </div>

      <div className="space-y-3">
        <Link
          href="/portal/login"
          className="block w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 font-medium transition shadow-lg shadow-red-200"
        >
          Thử lại
        </Link>

        <Link
          href="/portal"
          className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 font-medium transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
