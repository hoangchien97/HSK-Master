import { Suspense } from "react"
import RegisterFormClient from "./RegisterFormClient"

function RegisterSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">HSK Master</h1>
          <p className="mt-2 text-gray-600">Tạo tài khoản mới</p>
        </div>

        {/* Register Form - Client Component wrapped in Suspense */}
        <Suspense fallback={<RegisterSkeleton />}>
          <RegisterFormClient />
        </Suspense>
      </div>
    </div>
  )
}
