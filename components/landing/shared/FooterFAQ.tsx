"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_DATA } from "../contact/ContactFAQ";

export default function FooterFAQ() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
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
  );
}
