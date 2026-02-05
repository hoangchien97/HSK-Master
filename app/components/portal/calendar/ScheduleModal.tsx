'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Calendar, Info } from 'lucide-react';
import {
  BaseModal,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Switch,
  Tooltip,
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

  const renderHeader = () => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <Calendar className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {editMode ? 'Chỉnh sửa buổi học' : 'Tạo buổi học mới'}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {editMode ? 'Cập nhật thông tin buổi học' : 'Điền thông tin để tạo buổi học'}
        </p>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Hủy
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        onClick={handleSubmit(onFormSubmit)}
        className="bg-red-600 hover:bg-red-700"
      >
        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="2xl"
      maxHeight="90vh"
    >
      <form className="space-y-5">
        {/* Class Selection */}
        <div>
          <Label htmlFor="classId" required>
            Lớp học
          </Label>
          <Controller
            name="classId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="classId"
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
          <Label htmlFor="title" required>
            Tiêu đề
          </Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="VD: Lớp HSK 2 - Bài 1"
            error={errors.title?.message}
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Nội dung buổi học..."
            rows={3}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate" required>
              Ngày học
            </Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>
          <div>
            <Label htmlFor="startTime" required>
              Giờ bắt đầu
            </Label>
            <Input
              id="startTime"
              type="time"
              {...register('startTime')}
              error={errors.startTime?.message}
            />
          </div>
          <div>
            <Label htmlFor="endTime" required>
              Giờ kết thúc
            </Label>
            <Input
              id="endTime"
              type="time"
              {...register('endTime')}
              error={errors.endTime?.message}
            />
          </div>
        </div>

        {/* Recurrence */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="recurrence" className="mb-0">
                Lặp lại buổi học
              </Label>
              <Tooltip content="Tạo nhiều buổi học cùng lúc theo lịch lặp lại hàng tuần">
                <Info className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <Switch
              id="recurrence"
              checked={enableRecurrence}
              onCheckedChange={setEnableRecurrence}
            />
          </div>

          {enableRecurrence && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              {/* Weekdays Selection */}
              <div>
                <Label>Chọn các ngày trong tuần</Label>
                <div className="flex gap-2 mt-2">
                  {WEEKDAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleWeekdayToggle(day.value)}
                      className={`
                        w-10 h-10 rounded-lg font-medium text-sm transition-colors
                        ${selectedWeekdays.includes(day.value)
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-red-600'
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
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mặc định: +2 tháng từ ngày bắt đầu
                </p>
              </div>

              {/* Preview */}
              {previewCount > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>{previewCount}</strong> buổi học sẽ được tạo
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
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Label htmlFor="syncGoogle" className="mb-0">
              Đồng bộ Google Calendar
            </Label>
            <Tooltip content="Tự động đồng bộ buổi học lên Google Calendar của bạn">
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
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
