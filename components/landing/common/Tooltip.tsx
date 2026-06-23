"use client";

import { ReactElement, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string | ReactElement;
  title?: string;
  children: ReactElement;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  arrow?: boolean;
  animation?: string;
  duration?: number | [number, number];
  delay?: number | [number, number];
  theme?: string;
  className?: string;
  maxWidth?: number | string;
  interactive?: boolean;
  disabled?: boolean;
}

const placementClasses: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  auto: "bottom-full left-1/2 -translate-x-1/2 mb-2",
};

export default function Tooltip({
  content,
  title,
  children,
  placement = "top",
  delay = 0,
  className = "",
  maxWidth = 256,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayMs = Array.isArray(delay) ? delay[0] : delay;

  function show() {
    timerRef.current = setTimeout(() => setVisible(true), delayMs);
  }
  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  if (disabled) return children;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 rounded-lg shadow-xl bg-gray-900 text-white text-[10px] md:text-xs py-1.5 px-2 md:py-2 md:px-3 leading-relaxed",
            placementClasses[placement],
            className
          )}
          style={{
            maxWidth:
              typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
          }}
        >
          {title && (
            <div className="font-bold mb-1 text-yellow-400">{title}</div>
          )}
          {typeof content === "string" ? <p>{content}</p> : content}
        </span>
      )}
    </span>
  );
}
