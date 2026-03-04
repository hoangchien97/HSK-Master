"use client";

import { useEffect } from "react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Đã xảy ra lỗi</h2>
          <p className="text-gray-500 text-sm">
            {error.message || "Không thể tải nội dung. Vui lòng thử lại."}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono">Mã lỗi: {error.digest}</p>
          )}
        </div>

        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
