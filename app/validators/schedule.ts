import { z } from "zod";

export const scheduleSchema = z
  .object({
    classId: z.string().min(1, "Vui lòng chọn lớp học"),
    title: z.string().min(1, "Vui lòng nhập tiêu đề"),
    description: z.string().optional(),
    startDate: z.string().min(1, "Vui lòng chọn ngày"),
    startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
    location: z.string().optional(),
    meetingLink: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "Giờ kết thúc phải sau giờ bắt đầu",
      path: ["endTime"],
    }
  );

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export const recurrenceSchema = z.object({
  weekdays: z.array(z.number()).min(1, "Chọn ít nhất 1 ngày"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
});
