import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  return (
    <header className="border-b border-primary-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-primary-600 transition hover:text-primary-700"
        >
          🇨🇳 ABC Chinese
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-base font-medium font-vietnamese">
          <Link href="/" className="text-gray-700 transition hover:text-primary-600">
            Trang chủ
          </Link>
          <Link href="/courses" className="text-gray-700 transition hover:text-primary-600">
            Khoá học
          </Link>
          <Link href="/about" className="text-gray-700 transition hover:text-primary-600">
            Giới thiệu
          </Link>
          <Link href="/contact" className="text-gray-700 transition hover:text-primary-600">
            Liên hệ
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
