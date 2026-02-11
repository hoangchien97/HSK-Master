'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { Trash2, AlertTriangle, Repeat } from 'lucide-react';
import { Button, RadioGroup, Radio } from '@heroui/react';
import type { ISchedule } from '@/interfaces/portal';
import { CModal } from '@/components/portal/common';

type DeleteMode = 'single' | 'group';

interface DeleteScheduleModalProps {
  isOpen: boolean;
  schedule: ISchedule | null;
  onClose: () => void;
  onConfirm: (scheduleId: string) => Promise<void>;
  onConfirmGroup?: (recurrenceGroupId: string) => Promise<void>;
}

export default function DeleteScheduleModal({
  isOpen,
  schedule,
  onClose,
  onConfirm,
  onConfirmGroup,
}: DeleteScheduleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single');

  if (!schedule) return null;

  const hasRecurrenceGroup = !!schedule.recurrenceGroupId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteMode === 'group' && hasRecurrenceGroup && onConfirmGroup) {
        await onConfirmGroup(schedule.recurrenceGroupId!);
      } else {
        await onConfirm(schedule.id);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setIsDeleting(false);
      setDeleteMode('single');
    }
  };

  const handleClose = () => {
    setDeleteMode('single');
    onClose();
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger" />
          Xác nhận xóa lịch học
        </div>
      }
      footer={
        <>
          <Button variant="flat" onPress={handleClose} isDisabled={isDeleting}>
            Hủy
          </Button>
          <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>
            <Trash2 className="w-4 h-4" />
            {deleteMode === 'group' ? 'Xóa tất cả' : 'Xóa lịch'}
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

        {/* Batch delete option for recurring schedules */}
        {hasRecurrenceGroup && onConfirmGroup && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-medium text-purple-900">
                Buổi học thuộc nhóm lịch lặp lại
              </p>
            </div>
            <RadioGroup
              value={deleteMode}
              onValueChange={(value) => setDeleteMode(value as DeleteMode)}
              size="sm"
            >
              <Radio value="single">
                <span className="text-sm">Chỉ xóa buổi học này</span>
              </Radio>
              <Radio value="group" className="mt-1">
                <span className="text-sm text-red-600 font-medium">
                  Xóa tất cả buổi học trong nhóm lặp lại
                </span>
              </Radio>
            </RadioGroup>
          </div>
        )}

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
