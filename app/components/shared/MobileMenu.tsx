'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'Trang chủ', icon: 'home', path: '/' },
  { name: 'Khóa học', icon: 'school', path: '/courses' },
  { name: 'Giới thiệu', icon: 'info', path: '/about' },
  { name: 'Liên hệ', icon: 'mail', path: '/contact' },
  { name: 'Tài liệu', icon: 'book', path: '/vocabulary' },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Handle Escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Dark Overlay Background with fade animation - Click to close */}
      <div
        className={`fixed inset-0 bg-black/70 transition-all duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
        role="button"
        tabIndex={-1}
        aria-label="Close menu overlay"
      />

      {/* Sidebar Menu with slide animation */}
      <div
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-surface-light dark:bg-surface-dark shadow-2xl flex flex-col h-screen transition-all duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button and Language Switcher */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <div className="size-8 rounded bg-gradient-to-br from-red-600 to-yellow-500 p-1.5 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-600">
              HSK Master
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={onClose}
              className="flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all cursor-pointer ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-yellow-400 to-red-600 text-white'
                  : 'text-text-main-light dark:text-text-main-dark hover:bg-gradient-to-r hover:from-yellow-400 hover:to-red-600 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link
            href="/courses"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-red-600 text-white font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            <span>Bắt đầu học ngay</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
