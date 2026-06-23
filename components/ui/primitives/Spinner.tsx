import React from "react";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 32 };

export function Spinner({ size = "md", color = "currentColor", className }: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin inline-block flex-shrink-0", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
export default Spinner;
