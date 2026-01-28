"use client";
import React, { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

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

export default function CountUp({ value, suffix, stiffness = 120, damping = 16 }: Props) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness, damping });
  const [display, setDisplay] = useState<string>('0');

  useEffect(() => {
    // prefer explicit suffix prop; otherwise parse from string
    const parsed = parseNumeric(value);
    const target = parsed.num;
    const useSuffix = suffix ?? parsed.suffix;

    // start from 0
    motionVal.set(0);

    const unsubscribe = spring.onChange((v) => {
      const rounded = Math.round(v);
      // format with grouping
      setDisplay(rounded.toLocaleString() + (useSuffix ?? ''));
    });

    // animate to target after a small delay to allow the spring to animate
    const timer = setTimeout(() => {
      motionVal.set(target);
    }, 50);

    return () => {
      unsubscribe && unsubscribe();
      clearTimeout(timer);
    };
  }, [value, suffix, motionVal, spring]);

  return <div className="text-lg md:text-2xl lg:text-3xl font-bold mb-1">{display}</div>;
}
