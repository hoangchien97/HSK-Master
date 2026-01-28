"use client";

import { ReactElement } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
  content: string | ReactElement;
  title?: string;
  children: ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  arrow?: boolean;
  animation?: 'fade' | 'scale' | 'shift-away' | 'shift-toward' | 'perspective';
  duration?: number | [number, number];
  delay?: number | [number, number];
  theme?: string;
  className?: string;
  maxWidth?: number | string;
  interactive?: boolean;
  disabled?: boolean;
}

export default function Tooltip({
  content,
  title,
  children,
  placement = 'top',
  arrow = true,
  animation = 'scale',
  duration = 200,
  delay = 0,
  className = '',
  maxWidth = 256,
  disabled = false,
}: TooltipProps) {
  const delayMs = Array.isArray(delay) ? delay[0] : delay;
  const side = placement === 'auto' ? 'top' : placement;

  const animationClass = {
    fade: 'data-[state=delayed-open]:animate-fadeIn data-[state=instant-open]:animate-fadeIn data-[state=closed]:animate-fadeOut',
    scale: 'data-[state=delayed-open]:animate-scaleIn data-[state=instant-open]:animate-scaleIn data-[state=closed]:animate-scaleOut',
    'shift-away': 'data-[state=delayed-open]:animate-slideUp data-[state=instant-open]:animate-slideUp data-[state=closed]:animate-slideDown',
    'shift-toward': 'data-[state=delayed-open]:animate-slideDown data-[state=instant-open]:animate-slideDown data-[state=closed]:animate-slideUp',
    perspective: 'data-[state=delayed-open]:animate-perspective data-[state=instant-open]:animate-perspective data-[state=closed]:animate-perspectiveOut',
  }[animation];

  if (disabled) {
    return children;
  }

  return (
    <TooltipPrimitive.Root delayDuration={delayMs}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={5}
          className={`
            z-50
            bg-gray-900 dark:bg-gray-800 text-white text-[10px] md:text-xs
            rounded-lg shadow-xl py-1.5 px-2 md:py-2 md:px-3 leading-relaxed
            ${animationClass}
            ${className}
          `}
          style={{
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          }}
        >
          {title && <div className="font-bold mb-1 text-yellow-400">{title}</div>}
          {typeof content === 'string' ? <p>{content}</p> : content}

          {arrow && (
            <TooltipPrimitive.Arrow
              className="fill-gray-900 dark:fill-gray-800"
              width={11}
              height={5}
            />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
