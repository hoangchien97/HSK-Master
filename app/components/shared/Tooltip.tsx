"use client";

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import '@/app/styles/tippy-custom.css';
import { ReactElement } from 'react';

interface TooltipProps {
  content: string | ReactElement;
  title?: string; // Support for yellow title like in code.html
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
  theme = 'custom',
  className,
  maxWidth = 256, // w-64 = 256px
  interactive = false,
  disabled = false,
}: TooltipProps) {
  // Wrap children in a span to avoid ref issues with React 19
  const wrappedChildren = <span className="inline-flex">{children}</span>;

  return (
    <Tippy
      content={
        <div className="leading-relaxed">
          {title && <div className="tooltip-title">{title}</div>}
          {typeof content === 'string' ? (
            <p className="text-xs">{content}</p>
          ) : (
            content
          )}
        </div>
      }
      placement={placement}
      arrow={arrow}
      animation={animation}
      duration={duration}
      delay={delay}
      theme={theme}
      className={className}
      maxWidth={maxWidth}
      interactive={interactive}
      disabled={disabled}
    >
      {wrappedChildren}
    </Tippy>
  );
}
