import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  biography: z.string().max(500, "Tối đa 500 ký tự").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
