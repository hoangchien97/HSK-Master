"use client";

import { useEffect } from "react";

export default function PortalAuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-5 max-w-sm px-6">
        <h2 className="text-xl font-bold text-gray-900">Lỗi đăng nhập</h2>
        <p className="text-gray-500 text-sm">
          {error.message || "Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            Thử lại
          </button>
          <a
            href="/portal/login"
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Về trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
}
