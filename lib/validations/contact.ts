import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\-\s]+$/, "Số điện thoại chỉ được chứa chữ số"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  subject: z.string().optional(),
  message: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
