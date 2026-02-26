'use client';

import Image from 'next/image';
import { Button, Badge } from '@/components/landing/common';
import TypingText from './TypingText';
import type { HeroSlide } from '@/services';

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
  const animClass = animated && isActive ? 'animate-heroFadeInUp' : '';

  return (
    <div className="relative flex items-center h-full overflow-hidden bg-gray-900">
      {/* Background Image with Ken Burns Effect — Next.js Image for LCP */}
      <div
        className={`absolute inset-0 transition-transform duration-[8000ms] ease-linear ${
          animated && isActive ? 'scale-100' : 'scale-105'
        }`}
        style={{ opacity: 0.85 }}
      >
        <Image
          alt={slide.title}
          src={slide.image}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={75}
        />
      </div>

      {/* Enhanced Overlay Gradient - Only on Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient}`} style={{ opacity: 0.7 }} />

      {/* Content with CSS Animations (replaced framer-motion) */}
      <div className="relative z-10 px-4 py-6 sm:px-8 sm:py-10 md:px-16 lg:px-24 xl:px-32 max-w-5xl w-full">
        {/* Badge */}
        <div className={animClass} style={{ animationDelay: '0.2s' }}>
          <Badge variant="gradient" size="md" className="mb-3 md:mb-5 lg:mb-7">
            {slide.badge}
          </Badge>
        </div>

        {/* Title with Typing Effect */}
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

        {/* Description */}
        <div className={animClass} style={{ animationDelay: '0.5s' }}>
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
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-wrap gap-2 sm:gap-3 md:gap-4 ${animClass}`}
          style={{ animationDelay: '0.8s' }}
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
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-heroFadeInUp {
          animation: heroFadeInUp 0.5s ease both;
        }
      `}</style>
    </div>
  );
}
