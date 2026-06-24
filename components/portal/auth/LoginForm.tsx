"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Button, Input, FormField } from "@/components/ui";
import { PORTAL_ROUTES } from "@/constants/portal/routes";
import { MSG_AUTH, MSG } from "@/constants/portal/messages";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (error === "CredentialsSignin") toast.error(MSG_AUTH.LOGIN_FAILED);
    else if (error === "ACCOUNT_LOCKED") toast.error("Tài khoản của bạn đã bị khóa");
    else if (error === "OAuthAccountNotLinked")
      toast.error("Email đã được sử dụng với phương thức đăng nhập khác");
    else if (error) toast.error(MSG.ERROR_GENERIC);
    if (registered) toast.success(MSG_AUTH.REGISTER_SUCCESS + " Vui lòng đăng nhập");
  }, [error, registered]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: PORTAL_ROUTES.HOME,
        redirect: false,
      });

      if (result?.error) {
        toast.error(MSG_AUTH.LOGIN_FAILED);
        return;
      }

      toast.success(MSG_AUTH.LOGIN_SUCCESS);
      router.push(PORTAL_ROUTES.HOME);
      router.refresh();
    } catch {
      toast.error(MSG.ERROR_GENERIC);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: PORTAL_ROUTES.HOME });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">漢</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-sm text-gray-600">Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                required
              />
            )}
          />

          <div className="flex items-center justify-between">
            <Link
              href="/portal/forgot-password"
              className="ml-auto text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            variant="danger"
            isLoading={isSubmitting}
            className="w-full"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-500 font-medium">
              Hoặc đăng nhập bằng Google
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleSignIn}
          isDisabled={isSubmitting || googleLoading}
          isLoading={googleLoading}
          className="w-full border-2 gap-2 border-gray-200 hover:border-red-300"
        >
          {!googleLoading && (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Đăng nhập với Google
        </Button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href={PORTAL_ROUTES.REGISTER}
              className="font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
