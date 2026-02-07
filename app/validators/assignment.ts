import { z } from "zod";

export const assignmentSchema = z.object({
  classId: z.string().min(1, "Vui lòng chọn lớp"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string().optional(),
  assignmentType: z.string().min(1, "Vui lòng chọn loại bài tập"),
  dueDate: z.string().optional(),
  maxScore: z.number().min(1, "Tối thiểu 1 điểm").max(1000),
  status: z.enum(["ACTIVE", "DRAFT"]),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
