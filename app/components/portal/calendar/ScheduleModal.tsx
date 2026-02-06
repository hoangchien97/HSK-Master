'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Calendar, Repeat } from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  BaseModal,
} from '@/app/components/common';
import type { IClass, IScheduleFormData, ISchedule } from '@/app/interfaces/portal';
import {
  getDefaultRecurrenceEndDate,
  previewRecurrenceCount,
  formatWeekdays,
} from '@/app/utils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IScheduleFormData) => Promise<void>;
  classes: IClass[];
  initialData?: Partial<ISchedule> | Partial<IScheduleFormData>;
  editMode?: boolean;
}

const scheduleSchema = z.object({
  classId: z.string().min(1, 'Vui lòng chọn lớp học'),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày'),
  startTime: z.string().min(1, 'Vui lòng chọn giờ bắt đầu'),
  endTime: z.string().min(1, 'Vui lòng chọn giờ kết thúc'),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'Giờ kết thúc phải sau giờ bắt đầu',
  path: ['endTime'],
});

type ScheduleFormFields = z.infer<typeof scheduleSchema>;

const WEEKDAYS = [
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
  { value: 0, label: 'CN' },
];

export default function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  classes,
  initialData,
  editMode = false,
}: ScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableRecurrence, setEnableRecurrence] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  // Recurrence state
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState('');

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = dayjs().format('YYYY-MM-DD');

  // Helper to extract classId from initialData (handles both ISchedule and IScheduleFormData)
  const getClassId = (): string => {
    if (!initialData) return '';
    if ('classId' in initialData && initialData.classId) return initialData.classId;
    if ('class' in initialData && initialData.class) return initialData.class.id;
    return '';
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormFields>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      classId: getClassId(),
      title: initialData?.title || '',
      description: initialData?.description || '',
      startDate: initialData?.startTime
        ? dayjs(initialData.startTime).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      startTime: initialData?.startTime
        ? dayjs(initialData.startTime).format('HH:mm')
        : '09:00',
      endTime: initialData?.endTime
        ? dayjs(initialData.endTime).format('HH:mm')
        : '11:00',
    },
  });

  const startDate = watch('startDate');

  // Auto set end date when start date changes
  useEffect(() => {
    if (startDate && !endDate && enableRecurrence) {
      setEndDate(getDefaultRecurrenceEndDate(startDate));
    }
  }, [startDate, endDate, enableRecurrence]);

  // Preview recurrence count
  useEffect(() => {
    if (enableRecurrence && startDate && endDate && selectedWeekdays.length > 0) {
      const count = previewRecurrenceCount(startDate, endDate, selectedWeekdays);
      setPreviewCount(count);
    } else {
      setPreviewCount(0);
    }
  }, [enableRecurrence, startDate, endDate, selectedWeekdays]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setEnableRecurrence(false);
      setSyncToGoogle(false);
      setSelectedWeekdays([]);
      setEndDate('');
      setPreviewCount(0);
    }
  }, [isOpen, reset]);

  const handleWeekdayToggle = (day: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const onFormSubmit = async (data: ScheduleFormFields) => {
    setIsSubmitting(true);
    try {
      const startDateTime = dayjs(`${data.startDate} ${data.startTime}`).toDate();
      const endDateTime = dayjs(`${data.startDate} ${data.endTime}`).toDate();

      const formData: IScheduleFormData = {
        classId: data.classId,
        title: data.title,
        description: data.description,
        startTime: startDateTime,
        endTime: endDateTime,
        syncToGoogle,
      };

      if (enableRecurrence && selectedWeekdays.length > 0 && endDate) {
        formData.recurrence = {
          interval: 1,
          weekdays: selectedWeekdays,
          endDate,
        };
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editMode ? 'Cập nhật buổi học' : 'Tạo buổi học mới'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {editMode ? 'Cập nhật thông tin buổi học' : 'Điền thông tin để tạo buổi học'}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Class Selection */}
        <div>
          <Controller
            name="classId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="classId"
                label="Lớp học"
                required
                placeholder="Chọn lớp học"
                options={classes.map(c => ({
                  value: c.id,
                  label: `${c.name} (${c.code})`,
                }))}
                error={errors.classId?.message}
              />
            )}
          />
        </div>

        {/* Title */}
        <div>
          <Input
            id="title"
            label="Tiêu đề"
            required
            {...register('title')}
            placeholder="VD: Lớp HSK 2 - Bài 1"
            error={errors.title?.message}
          />
        </div>

        {/* Description */}
        <div>
          <Textarea
            id="description"
            label="Mô tả"
            {...register('description')}
            placeholder="Nội dung buổi học..."
            rows={3}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              id="startDate"
              label="Ngày học"
              required
              type="date"
              min={editMode ? undefined : today}
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>
          <div>
            <Input
              id="startTime"
              label="Giờ bắt đầu"
              required
              type="time"
              {...register('startTime')}
              error={errors.startTime?.message}
            />
          </div>
          <div>
            <Input
              id="endTime"
              label="Giờ kết thúc"
              required
              type="time"
              {...register('endTime')}
              error={errors.endTime?.message}
            />
          </div>
        </div>

        {/* Recurrence */}
        <div className="space-y-4 p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Repeat className="w-5 h-5 text-red-600" />
              </div>
              <div>
              <h4 className="text-sm font-semibold text-gray-900">Lặp lại buổi học</h4>
              <p className="text-xs text-gray-600">Tạo nhiều buổi học theo lịch hàng tuần</p>
              </div>
            </div>
            <Switch
              id="recurrence"
              checked={enableRecurrence}
              onCheckedChange={setEnableRecurrence}
            />
            </div>

          {enableRecurrence && (
            <div className="space-y-4 pt-4 border-t border-red-200">
              {/* Weekdays Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">Chọn các ngày trong tuần</p>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleWeekdayToggle(day.value)}
                      className={`
                        flex-1 min-w-[60px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
                        ${selectedWeekdays.includes(day.value)
                          ? 'bg-red-600 text-white shadow-md scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50'
                        }
                      `}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* End Date */}
              <div>
                <Input
                  id="endDate"
                  label="Ngày kết thúc lặp lại"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  helperText="Mặc định: +2 tháng từ ngày bắt đầu"
                  className="bg-white"
                />
              </div>

              {/* Preview */}
              {previewCount > 0 && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">
                    📅 <strong>{previewCount}</strong> buổi học sẽ được tạo
                    {selectedWeekdays.length > 0 && (
                      <> vào các ngày: <strong>{formatWeekdays(selectedWeekdays)}</strong></>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
          </div>

        {/* Google Calendar Sync */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Đồng bộ Google Calendar</h4>
              <p className="text-xs text-gray-600">Tự động thêm vào lịch của bạn</p>
            </div>
          </div>
          <Switch
            id="syncGoogle"
            checked={syncToGoogle}
            onCheckedChange={setSyncToGoogle}
          />
        </div>
        </form>
      </BaseModal>
  );
}
