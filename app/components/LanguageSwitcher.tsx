'use client';

import { useState } from "react";

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<'VN' | 'CN'>('VN');

  return (
    <div
      className="flex items-center bg-gray-100 rounded-lg p-1 dark:bg-surface-dark border border-border-light dark:border-border-dark"
      suppressHydrationWarning
    >
      <button
        onClick={() => setLanguage('VN')}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all border cursor-pointer ${
          language === 'VN'
            ? 'bg-white text-red-600 shadow-sm dark:bg-gray-700 dark:text-red-400 border-gray-100 dark:border-gray-600'
            : 'text-gray-500 hover:text-red-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-700/50 border-transparent'
        }`}
      >
        VN
      </button>
      <button
        onClick={() => setLanguage('CN')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all border cursor-pointer ${
          language === 'CN'
            ? 'bg-white text-red-600 shadow-sm dark:bg-gray-700 dark:text-red-400 border-gray-100 dark:border-gray-600'
            : 'text-gray-500 hover:text-red-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-700/50 border-transparent'
        }`}
      >
        CN
      </button>
    </div>
  );
}
