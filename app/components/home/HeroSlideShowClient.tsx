'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSlideContent from './HeroSlideContent';
import type { HeroSlide } from '@/app/services';

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

              {/* Enhanced Navigation Dots - Clean Outline Style */}
              <div className="absolute bottom-3 sm:bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border-2 border-white/30 shadow-xl">
                {slides.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? 'bg-white border-2 border-white shadow-lg shadow-red-500/50 w-8 sm:w-10 md:w-12 h-2 sm:h-2.5'
                        : 'bg-white/50 border-2 border-white/70 hover:bg-white/80 hover:border-white w-2 sm:w-2.5 h-2 sm:h-2.5 cursor-pointer'
                    }`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
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
