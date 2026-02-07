"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip,
} from "@heroui/react";
import { Calendar, Repeat } from "lucide-react";
import { CModal } from "../common";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { scheduleSchema, type ScheduleFormValues } from "@/app/validators";
import type { IClass, ICreateScheduleDTO, IRecurrence } from "@/app/interfaces/portal";
import {
  getDefaultRecurrenceEndDate,
  previewRecurrenceCount,
  formatWeekdays,
} from "@/app/utils";

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classes: IClass[];
  initialData?: any;
  editMode?: boolean;
}

const WEEKDAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
];

export default function ScheduleFormModal({
  isOpen,
  onClose,
  onSuccess,
  classes,
  initialData,
  editMode = false,
}: ScheduleFormModalProps) {
  const [enableRecurrence, setEnableRecurrence] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState("");
  const [previewCount, setPreviewCount] = useState(0);

  const today = dayjs().format("YYYY-MM-DD");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      classId: initialData?.classId || initialData?.class?.id || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      startDate: initialData?.startTime
        ? dayjs(initialData.startTime).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      startTime: initialData?.startTime
        ? dayjs(initialData.startTime).format("HH:mm")
        : "09:00",
      endTime: initialData?.endTime
        ? dayjs(initialData.endTime).format("HH:mm")
        : "11:00",
      location: initialData?.location || "",
      meetingLink: initialData?.meetingLink || "",
    },
  });

  const startDate = watch("startDate");

  useEffect(() => {
    if (startDate && !endDate && enableRecurrence) {
      setEndDate(getDefaultRecurrenceEndDate(startDate));
    }
  }, [startDate, endDate, enableRecurrence]);

  useEffect(() => {
    if (enableRecurrence && startDate && endDate && selectedWeekdays.length > 0) {
      setPreviewCount(previewRecurrenceCount(startDate, endDate, selectedWeekdays));
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
      setEndDate("");
      setPreviewCount(0);
    }
  }, [isOpen, reset]);

  const handleWeekdayToggle = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      const startDateTime = dayjs(`${data.startDate} ${data.startTime}`).toDate();
      const endDateTime = dayjs(`${data.startDate} ${data.endTime}`).toDate();

      const body: ICreateScheduleDTO = {
        classId: data.classId,
        title: data.title,
        description: data.description,
        startTime: startDateTime,
        endTime: endDateTime,
        location: data.location,
        meetingLink: data.meetingLink,
        syncToGoogle,
      };

      if (enableRecurrence && selectedWeekdays.length > 0 && endDate) {
        body.recurrence = {
          interval: 1,
          weekdays: selectedWeekdays,
          endDate,
        };
      }

      const url = editMode
        ? `/api/portal/schedules/${initialData.id}`
        : "/api/portal/schedules";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Có lỗi xảy ra");
      }

      toast.success(editMode ? "Cập nhật lịch thành công!" : "Tạo lịch thành công!");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      closeIcon={Calendar}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {editMode ? "Cập nhật buổi học" : "Tạo buổi học mới"}
            </p>
            <p className="text-sm text-default-400 font-normal">
              {editMode ? "Cập nhật thông tin buổi học" : "Điền thông tin để tạo buổi học"}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button color="primary" type="submit" form="schedule-form" isLoading={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} className="gap-4 flex flex-col">
            {/* Class Selection */}
            <Controller
              name="classId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Lớp học"
                  placeholder="Chọn lớp học"
                  isRequired
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    field.onChange(val);
                  }}
                  isInvalid={!!errors.classId}
                  errorMessage={errors.classId?.message}
                >
                  {classes.map((c) => (
                    <SelectItem key={c.id}>
                      {c.className || c.classCode}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Input
              label="Tiêu đề"
              placeholder="VD: Lớp HSK 2 - Bài 1"
              isRequired
              isInvalid={!!errors.title}
              errorMessage={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              label="Mô tả"
              placeholder="Nội dung buổi học..."
              {...register("description")}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="date"
                label="Ngày học"
                isRequired
                min={editMode ? undefined : today}
                isInvalid={!!errors.startDate}
                errorMessage={errors.startDate?.message}
                {...register("startDate")}
              />
              <Input
                type="time"
                label="Giờ bắt đầu"
                isRequired
                isInvalid={!!errors.startTime}
                errorMessage={errors.startTime?.message}
                {...register("startTime")}
              />
              <Input
                type="time"
                label="Giờ kết thúc"
                isRequired
                isInvalid={!!errors.endTime}
                errorMessage={errors.endTime?.message}
                {...register("endTime")}
              />
            </div>

            {/* Location & Meeting Link */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Địa điểm"
                placeholder="Phòng 301 hoặc Online"
                {...register("location")}
              />
              <Input
                label="Link học online"
                placeholder="https://meet.google.com/..."
                {...register("meetingLink")}
              />
            </div>

            {/* Recurrence */}
            <div className="p-4 bg-default-50 rounded-xl border border-default-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Repeat className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Lặp lại buổi học</p>
                    <p className="text-xs text-default-400">
                      Tạo nhiều buổi học theo lịch hàng tuần
                    </p>
                  </div>
                </div>
                <Switch
                  isSelected={enableRecurrence}
                  onValueChange={setEnableRecurrence}
                  size="sm"
                  color="primary"
                />
              </div>

              {enableRecurrence && (
                <div className="space-y-3 pt-3 border-t border-default-200">
                  <p className="text-sm font-medium">Chọn các ngày trong tuần</p>
                  <div className="flex gap-2 flex-wrap">
                    {WEEKDAYS.map((day) => (
                      <Chip
                        key={day.value}
                        variant={selectedWeekdays.includes(day.value) ? "solid" : "bordered"}
                        color={selectedWeekdays.includes(day.value) ? "primary" : "default"}
                        className="cursor-pointer"
                        onClick={() => handleWeekdayToggle(day.value)}
                      >
                        {day.label}
                      </Chip>
                    ))}
                  </div>
                  <Input
                    type="date"
                    label="Ngày kết thúc lặp lại"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    description="Mặc định: +2 tháng từ ngày bắt đầu"
                    size="sm"
                  />
                  {previewCount > 0 && (
                    <Chip color="primary" variant="flat" size="sm">
                      📅 {previewCount} buổi học sẽ được tạo
                      {selectedWeekdays.length > 0 &&
                        ` vào: ${formatWeekdays(selectedWeekdays)}`}
                    </Chip>
                  )}
                </div>
              )}
            </div>

            {/* Google Sync */}
            <div className="flex items-center justify-between p-4 bg-default-50 rounded-xl border border-default-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Đồng bộ Google Calendar</p>
                  <p className="text-xs text-default-400">
                    Tự động thêm vào lịch của bạn
                  </p>
                </div>
              </div>
              <Switch
                isSelected={syncToGoogle}
                onValueChange={setSyncToGoogle}
                size="sm"
                color="primary"
              />
            </div>
          </form>
    </CModal>
  );
}
