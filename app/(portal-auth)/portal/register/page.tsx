import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import RegisterFormClient from "./RegisterFormClient"

export default async function PortalRegisterPage() {
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
        <p className="mt-2 text-gray-600">Tạo tài khoản mới</p>
      </div>

      {/* Register Form - Client Component wrapped in Suspense */}
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterFormClient />
      </Suspense>
    </div>
  )
}

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
  )
}
