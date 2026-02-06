'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  ScheduleXCalendarView,
  ScheduleModal,
  EventDetailDrawer,
  DeleteScheduleModal,
} from '@/app/components/portal/calendar';
import { PageHeader, LoadingSpinner } from '@/app/components/portal/common';
import {
  fetchSchedules,
  fetchClasses,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '@/app/actions/schedule.actions';
import type {
  ISchedule,
  IClass,
  IScheduleFormData,
} from '@/app/interfaces/portal';

export default function TeacherScheduleCalendar() {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ISchedule | null>(null);

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [classesResult, schedulesResult] = await Promise.all([
        fetchClasses(),
        fetchSchedules(),
      ]);

      if (!classesResult.success) {
        throw new Error(classesResult.error || 'Không thể tải danh sách lớp');
      }

      if (!schedulesResult.success) {
        throw new Error(schedulesResult.error || 'Không thể tải lịch học');
      }

      setClasses(classesResult.classes || []);
      setSchedules(schedulesResult.schedules || []);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = async (data: IScheduleFormData) => {
    try {
      const result = await createSchedule(data);

      if (!result.success) {
        throw new Error(result.error || 'Không thể tạo buổi học');
      }

      const count = result.count || 1;
      toast.success(`Đã tạo ${count} buổi học thành công!`);

      // Optimistically add new schedules to state
      if (result.schedules && Array.isArray(result.schedules)) {
        setSchedules(prev => [...prev, ...result.schedules!]);
      } else {
        // Fallback: reload data
        await loadData();
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo buổi học';
      toast.error(errorMessage);
    }
  };

  const handleUpdateSchedule = async (data: IScheduleFormData) => {
    if (!scheduleToEdit) return;

    try {
      const result = await updateSchedule(scheduleToEdit.id, {
        title: data.title,
        description: data.description,
        classId: data.classId,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      if (!result.success) {
        throw new Error(result.error || 'Không thể cập nhật buổi học');
      }

      toast.success('Đã cập nhật buổi học thành công!');
      
      // Optimistically update schedule in state
      if (result.schedule) {
        setSchedules(prev => prev.map(s => s.id === scheduleToEdit.id ? result.schedule! : s));
        if (selectedSchedule?.id === scheduleToEdit.id) {
          setSelectedSchedule(result.schedule);
        }
      } else {
        // Fallback: reload data
        await loadData();
      }
      
      setShowModal(false);
      setScheduleToEdit(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật buổi học';
      toast.error(errorMessage);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const result = await deleteSchedule(scheduleId);

      if (!result.success) {
        throw new Error(result.error || 'Không thể xóa buổi học');
      }

      toast.success('Đã xóa buổi học thành công!');
      
      // Optimistically remove schedule from state
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      setShowDeleteModal(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa buổi học';
      toast.error(errorMessage);
    }
  };

  const handleEventClick = (schedule: ISchedule) => {
    setSelectedSchedule(schedule);
  };

  const handleEventDoubleClick = (schedule: ISchedule) => {
    setScheduleToEdit(schedule);
    setShowModal(true);
  };

  const handleEdit = (schedule: ISchedule) => {
    setScheduleToEdit(schedule);
    setShowModal(true);
  };

  const handleDelete = (schedule: ISchedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScheduleToEdit(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch giảng dạy"
        description="Quản lý và xem tất cả lịch học"
      />

      {/* Calendar - Full Width */}
      <ScheduleXCalendarView
        schedules={schedules}
        onEventClick={handleEventClick}
        onEventDoubleClick={handleEventDoubleClick}
        onCreateSchedule={() => {
          setScheduleToEdit(null);
          setShowModal(true);
        }}
      />

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        open={!!selectedSchedule}
        onOpenChange={(open) => !open && setSelectedSchedule(null)}
        eventId={selectedSchedule?.id || null}
        onEdit={(eventId) => {
          const schedule = schedules.find(s => s.id === eventId);
          if (schedule) handleEdit(schedule);
        }}
        onDelete={(eventId) => {
          const schedule = schedules.find(s => s.id === eventId);
          if (schedule) handleDelete(schedule);
        }}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={scheduleToEdit ? handleUpdateSchedule : handleCreateSchedule}
        classes={classes}
        initialData={scheduleToEdit || undefined}
        editMode={!!scheduleToEdit}
      />

      {/* Delete Modal */}
      <DeleteScheduleModal
        isOpen={showDeleteModal}
        schedule={selectedSchedule}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSchedule}
      />
    </div>
  );
}
