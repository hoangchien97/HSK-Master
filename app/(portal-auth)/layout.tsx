import Link from "next/link"
import Image from "next/image"
import { BRAND_NAME } from "@/constants/brand"
import AuthBrandingPanel from "@/components/portal/auth/AuthBrandingPanel"

export default function PortalAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="min-h-screen flex">

      {/* Left side - Branding Panel (desktop only) */}
      <AuthBrandingPanel />

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo - only show on mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt={BRAND_NAME} width={40} height={40} className="rounded-lg" />
              <span className="font-bold text-xl text-gray-900">{BRAND_NAME}</span>
            </Link>
          </div>

          {/* Form content */}
          <div>
            {children}
          </div>
        </div>
      </div>
      </div>
  )
}
