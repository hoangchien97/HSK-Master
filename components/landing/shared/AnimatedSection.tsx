"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: "fadeInUp" | "slideInLeft" | "slideInRight" | "scaleIn" | "stagger";
  delay?: number;
  className?: string;
}

const hiddenStyles: Record<string, React.CSSProperties> = {
  fadeInUp: { opacity: 0, transform: "translateY(40px)" },
  slideInLeft: { opacity: 0, transform: "translateX(-50px)" },
  slideInRight: { opacity: 0, transform: "translateX(50px)" },
  scaleIn: { opacity: 0, transform: "scale(0.9)" },
  stagger: { opacity: 0 },
};

const visibleStyle: React.CSSProperties = { opacity: 1, transform: "none" };

export function AnimatedSection({
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
      { rootMargin: "-80px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties = {
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    willChange: isVisible ? "auto" : "opacity, transform",
    ...(isVisible ? visibleStyle : hiddenStyles[variant] || hiddenStyles.fadeInUp),
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
