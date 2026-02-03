import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import LoginFormClient from "./LoginFormClient"

export default async function PortalLoginPage() {
  // Server-side auth check - redirect if already logged in
  const session = await auth()
  if (session?.user) {
    redirect("/portal")
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo & Title */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">漢</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">HSK Learn</h1>
        <p className="mt-2 text-gray-600">Đăng nhập vào Portal học tập</p>
      </div>

      {/* Login Form - Client Component wrapped in Suspense */}
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginFormClient />
      </Suspense>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}
