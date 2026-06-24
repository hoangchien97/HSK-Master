"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content?: React.ReactNode;
  title?: React.ReactNode;
  placement?: TooltipPlacement;
  delayMs?: number;
  children: React.ReactElement;
  className?: string;
  // Landing compat no-ops
  arrow?: boolean;
  animation?: string;
  duration?: number;
}

export function Tooltip({
  content,
  title,
  placement = "top",
  delayMs = 400,
  children,
  className,
  arrow: _arrow,
  animation: _animation,
  duration: _duration,
}: TooltipProps) {
  void _arrow;
  void _animation;
  void _duration;
  const resolvedContent = content ?? title;
  return (
    <TooltipPrimitive.Provider delayDuration={delayMs}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side={placement}
          sideOffset={4}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-(--color-ink) px-3 py-1.5 text-xs text-white shadow-md",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
        >
          {resolvedContent}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export default Tooltip;
