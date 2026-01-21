"use client";
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface Review {
  id: string;
  studentName: string;
  className: string;
  content: string;
  rating: number;
  createdAt: Date | string;
}

interface Props {
  reviews: Review[];
}

export default function ReviewListClient({ reviews }: Props) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Chưa có đánh giá nào được phê duyệt
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4 md:gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex-none w-[85%] sm:w-[300px] md:w-[350px] lg:w-[400px]"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-5 lg:p-6 h-full border border-gray-100 dark:border-gray-700">
              {/* Rating Stars */}
              <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`${
                      i < review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {/* Review Content */}
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed line-clamp-6">
                &ldquo;{review.content}&rdquo;
              </p>

              {/* Student Info */}
              <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                  {review.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                    {review.studentName}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {review.className}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
