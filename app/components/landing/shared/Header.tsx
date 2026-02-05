'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MobileMenu from "./MobileMenu";
import { Menu, Languages } from "lucide-react";
import { Button } from "@/app/components/common";

const navigationItems = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Khóa học', path: '/courses' },
  // { name: 'Tài liệu', path: '/vocabulary' },
  { name: 'Giới thiệu', path: '/about' },
  { name: 'Liên hệ', path: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-surface-light/95 supports-[backdrop-filter]:bg-surface-light/80 dark:bg-surface-dark/95 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex justify-between w-full md:w-auto items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 flex text-text-main-light dark:text-text-main-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-300 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 transition-transform duration-300" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-primary">
            <div className="size-8 rounded bg-gradient-to-br from-red-600 to-yellow-500 p-1.5 flex items-center justify-center text-white shadow-md">
              <Languages className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-600 hidden sm:block">
              HSK Master
            </span>
          </Link>
        </div>

        {/* Center Section - Search Bar */}
        {/* <div className="hidden md:flex max-w-md flex-1 mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-text-secondary-light" />
            </div>
            <input
              className="block w-full rounded-full border-gray-200 bg-gray-50 dark:bg-background-dark py-2 pl-10 pr-3 text-sm placeholder-text-secondary-light focus:border-red-500 focus:ring-red-500 dark:text-white dark:placeholder-gray-500 transition-all hover:bg-white focus:bg-white dark:hover:bg-surface-dark dark:focus:bg-surface-dark shadow-sm"
              placeholder="Tìm khóa học (VD: HSK 4)..."
              type="text"
            />
          </div>
        </div> */}

        {/* Right Section - Navigation + Language + CTA */}
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-6 mr-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative text-sm font-semibold transition-all cursor-pointer group pb-1 ${
                  isActive(item.path)
                    ? 'text-red-600'
                    : 'text-text-main-light dark:text-text-main-dark hover:text-red-600'
                }`}
              >
                {item.name}
                {/* Hover Indicator */}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-transform duration-300 origin-left ${
                  isActive(item.path)
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
          </nav>

          {/* Language Switcher - Desktop Only */}
          {/* <div className="hidden sm:block">
            <LanguageSwitcher />
          </div> */}

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link href="/courses" className="hidden sm:flex">
              <Button variant="gradient" size="sm">
                Bắt đầu học
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
