'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';

interface Slide {
  id: number;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  overlayGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=800&fit=crop',
    badge: 'Khóa học mới 2024',
    badgeColor: 'bg-yellow-500 text-black',
    title: 'Chinh phục HSK 1 - HSK 6',
    description: 'Hệ thống bài giảng video chất lượng cao. Tích hợp AI luyện phát âm và học từ để thi phòng phù hợp nhất Việt Nam.',
    primaryCTA: {
      text: 'Xem lộ trình',
      href: '#courses',
    },
    secondaryCTA: {
      text: 'Thử học miễn phí',
      href: '/courses',
    },
    overlayGradient: 'from-black/80 via-black/40 to-transparent',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&h=800&fit=crop',
    badge: 'Tài liệu chất lượng',
    badgeColor: 'bg-white text-red-600',
    title: 'Tài liệu học tập đầy đủ',
    description: 'Kho tài liệu phong phú với hàng ngàn bài tập, từ vựng và mẹo học tập hiệu quả.',
    primaryCTA: {
      text: 'Khám phá ngay',
      href: '/vocabulary',
    },
    overlayGradient: 'from-red-900/90 via-red-800/50 to-transparent',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=800&fit=crop',
    badge: 'Cộng đồng học tập',
    badgeColor: 'bg-blue-500 text-white',
    title: 'Học cùng cộng đồng',
    description: 'Tham gia cộng đồng học viên năng động, chia sẻ kinh nghiệm và cùng tiến bộ.',
    primaryCTA: {
      text: 'Tham gia ngay',
      href: '/contact',
    },
    overlayGradient: 'from-blue-900/90 via-blue-800/50 to-transparent',
  },
];

export default function HeroSlideShow() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 20 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

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
                  <div className="relative z-10 px-6 py-8 md:px-12 lg:px-24 max-w-3xl w-full">
                    <span
                      className={`inline-block py-1.5 px-3 rounded ${slide.badgeColor} text-xs font-bold uppercase tracking-wider mb-4 md:mb-6 shadow-sm`}
                    >
                      {slide.badge}
                    </span>
                    
                    {/* Title with Gradient */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight drop-shadow-sm">
                      <span className="block md:inline">Chinh phục </span>
                      <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                        HSK 1 - HSK 6
                      </span>
                      <br className="hidden md:block" />
                      <span className="block mt-1 md:mt-2 text-xl md:text-3xl lg:text-4xl">
                        Dễ dàng & Hiệu quả
                      </span>
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
