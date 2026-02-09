'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@heroui/react';
import type { ISchedule } from '@/interfaces/portal';
import { CModal } from '@/components/portal/common';

interface DeleteScheduleModalProps {
  isOpen: boolean;
  schedule: ISchedule | null;
  onClose: () => void;
  onConfirm: (scheduleId: string) => Promise<void>;
}

export default function DeleteScheduleModal({
  isOpen,
  schedule,
  onClose,
  onConfirm,
}: DeleteScheduleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!schedule) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(schedule.id);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger" />
          Xác nhận xóa lịch học
        </div>
      }
      footer={
        <>
          <Button variant="flat" onPress={onClose} isDisabled={isDeleting}>
            Hủy
          </Button>
          <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>
            <Trash2 className="w-4 h-4" />
            Xóa lịch
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Bạn có chắc chắn muốn xóa buổi học này?
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {schedule.class?.className} ({schedule.class?.classCode})
              </p>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {dayjs(schedule.startTime).format('dddd, DD/MM/YYYY')}
              </p>
              <p className="text-xs text-gray-600">
                {dayjs(schedule.startTime).format('HH:mm')} - {dayjs(schedule.endTime).format('HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {/* Google Calendar Warning */}
        {schedule.syncedToGoogle && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Đồng bộ Google Calendar</p>
              <p className="text-sm text-blue-700 mt-1">
                Buổi học này cũng sẽ bị xóa khỏi Google Calendar.
              </p>
            </div>
          </div>
        )}
      </div>
    </CModal>
  );
}
