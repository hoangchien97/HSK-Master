"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';

type Props = {
  value: number | string;
  // optional: symbol or text to append (e.g. '+', '%', ' năm')
  suffix?: string;
  // kept for API compat but no longer used (was for framer-motion spring)
  stiffness?: number;
  damping?: number;
};

function parseNumeric(input: number | string) {
  if (typeof input === 'number') return { num: Math.round(input), suffix: '' };
  let s = String(input).trim();
  if (!s) return { num: 0, suffix: '' };
  // capture trailing + to re-append
  const plus = s.endsWith('+');
  if (plus) s = s.slice(0, -1).trim();
  s = s.replace(/,/g, '').toLowerCase();
  let multiplier = 1;
  if (s.endsWith('k')) {
    multiplier = 1_000;
    s = s.slice(0, -1);
  } else if (s.endsWith('m')) {
    multiplier = 1_000_000;
    s = s.slice(0, -1);
  } else if (s.endsWith('b')) {
    multiplier = 1_000_000_000;
    s = s.slice(0, -1);
  }
  const parsed = parseFloat(s || '0');
  const num = Math.round((isNaN(parsed) ? 0 : parsed) * multiplier);
  return { num, suffix: plus ? '+' : '' };
}

/**
 * Lightweight CountUp using requestAnimationFrame instead of framer-motion spring.
 * Saves importing useMotionValue, useSpring, useInView from framer-motion.
 */
export default function CountUp({ value, suffix }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<string>('0');
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const parsed = parseNumeric(value);
    const target = parsed.num;
    const useSuffix = suffix ?? parsed.suffix;
    const duration = 1200; // ms
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(current.toLocaleString() + (useSuffix ?? ''));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }, [value, suffix]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { rootMargin: "-100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div
      ref={ref}
      className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 text-white"
    >
      {display}
    </div>
  );
}
