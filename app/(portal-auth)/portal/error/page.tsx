import { Suspense } from "react"
import PortalAuthErrorContent from "./PortalAuthErrorContent"

// Force dynamic rendering to handle searchParams
export const dynamic = "force-dynamic"

export default function PortalAuthErrorPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <Suspense fallback={<ErrorSkeleton />}>
        <PortalAuthErrorContent />
      </Suspense>
    </div>
  )
}

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
