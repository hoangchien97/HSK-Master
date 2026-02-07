'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Calendar, Repeat } from 'lucide-react';
import { Button, Input, Select, SelectItem, Switch, Textarea } from '@heroui/react';
import { CModal } from '../common';
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

  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState('');

  const today = dayjs().format('YYYY-MM-DD');

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

  useEffect(() => {
    if (startDate && !endDate && enableRecurrence) {
      setEndDate(getDefaultRecurrenceEndDate(startDate));
    }
  }, [startDate, endDate, enableRecurrence]);

  useEffect(() => {
    if (enableRecurrence && startDate && endDate && selectedWeekdays.length > 0) {
      const count = previewRecurrenceCount(startDate, endDate, selectedWeekdays);
      setPreviewCount(count);
    } else {
      setPreviewCount(0);
    }
  }, [enableRecurrence, startDate, endDate, selectedWeekdays]);

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
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
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
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      closeIcon={editMode ? Calendar : Calendar}
      title={
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
        <>
          <Button variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="schedule-form"
            isDisabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </>
      }
    >
      <form id="schedule-form" className="space-y-5" onSubmit={handleSubmit(onFormSubmit)}>
            {/* Class Selection */}
            <Controller
              name="classId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Lớp học"
                  isRequired
                  placeholder="Chọn lớp học"
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    field.onChange(selected);
                  }}
                  isInvalid={!!errors.classId}
                  errorMessage={errors.classId?.message}
                >
                  {classes.map(c => (
                    <SelectItem key={c.id} textValue={`${c.className} (${c.classCode})`}>
                      {c.className} ({c.classCode})
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            {/* Title */}
            <Input
              label="Tiêu đề"
              isRequired
              {...register('title')}
              placeholder="VD: Lớp HSK 2 - Bài 1"
              isInvalid={!!errors.title}
              errorMessage={errors.title?.message}
            />

            {/* Description */}
            <Textarea
              label="Mô tả"
              {...register('description')}
              placeholder="Nội dung buổi học..."
              minRows={3}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Ngày học"
                isRequired
                type="date"
                min={editMode ? undefined : today}
                {...register('startDate')}
                isInvalid={!!errors.startDate}
                errorMessage={errors.startDate?.message}
              />
              <Input
                label="Giờ bắt đầu"
                isRequired
                type="time"
                {...register('startTime')}
                isInvalid={!!errors.startTime}
                errorMessage={errors.startTime?.message}
              />
              <Input
                label="Giờ kết thúc"
                isRequired
                type="time"
                {...register('endTime')}
                isInvalid={!!errors.endTime}
                errorMessage={errors.endTime?.message}
              />
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
                  isSelected={enableRecurrence}
                  onValueChange={setEnableRecurrence}
                />
              </div>

              {enableRecurrence && (
                <div className="space-y-4 pt-4 border-t border-red-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-3">Chọn các ngày trong tuần</p>
                    <div className="flex gap-2 flex-wrap">
                      {WEEKDAYS.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleWeekdayToggle(day.value)}
                          className={`flex-1 min-w-[60px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            selectedWeekdays.includes(day.value)
                              ? 'bg-red-600 text-white shadow-md scale-105'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Ngày kết thúc lặp lại"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    description="Mặc định: +2 tháng từ ngày bắt đầu"
                    className="bg-white"
                  />

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
                    <path fill="#4285F4" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Đồng bộ Google Calendar</h4>
                  <p className="text-xs text-gray-600">Tự động thêm vào lịch của bạn</p>
                </div>
              </div>
              <Switch
                isSelected={syncToGoogle}
                onValueChange={setSyncToGoogle}
              />
            </div>
          </form>
    </CModal>
  );
}
