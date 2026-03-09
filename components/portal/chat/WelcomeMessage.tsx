"use client"

import { Bot } from "lucide-react"

interface WelcomeMessageProps {
  onSuggestionClick?: (text: string) => void
}

const SUGGESTIONS = [
  "HSK 1 có bao nhiêu từ vựng?",
  '"你好" nghĩa là gì?',
  "Sửa câu: 我去学校昨天",
]

export default function WelcomeMessage({ onSuggestionClick }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Bot className="w-7 h-7 text-red-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-2">
        Xin chào! 你好! 😊
      </h3>
      <p className="text-sm text-gray-500 max-w-65 leading-relaxed">
        Tôi là trợ lý AI giúp bạn học tiếng Trung. Hãy hỏi tôi về ngữ pháp, từ vựng, hoặc gửi câu tiếng Trung để tôi sửa nhé!
      </p>
      <div className="mt-5 flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSuggestionClick?.(q)}
            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full
                       hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
