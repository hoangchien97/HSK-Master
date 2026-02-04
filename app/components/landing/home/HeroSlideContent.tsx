'use client';

import { motion } from 'framer-motion';
import { Button, Badge } from '@/app/components/landing/shared';
import TypingText from './TypingText';
import type { HeroSlide } from '@/app/services';

interface HeroSlideContentProps {
  slide: HeroSlide;
  isActive?: boolean;
  animated?: boolean;
}

export default function HeroSlideContent({
  slide,
  isActive = false,
  animated = true
}: HeroSlideContentProps) {
  return (
    <div className="relative flex items-center h-full overflow-hidden bg-gray-900">
      {/* Background Image with Ken Burns Effect */}
      <motion.img
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover"
        src={slide.image}
        initial={animated ? { scale: 1.05 } : { scale: 1 }}
        animate={animated && isActive ? { scale: 1 } : { scale: 1.05 }}
        transition={{ duration: 8, ease: 'linear' }}
        style={{ opacity: 0.85 }}
      />

      {/* Enhanced Overlay Gradient - Only on Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient}`} style={{ opacity: 0.7 }} />

      {/* Content with Animations */}
      <div className="relative z-10 px-4 py-6 sm:px-8 sm:py-10 md:px-16 lg:px-24 xl:px-32 max-w-5xl w-full">
        {/* Badge with Animation */}
        <motion.div
          initial={animated ? { opacity: 0, y: -20 } : false}
          animate={animated ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Badge variant="gradient" size="md" className="mb-3 md:mb-5 lg:mb-7">
            {slide.badge}
          </Badge>
        </motion.div>

        {/* Title with Typing Effect - Gradient Text with Strong Shadow for Contrast */}
        {animated && isActive ? (
          <TypingText
            text={slide.title}
            className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
            delay={0.3}
          />
        ) : (
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            {slide.title}
          </h2>
        )}

        {/* Description with Typing Effect - Clean White Text */}
        <motion.div
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={animated ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animated && isActive ? (
            <TypingText
              text={slide.description}
              className="md:block text-white text-sm md:text-base lg:text-lg mb-4 md:mb-6 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]"
              delay={0.8}
            />
          ) : (
            <p className="md:block text-white text-sm md:text-base lg:text-lg mb-4 md:mb-6 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
              {slide.description}
            </p>
          )}
        </motion.div>

        {/* CTA Buttons with Staggered Animation - Responsive */}
        <motion.div
          className="flex flex-wrap gap-2 sm:gap-3 md:gap-4"
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={animated ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <a href={slide.primaryCTA.href}>
            <Button
              variant="gradient"
              size="md"
              className="rounded-full shadow-2xl hover:shadow-3xl"
              icon={<span className="text-base md:text-lg">→</span>}
              iconPosition="right"
            >
              {slide.primaryCTA.text}
            </Button>
          </a>
          {slide.secondaryCTA && (
            <a href={slide.secondaryCTA.href}>
              <Button
                variant="outline-white"
                size="md"
                className="rounded-full bg-white/10 hover:bg-white/20 border-white/60"
              >
                {slide.secondaryCTA.text}
              </Button>
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}
