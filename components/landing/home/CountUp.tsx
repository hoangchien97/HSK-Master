"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useMotionValue, useSpring, useInView } from 'framer-motion';

type Props = {
  value: number | string;
  // optional: symbol or text to append (e.g. '+', '%', ' năm')
  suffix?: string;
  // optional: how snappy the spring feels
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

export default function CountUp({ value, suffix, stiffness = 100, damping = 20 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, {
    stiffness,
    damping,
    restDelta: 0.001
  });
  const [display, setDisplay] = useState<string>('0');

  useEffect(() => {
    if (!isInView) return;

    // prefer explicit suffix prop; otherwise parse from string
    const parsed = parseNumeric(value);
    const target = parsed.num;
    const useSuffix = suffix ?? parsed.suffix;

    const unsubscribe = spring.on("change", (latest) => {
      const rounded = Math.round(latest);
      // format with grouping
      setDisplay(rounded.toLocaleString() + (useSuffix ?? ''));
    });

    // animate to target
    motionVal.set(target);

    return () => {
      unsubscribe();
    };
  }, [isInView, value, suffix, motionVal, spring]);

  return (
    <div
      ref={ref}
      className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 text-white"
    >
      {display}
    </div>
  );
}
