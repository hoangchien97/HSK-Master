import { Suspense } from "react"
import AuthErrorContent from "./AuthErrorContent"

function ErrorSkeleton() {
  return (
    <div className="text-center space-y-6 animate-pulse">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <Suspense fallback={<ErrorSkeleton />}>
          <AuthErrorContent />
        </Suspense>
      </div>
    </div>
  )
}
