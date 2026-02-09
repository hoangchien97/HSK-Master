'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useEffect } from "react";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { BRAND_NAME } from "@/constants/brand";
import { LANDING_NAV_ITEMS } from "@/constants/landing";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

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
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt={BRAND_NAME} width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-600">{BRAND_NAME}</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={onClose}
              className="flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-text-main-light dark:text-text-main-dark" />
            </button>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {LANDING_NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            return (
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
                <IconComponent className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link
            href="/courses"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-red-600 text-white font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="w-5 h-5" />
            <span>Bắt đầu học ngay</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
