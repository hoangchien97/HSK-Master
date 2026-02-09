'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > 0;
    }
    return false;
  });

  // Show button when page is scrolled (any scroll)
  const toggleVisibility = () => {
    // Show immediately when user scrolls at all
    const scrolled = window.scrollY > 0;
    setIsVisible(scrolled);
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          onClick={scrollToTop}
          className="fixed hover:cursor-pointer bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          aria-label="Scroll to top"
          title="Lên đầu trang"
        >
          <ArrowUp className="w-6 h-6" strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
