import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import RegisterForm from "@/app/components/portal/auth/RegisterForm"

export default async function PortalRegisterPage() {
  // Server-side auth check - redirect if already logged in
  const session = await auth()
  if (session?.user) {
    redirect("/portal")
  }

  return (
    <div className="flex items-center justify-center">
      {/* Register Form - Client Component wrapped in Suspense */}
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}

function RegisterFormSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 space-y-4 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="h-8 w-40 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-56 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="space-y-4">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
