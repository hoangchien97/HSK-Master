import Link from "next/link";
import { CheckCircle, BookOpen, Users } from "lucide-react";
import Image from "next/image";
import { BRAND_NAME } from "@/constants/brand";

const features = [
  {
    icon: CheckCircle,
    text: "Theo dõi tiến độ học tập chi tiết",
  },
  {
    icon: BookOpen,
    text: "Bài học từ HSK 1 đến HSK 6",
  },
  {
    icon: Users,
    text: "Học cùng giáo viên chuyên nghiệp",
  },
];

/**
 * Left branding panel shown on the portal auth pages (login/register).
 * Desktop only — hidden on mobile.
 */
export default function AuthBrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20zM60 30c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt={BRAND_NAME} width={48} height={48} className="rounded-xl" />
          <span className="font-bold text-2xl text-white">{BRAND_NAME}</span>
        </Link>

        {/* Main content */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Chào mừng bạn đến với
            <br />
            {BRAND_NAME} Portal
          </h1>
          <p className="text-red-100 text-lg max-w-md">
            Nền tảng học tiếng Trung trực tuyến hàng đầu. Theo dõi tiến độ, làm
            bài tập và nâng cao kỹ năng của bạn.
          </p>

          {/* Features */}
          <div className="space-y-4 pt-6">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-red-200 text-sm">
          © 2026 {BRAND_NAME}. Học tiếng Trung dễ dàng.
        </p>
      </div>
    </div>
  );
}
