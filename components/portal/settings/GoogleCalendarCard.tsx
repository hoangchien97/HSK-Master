'use client';

/**
 * GoogleCalendarCard
 * Settings card for connecting/disconnecting Google Calendar.
 * Shows connection status + provides connect/reconnect/disconnect actions.
 */

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

interface CalendarStatus {
  connected: boolean;
  isValid: boolean;
  connectedAt?: string;
  hasRefreshToken?: boolean;
  message: string;
}

export default function GoogleCalendarCard() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle redirect params from callback
  useEffect(() => {
    const calendarConnected = searchParams.get('calendar_connected');
    const calendarError = searchParams.get('calendar_error');

    if (calendarConnected === 'true') {
      toast.success('Kết nối Google Calendar thành công!');
      fetchStatus();
    }

    if (calendarError) {
      const errorMessages: Record<string, string> = {
        denied: 'Bạn đã từ chối quyền truy cập Google Calendar.',
        missing_params: 'Thiếu thông tin xác thực. Vui lòng thử lại.',
        token_exchange: 'Lỗi xác thực với Google. Vui lòng thử lại.',
        no_refresh_token: 'Không nhận được refresh token. Vui lòng thử kết nối lại.',
        server_error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      };
      toast.error(errorMessages[calendarError] || 'Lỗi kết nối Google Calendar.');
    }
  }, [searchParams]);

  async function fetchStatus() {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/calendar/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, isValid: false, message: 'Lỗi kiểm tra kết nối' });
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    // Redirect to the connect endpoint which redirects to Google
    window.location.href = '/api/portal/calendar/connect';
  }

  function handleDisconnect() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/calendar/status', { method: 'DELETE' });
        if (res.ok) {
          toast.success('Đã ngắt kết nối Google Calendar');
          setStatus({ connected: false, isValid: false, message: 'Chưa kết nối Google Calendar' });
        } else {
          toast.error('Lỗi khi ngắt kết nối');
        }
      } catch {
        toast.error('Lỗi khi ngắt kết nối');
      }
    });
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-72" />
      </div>
    );
  }

  const isConnected = status?.connected && status?.isValid;
  const needsReconnect = status?.connected && !status?.isValid;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Google Calendar icon */}
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Calendar body */}
              <path d="M18.5 3.5h-13A2 2 0 003.5 5.5v13a2 2 0 002 2h13a2 2 0 002-2v-13a2 2 0 00-2-2z" fill="#fff" />
              {/* Top bar */}
              <path d="M18.5 3.5h-13A2 2 0 003.5 5.5V8h17V5.5a2 2 0 00-2-2z" fill="#4285F4" />
              {/* Grid lines */}
              <path d="M3.5 8h17v2.5h-17z" fill="#E8EAED" />
              {/* Date cells */}
              <rect x="6" y="11.5" width="3" height="2.5" rx=".5" fill="#EA4335" />
              <rect x="10.5" y="11.5" width="3" height="2.5" rx=".5" fill="#FBBC04" />
              <rect x="15" y="11.5" width="3" height="2.5" rx=".5" fill="#34A853" />
              <rect x="6" y="15.5" width="3" height="2.5" rx=".5" fill="#4285F4" />
              <rect x="10.5" y="15.5" width="3" height="2.5" rx=".5" fill="#EA4335" />
              <rect x="15" y="15.5" width="3" height="2.5" rx=".5" fill="#34A853" />
              {/* Calendar hooks */}
              <path d="M9 2v3M15 2v3" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Google Calendar
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Đồng bộ lịch học tự động với Google Calendar
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            isConnected
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : needsReconnect
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-green-500' : needsReconnect ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
          />
          {isConnected ? 'Đã kết nối' : needsReconnect ? 'Cần kết nối lại' : 'Chưa kết nối'}
        </span>
      </div>

      {/* Status message */}
      {needsReconnect && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ Kết nối Google Calendar không hợp lệ. Token có thể đã hết hạn hoặc bị thu hồi.
            Vui lòng kết nối lại để tiếp tục đồng bộ lịch học.
          </p>
        </div>
      )}

      {!status?.connected && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            💡 Khi kết nối, lịch học sẽ tự động đồng bộ sang Google Calendar của bạn.
            Chúng tôi chỉ tạo/sửa/xóa sự kiện lịch học — không truy cập sự kiện khác.
          </p>
        </div>
      )}

      {/* Connected info */}
      {isConnected && status?.connectedAt && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Kết nối từ: {new Date(status.connectedAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7S11.87 1 8 1zm3.12 7.88H8.88v2.24a.88.88 0 01-1.76 0V8.88H4.88a.88.88 0 010-1.76h2.24V4.88a.88.88 0 011.76 0v2.24h2.24a.88.88 0 010 1.76z"
                fill="currentColor"
              />
            </svg>
            {needsReconnect ? 'Kết nối lại' : 'Kết nối Google Calendar'}
          </button>
        ) : (
          <>
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              🔄 Kết nối lại
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
            >
              ✕ Ngắt kết nối
            </button>
          </>
        )}
      </div>
    </div>
  );
}
