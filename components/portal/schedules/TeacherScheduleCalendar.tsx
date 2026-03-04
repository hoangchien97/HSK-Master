'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  BigCalendarView,
  ScheduleModal,
  EventDetailDrawer,
  DeleteScheduleModal,
} from '@/components/portal/calendar';
import {
  fetchSchedules,
  fetchClasses,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  deleteScheduleGroup,
} from '@/actions/schedule.actions';
import { Spinner } from '@heroui/react';
import type {
  ISchedule,
  IClass,
  IScheduleFormData,
} from '@/interfaces/portal';

export default function TeacherScheduleCalendar() {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ISchedule | null>(null);
  const [scheduleToEdit, setScheduleToEdit] = useState<ISchedule | null>(null);
  const [slotInitialTime, setSlotInitialTime] = useState<{ start: Date; end: Date } | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setIsPageLoading(true);
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
      setIsPageLoading(false);
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

      // Show sync warning if sync was requested but failed
      if (data.syncToGoogle && result.syncError) {
        const isNotConnected = result.syncError.includes("chưa được kết nối") || result.syncError.includes("hết hạn")
        if (isNotConnected) {
          toast.warning("Lịch đã được tạo nhưng chưa đồng bộ Google Calendar. Bạn cần đăng xuất rồi đăng nhập lại bằng Google để kích hoạt đồng bộ.", { autoClose: 8000 })
        } else {
          toast.warning(`Đồng bộ Google Calendar thất bại: ${result.syncError}`)
        }
      }

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
    if (!scheduleToEdit?.seriesId) return;

    try {
      const result = await updateSchedule(scheduleToEdit.seriesId, data);

      if (!result.success) {
        throw new Error(result.error || 'Không thể cập nhật buổi học');
      }

      toast.success('Đã cập nhật buổi học thành công!');

      // Reload data since series update may affect multiple sessions
      await loadData();

      setShowModal(false);
      setScheduleToEdit(null);
      setSelectedSchedule(null);
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
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa buổi học';
      toast.error(errorMessage);
    }
  };

  const handleDeleteScheduleGroup = async (seriesId: string) => {
    try {
      const result = await deleteScheduleGroup(seriesId);

      if (!result.success) {
        throw new Error(result.error || 'Không thể xóa nhóm lịch lặp lại');
      }

      const count = result.deletedIds?.length || 0;
      toast.success(`Đã xóa ${count} buổi học trong nhóm lặp lại!`);

      // Optimistically remove all schedules in the group from state
      if (result.deletedIds) {
        const deletedSet = new Set(result.deletedIds);
        setSchedules(prev => prev.filter(s => !deletedSet.has(s.id)));
      } else {
        // Fallback: reload all data
        await loadData();
      }
      setShowDeleteModal(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Error deleting schedule group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa nhóm lịch';
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
    setScheduleToDelete(schedule);
    setSelectedSchedule(null);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScheduleToEdit(null);
    setSlotInitialTime(null);
  };

  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    setScheduleToEdit(null);
    setSlotInitialTime(slotInfo);
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Calendar — wrapped in relative container for loading overlay */}
      <div className="relative flex-1 min-h-[400px]">
        {/* Inline pill loading — same style as CTable refetch pill */}
        {isPageLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-default-200">
              <Spinner size="sm" color="primary" classNames={{ wrapper: "w-4 h-4" }} />
              <span className="text-xs text-default-500 font-medium">Đang tải lịch học...</span>
            </div>
          </div>
        )}
        <BigCalendarView
          schedules={schedules}
          onEventClick={handleEventClick}
          onEventDoubleClick={handleEventDoubleClick}
          onEditEvent={handleEdit}
          onCreateSchedule={() => {
            setScheduleToEdit(null);
            setSlotInitialTime(null);
            setShowModal(true);
          }}
          onSlotSelect={handleSlotSelect}
        />
      </div>

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
        slotInitialTime={slotInitialTime || undefined}
      />

      {/* Delete Modal */}
      <DeleteScheduleModal
        isOpen={showDeleteModal}
        schedule={scheduleToDelete}
        onClose={() => { setShowDeleteModal(false); setScheduleToDelete(null); }}
        onConfirm={handleDeleteSchedule}
        onConfirmGroup={handleDeleteScheduleGroup}
      />
    </div>
  );
}
