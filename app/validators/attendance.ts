import { z } from "zod";

export const attendanceSchema = z.object({
  scheduleId: z.string().min(1, "Vui lòng chọn buổi học"),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      note: z.string().optional(),
    })
  ),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
