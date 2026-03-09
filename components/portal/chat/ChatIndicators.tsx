"use client"

import { Bot } from "lucide-react"

/**
 * Streaming text — shows partial AI response with a blinking cursor.
 * The cursor disappears automatically once streaming ends (component unmounts).
 */
export function StreamingIndicator({ content }: { content: string }) {
  return (
    <div className="flex gap-2 mb-3 justify-start">
      <div className="shrink-0 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center mt-1">
        <Bot className="w-4 h-4 text-red-600" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed bg-gray-100 text-gray-800 whitespace-pre-wrap break-words">
        {content}
        <span className="inline-block w-0.5 h-[1.1em] bg-gray-800 ml-0.5 align-middle animate-[blink_1s_steps(2)_infinite]" />
      </div>
    </div>
  )
}

/** Three-dot bouncing loader while waiting for the first token */
export function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3 justify-start">
      <div className="shrink-0 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center mt-1">
        <Bot className="w-4 h-4 text-red-600" />
      </div>
      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-gray-100">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
