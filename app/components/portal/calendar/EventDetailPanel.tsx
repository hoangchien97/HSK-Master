'use client';

import dayjs from 'dayjs';
import { X, Calendar, Clock, BookOpen, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button, Badge } from '@/app/components/common';
import type { ISchedule } from '@/app/interfaces/portal';
import { formatScheduleTime, getScheduleDuration } from '@/app/utils';

interface EventDetailPanelProps {
  schedule: ISchedule | null;
  onClose: () => void;
  onEdit: (schedule: ISchedule) => void;
  onDelete: (schedule: ISchedule) => void;
}

export default function EventDetailPanel({
  schedule,
  onClose,
  onEdit,
  onDelete,
}: EventDetailPanelProps) {
  if (!schedule) return null;

  const duration = getScheduleDuration(schedule.startTime, schedule.endTime);
  const formattedDate = dayjs(schedule.startTime).format('dddd, DD/MM/YYYY');

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Chi tiết buổi học</h2>
            <p className="text-xs text-gray-500 capitalize">{formattedDate}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {schedule.title}
          </h3>
        </div>

        {/* Class Card */}
        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border border-red-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{schedule.class.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-xs">
                  {schedule.class.code}
                </Badge>
                <span className="text-xs text-gray-600">{schedule.class.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {formatScheduleTime(schedule.startTime)} - {formatScheduleTime(schedule.endTime)}
              </p>
              <p className="text-xs text-gray-500">
                Thời lượng: {duration} phút
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {schedule.description && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Nội dung buổi học</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {schedule.description}
              </p>
            </div>
          </div>
        )}

        {/* Google Calendar Sync Status */}
        {schedule.syncedToGoogle && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Đã đồng bộ Google Calendar
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Buổi học này được tự động cập nhật trên Google Calendar
              </p>
            </div>
          </div>
        )}

        {/* Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Trạng thái</h4>
          <Badge 
            variant={schedule.status === 'ACTIVE' ? 'success' : 'default'}
            className="text-sm"
          >
            {schedule.status === 'ACTIVE' ? 'Hoạt động' : schedule.status}
          </Badge>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <Button
          variant="outline"
          fullWidth
          onClick={() => onEdit(schedule)}
          icon={<Edit2 className="w-4 h-4" />}
        >
          Chỉnh sửa
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={() => onDelete(schedule)}
          icon={<Trash2 className="w-4 h-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
        >
          Xóa buổi học
        </Button>
      </div>
    </div>
  );
}
