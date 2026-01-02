'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
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

  // Prevent hydration mismatch by not rendering interactive elements until mounted
  if (!mounted) {
    return (
      <section className="relative bg-white dark:bg-background-dark pt-4 pb-8 lg:pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] group border border-gray-100 dark:border-gray-800">
            {/* Show first slide as fallback during SSR */}
            <div className="relative flex items-center bg-gray-900 h-full">
              <img
                alt={slides[0].title}
                className="absolute inset-0 w-full h-full object-cover"
                src={slides[0].image}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slides[0].overlayGradient}`} />
              <div className="relative z-10 px-6 py-8 md:px-12 lg:px-24 max-w-4xl w-full">
                <span
                  className={`inline-block py-1.5 px-3 rounded ${slides[0].badgeColor} text-xs font-bold uppercase tracking-wider mb-4 md:mb-6 shadow-sm`}
                >
                  {slides[0].badge}
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight drop-shadow-sm">
                  {slides[0].title}
                </h2>
                <p className="hidden md:block text-gray-100 text-base lg:text-lg mb-6 md:mb-8 max-w-xl font-medium drop-shadow-md">
                  {slides[0].description}
                </p>
                <div className="hidden md:flex flex-wrap gap-3 md:gap-4">
                  <Link
                    href={slides[0].primaryCTA.href}
                    className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-gradient-to-r from-yellow-400 to-red-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 text-center"
                  >
                    {slides[0].primaryCTA.text}
                  </Link>
                  {slides[0].secondaryCTA && (
                    <Link
                      href={slides[0].secondaryCTA.href}
                      className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-white/20 backdrop-blur-md text-white font-semibold border border-white/30 hover:bg-white/30 transition-all text-center"
                    >
                      {slides[0].secondaryCTA.text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white dark:bg-background-dark pt-4 pb-8 lg:pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] group border border-gray-100 dark:border-gray-800">
          {/* Embla Carousel */}
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="flex-[0_0_100%] min-w-0 relative flex items-center bg-gray-900"
                >
                  {/* Background Image */}
                  <img
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={slide.image}
                  />

                  {/* Overlay Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient}`} />

                  {/* Content */}
                  <div className="relative z-10 px-6 py-8 md:px-12 lg:px-24 max-w-4xl w-full">
                    <span
                      className={`inline-block py-1.5 px-3 rounded ${slide.badgeColor} text-xs font-bold uppercase tracking-wider mb-4 md:mb-6 shadow-sm`}
                    >
                      {slide.badge}
                    </span>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight drop-shadow-sm">
                      {slide.title}
                    </h2>

                    {/* Description - Hidden on Mobile */}
                    <p className="hidden md:block text-gray-100 text-base lg:text-lg mb-6 md:mb-8 max-w-xl font-medium drop-shadow-md">
                      {slide.description}
                    </p>

                    {/* CTA Buttons - Hidden on Mobile */}
                    <div className="hidden md:flex flex-wrap gap-3 md:gap-4">
                      <Link
                        href={slide.primaryCTA.href}
                        className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-gradient-to-r from-yellow-400 to-red-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 text-center"
                      >
                        {slide.primaryCTA.text}
                      </Link>
                      {slide.secondaryCTA && (
                        <Link
                          href={slide.secondaryCTA.href}
                          className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-white/20 backdrop-blur-md text-white font-semibold border border-white/30 hover:bg-white/30 transition-all text-center"
                        >
                          {slide.secondaryCTA.text}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-6 md:w-8 h-1.5 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-white shadow-sm ring-1 ring-black/10'
                    : 'bg-white/40 hover:bg-white/70 cursor-pointer backdrop-blur-sm'
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
