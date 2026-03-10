"use client"

import { Bot, Sparkles, BookOpen, PenLine } from "lucide-react"

interface WelcomeMessageProps {
  userName?: string
  onSuggestionClick?: (text: string) => void
}

const SUGGESTIONS = [
  { icon: BookOpen, text: "HSK 1 có bao nhiêu từ vựng?" },
  { icon: Sparkles, text: '"你好" nghĩa là gì?' },
  { icon: PenLine, text: "Sửa câu: 我去学校昨天" },
]

export default function WelcomeMessage({ userName, onSuggestionClick }: WelcomeMessageProps) {
  const displayName = userName?.split(" ").pop() || "bạn"

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 shadow-sm">
        <Bot className="w-7 h-7 text-red-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1.5">
        Xin chào {displayName}! 😊
      </h3>
      <p className="text-sm text-gray-500 max-w-72 leading-relaxed">
        Tôi là trợ lý AI giúp bạn học tiếng Trung. Hỏi tôi về ngữ pháp, từ vựng, hoặc gửi câu tiếng Trung để sửa nhé!
      </p>

      <div className="mt-6 w-full max-w-72 flex flex-col gap-2">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Gợi ý cho bạn</p>
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestionClick?.(text)}
            className="flex items-center gap-2.5 w-full text-left text-sm text-gray-600 bg-gray-50 border border-gray-200
                       px-3.5 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200
                       transition-colors cursor-pointer"
          >
            <Icon className="w-4 h-4 shrink-0 text-gray-400" />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
