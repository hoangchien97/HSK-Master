'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSlideContent from './HeroSlideContent';
import type { HeroSlide } from '@/services';

interface HeroSlideShowClientProps {
  slides: HeroSlide[];
}

export default function HeroSlideShowClient({ slides }: HeroSlideShowClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 20 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  if (!slides || slides.length === 0) {
    return null;
  }

  // Render container structure immediately, but prevent hydration mismatch for carousel
  const containerContent = (
    <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background-dark pt-4 pb-6 md:pt-6 md:pb-10 lg:pt-10 lg:pb-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="relative rounded-xl md:rounded-3xl overflow-hidden shadow-2xl md:shadow-3xl aspect-[4/3] sm:aspect-video md:aspect-[21/9] group border-2 border-gray-200 dark:border-gray-700 hover:shadow-4xl transition-shadow duration-500">
          {!mounted ? (
            // SSR: Show first slide without carousel
            <HeroSlideContent slide={slides[0]} isActive={true} animated={false} />
          ) : (
            // Client: Show carousel with animations
            <>
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                  <AnimatePresence mode="wait">
                    {slides.map((slide, slideIndex) => (
                      <div
                        key={slide.id}
                        className="flex-[0_0_100%] min-w-0"
                      >
                        <HeroSlideContent
                          slide={slide}
                          isActive={slideIndex === selectedIndex}
                          animated={true}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Enhanced Navigation Dots - Clean Minimal Style */}
              <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 md:gap-2.5 z-20">
                {slides.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/40 w-7 sm:w-9 md:w-11 lg:w-14 h-2 sm:h-2.5 md:h-3'
                        : 'bg-white/50 hover:bg-white/80 w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 cursor-pointer'
                    }`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );

  return containerContent;

}
