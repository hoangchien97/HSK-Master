import { z } from "zod";

export const reviewSchema = z.object({
  studentName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  className: z.string().min(1, "Vui lòng chọn lớp học"),
  content: z
    .string()
    .min(10, "Nội dung phải có ít nhất 10 ký tự")
    .max(500, "Nội dung không quá 500 ký tự"),
  rating: z.number().min(1, "Vui lòng chọn đánh giá").max(5),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
