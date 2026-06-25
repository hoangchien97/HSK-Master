"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Button, Input, FormField } from "@/components/ui";
import { PORTAL_ROUTES, API_ROUTES } from "@/constants/portal/routes";
import { MSG_AUTH, MSG } from "@/constants/portal/messages";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

export default function RegisterForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch(API_ROUTES.AUTH.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || MSG_AUTH.REGISTER_FAILED);
        return;
      }

      toast.success(MSG_AUTH.REGISTER_SUCCESS);

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: PORTAL_ROUTES.HOME,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(`${PORTAL_ROUTES.LOGIN}?registered=true`);
      } else {
        router.push(PORTAL_ROUTES.HOME);
        router.refresh();
      }
    } catch {
      toast.error(MSG.ERROR_GENERIC);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">漢</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-sm text-gray-600">
            Tạo tài khoản để bắt đầu học tiếng Trung
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Họ và tên"
                type="text"
                placeholder="Nguyễn Văn A"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <FormField
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Email"
                type="email"
                placeholder="email@example.com"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <FormField
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                error={fieldState.error?.message}
                hint="Tối thiểu 6 ký tự"
                required
              />
            )}
          />

          <FormField
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <Button
            type="submit"
            variant="danger"
            isLoading={isSubmitting}
            className="w-full"
          >
            Đăng ký
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link href="/terms" className="text-red-600 hover:underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-red-600 hover:underline">
              Chính sách bảo mật
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href={PORTAL_ROUTES.LOGIN}
              className="font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
