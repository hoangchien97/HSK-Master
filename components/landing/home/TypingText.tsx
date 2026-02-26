'use client';

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * Lightweight typing effect using CSS animations instead of per-character
 * framer-motion spans (which created 40+ animated DOM elements per title).
 */
export default function TypingText({
  text,
  className = '',
  delay = 0,
}: TypingTextProps) {
  return (
    <div
      className={className}
      style={{
        animation: `typingFadeIn 0.5s ease ${delay}s both`,
      }}
    >
      {text}
      <style jsx>{`
        @keyframes typingFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
