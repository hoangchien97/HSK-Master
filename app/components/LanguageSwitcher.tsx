"use client";

import { useState } from "react";

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState("vi");

  const handleChange = (newLocale: string) => {
    setLocale(newLocale);
    // TODO: Implement i18n logic later
    console.log("Switch to:", newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          locale === "vi"
            ? "bg-primary-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="Switch to Vietnamese"
      >
        🇻🇳 VI
      </button>
      <button
        className={`rounded-lg px-3 py-1.5 text-sm font-medium font-chinese transition ${
          locale === "cn"
            ? "bg-primary-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="Switch to Chinese"
      >
        🇨🇳 中文
      </button>
    </div>
  );
}
