"use client";
import Link from "next/link";
import { HSK_LEVEL_GROUPS } from "@/types/filters";
import { Phone, Mail, MapPin, Linkedin, Instagram, Facebook, ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { FAQ_DATA } from "../contact/ContactFAQ";
import { BRAND_NAME } from "@/constants/brand";

export default function Footer() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <footer className="bg-gradient-to-r from-yellow-500 to-red-600 text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-primary">
            <Image src="/logo.svg" alt={BRAND_NAME} width={160} height={64} priority className="bg-transparent" />
          </Link>
            <p className="text-sm text-white mb-4 leading-relaxed max-w-xs">
              Nền tảng học tiếng Trung trực tuyến hàng đầu, giúp bạn chinh phục HSK từ con số 0 đến thành thạo.
            </p>
            <div className="flex gap-2.5">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-110 hover:rotate-6"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-110 hover:rotate-6"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-110 hover:rotate-6"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Courses Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Khóa học</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/courses?hskLevel=${HSK_LEVEL_GROUPS.BEGINNER}`}
                  className="text-sm text-white/90 hover:text-white hover:brightness-125 hover:translate-x-1 transition-all inline-block"
                >
                  Sơ cấp (HSK 1-2)
                </Link>
              </li>
              <li>
                <Link
                  href={`/courses?hskLevel=${HSK_LEVEL_GROUPS.INTERMEDIATE}`}
                  className="text-sm text-white/90 hover:text-white hover:brightness-125 hover:translate-x-1 transition-all inline-block"
                >
                  Trung cấp (HSK 3-4)
                </Link>
              </li>
              <li>
                <Link
                  href={`/courses?hskLevel=${HSK_LEVEL_GROUPS.ADVANCED}`}
                  className="text-sm text-white/90 hover:text-white hover:brightness-125 hover:translate-x-1 transition-all inline-block"
                >
                  Cao cấp (HSK 5-6)
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-sm text-white hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Tất cả khóa học
                  <span className="text-xs">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Liên hệ</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 group">
                <Phone className="text-white/90 w-4 h-4 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="tel:0965322136" className="text-sm font-semibold text-white/90 hover:text-white hover:brightness-125 hover:underline transition-all">
                  0965322136
                </a>
              </li>
              <li className="flex items-start gap-2.5 group">
                <Mail className="text-white/90 w-4 h-4 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="mailto:tranhongngoc19122001@gmail.com" className="text-sm text-white/90 hover:text-white hover:brightness-125 hover:underline break-all transition-all">
                  tranhongngoc19122001@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 group">
                <MapPin className="text-white/90 w-4 h-4 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-white/90">Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Câu hỏi thường gặp</h3>
            <div className="space-y-2">
              {FAQ_DATA.map((faq) => (
                <div key={faq.id} className="border border-white/20 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-white pr-2">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-white transition-transform shrink-0 ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedFAQ === faq.id ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-3 pb-3">
                      <p className="text-[12px] text-white/75 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-white/30 pt-6">
          <div className="flex justify-center">
            <p className="text-xs text-white/80 text-center">
              © 2026 {BRAND_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
