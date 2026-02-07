import { z } from "zod";

export const classSchema = z.object({
  className: z.string().min(1, "Vui lòng nhập tên lớp"),
  classCode: z.string().min(1, "Vui lòng nhập mã lớp"),
  description: z.string().optional(),
  level: z.string().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().optional(),
  maxStudents: z.number().min(1, "Tối thiểu 1 học viên").max(100, "Tối đa 100 học viên"),
});

export type ClassFormValues = z.infer<typeof classSchema>;
