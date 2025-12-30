import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-red-600">
          ABC Chinese
        </Link>

        {/* Navigation */}
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-red-600">
            Trang chủ
          </Link>
          <Link href="/courses" className="hover:text-red-600">
            Khoá học
          </Link>
          <Link href="/about" className="hover:text-red-600">
            Giới thiệu
          </Link>
          <Link href="/contact" className="hover:text-red-600">
            Liên hệ
          </Link>
        </nav>
      </div>
    </header>
  );
}
