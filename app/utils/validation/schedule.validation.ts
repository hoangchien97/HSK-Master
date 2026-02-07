import { z } from "zod"

// Create Schedule Form Schema
export const createScheduleSchema = z.object({
  classId: z.string().min(1, "Vui lòng chọn lớp học"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  startTime: z.date({
    error: "Vui lòng chọn giờ bắt đầu",
  }),
  endTime: z.date({
    error: "Vui lòng chọn giờ kết thúc",
  }),
  location: z.string().optional(),
  meetingLink: z.string().url("Link meeting không hợp lệ").optional().or(z.literal("")),

  // Recurrence
  isRecurring: z.boolean(),
  recurrenceDays: z.array(z.number()).optional(),
  recurrenceEndDate: z.date().optional(),

  // Google sync
  syncToGoogle: z.boolean(),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  }
).refine(
  (data) => {
    if (data.isRecurring) {
      return data.recurrenceDays && data.recurrenceDays.length > 0
    }
    return true
  },
  {
    message: "Vui lòng chọn ít nhất một ngày lặp lại",
    path: ["recurrenceDays"],
  }
).refine(
  (data) => {
    if (data.isRecurring) {
      return data.recurrenceEndDate !== undefined
    }
    return true
  },
  {
    message: "Vui lòng chọn ngày kết thúc lặp lại",
    path: ["recurrenceEndDate"],
  }
)

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>

// Update Schedule Form Schema
export const updateScheduleSchema = createScheduleSchema.partial()

export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>
