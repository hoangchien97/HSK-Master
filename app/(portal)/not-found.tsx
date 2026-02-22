"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@heroui/react"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function PortalNotFound() {
  const router = useRouter()

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="relative mb-6">
          <h1 className="text-[120px] font-extrabold text-gray-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Trang không tồn tại
        </h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang trước.
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="bordered"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => router.back()}
          >
            Quay lại
          </Button>
          <Button
            as={Link}
            href="/portal"
            color="primary"
            startContent={<Home className="w-4 h-4" />}
          >
            Bảng điều khiển
          </Button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          <span className="text-base">找不到页面</span> — Không tìm thấy trang
        </p>
      </div>
    </div>
  )
}
