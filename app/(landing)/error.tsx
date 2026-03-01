"use client";

import { useEffect } from "react";

export default function LandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Landing error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Error icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-main">Đã xảy ra lỗi</h2>
          <p className="text-text-muted text-sm">
            {error.message || "Đã có sự cố xảy ra. Vui lòng thử lại sau."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="px-6 py-2.5 border border-border-light text-text-main rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
