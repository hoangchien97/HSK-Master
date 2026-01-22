'use client';

import { motion } from 'framer-motion';

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function TypingText({
  text,
  className = '',
  delay = 0,
  duration = 0.05
}: TypingTextProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration,
            delay: delay + (index * 0.03),
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}
