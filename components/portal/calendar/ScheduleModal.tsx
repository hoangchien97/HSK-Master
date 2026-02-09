"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Form,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip,
} from "@heroui/react";
import { Calendar, Repeat } from "lucide-react";
import { CModal } from "../common";
import dayjs from "dayjs";
import type { IClass, IScheduleFormData, ISchedule } from "@/interfaces/portal";
import {
  getDefaultRecurrenceEndDate,
  previewRecurrenceCount,
  formatWeekdays,
} from "@/utils";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IScheduleFormData) => Promise<void>;
  classes: IClass[];
  initialData?: Partial<ISchedule> | Partial<IScheduleFormData>;
  editMode?: boolean;
  slotInitialTime?: { start: Date; end: Date };
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

export default function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  classes,
  initialData,
  editMode = false,
  slotInitialTime,
}: ScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enableRecurrence, setEnableRecurrence] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState("");
  const [previewCount, setPreviewCount] = useState(0);

  const getClassId = useCallback((): string => {
    if (!initialData) return "";
    if ("classId" in initialData && initialData.classId) return initialData.classId;
    if ("class" in initialData && initialData.class) return (initialData.class as { id: string }).id;
    return "";
  }, [initialData]);

  const [classId, setClassId] = useState(getClassId());
  const [startDate, setStartDate] = useState(
    initialData?.startTime
      ? dayjs(initialData.startTime).format("YYYY-MM-DD")
      : slotInitialTime
        ? dayjs(slotInitialTime.start).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")
  );

  // Derive default start/end times from slot selection or initialData
  const defaultStartTime = slotInitialTime
    ? dayjs(slotInitialTime.start).format("HH:mm")
    : initialData?.startTime
      ? dayjs(initialData.startTime).format("HH:mm")
      : "09:00";

  const defaultEndTime = slotInitialTime
    ? dayjs(slotInitialTime.end).format("HH:mm")
    : initialData?.endTime
      ? dayjs(initialData.endTime).format("HH:mm")
      : "11:00";

  const today = dayjs().format("YYYY-MM-DD");

  // Auto-set recurrence end date
  useEffect(() => {
    if (startDate && !endDate && enableRecurrence) {
      setEndDate(getDefaultRecurrenceEndDate(startDate));
    }
  }, [startDate, endDate, enableRecurrence]);

  // Preview recurrence count
  useEffect(() => {
    if (enableRecurrence && startDate && endDate && selectedWeekdays.length > 0) {
      setPreviewCount(previewRecurrenceCount(startDate, endDate, selectedWeekdays));
    } else {
      setPreviewCount(0);
    }
  }, [enableRecurrence, startDate, endDate, selectedWeekdays]);

  // Reset form on close / init on open
  useEffect(() => {
    if (!isOpen) {
      setErrors((prev) => Object.keys(prev).length > 0 ? {} : prev);
      setEnableRecurrence(false);
      setSyncToGoogle(false);
      setSelectedWeekdays((prev) => prev.length > 0 ? [] : prev);
      setEndDate("");
      setPreviewCount(0);
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setClassId("");
    } else if (initialData) {
      setClassId(getClassId());
      setStartDate(
        initialData?.startTime
          ? dayjs(initialData.startTime).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD")
      );
    } else if (slotInitialTime) {
      setStartDate(dayjs(slotInitialTime.start).format("YYYY-MM-DD"));
    }
  }, [isOpen, initialData, slotInitialTime, getClassId]);

  const handleWeekdayToggle = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    setErrors({});

    // Validate classId from state (Select doesn't serialize well)
    if (!classId) {
      setErrors({ classId: "Vui lòng chọn lớp học" });
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = dayjs(`${formData.startDate} ${formData.startTime}`).toDate();
      const endDateTime = dayjs(`${formData.startDate} ${formData.endTime}`).toDate();

      if (endDateTime <= startDateTime) {
        setErrors({ endTime: "Giờ kết thúc phải sau giờ bắt đầu" });
        return;
      }

      const payload: IScheduleFormData = {
        classId,
        title: formData.title as string,
        description: formData.description as string,
        startTime: startDateTime,
        endTime: endDateTime,
        location: formData.location as string || undefined,
        meetingLink: formData.meetingLink as string || undefined,
        syncToGoogle,
      };

      if (!editMode && enableRecurrence && selectedWeekdays.length > 0 && endDate) {
        payload.recurrence = {
          interval: 1,
          weekdays: selectedWeekdays,
          endDate,
        };
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Error submitting schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="outside"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {editMode ? "Cập nhật buổi học" : "Tạo buổi học mới"}
            </p>
            <p className="text-sm text-default-400 font-normal">
              {editMode
                ? "Cập nhật thông tin buổi học"
                : "Điền thông tin để tạo buổi học"}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            type="submit"
            form="schedule-form"
            isLoading={isSubmitting}
          >
            {editMode ? "Cập nhật" : "Tạo buổi học"}
          </Button>
        </>
      }
    >
      <Form
        id="schedule-form"
        validationErrors={errors}
        onSubmit={handleFormSubmit}
        className="gap-4 flex flex-col"
      >
        {/* Class Selection */}
        <Select
          label="Lớp học"
          name="classId"
          placeholder="Chọn lớp học"
          labelPlacement="outside"
          isRequired
          selectedKeys={classId ? new Set([classId]) : new Set()}
          onSelectionChange={(keys: "all" | Set<React.Key>) => {
            if (keys !== "all") {
              const val = Array.from(keys)[0] as string;
              setClassId(val || "");
            }
          }}
          isInvalid={!!errors.classId}
          errorMessage={errors.classId || undefined}
        >
          {classes.map((c) => (
            <SelectItem key={c.id}>
              {c.className}
            </SelectItem>
          ))}
        </Select>

        {/* Title */}
        <Input
          name="title"
          label="Tiêu đề"
          placeholder="VD: Bài 1 - Chào hỏi cơ bản"
          labelPlacement="outside"
          isRequired
          defaultValue={initialData?.title || ""}
          errorMessage={({ validationDetails }) => {
            if (validationDetails.valueMissing) {
              return "Vui lòng nhập tiêu đề";
            }
          }}
        />

        {/* Description */}
        <Textarea
          name="description"
          label="Mô tả"
          placeholder="Nội dung buổi học..."
          labelPlacement="outside"
          defaultValue={initialData?.description || ""}
        />

        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            type="date"
            name="startDate"
            label="Ngày học"
            labelPlacement="outside"
            isRequired
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            min={editMode ? undefined : today}
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng chọn ngày";
              }
            }}
          />
          <Input
            type="time"
            name="startTime"
            label="Giờ bắt đầu"
            labelPlacement="outside"
            isRequired
            defaultValue={defaultStartTime}
            key={`start-${defaultStartTime}`}
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng chọn giờ bắt đầu";
              }
            }}
          />
          <Input
            type="time"
            name="endTime"
            label="Giờ kết thúc"
            labelPlacement="outside"
            isRequired
            defaultValue={defaultEndTime}
            key={`end-${defaultEndTime}`}
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng chọn giờ kết thúc";
              }
            }}
          />
        </div>

        {/* Location & Meeting Link */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="location"
            label="Địa điểm"
            placeholder="Phòng 301 hoặc Online"
            labelPlacement="outside"
            defaultValue={(initialData as Record<string, unknown>)?.location as string || ""}
          />
          <Input
            name="meetingLink"
            label="Link học online"
            placeholder="https://meet.google.com/..."
            labelPlacement="outside"
            defaultValue={(initialData as Record<string, unknown>)?.meetingLink as string || ""}
          />
        </div>

        {/* Recurrence (create mode only) */}
        {!editMode && (
          <div className="p-4 bg-default-50 rounded-xl border border-default-200 space-y-4 w-full">
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
                      variant={
                        selectedWeekdays.includes(day.value) ? "solid" : "bordered"
                      }
                      color={
                        selectedWeekdays.includes(day.value) ? "primary" : "default"
                      }
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
                  labelPlacement="outside"
                  value={endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                  min={startDate || today}
                  size="sm"
                />
                {previewCount > 0 && (
                  <Chip color="primary" variant="flat" size="sm">
                    ��� {previewCount} buổi học sẽ được tạo
                    {selectedWeekdays.length > 0 &&
                      ` vào: ${formatWeekdays(selectedWeekdays)}`}
                  </Chip>
                )}
              </div>
            )}
          </div>
        )}

        {/* Google Sync */}
        <div className="flex items-center justify-between p-4 bg-default-50 rounded-xl border border-default-200 w-full">
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
      </Form>
    </CModal>
  );
}
