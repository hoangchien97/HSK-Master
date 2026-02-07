"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { Form, Input, Button } from "@heroui/react";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password validation
  const getPasswordError = (value: string) => {
    if (value.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    // Custom validation
    const newErrors: Record<string, string> = {};
    
    const passwordError = getPasswordError(data.password as string);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Call register API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name as string,
          email: data.email as string,
          password: data.password as string,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Có lỗi xảy ra khi đăng ký");
        setLoading(false);
        return;
      }

      // Success - auto login
      toast.success("Đăng ký thành công!");

      const signInResult = await signIn("credentials", {
        email: data.email as string,
        password: data.password as string,
        callbackUrl: "/portal",
        redirect: false,
      });

      if (signInResult?.error) {
        // Redirect to login page
        router.push("/portal/login?registered=true");
      } else {
        router.push("/portal");
        router.refresh();
      }
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">漢</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-sm text-gray-600">
            Tạo tài khoản để bắt đầu học tiếng Trung
          </p>
        </div>

        {/* Register Form */}
        <Form
          validationErrors={errors}
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <Input
            isRequired
            label="Họ và tên"
            name="name"
            type="text"
            placeholder="Nguyễn Văn A"
            labelPlacement="outside"
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng nhập họ tên";
              }
            }}
          />

          <Input
            isRequired
            label="Email"
            name="email"
            type="email"
            placeholder="email@example.com"
            labelPlacement="outside"
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng nhập email";
              }
              if (validationDetails.typeMismatch) {
                return "Email không hợp lệ";
              }
            }}
          />

          <Input
            isRequired
            label="Mật khẩu"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            labelPlacement="outside"
            value={password}
            onValueChange={setPassword}
            errorMessage={getPasswordError(password)}
            isInvalid={getPasswordError(password) !== null}
            description="Tối thiểu 6 ký tự"
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          <Input
            isRequired
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            labelPlacement="outside"
            value={confirmPassword}
            onValueChange={(value: string) => {
              setConfirmPassword(value);
              if (errors.confirmPassword) {
                const { confirmPassword, ...rest } = errors;
                setErrors(rest);
              }
            }}
            errorMessage={errors.confirmPassword}
            isInvalid={!!errors.confirmPassword}
            endContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          <Button
            type="submit"
            color="danger"
            isLoading={loading}
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
        </Form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href="/portal/login"
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
