"use client";

import { useRef, useEffect, useState, ReactNode, memo } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: "fadeInUp" | "slideInLeft" | "slideInRight" | "scaleIn" | "stagger";
  delay?: number;
  className?: string;
}

const variantClasses: Record<string, string> = {
  fadeInUp: "translate-y-10 opacity-0",
  slideInLeft: "-translate-x-12 opacity-0",
  slideInRight: "translate-x-12 opacity-0",
  scaleIn: "scale-95 opacity-0",
  stagger: "opacity-0",
};

export const AnimatedSection = memo(function AnimatedSection({
  children,
  variant = "fadeInUp",
  delay = 0,
  className = ""
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-60px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 translate-x-0 scale-100 opacity-100" : variantClasses[variant] || variantClasses.fadeInUp
      } ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
});
